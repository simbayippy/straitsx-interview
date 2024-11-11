# straitsx-interview

The following contains my attempt at the questions given for the straitsx 1 hour take-home assignment

Deployed and verified contract: 0x2DCdc9a5E485f350D622C968648D2A29FbAaA949

https://sepolia.etherscan.io/address/0x2DCdc9a5E485f350D622C968648D2A29FbAaA949#code

## Task 1

A few considerations made:

- For withdrawals, ensured that deposits are cleared before transferring tokens, to prevent reentrancy attacks
- Created a public view function of earnedInterest() for users to check their interest earned
- removed console.log from token.sol for actual deployment since only acts to eat up gas

## Task 2

To run and test the implementation, make sure you have hardhard installed.

Next, simply run the cli command:

```
npx hardhat run scripts/interact.js
```

Expected result should be that the final balance of the depositer (second account) is 1010 tokens (500 \* 1.02) + 500/

From console logs:

```
Deploying contracts with account: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Token deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
Transferred 1000 tokens to second account: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
Second account balance after transfer: 1000n
Deposited 500 tokens from second account
Withdrawn tokens after 5 minutes
Final balance of second account: 1010n
```
