import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { VERIFICATION_BLOCK_CONFIRMATIONS, developmentChains } from "../helper-hardhat-config";
import verify from "../utils/verify";

const deployDappcord: DeployFunction = async (
  hre: HardhatRuntimeEnvironment
) => {
  const { deployments, getNamedAccounts, ethers, network } = hre;

  const {deploy, log} = deployments
  const {deployer} = await getNamedAccounts()
  const waitBlockConfirmations = developmentChains.includes(network.name)
    ? 1
    : VERIFICATION_BLOCK_CONFIRMATIONS;

  const args: any[] = []

  const dappcord = await deploy("Dappcord", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: waitBlockConfirmations
  })

  if(developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY){
    await verify(dappcord.address, args);
    log("verification done");
  }
};



export default deployDappcord

deployDappcord.tags = ["all", "dappcord"];
