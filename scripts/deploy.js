// scripts/deploy.js
const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const Voting = await hre.ethers.getContractFactory("Voting");
  console.log("Deploying Voting contract...");

  const voting = await Voting.deploy();
  // Wait for the deployment transaction to be mined (ethers v6)
  await voting.waitForDeployment();

  console.log("Voting contract deployed to:", voting.target);

  const contractAddress = voting.target;
  fs.writeFileSync("contract-address.txt", contractAddress);
  console.log("Contract address saved to contract-address.txt");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
