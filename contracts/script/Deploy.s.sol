// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { Script, console } from "forge-std/Script.sol";
import { BananaEscrow } from "../src/BananaEscrow.sol";
import { TestUSDC } from "../src/TestUSDC.sol";

/// Deploys the escrow (and tUSDC unless USDC_ADDRESS is given), funds and approves the relayer.
///
///   MONAD_RELAYER_PRIVATE_KEY  relayer key (deployer = relayer)
///   ESCROW_TIMEOUT             seconds before refund() opens. Default 7 days; the testnet demo uses 600.
///   USDC_ADDRESS               optional: an existing USDC (e.g. Circle's testnet USDC) instead of tUSDC
///   MINT_USDC                  tUSDC to mint to the relayer, whole units. Default 10,000.
contract Deploy is Script {
    function run() external {
        uint256 pk = vm.envUint("MONAD_RELAYER_PRIVATE_KEY");
        address relayer = vm.addr(pk);
        uint64 timeout = uint64(vm.envOr("ESCROW_TIMEOUT", uint256(7 days)));
        address usdc = vm.envOr("USDC_ADDRESS", address(0));

        vm.startBroadcast(pk);
        if (usdc == address(0)) {
            TestUSDC t = new TestUSDC(relayer);
            t.mint(relayer, vm.envOr("MINT_USDC", uint256(10_000)) * 1e6);
            usdc = address(t);
        }
        BananaEscrow escrow = new BananaEscrow(relayer, usdc, timeout);
        // The relayer deposits for buyers; approve once so each hold is a single transaction.
        (bool ok,) = usdc.call(abi.encodeWithSignature("approve(address,uint256)", address(escrow), type(uint256).max));
        require(ok, "approve failed");
        vm.stopBroadcast();

        console.log("relayer ", relayer);
        console.log("usdc    ", usdc);
        console.log("escrow  ", address(escrow));
        console.log("timeout ", timeout);
    }
}
