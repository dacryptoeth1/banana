// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title BananaEscrow
/// @notice Holds payment for a Creator Service until the buyer confirms delivery.
///
/// Buyers pay Banana with card or mobile money and never hold a wallet, so Banana's relayer
/// deposits on their behalf and calls `release` when the buyer taps "Confirm delivery".
/// If nothing is released within `timeout`, anyone may trigger `refund`, which always returns
/// the funds to whoever deposited them (the relayer, which refunds the buyer in local money).
///
/// The asset is fixed at deployment: `token == address(0)` escrows the native coin (MON),
/// otherwise an ERC-20 such as testnet USDC.
contract BananaEscrow {
    enum Status { None, Held, Released, Refunded }

    struct Order {
        address payer; // who deposited; refunds go back here
        address seller; // the creator
        uint128 amount;
        uint64 heldAt;
        Status status;
    }

    address public immutable relayer;
    address public immutable token;
    uint64 public immutable timeout;

    mapping(bytes32 orderId => Order) public orders;

    event Deposited(bytes32 indexed orderId, address indexed payer, address indexed seller, uint256 amount, uint64 refundableAt);
    event Released(bytes32 indexed orderId, address indexed seller, uint256 amount);
    event Refunded(bytes32 indexed orderId, address indexed payer, uint256 amount);

    error NotRelayer();
    error ZeroAddress();
    error ZeroAmount();
    error AlreadyExists();
    error NotHeld();
    error TooEarly(uint64 refundableAt);
    error WrongValue();
    error TransferFailed();

    constructor(address relayer_, address token_, uint64 timeout_) {
        if (relayer_ == address(0)) revert ZeroAddress();
        if (token_ != address(0) && token_.code.length == 0) revert ZeroAddress(); // not a token contract
        relayer = relayer_;
        token = token_;
        timeout = timeout_;
    }

    /// @notice Hold msg.value (native coin) for `orderId`.
    function deposit(bytes32 orderId, address seller) external payable {
        if (token != address(0) || msg.value > type(uint128).max) revert WrongValue();
        _hold(orderId, seller, uint128(msg.value));
    }

    /// @notice Hold `amount` of the ERC-20 for `orderId`. Approve this contract for `amount` first.
    function depositToken(bytes32 orderId, address seller, uint128 amount) external {
        if (token == address(0)) revert WrongValue();
        _hold(orderId, seller, amount);
        _call(token, abi.encodeWithSelector(0x23b872dd, msg.sender, address(this), amount)); // transferFrom
    }

    function _hold(bytes32 orderId, address seller, uint128 amount) private {
        if (seller == address(0)) revert ZeroAddress();
        if (amount == 0) revert ZeroAmount();
        if (orders[orderId].status != Status.None) revert AlreadyExists();
        uint64 now_ = uint64(block.timestamp);
        orders[orderId] = Order({ payer: msg.sender, seller: seller, amount: amount, heldAt: now_, status: Status.Held });
        emit Deposited(orderId, msg.sender, seller, amount, now_ + timeout);
    }

    /// @notice Pay the creator. Only the relayer, when the buyer confirms delivery.
    function release(bytes32 orderId) external {
        if (msg.sender != relayer) revert NotRelayer();
        Order storage o = orders[orderId];
        if (o.status != Status.Held) revert NotHeld();
        o.status = Status.Released; // effects before the transfer
        _send(o.seller, o.amount);
        emit Released(orderId, o.seller, o.amount);
    }

    /// @notice Return the funds to the payer once the timeout has passed without a release.
    function refund(bytes32 orderId) external {
        Order storage o = orders[orderId];
        if (o.status != Status.Held) revert NotHeld();
        uint64 at = o.heldAt + timeout;
        if (block.timestamp < at) revert TooEarly(at);
        o.status = Status.Refunded;
        _send(o.payer, o.amount);
        emit Refunded(orderId, o.payer, o.amount);
    }

    function refundableAt(bytes32 orderId) external view returns (uint64) {
        return orders[orderId].heldAt + timeout;
    }

    function _send(address to, uint256 amount) private {
        if (token == address(0)) {
            (bool ok,) = to.call{ value: amount }("");
            if (!ok) revert TransferFailed();
        } else {
            _call(token, abi.encodeWithSelector(0xa9059cbb, to, amount)); // transfer
        }
    }

    /// Works with tokens that return a bool and with ones that return nothing.
    function _call(address target, bytes memory data) private {
        (bool ok, bytes memory ret) = target.call(data);
        if (!ok || (ret.length != 0 && !abi.decode(ret, (bool)))) revert TransferFailed();
    }
}
