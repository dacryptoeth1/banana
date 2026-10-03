// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title TestUSDC (tUSDC)
/// @notice Testnet stand-in for USDC: 6 decimals, minted only by its owner (Banana's relayer).
///         Circle's Monad testnet USDC faucet gives 20 USDC per 2 hours, too little for demo orders.
///         Switch to Circle's token by redeploying BananaEscrow with USDC_ADDRESS set.
contract TestUSDC {
    string public constant name = "Test USDC";
    string public constant symbol = "tUSDC";
    uint8 public constant decimals = 6;
    address public immutable owner;
    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    error NotOwner();
    error Insufficient();

    constructor(address owner_) {
        owner = owner_;
    }

    function mint(address to, uint256 amount) external {
        if (msg.sender != owner) revert NotOwner();
        totalSupply += amount;
        balanceOf[to] += amount;
        emit Transfer(address(0), to, amount);
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        _move(msg.sender, to, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        uint256 a = allowance[from][msg.sender];
        if (a != type(uint256).max) {
            if (a < amount) revert Insufficient();
            allowance[from][msg.sender] = a - amount;
        }
        _move(from, to, amount);
        return true;
    }

    function _move(address from, address to, uint256 amount) private {
        if (balanceOf[from] < amount) revert Insufficient();
        unchecked { balanceOf[from] -= amount; }
        balanceOf[to] += amount;
        emit Transfer(from, to, amount);
    }
}
