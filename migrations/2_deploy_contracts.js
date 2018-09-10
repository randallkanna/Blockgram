var Fund = artifacts.require("./Fund.sol");

module.exports = function(deployer) {
  deployer.deploy(Fund);
};
