const Migrations = artifacts.require("Migrations");

module.exports = function (deployer) {
  deployer.deploy(Migrations);
};

  // SETUP

// deploy fakeDAI and fakeUSDC token contracts on Kovan
// deposit fakeDAI and fakeUSDC tokens on Arbitrum to spawn new token contracts
// deploy uniswap pair on Arbitrum
// provide liquidity on fakeDAI/fakeUSDC uniswap pair + mint LP tokens

  // TRANSACTION

// 2nd account deposits fakeDAI into Arbitrum
// swaps fakeDAI for fakeUSDC
// withdraws fakeUSDC on Kovan

