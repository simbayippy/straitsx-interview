const { expect } = require("chai");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("Token deposit and withdraw", function () {
  // Basic deposit and interest earning
  it("Should allow deposit and earn interest", async function () {
    const [owner] = await ethers.getSigners();
    const hardhatToken = await ethers.deployContract("Token");

    // Deposit 100 tokens
    await hardhatToken.deposit(100);
    expect(await hardhatToken.balanceOf(owner.address)).to.equal(999900);

    // Fast forward 5 minutes
    await time.increase(300);

    // Withdraw and check interest
    await hardhatToken.withdraw();
    expect(await hardhatToken.balanceOf(owner.address)).to.equal(1000002);
  });

  // Multiple interest periods
  it("Should calculate interest correctly for multiple periods", async function () {
    const [owner] = await ethers.getSigners();
    const hardhatToken = await ethers.deployContract("Token");

    // Deposit 100 tokens
    await hardhatToken.deposit(100);

    // Fast forward 15 minutes (3 periods)
    await time.increase(900);

    // Withdraw and check interest (100 + 6% interest)
    await hardhatToken.withdraw();
    expect(await hardhatToken.balanceOf(owner.address)).to.equal(1000006);
  });

  // Cannot transfer while tokens are deposited
  it("Should not allow transfer of tokens that are deposited", async function () {
    const [owner, addr1] = await ethers.getSigners();
    const hardhatToken = await ethers.deployContract("Token");

    // Deposit most tokens
    await hardhatToken.deposit(999900);

    // Try to transfer the remaining 100 tokens plus 1
    await expect(hardhatToken.transfer(addr1.address, 101)).to.be.revertedWith(
      "Not enough tokens"
    );

    // Can still transfer remaining tokens
    await hardhatToken.transfer(addr1.address, 100);
    expect(await hardhatToken.balanceOf(addr1.address)).to.equal(100);
  });

  // Error cases
  it("Should handle error cases correctly", async function () {
    const [owner, addr1] = await ethers.getSigners();
    const hardhatToken = await ethers.deployContract("Token");

    // Cannot deposit 0 tokens
    await expect(hardhatToken.deposit(0)).to.be.revertedWith(
      "Amount must be greater than 0"
    );

    // Cannot deposit more than balance
    await expect(hardhatToken.deposit(1000001)).to.be.revertedWith(
      "Insufficient balance"
    );

    // Cannot withdraw without deposit
    await expect(hardhatToken.withdraw()).to.be.revertedWith(
      "No deposit found"
    );

    // Cannot make multiple deposits, only a single deposit is allowed
    await hardhatToken.deposit(100);
    await expect(hardhatToken.deposit(100)).to.be.revertedWith(
      "Existing deposit must be withdrawn first"
    );
  });

  // Only depositor can withdraw
  it("Should only allow depositor to withdraw", async function () {
    const [owner, addr1] = await ethers.getSigners();
    const hardhatToken = await ethers.deployContract("Token");

    // Owner deposits
    await hardhatToken.deposit(100);

    // Another account tries to withdraw
    await expect(hardhatToken.connect(addr1).withdraw()).to.be.revertedWith(
      "No deposit found"
    );
  });

  // Events are emitted correctly
  it("Should emit correct events for deposit and withdraw", async function () {
    const [owner] = await ethers.getSigners();
    const hardhatToken = await ethers.deployContract("Token");

    // Check deposit event
    await expect(hardhatToken.deposit(100))
      .to.emit(hardhatToken, "TokenDeposit")
      .withArgs(owner.address, 100);

    // Fast forward 5 minutes
    await time.increase(300);

    // Check withdraw event
    await expect(hardhatToken.withdraw())
      .to.emit(hardhatToken, "TokenWithdraw")
      .withArgs(owner.address, 100, 2);
  });
});
