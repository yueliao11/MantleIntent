const hre = require("hardhat");

async function main() {
  const MantleAdvisor = await hre.ethers.getContractFactory("MantleAdvisor");
  const advisor = await MantleAdvisor.deploy();
  await advisor.waitForDeployment();
  
  console.log("MantleAdvisor deployed to:", await advisor.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});