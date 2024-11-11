const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

async function main() {
  const [deployer, secondAccount] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Deploy the contract
  const Token = await ethers.getContractFactory("Token");
  const token = await Token.deploy();
  await token.waitForDeployment();
  console.log("Token deployed to:", await token.getAddress());

  // Transfer 1000 tokens to second account
  const transferTx = await token.transfer(secondAccount.address, 1000);
  await transferTx.wait();
  console.log(
    "Transferred 1000 tokens to second account:",
    secondAccount.address
  );

  // Check second account balance
  const balanceAfterTransfer = await token.balanceOf(secondAccount.address);
  console.log("Second account balance after transfer:", balanceAfterTransfer);

  // Deposit 500 tokens from second account
  const tokenWithSecondAccount = token.connect(secondAccount);
  const depositTx = await tokenWithSecondAccount.deposit(500);
  await depositTx.wait();
  console.log("Deposited 500 tokens from second account");

  // Fast forward 5 minutes
  await time.increase(300); // 5 minutes in seconds

  // Withdraw tokens
  const withdrawTx = await tokenWithSecondAccount.withdraw();
  await withdrawTx.wait();
  console.log("Withdrawn tokens after 5 minutes");

  // Check final balance
  const finalBalance = await token.balanceOf(secondAccount.address);
  console.log("Final balance of second account:", finalBalance);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
