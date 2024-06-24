import { deployments, ethers, network } from "hardhat";
import { developmentChains } from "../../helper-hardhat-config";
import { Dappcord } from "../../typechain-types";
import { BigNumber, Signer } from "ethers";
import { assert, expect } from "chai";

interface channelType {
  id: number;
  name: string;
  cost: BigNumber;
}

const channel: channelType = {
  id: 1,
  name: "intro",
  cost: ethers.utils.parseEther("0.5"),
};

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("", () => {
      let dappcord: Dappcord, deployer: Signer, joiner: Signer;

      beforeEach(async () => {
        [deployer, joiner] = await ethers.getSigners();
        await deployments.fixture(["all"]);
        dappcord = await ethers.getContract("Dappcord", deployer);
      });

      describe("deployment", () => {
        it("intializes the contract correctly", async () => {
          const res = await dappcord.getOwner();

          assert.equal(res, (await deployer.getAddress()).toString());
        });
      });

      describe("createChannel", () => {
        beforeEach(async () => {
          const response = await dappcord.createChannel(
            channel.name,
            channel.cost
          );
          await response.wait();
        });

        it("increases the number of channels", async () => {
          const res = await dappcord.totalChannels();
          assert.equal(res.toString(), "1");
        });

        it("actually creates a channel and updates the mapping", async () => {
          const res = await dappcord.getChannels(1);
          assert.equal(res.name, channel.name);
          assert.equal(
            ethers.utils.formatUnits(res.cost.toString(), "ether"),
            "0.5"
          );
        });
      });

      describe("mint", () => {
        beforeEach(async () => {
          const response = await dappcord.createChannel(
            channel.name,
            channel.cost
          );
          await response.wait();
        });

        it("reverts if the id passed in is 0", async () => {
          await expect(dappcord.mint(0, { value: channel.cost })).to.be
            .reverted;
        });

        it("reverts if the id passed in is less than the totalSupply", async () => {
          await expect(dappcord.mint(2, { value: channel.cost })).to.be
            .reverted;
        });

        it("reverts if the amount deposited is less than the channel cost", async () => {
          await expect(dappcord.mint(1)).to.be.reverted;
        });
        // it("reverts if the amount deposited is less than the channel cost", async () => {});

        it("increases total supply after mint", async () => {
          const response = await dappcord.connect(joiner).mint(channel.id, {
            value: channel.cost,
          });
          await response.wait();

          const res = await dappcord.totalSupply();

          assert.equal(res.toString(), "1");
        });

        it("actually mints NFT to the channel joiner and changes the hasJoined boolean to true", async () => {
          const response = await dappcord.connect(joiner).mint(channel.id, {
            value: channel.cost,
          });
          await response.wait();

          const res = await dappcord.hasJoined(channel.id, joiner.getAddress());

          const owner = await dappcord.ownerOf(1);
          assert.equal(res, true);
          assert.equal(owner, (await joiner.getAddress()).toString());
        });
      });

      describe("withdraw", () => {
        beforeEach(async () => {
          const res = await dappcord.createChannel(channel.name, channel.cost);
          await res.wait();

          const response = await dappcord.connect(joiner).mint(channel.id);
          await response.wait();
        });
        it("withdraws funds to the owner address", async () => {
          const startingOwnerBal = await ethers.provider.getBalance(
            deployer.getAddress()
          );

          const res = await dappcord.withdraw();
          const rec = await res.wait();

          const { gasUsed, effectiveGasPrice } = rec;
          const gasCost = gasUsed.mul(effectiveGasPrice);

          const closingOwnerBal = await ethers.provider.getBalance(
            deployer.getAddress()
          );

          assert.equal(
            closingOwnerBal.add(gasCost),
            startingOwnerBal.add(channel.cost)
          );
        });
      });
    });
