// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { Test } from "forge-std/Test.sol";
import { BananaEscrow } from "../src/BananaEscrow.sol";

/// Minimal 6-decimal ERC-20 standing in for USDC.
contract MockUSDC {
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    function mint(address to, uint256 a) external { balanceOf[to] += a; }
    function approve(address s, uint256 a) external returns (bool) { allowance[msg.sender][s] = a; return true; }
    function transfer(address to, uint256 a) external returns (bool) { balanceOf[msg.sender] -= a; balanceOf[to] += a; return true; }
    function transferFrom(address f, address to, uint256 a) external returns (bool) {
        allowance[f][msg.sender] -= a; balanceOf[f] -= a; balanceOf[to] += a; return true;
    }
}

/// A seller that refuses native payments, to prove a failed transfer can't strand state.
contract Refuser {
    receive() external payable { revert("no"); }
}

contract BananaEscrowTest is Test {
    event Deposited(bytes32 indexed orderId, address indexed payer, address indexed seller, uint256 amount, uint64 refundableAt);
    event Released(bytes32 indexed orderId, address indexed seller, uint256 amount);
    event Refunded(bytes32 indexed orderId, address indexed payer, uint256 amount);

    uint64 constant TIMEOUT = 7 days;
    address relayer = makeAddr("relayer");
    address seller = makeAddr("seller");
    address stranger = makeAddr("stranger");
    bytes32 constant ORDER = keccak256("BNN-1234");

    BananaEscrow escrow; // native MON

    function setUp() public {
        escrow = new BananaEscrow(relayer, address(0), TIMEOUT);
        vm.deal(relayer, 100 ether);
        vm.deal(stranger, 100 ether);
    }

    function _status(BananaEscrow e, bytes32 id) internal view returns (BananaEscrow.Status s) {
        (,,,, s) = e.orders(id);
    }

    // --------------------------------------------------------------- deposit

    function test_deposit_holdsFundsAndEmits() public {
        vm.expectEmit(address(escrow));
        emit Deposited(ORDER, relayer, seller, 1 ether, uint64(block.timestamp) + TIMEOUT);
        vm.prank(relayer);
        escrow.deposit{ value: 1 ether }(ORDER, seller);

        (address payer, address s, uint128 amount, uint64 heldAt, BananaEscrow.Status st) = escrow.orders(ORDER);
        assertEq(payer, relayer);
        assertEq(s, seller);
        assertEq(amount, 1 ether);
        assertEq(heldAt, block.timestamp);
        assertEq(uint8(st), uint8(BananaEscrow.Status.Held));
        assertEq(address(escrow).balance, 1 ether);
    }

    function test_deposit_revertsOnDuplicateOrder() public {
        vm.startPrank(relayer);
        escrow.deposit{ value: 1 ether }(ORDER, seller);
        vm.expectRevert(BananaEscrow.AlreadyExists.selector);
        escrow.deposit{ value: 1 ether }(ORDER, seller);
    }

    function test_deposit_revertsOnZeroAmountOrSeller() public {
        vm.startPrank(relayer);
        vm.expectRevert(BananaEscrow.ZeroAmount.selector);
        escrow.deposit{ value: 0 }(ORDER, seller);
        vm.expectRevert(BananaEscrow.ZeroAddress.selector);
        escrow.deposit{ value: 1 ether }(ORDER, address(0));
    }

    function test_deposit_nativeRejectsTokenPath() public {
        vm.prank(relayer);
        vm.expectRevert(BananaEscrow.WrongValue.selector);
        escrow.depositToken(ORDER, seller, 1);
    }

    // --------------------------------------------------------------- release

    function test_release_paysSellerOnce() public {
        vm.prank(relayer);
        escrow.deposit{ value: 1 ether }(ORDER, seller);

        vm.expectEmit(address(escrow));
        emit Released(ORDER, seller, 1 ether);
        vm.prank(relayer);
        escrow.release(ORDER);

        assertEq(seller.balance, 1 ether);
        assertEq(address(escrow).balance, 0);
        assertEq(uint8(_status(escrow, ORDER)), uint8(BananaEscrow.Status.Released));

        vm.prank(relayer);
        vm.expectRevert(BananaEscrow.NotHeld.selector);
        escrow.release(ORDER);
    }

    function test_release_onlyRelayer() public {
        vm.prank(relayer);
        escrow.deposit{ value: 1 ether }(ORDER, seller);

        for (uint256 i; i < 3; i++) {
            address who = [stranger, seller, address(this)][i];
            vm.prank(who);
            vm.expectRevert(BananaEscrow.NotRelayer.selector);
            escrow.release(ORDER);
        }
        assertEq(seller.balance, 0);
    }

    function test_release_revertsForUnknownOrder() public {
        vm.prank(relayer);
        vm.expectRevert(BananaEscrow.NotHeld.selector);
        escrow.release(keccak256("nope"));
    }

    function test_release_failedTransferRevertsWholeCall() public {
        Refuser bad = new Refuser();
        vm.startPrank(relayer);
        escrow.deposit{ value: 1 ether }(ORDER, address(bad));
        vm.expectRevert(BananaEscrow.TransferFailed.selector);
        escrow.release(ORDER);
        assertEq(uint8(_status(escrow, ORDER)), uint8(BananaEscrow.Status.Held)); // still held, refundable later
    }

    // ---------------------------------------------------------------- refund

    function test_refund_tooEarly() public {
        vm.prank(relayer);
        escrow.deposit{ value: 1 ether }(ORDER, seller);
        uint64 at = uint64(block.timestamp) + TIMEOUT;

        vm.warp(at - 1);
        vm.expectRevert(abi.encodeWithSelector(BananaEscrow.TooEarly.selector, at));
        escrow.refund(ORDER);
    }

    function test_refund_afterTimeout_returnsToPayer_anyoneCanTrigger() public {
        vm.prank(relayer);
        escrow.deposit{ value: 1 ether }(ORDER, seller);
        uint256 before = relayer.balance;

        vm.warp(block.timestamp + TIMEOUT);
        vm.expectEmit(address(escrow));
        emit Refunded(ORDER, relayer, 1 ether);
        vm.prank(stranger);
        escrow.refund(ORDER);

        assertEq(relayer.balance, before + 1 ether);
        assertEq(seller.balance, 0);
        assertEq(uint8(_status(escrow, ORDER)), uint8(BananaEscrow.Status.Refunded));
    }

    function test_noReleaseAfterRefund_noRefundAfterRelease() public {
        bytes32 other = keccak256("BNN-5678");
        vm.startPrank(relayer);
        escrow.deposit{ value: 1 ether }(ORDER, seller);
        escrow.deposit{ value: 2 ether }(other, seller);
        escrow.release(other);
        vm.warp(block.timestamp + TIMEOUT);
        escrow.refund(ORDER);

        vm.expectRevert(BananaEscrow.NotHeld.selector);
        escrow.release(ORDER);
        vm.expectRevert(BananaEscrow.NotHeld.selector);
        escrow.refund(other);
        vm.stopPrank();
        assertEq(seller.balance, 2 ether);
    }

    function testFuzz_holdThenRelease(uint128 amount, address s) public {
        vm.assume(amount > 0 && amount <= 50 ether);
        vm.assume(s != address(0) && s.code.length == 0 && uint160(s) > 0xff && s != address(escrow));
        uint256 before = s.balance;
        vm.startPrank(relayer);
        escrow.deposit{ value: amount }(ORDER, s);
        escrow.release(ORDER);
        assertEq(s.balance, before + amount);
    }

    // ----------------------------------------------------------- ERC-20 path

    function test_token_holdReleaseRefund() public {
        MockUSDC usdc = new MockUSDC();
        BananaEscrow e = new BananaEscrow(relayer, address(usdc), TIMEOUT);
        usdc.mint(relayer, 100e6);

        vm.startPrank(relayer);
        usdc.approve(address(e), type(uint256).max);
        e.depositToken(ORDER, seller, 9_020_000); // 9.02 USDC
        e.depositToken(keccak256("b"), seller, 1e6);
        vm.expectRevert(BananaEscrow.WrongValue.selector);
        e.deposit{ value: 1 }(keccak256("c"), seller);

        e.release(ORDER);
        assertEq(usdc.balanceOf(seller), 9_020_000);

        vm.warp(block.timestamp + TIMEOUT);
        e.refund(keccak256("b"));
        assertEq(usdc.balanceOf(relayer), 100e6 - 9_020_000);
        assertEq(usdc.balanceOf(address(e)), 0);
    }

    function test_constructor_validates() public {
        vm.expectRevert(BananaEscrow.ZeroAddress.selector);
        new BananaEscrow(address(0), address(0), TIMEOUT);
        vm.expectRevert(BananaEscrow.ZeroAddress.selector);
        new BananaEscrow(relayer, address(0xBEEF), TIMEOUT); // no code: not a token
    }
}

import { TestUSDC } from "../src/TestUSDC.sol";

contract TestUSDCTest is Test {
    address owner = makeAddr("owner");
    address alice = makeAddr("alice");

    function test_onlyOwnerMints_and_escrowRoundTrip() public {
        TestUSDC t = new TestUSDC(owner);
        assertEq(t.decimals(), 6);
        vm.prank(alice);
        vm.expectRevert(TestUSDC.NotOwner.selector);
        t.mint(alice, 1);

        vm.startPrank(owner);
        t.mint(owner, 100e6);
        BananaEscrow e = new BananaEscrow(owner, address(t), 600);
        t.approve(address(e), type(uint256).max);
        e.depositToken(keccak256("x"), alice, 49e6);
        e.release(keccak256("x"));
        vm.stopPrank();
        assertEq(t.balanceOf(alice), 49e6);
        assertEq(t.allowance(owner, address(e)), type(uint256).max); // infinite approval isn't decremented
    }

    function test_transferFromRespectsAllowance() public {
        TestUSDC t = new TestUSDC(owner);
        vm.prank(owner);
        t.mint(owner, 10e6);
        vm.prank(owner);
        t.approve(alice, 5e6);
        vm.prank(alice);
        vm.expectRevert(TestUSDC.Insufficient.selector);
        t.transferFrom(owner, alice, 6e6);
    }
}
