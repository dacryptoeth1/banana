'use client';
import { FlipReceipt } from './FlipReceipt';
import { CITY, sampleChain } from '@/lib/chain';
import { country } from '@/lib/mock-data';
import { money } from '@/lib/format';
import type { Sale } from '@/lib/state';

/** The receipt for one sale: amount, item, buyer city, method, time. Flips to the settlement onchain. */
export function SaleReceipt({ sale, amount }: { sale: Sale; amount?: string }) {
  const t = new Date(sale.at);
  return (
    <FlipReceipt
      amount={amount ?? money(sale.grossUsd, 'USD', { decimals: 2 })}
      amountSub={<>Creator receives {money(sale.netUsd, 'USD', { decimals: 2 })} · Banana fee 2%</>}
      rows={[
        ['Item', sale.title],
        ['Buyer', `${CITY[sale.buyerCountry]}, ${country(sale.buyerCountry).name}`],
        ['Paid with', sale.method],
        ['Time', `${t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · ${t.toLocaleDateString([], { day: 'numeric', month: 'short' })}`],
        ['Order', sale.id],
      ]}
      chain={sale.chain ?? sampleChain(sale.ref, sale.at)}
      settled={`${sale.netUsd.toFixed(2)} USDC`}
    />
  );
}
