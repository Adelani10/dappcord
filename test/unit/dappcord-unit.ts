import { deployments, ethers, network } from "hardhat";
import { developmentChains } from "../../helper-hardhat-config";
import { Dappcord } from "../../typechain-types";
import { Signer } from "ethers";

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("", () => {
      let dappcord: Dappcord, deployer: Signer;

      beforeEach(async () => {
        [deployer] = await ethers.getSigners();
        await deployments.fixture(["all"]);
        dappcord = await ethers.getContract("Dappcord", deployer);
      });

      describe("deployment", () => {
        it("intializes the contract correctly", async ()=> {
            
        })
      })
    });
