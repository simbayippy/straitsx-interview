//SPDX-License-Identifier: UNLICENSED

// Solidity files have to start with this pragma.
// It will be used by the Solidity compiler to validate its version.
pragma solidity ^0.8.0;

// This is the main building block for smart contracts.
contract Token {
    // Some string type variables to identify the token.
    string public name = "My Hardhat Token";
    string public symbol = "MHT";

    // The fixed amount of tokens, stored in an unsigned integer type variable.
    uint256 public totalSupply = 1000000;

    // An address type variable is used to store ethereum accounts.
    address public owner;

    // A mapping is a key/value map. Here we store each account's balance.
    mapping(address => uint256) balances;

    // New state variables
    struct Deposit {
        uint256 amount;
        uint256 timestamp;
    }
    
    mapping(address => Deposit) public deposits;
    
    // Constants for interest calculation
    uint256 private constant INTEREST_RATE = 2; // 2%
    uint256 private constant INTEREST_PERIOD = 5 minutes;
    
    // The Transfer event helps off-chain applications understand
    // what happens within your contract.
    event Transfer(address indexed _from, address indexed _to, uint256 _value);
    event TokenDeposit(address indexed depositor, uint256 amount);
    event TokenWithdraw(address indexed depositor, uint256 amount, uint256 interest);

    /**
     * Contract initialization.
     */
    constructor() {
        // The totalSupply is assigned to the transaction sender, which is the
        // account that is deploying the contract.
        balances[msg.sender] = totalSupply;
        owner = msg.sender;
    }

    /**
     * A function to transfer tokens.
     *
     * The `external` modifier makes a function *only* callable from *outside*
     * the contract.
     */
    function transfer(address to, uint256 amount) external {
        // Check if the transaction sender has enough tokens.
        // If `require`'s first argument evaluates to `false`, the
        // transaction will revert.
        require(balances[msg.sender] >= amount, "Not enough tokens");
        // Transfer the amount.
        balances[msg.sender] -= amount;
        balances[to] += amount;

        // Notify off-chain applications of the transfer.
        emit Transfer(msg.sender, to, amount);
    }

    /**
     * Read only function to retrieve the token balance of a given account.
     *
     * The `view` modifier indicates that it doesn't modify the contract's
     * state, which allows us to call it without executing a transaction.
     */
    function balanceOf(address account) external view returns (uint256) {
        return balances[account];
    }

    // view function for users to check for earned interest
    function earnedInterest(address account) external view returns (uint256) {
        Deposit memory userDeposit = deposits[account];
        if (userDeposit.amount == 0) {
            return 0;
        }
        
        uint256 timeElapsed = block.timestamp - userDeposit.timestamp;
        uint256 periods = timeElapsed / INTEREST_PERIOD;
        return (userDeposit.amount * INTEREST_RATE * periods) / 100;
    }

    // New deposit function to earn interest
    function deposit(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        require(balances[msg.sender] >= amount, "Insufficient balance");
        require(deposits[msg.sender].amount == 0, "Existing deposit must be withdrawn first"); // ensures only one active deposit at a time, since simple interest
        
        balances[msg.sender] -= amount;
        
        deposits[msg.sender] = Deposit({
            amount: amount,
            timestamp: block.timestamp
        });
        
        emit TokenDeposit(msg.sender, amount); // emit events, notifies off-chain applications of the deposit
    }

    // Withdraw function to withdraw depost + earned interest
    function withdraw() external {
        Deposit memory userDeposit = deposits[msg.sender];
        require(userDeposit.amount > 0, "No deposit found");
        
        // Calculate time elapsed in periods, using currently block timestamp
        uint256 timeElapsed = block.timestamp - userDeposit.timestamp;
        uint256 periods = timeElapsed / INTEREST_PERIOD;
        
        // Calculate interest
        uint256 interest = (userDeposit.amount * INTEREST_RATE * periods) / 100;
        
        // Clear deposit before transfer to prevent reentrancy attacks
        uint256 totalAmount = userDeposit.amount + interest;
        delete deposits[msg.sender];
        
        // Transfer principal + interest
        balances[msg.sender] += totalAmount;
        
        emit TokenWithdraw(msg.sender, userDeposit.amount, interest);
    }
}