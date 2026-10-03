/*
 * Server only (imported by app/api/escrow). Banana's relayer talks to BananaEscrow on Monad testnet.
 * Buyers and creators never sign anything: the relayer deposits, releases and refunds for them.
 */
import { createPublicClient, createWalletClient, defineChain, encodePacked, http, keccak256, parseAbi, parseAbiItem, parseUnits, toBytes, type Hex } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import type { ChainInfo } from './chain';

export const monadTestnet = defineChain({
  id: 10143,
  name: 'Monad Testnet',
  nativeCurrency: { name: 'Monad', symbol: 'MON', decimals: 18 },
  rpcUrls: { default: { http: [process.env.MONAD_RPC_URL || 'https://testnet-rpc.monad.xyz'] } },
});

const ABI = parseAbi([
  'function depositToken(bytes32 orderId, address seller, uint128 amount)',
  'function release(bytes32 orderId)',
  'function refund(bytes32 orderId)',
  'function orders(bytes32) view returns (address payer, address seller, uint128 amount, uint64 heldAt, uint8 status)',
  'function refundableAt(bytes32) view returns (uint64)',
]);
const EVENTS = {
  hold: parseAbiItem('event Deposited(bytes32 indexed orderId, address indexed payer, address indexed seller, uint256 amount, uint64 refundableAt)'),
  release: parseAbiItem('event Released(bytes32 indexed orderId, address indexed seller, uint256 amount)'),
  refund: parseAbiItem('event Refunded(bytes32 indexed orderId, address indexed payer, uint256 amount)'),
};
const STATUS = { None: 0, Held: 1, Released: 2, Refunded: 3 } as const;
const [ZERO, ONE, SPAN] = [BigInt(0), BigInt(1), BigInt(99)]; // tsconfig targets < ES2020: no bigint literals

export class EscrowError extends Error {
  constructor(message: string, readonly status = 502, readonly extra: Record<string, unknown> = {}) { super(message); }
}

function config() {
  const pk = process.env.MONAD_RELAYER_PRIVATE_KEY as Hex | undefined;
  const escrow = process.env.ESCROW_ADDRESS as Hex | undefined;
  if (!pk || !/^0x[0-9a-fA-F]{64}$/.test(pk) || !escrow || !/^0x[0-9a-fA-F]{40}$/.test(escrow)) {
    throw new EscrowError('Testnet settlement is not configured.', 503);
  }
  return { pk, escrow };
}

/** One onchain order per sale. Derived, so nothing has to be stored server-side. */
export const orderIdOf = (saleId: string, heldAt: number) => keccak256(toBytes(`banana:${saleId}:${heldAt}`));

/**
 * DEMO CUSTODY. Creators don't have wallets yet, so each handle gets an address whose key Banana can
 * re-derive from the relayer key. Funds released to it are recoverable by Banana. Replace with real
 * creator wallets (or a custody provider) before mainnet.
 */
export function creatorAddress(handle: string) {
  const { pk } = config();
  return privateKeyToAccount(keccak256(encodePacked(['bytes32', 'string'], [pk, `banana-demo-custody:${handle.toLowerCase()}`]))).address;
}

function clients() {
  const { pk, escrow } = config();
  const account = privateKeyToAccount(pk);
  const transport = http(undefined, { timeout: 15_000, retryCount: 2 });
  return {
    escrow,
    pub: createPublicClient({ chain: monadTestnet, transport }),
    wallet: createWalletClient({ chain: monadTestnet, transport, account }),
  };
}

type Pub = ReturnType<typeof clients>['pub'];

async function info(pub: Pub, hash: Hex, blockNumber: bigint): Promise<ChainInfo> {
  const block = await pub.getBlock({ blockNumber });
  return { hash, block: Number(blockNumber), settledAt: Number(block.timestamp) * 1000, sample: false };
}

/** The transaction that already did `action` for this order, if any (makes retries safe). */
async function already(pub: Pub, escrow: Hex, action: keyof typeof EVENTS, orderId: Hex): Promise<ChainInfo | null> {
  const head = await pub.getBlockNumber();
  // The public RPC caps eth_getLogs at 100 blocks, so look back 600 blocks (≈ 4 minutes): enough to make
  // an immediate retry return the original transaction. Older duplicates get a clear 409 instead.
  for (let to = head, i = 0; i < 6; i++) {
    const from = to > SPAN ? to - SPAN : ZERO;
    const logs = await pub.getLogs({ address: escrow, event: EVENTS[action], args: { orderId }, fromBlock: from, toBlock: to }).catch(() => []);
    if (logs.length) return info(pub, logs[0].transactionHash!, logs[0].blockNumber!);
    if (from === ZERO) break;
    to = from - ONE;
  }
  return null;
}

async function send(c: ReturnType<typeof clients>, fn: 'depositToken' | 'release' | 'refund', args: readonly unknown[]): Promise<ChainInfo> {
  // Simulate first: a revert comes back as a clear error instead of a failed, fee-burning transaction.
  const { request } = await c.pub.simulateContract({ address: c.escrow, abi: ABI, functionName: fn, args: args as never, account: c.wallet.account });
  const hash = await c.wallet.writeContract(request);
  const r = await c.pub.waitForTransactionReceipt({ hash, pollingInterval: 400, timeout: 20_000 });
  if (r.status !== 'success') throw new EscrowError('The settlement transaction failed.');
  return info(c.pub, hash, r.blockNumber);
}

export async function escrowOnchain(action: 'hold' | 'release' | 'refund', o: { saleId: string; heldAt: number; seller: string; amountUsd: number }): Promise<ChainInfo> {
  const c = clients();
  const orderId = orderIdOf(o.saleId, o.heldAt);
  const [, , , , status] = await c.pub.readContract({ address: c.escrow, abi: ABI, functionName: 'orders', args: [orderId] });

  if (action === 'hold') {
    if (status !== STATUS.None) {
      const prev = await already(c.pub, c.escrow, 'hold', orderId);
      if (prev) return prev;
      throw new EscrowError('This order is already held.', 409);
    }
    const amount = parseUnits(o.amountUsd.toFixed(2), 6); // USDC has 6 decimals
    return send(c, 'depositToken', [orderId, creatorAddress(o.seller), amount]);
  }

  const done = action === 'release' ? STATUS.Released : STATUS.Refunded;
  if (status === done) {
    const prev = await already(c.pub, c.escrow, action, orderId);
    if (prev) return prev;
  }
  if (status !== STATUS.Held) throw new EscrowError(status === STATUS.None ? 'This order was never held.' : 'This order is already settled.', 409);

  if (action === 'refund') {
    const at = Number(await c.pub.readContract({ address: c.escrow, abi: ABI, functionName: 'refundableAt', args: [orderId] })) * 1000;
    const head = await c.pub.getBlock();
    if (Number(head.timestamp) * 1000 < at) throw new EscrowError('The refund window hasn’t opened yet.', 425, { refundableAt: at });
    return send(c, 'refund', [orderId]);
  }
  return send(c, 'release', [orderId]);
}
