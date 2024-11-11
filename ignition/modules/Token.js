const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const TokenModule = buildModule("TokenModuleStraitsxV2", (m) => {
  const token = m.contract("Token");

  return { token };
});

module.exports = TokenModule;
