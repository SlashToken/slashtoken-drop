const {
  time,
  loadFixture, reset, impersonateAccount
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
require("@nomiclabs/hardhat-web3");

describe("SlashToken", function () {


  async function deployDummyErc20TokenAndMint() {

    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount, thirdUser] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("DummyErc20");
    const token = await Token.deploy({from: owner});

    const SlashToken = await ethers.getContractFactory("SlashToken");
    const slashToken = await SlashToken.deploy({from: owner});
    await slashToken.initialize(owner.address, '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199', ethers.parseEther("0.03"), [5, 10, 30], [ethers.parseEther("0.12"), ethers.parseEther("0.21"), ethers.parseEther("0.45")])
    return  { token, slashToken, owner, otherAccount, thirdUser };
  }
  async function deployDummyErc721TokenAndSlashtoken() {

    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount, thirdUser] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("DummyErc721");
    const token = await Token.deploy({from: owner});

    const SlashToken = await ethers.getContractFactory("SlashToken");
    const slashToken = await SlashToken.deploy({from: owner});
    await slashToken.initialize(owner.address, '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199', ethers.parseEther("0.03"), [5, 10, 30], [ethers.parseEther("0.12"), ethers.parseEther("0.21"), ethers.parseEther("0.45")])
    await slashToken.handleErc721Flag(1)
    return  { token, slashToken, owner, otherAccount, thirdUser };
  }
  xdescribe("ERC20", function () {
    describe("E2E Airdrop", function () {
      xit("Should mint and airdrop the token with fixed price", async function () {
        const {token, slashToken, owner, otherAccount, thirdUser} = await loadFixture(
            deployDummyErc20TokenAndMint
        );

        await token.mint(50000000000000n, {from: owner});
        let addressList = []

        for (let i = 0; i < 500; i++) {
          let wallet = ethers.Wallet.createRandom()
          addressList.push(wallet.address)
        }
        expect(await token.balanceOf(owner.address)).to.equal(50000000000000000000000000000000n);
        const tokenAddress = await token.getAddress()
        const slashTokenAddress = await slashToken.getAddress()
        await token.increaseAllowance(slashTokenAddress, 50000000000000000000000000000000n, {from: owner})
        expect(await token.allowance(owner.address, slashTokenAddress)).to.equal(50000000000000000000000000000000n)
        await expect(slashToken.erc20AirdropEqualAmount(addressList, ethers.parseEther("123456789"), tokenAddress, {
          value: ethers.parseEther("0.03"),
          from: owner
        }))
            .to.emit(slashToken, "Erc20AirdropEqualAmount")
            .withArgs(owner.address, tokenAddress, 500, ethers.parseEther("123456789") * 500n);
        for (let i = 0; i < addressList.length; i++) {
          expect(await token.balanceOf(addressList[i])).to.equal(123456789000000000000000000n);
        }
        expect(await ethers.provider.getBalance(slashTokenAddress)).to.equal(ethers.parseEther("0.03"))
        await slashToken.claimFees();
        expect(await ethers.provider.getBalance('0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199')).to.equal(ethers.parseEther("10000.03"))

      }).timeout(100000);;
      xit("Should mint and airdrop the token with custom price", async function () {
        const {token, slashToken, owner, otherAccount, thirdUser} = await loadFixture(
            deployDummyErc20TokenAndMint
        );
        await token.mint(50000000000000n, {from: owner});
        let addressList = []
        let amounts = []
        for (let i = 0; i < 500; i++) {
          let wallet = ethers.Wallet.createRandom()
          addressList.push(wallet.address)
          amounts.push(Math.floor(Math.random() * (123456789 - 1000)) + 1000)
        }
        const sum1 = amounts.reduce((acc, item) => BigInt(acc) + BigInt(item), 0);
        expect(await token.balanceOf(owner.address)).to.equal(50000000000000000000000000000000n);
        const tokenAddress = await token.getAddress()
        const slashTokenAddress = await slashToken.getAddress()
        await token.increaseAllowance(slashTokenAddress, 50000000000000000000000000000000n, {from: owner})
        expect(await token.allowance(owner.address, slashTokenAddress)).to.equal(50000000000000000000000000000000n)
        await expect(slashToken.erc20AirdropCustomAmount(addressList, amounts, tokenAddress, sum1, {
          value: ethers.parseEther("0.03"),
          from: owner
        }))
            .to.emit(slashToken, "Erc20AirdropCustomAmount")
            .withArgs(owner.address, tokenAddress, 500, sum1);
        for (let i = 0; i < addressList.length; i++) {
          expect(await token.balanceOf(addressList[i])).to.equal(amounts[i]);
        }
      });
      xit("Should buy 5 txns bundle and airdrop the token with fixed price", async function () {
        const {token, slashToken, owner, otherAccount, thirdUser} = await loadFixture(
            deployDummyErc20TokenAndMint
        );

        await token.mint(50000000000000n, {from: owner});
        let addressList1 = []
        let addressList2 = []

        for (let i = 0; i < 500; i++) {
          let wallet1 = ethers.Wallet.createRandom()
          let wallet2 = ethers.Wallet.createRandom()
          addressList1.push(wallet1.address)
          addressList2.push(wallet2.address)
        }
        expect(await token.balanceOf(owner.address)).to.equal(50000000000000000000000000000000n);
        const tokenAddress = await token.getAddress()
        const slashTokenAddress = await slashToken.getAddress()
        await token.increaseAllowance(slashTokenAddress, 50000000000000000000000000000000n, {from: owner})
        expect(await token.allowance(owner.address, slashTokenAddress)).to.equal(50000000000000000000000000000000n)
        await expect(slashToken.buyTxnsBundle(0, 1, {value: ethers.parseEther("0.12"), from: owner}))
            .to.emit(slashToken, "TxnsBundleBought")
            .withArgs(owner.address, ethers.parseEther("0.12"), 5)
        await expect(slashToken.erc20AirdropEqualAmount(addressList1, ethers.parseEther("123456789"), tokenAddress, {from: owner}))
            .to.emit(slashToken, "Erc20AirdropEqualAmount")
            .withArgs(owner.address, tokenAddress, 500, ethers.parseEther("123456789") * 500n);
        const secondBundleTxn = await slashToken.erc20AirdropEqualAmount(addressList2, ethers.parseEther("123456789"), tokenAddress, {from: owner});
        await expect(secondBundleTxn)
            .to.emit(slashToken, "Erc20AirdropEqualAmount")
            .withArgs(owner.address, tokenAddress, 500, ethers.parseEther("123456789") * 500n);
        expect(await slashToken.getAvailableTxnsForWallet({from: owner}))
            .to.equal(3)
      });
      xit("Should buy a 5 txns bundle and airdrop the token with custom price", async function () {
        const {token, slashToken, owner, otherAccount, thirdUser} = await loadFixture(
            deployDummyErc20TokenAndMint
        );

        await token.mint(50000000000000n, {from: owner});
        let addressList1 = []
        let addressList2 = []
        let amounts1 = []
        let amounts2 = []

        for (let i = 0; i < 500; i++) {
          let wallet1 = ethers.Wallet.createRandom()
          let wallet2 = ethers.Wallet.createRandom()
          addressList1.push(wallet1.address)
          addressList2.push(wallet2.address)
          amounts1.push(Math.floor(Math.random() * (123456789 - 1000)) + 1000)
          amounts2.push(Math.floor(Math.random() * (123456789 - 1000)) + 1000)
        }
        const sum1 = amounts1.reduce((acc, item) => BigInt(acc) + BigInt(item), 0);
        const sum2 = amounts2.reduce((acc, item) => BigInt(acc) + BigInt(item), 0);


        expect(await token.balanceOf(owner.address)).to.equal(50000000000000000000000000000000n);
        const tokenAddress = await token.getAddress()
        const slashTokenAddress = await slashToken.getAddress()
        await token.increaseAllowance(slashTokenAddress, 50000000000000000000000000000000n, {from: owner})
        expect(await token.allowance(owner.address, slashTokenAddress)).to.equal(50000000000000000000000000000000n)
        await expect(slashToken.buyTxnsBundle(0, 1, {value: ethers.parseEther("0.12"), from: owner}))
            .to.emit(slashToken, "TxnsBundleBought")
            .withArgs(owner.address, ethers.parseEther("0.12"), 5)
        await expect(slashToken.erc20AirdropCustomAmount(addressList1, amounts1, tokenAddress, sum1,{from: owner}))
            .to.emit(slashToken, "Erc20AirdropCustomAmount")
            .withArgs(owner.address, tokenAddress, 500, sum1);
        const secondBundleTxn = await slashToken.erc20AirdropCustomAmount(addressList2, amounts2, tokenAddress, sum2, {from: owner});
        await expect(secondBundleTxn)
            .to.emit(slashToken, "Erc20AirdropCustomAmount")
            .withArgs(owner.address, tokenAddress, 500, sum2);
        expect(await slashToken.getAvailableTxnsForWallet({from: owner}))
            .to.equal(3)
      });
      xit("Should buy 10 txns bundle and airdrop the token with fixed price", async function () {
        const {token, slashToken, owner, otherAccount, thirdUser} = await loadFixture(
            deployDummyErc20TokenAndMint
        );

        await token.mint(50000000000000n, {from: owner});
        let addressList1 = []
        let addressList2 = []

        for (let i = 0; i < 500; i++) {
          let wallet1 = ethers.Wallet.createRandom()
          let wallet2 = ethers.Wallet.createRandom()
          addressList1.push(wallet1.address)
          addressList2.push(wallet2.address)
        }
        expect(await token.balanceOf(owner.address)).to.equal(50000000000000000000000000000000n);
        const tokenAddress = await token.getAddress()
        const slashTokenAddress = await slashToken.getAddress()
        await token.increaseAllowance(slashTokenAddress, 50000000000000000000000000000000n, {from: owner})
        expect(await token.allowance(owner.address, slashTokenAddress)).to.equal(50000000000000000000000000000000n)
        await expect(slashToken.buyTxnsBundle(1, 1, {value: ethers.parseEther("0.21"), from: owner}))
            .to.emit(slashToken, "TxnsBundleBought")
            .withArgs(owner.address, ethers.parseEther("0.21"), 10)
        await expect(slashToken.erc20AirdropEqualAmount(addressList1, ethers.parseEther("123456789"), tokenAddress, {from: owner}))
            .to.emit(slashToken, "Erc20AirdropEqualAmount")
            .withArgs(owner.address, tokenAddress, 500, ethers.parseEther("123456789") * 500n);
        const secondBundleTxn = await slashToken.erc20AirdropEqualAmount(addressList2, ethers.parseEther("123456789"), tokenAddress, {from: owner});
        await expect(secondBundleTxn)
            .to.emit(slashToken, "Erc20AirdropEqualAmount")
            .withArgs(owner.address, tokenAddress, 500, ethers.parseEther("123456789") * 500n);
        expect(await slashToken.getAvailableTxnsForWallet({from: owner}))
            .to.equal(8)
      });
      xit("Should buy a 10 txns bundle and airdrop the token with custom price", async function () {
        const {token, slashToken, owner, otherAccount, thirdUser} = await loadFixture(
            deployDummyErc20TokenAndMint
        );

        await token.mint(50000000000000n, {from: owner});
        let addressList1 = []
        let addressList2 = []
        let amounts1 = []
        let amounts2 = []

        for (let i = 0; i < 500; i++) {
          let wallet1 = ethers.Wallet.createRandom()
          let wallet2 = ethers.Wallet.createRandom()
          addressList1.push(wallet1.address)
          addressList2.push(wallet2.address)
          amounts1.push(Math.floor(Math.random() * (123456789 - 1000)) + 1000)
          amounts2.push(Math.floor(Math.random() * (123456789 - 1000)) + 1000)
        }
        const sum1 = amounts1.reduce((acc, item) => BigInt(acc) + BigInt(item), 0);
        const sum2 = amounts2.reduce((acc, item) => BigInt(acc) + BigInt(item), 0);


        expect(await token.balanceOf(owner.address)).to.equal(50000000000000000000000000000000n);
        const tokenAddress = await token.getAddress()
        const slashTokenAddress = await slashToken.getAddress()
        await token.increaseAllowance(slashTokenAddress, 50000000000000000000000000000000n, {from: owner})
        expect(await token.allowance(owner.address, slashTokenAddress)).to.equal(50000000000000000000000000000000n)
        await expect(slashToken.buyTxnsBundle(1, 1, {value: ethers.parseEther("0.21"), from: owner}))
            .to.emit(slashToken, "TxnsBundleBought")
            .withArgs(owner.address, ethers.parseEther("0.21"), 10)
        await expect(slashToken.erc20AirdropCustomAmount(addressList1, amounts1, tokenAddress, sum1,{from: owner}))
            .to.emit(slashToken, "Erc20AirdropCustomAmount")
            .withArgs(owner.address, tokenAddress, 500, sum1);
        const secondBundleTxn = await slashToken.erc20AirdropCustomAmount(addressList2, amounts2, tokenAddress, sum2, {from: owner});
        await expect(secondBundleTxn)
            .to.emit(slashToken, "Erc20AirdropCustomAmount")
            .withArgs(owner.address, tokenAddress, 500, sum2);
        expect(await slashToken.getAvailableTxnsForWallet({from: owner}))
            .to.equal(8)
      });
      xit("Should buy 30 txns bundle and airdrop the token with fixed price", async function () {
        const {token, slashToken, owner, otherAccount, thirdUser} = await loadFixture(
            deployDummyErc20TokenAndMint
        );

        await token.mint(50000000000000n, {from: owner});
        let addressList1 = []
        let addressList2 = []

        for (let i = 0; i < 500; i++) {
          let wallet1 = ethers.Wallet.createRandom()
          let wallet2 = ethers.Wallet.createRandom()
          addressList1.push(wallet1.address)
          addressList2.push(wallet2.address)
        }
        expect(await token.balanceOf(owner.address)).to.equal(50000000000000000000000000000000n);
        const tokenAddress = await token.getAddress()
        const slashTokenAddress = await slashToken.getAddress()
        await token.increaseAllowance(slashTokenAddress, 50000000000000000000000000000000n, {from: owner})
        expect(await token.allowance(owner.address, slashTokenAddress)).to.equal(50000000000000000000000000000000n)
        await expect(slashToken.buyTxnsBundle(2, 1, {value: ethers.parseEther("0.45"), from: owner}))
            .to.emit(slashToken, "TxnsBundleBought")
            .withArgs(owner.address, ethers.parseEther("0.45"), 30)
        await expect(slashToken.erc20AirdropEqualAmount(addressList1, ethers.parseEther("123456789"), tokenAddress, {from: owner}))
            .to.emit(slashToken, "Erc20AirdropEqualAmount")
            .withArgs(owner.address, tokenAddress, 500, ethers.parseEther("123456789") * 500n);
        const secondBundleTxn = await slashToken.erc20AirdropEqualAmount(addressList2, ethers.parseEther("123456789"), tokenAddress, {from: owner});
        await expect(secondBundleTxn)
            .to.emit(slashToken, "Erc20AirdropEqualAmount")
            .withArgs(owner.address, tokenAddress, 500, ethers.parseEther("123456789") * 500n);
        expect(await slashToken.getAvailableTxnsForWallet({from: owner}))
            .to.equal(28)
      });
      xit("Should buy a 30 txns bundle and airdrop the token with custom price", async function () {
        const {token, slashToken, owner, otherAccount, thirdUser} = await loadFixture(
            deployDummyErc20TokenAndMint
        );

        await token.mint(50000000000000n, {from: owner});
        let addressList1 = []
        let addressList2 = []
        let amounts1 = []
        let amounts2 = []

        for (let i = 0; i < 500; i++) {
          let wallet1 = ethers.Wallet.createRandom()
          let wallet2 = ethers.Wallet.createRandom()
          addressList1.push(wallet1.address)
          addressList2.push(wallet2.address)
          amounts1.push(Math.floor(Math.random() * (123456789 - 1000)) + 1000)
          amounts2.push(Math.floor(Math.random() * (123456789 - 1000)) + 1000)
        }
        const sum1 = amounts1.reduce((acc, item) => BigInt(acc) + BigInt(item), 0);
        const sum2 = amounts2.reduce((acc, item) => BigInt(acc) + BigInt(item), 0);


        expect(await token.balanceOf(owner.address)).to.equal(50000000000000000000000000000000n);
        const tokenAddress = await token.getAddress()
        const slashTokenAddress = await slashToken.getAddress()
        await token.increaseAllowance(slashTokenAddress, 50000000000000000000000000000000n, {from: owner})
        expect(await token.allowance(owner.address, slashTokenAddress)).to.equal(50000000000000000000000000000000n)
        await expect(slashToken.buyTxnsBundle(2, 1, {value: ethers.parseEther("0.45"), from: owner}))
            .to.emit(slashToken, "TxnsBundleBought")
            .withArgs(owner.address, ethers.parseEther("0.45"), 30)
        await expect(slashToken.erc20AirdropCustomAmount(addressList1, amounts1, tokenAddress, sum1,{from: owner}))
            .to.emit(slashToken, "Erc20AirdropCustomAmount")
            .withArgs(owner.address, tokenAddress, 500, sum1);
        const secondBundleTxn = await slashToken.erc20AirdropCustomAmount(addressList2, amounts2, tokenAddress, sum2, {from: owner});
        await expect(secondBundleTxn)
            .to.emit(slashToken, "Erc20AirdropCustomAmount")
            .withArgs(owner.address, tokenAddress, 500, sum2);
        expect(await slashToken.getAvailableTxnsForWallet({from: owner}))
            .to.equal(28)
      });
      xit("Should whitelist a wallet and airdrop the token with fixed price", async function () {
        const {token, slashToken, owner, otherAccount, thirdUser} = await loadFixture(
            deployDummyErc20TokenAndMint
        );

        await token.mint(50000000000000n, {from: owner});
        let addressList = []

        for (let i = 0; i < 500; i++) {
          let wallet = ethers.Wallet.createRandom()
          addressList.push(wallet.address)
        }
        expect(await token.balanceOf(owner.address)).to.equal(50000000000000000000000000000000n);
        const tokenAddress = await token.getAddress()
        const slashTokenAddress = await slashToken.getAddress()
        await token.increaseAllowance(slashTokenAddress, 50000000000000000000000000000000n, {from: owner})
        expect(await token.allowance(owner.address, slashTokenAddress)).to.equal(50000000000000000000000000000000n)
        await slashToken.setBaseFeeForWallet(owner.address, ethers.parseEther("0.02"), {from: owner})
        await expect(slashToken.erc20AirdropEqualAmount(addressList, ethers.parseEther("123456789"), tokenAddress, {
          value: ethers.parseEther("0.02"),
          from: owner
        }))
            .to.emit(slashToken, "Erc20AirdropEqualAmount")
            .withArgs(owner.address, tokenAddress, 500, ethers.parseEther("123456789")*500n);
      });
      xit("Should giveaway txns to a wallet and airdrop the token with fixed price", async function () {
        const {token, slashToken, owner, otherAccount, thirdUser} = await loadFixture(
            deployDummyErc20TokenAndMint
        );

        await token.mint(50000000000000n, {from: owner});
        let addressList = []

        for (let i = 0; i < 500; i++) {
          let wallet = ethers.Wallet.createRandom()
          addressList.push(wallet.address)
        }
        expect(await token.balanceOf(owner.address)).to.equal(50000000000000000000000000000000n);
        const tokenAddress = await token.getAddress()
        const slashTokenAddress = await slashToken.getAddress()
        await token.increaseAllowance(slashTokenAddress, 50000000000000000000000000000000n, {from: owner})
        expect(await token.allowance(owner.address, slashTokenAddress)).to.equal(50000000000000000000000000000000n)
        await expect(slashToken.addTxnsToWallets([owner.address], [1], {from: owner}))
            .to.emit(slashToken, "TxnsAdded")
            .withArgs([owner.address], [1])
        await expect(slashToken.erc20AirdropEqualAmount(addressList, ethers.parseEther("123456789"), tokenAddress, {
          from: owner
        }))
            .to.emit(slashToken, "Erc20AirdropEqualAmount")
            .withArgs(owner.address, tokenAddress, 500, ethers.parseEther("123456789")*500n);
      });
      xit("Should giveaway txns to a wallet and airdrop the token with custom price", async function () {
        const {token, slashToken, owner, otherAccount, thirdUser} = await loadFixture(
            deployDummyErc20TokenAndMint
        );

        await token.mint(50000000000000n, {from: owner});
        let addressList = []

        for (let i = 0; i < 500; i++) {
          let wallet = ethers.Wallet.createRandom()
          addressList.push(wallet.address)
        }
        expect(await token.balanceOf(owner.address)).to.equal(50000000000000000000000000000000n);
        const tokenAddress = await token.getAddress()
        const slashTokenAddress = await slashToken.getAddress()
        await token.increaseAllowance(slashTokenAddress, 50000000000000000000000000000000n, {from: owner})
        expect(await token.allowance(owner.address, slashTokenAddress)).to.equal(50000000000000000000000000000000n)
        await expect(slashToken.addTxnsToWallets([owner.address], [1], {from: owner}))
            .to.emit(slashToken, "TxnsAdded")
            .withArgs([owner.address], [1])
        await expect(slashToken.erc20AirdropEqualAmount(addressList, ethers.parseEther("123456789"), tokenAddress, {
          from: owner
        }))
            .to.emit(slashToken, "Erc20AirdropEqualAmount")
            .withArgs(owner.address, tokenAddress, 500, ethers.parseEther("123456789")*500n);
      });
    });
    xdescribe("Erc20 airdrop functionality tests", function () {
      it("Should revert with NVV if not correct value", async function () {
        const {token, slashToken, owner, otherAccount, thirdUser} = await loadFixture(
            deployDummyErc20TokenAndMint
        );
        const tokenAddress = await token.getAddress()
        await expect(slashToken.erc20AirdropEqualAmount([owner.address], ethers.parseEther("123456789"), tokenAddress, {
          value: ethers.parseEther("0.02"),
          from: owner
        })).revertedWith("NVV")
        await expect(slashToken.erc20AirdropCustomAmount([owner.address], [1], tokenAddress, 1,  {
          value: ethers.parseEther("0.02"),
          from: owner
        })).revertedWith("NVV")
      });
      it("Should revert if not valid approvals", async function () {
        const {token, slashToken, owner, otherAccount, thirdUser} = await loadFixture(
            deployDummyErc20TokenAndMint
        );
        const tokenAddress = await token.getAddress()
        await expect(slashToken.erc20AirdropEqualAmount([owner.address], ethers.parseEther("123456789"), tokenAddress, {
          value: ethers.parseEther("0.03"),
          from: owner
        })).revertedWithCustomError(slashToken, "TransferFromFailed()")
        await expect(slashToken.erc20AirdropCustomAmount([owner.address], [1], tokenAddress, 1, {
          value: ethers.parseEther("0.03"),
          from: owner
        })).revertedWithCustomError(slashToken, "TransferFromFailed()")
      });
      it("Should revert if not enough amount", async function () {
        const {token, slashToken, owner, otherAccount, thirdUser} = await loadFixture(
            deployDummyErc20TokenAndMint
        );
        await token.mint(1n, {from: owner});
        const slashTokenAddress = await slashToken.getAddress()
        await token.increaseAllowance(slashTokenAddress, 50000000000000000000000000000000n, {from: owner})
        const tokenAddress = await token.getAddress()
        await expect(slashToken.erc20AirdropEqualAmount([owner.address], ethers.parseEther("123456789"), tokenAddress, {
          value: ethers.parseEther("0.03"),
          from: owner
        })).revertedWithCustomError(slashToken, "TransferFromFailed")
        await expect(slashToken.erc20AirdropCustomAmount([owner.address], [ethers.parseEther("123456789")], tokenAddress, ethers.parseEther("123456789"), {
          value: ethers.parseEther("0.03"),
          from: owner
        })).revertedWithCustomError(slashToken, "TransferFromFailed")
      });
      it("Should revert if custom not valid amount length", async function () {
        const {token, slashToken, owner, otherAccount, thirdUser} = await loadFixture(
            deployDummyErc20TokenAndMint
        );
        await token.mint(1n, {from: owner});
        const slashTokenAddress = await slashToken.getAddress()
        await token.increaseAllowance(slashTokenAddress, 50000000000000000000000000000000n, {from: owner})
        const tokenAddress = await token.getAddress()
        await expect(slashToken.erc20AirdropCustomAmount([owner.address], [ethers.parseEther("123456789"), ethers.parseEther("123456789")], tokenAddress, ethers.parseEther("123456789"), {
          value: ethers.parseEther("0.03"),
          from: owner
        })).revertedWith("NVL")
      });
      it("Should revert if not valid recipients length", async function () {
        const {token, slashToken, owner, otherAccount, thirdUser} = await loadFixture(
            deployDummyErc20TokenAndMint
        );
        let addressList = []
        let amounts = []
        for (let i = 0; i < 501; i++) {
          let wallet = ethers.Wallet.createRandom()
          addressList.push(wallet.address)
          amounts.push(Math.floor(Math.random() * (123456789 - 1000)) + 1000)
        }
        await token.mint(50000000000000000000000000000000n, {from: owner});
        const slashTokenAddress = await slashToken.getAddress()
        await token.increaseAllowance(slashTokenAddress, 50000000000000000000000000000000n, {from: owner})
        const tokenAddress = await token.getAddress()
        await expect(slashToken.erc20AirdropEqualAmount(addressList, ethers.parseEther("0.03"), tokenAddress, {
          value: ethers.parseEther("0.03"),
          from: owner
        })).revertedWith("NVL")
        await expect(slashToken.erc20AirdropCustomAmount(addressList, amounts, tokenAddress, 1,{
          value: ethers.parseEther("0.03"),
          from: owner
        })).revertedWith("NVL")
      });
      it("Should revert when user is in denylist.", async function () {
        const {token, slashToken, owner, otherAccount, thirdUser} = await loadFixture(
            deployDummyErc20TokenAndMint
        );
        await slashToken.addToDenylist([otherAccount.address], {from: owner})
        await token.connect(otherAccount).mint(50000000000000n);
        let addressList = []
        for (let i = 0; i < 10; i++) {
          let wallet = ethers.Wallet.createRandom()
          addressList.push(wallet.address)
        }
        const tokenAddress = await token.getAddress()
        const slashTokenAddress = await slashToken.getAddress()
        await token.connect(otherAccount).increaseAllowance(slashTokenAddress, 50000000000000000000000000000000n)
        await expect(slashToken.connect(otherAccount).erc20AirdropEqualAmount(addressList, ethers.parseEther("123456789"), tokenAddress, {
          value: ethers.parseEther("0.03"),
        })).to.revertedWith('UD')
      });
    });
  });
  xdescribe("Native Currency", function () {
    describe("E2E Native Airdrop", function () {
      xit("Should airdrop ETH with fixed price", async function () {
        const {token, slashToken, owner, otherAccount, thirdUser} = await loadFixture(
            deployDummyErc20TokenAndMint
        );

        let addressList = []
        for (let i = 0; i < 500; i++) {
          let wallet = ethers.Wallet.createRandom()
          addressList.push(wallet.address)
        }
        await expect(slashToken.nativeAirdropEqualAmount(addressList, ethers.parseEther("0.01"), {
          value: ethers.parseEther("5.03"),
          from: owner
        }))
            .to.emit(slashToken, "NativeAirdropEqualAmount")
            .withArgs(owner.address, 500, ethers.parseEther("5"));
        for (let i = 0; i < addressList.length; i++) {
          expect(await ethers.provider.getBalance(addressList[i])).to.equal(ethers.parseEther("0.01"));
        }
      });
      it("Should airdrop ETH with custom price", async function () {
        const {token, slashToken, owner, otherAccount, thirdUser} = await loadFixture(
            deployDummyErc20TokenAndMint
        );
        let amounts = []
        let addressList = []
        for (let i = 0; i < 5; i++) {
          let wallet = ethers.Wallet.createRandom()
          addressList.push(wallet.address)
          amounts.push(Math.floor(Math.random() * (123456789 - 1000)) + 1000)
        }
        const sum = amounts.reduce((acc, item) => BigInt(acc) + BigInt(item), 0);
        await expect(slashToken.nativeAirdropCustomAmount(addressList, amounts, {
          value: (ethers.parseEther("0.03") + sum),
          from: owner
        }))
            .to.emit(slashToken, "NativeAirdropCustomAmount")
            .withArgs(owner.address, 5, sum);
        for (let i = 0; i < addressList.length; i++) {
          expect(await ethers.provider.getBalance(addressList[i])).to.equal(amounts[i]);
        }
      });
      xit("Should buy 5 txns bundle and airdrop native with fixed price", async function () {
        const {token, slashToken, owner, otherAccount, thirdUser} = await loadFixture(
            deployDummyErc20TokenAndMint
        );

        let addressList = []
        for (let i = 0; i < 500; i++) {
          let wallet = ethers.Wallet.createRandom()
          addressList.push(wallet.address)
        }
        await expect(slashToken.buyTxnsBundle(0, 1, {value: ethers.parseEther("0.12"), from: owner}))
            .to.emit(slashToken, "TxnsBundleBought")
            .withArgs(owner.address, ethers.parseEther("0.12"), 5)
        await expect(slashToken.nativeAirdropEqualAmount(addressList, ethers.parseEther("0.01"), {
          value: ethers.parseEther("5"),
          from: owner
        }))
            .to.emit(slashToken, "NativeAirdropEqualAmount")
            .withArgs(owner.address, 500, ethers.parseEther("5"));
        for (let i = 0; i < addressList.length; i++) {
          expect(await ethers.provider.getBalance(addressList[i])).to.equal(ethers.parseEther("0.01"));
        }
        expect(await slashToken.getAvailableTxnsForWallet({from: owner}))
            .to.equal(4)
      });
      xit("Should buy a 5 txns bundle and airdrop native with custom price", async function () {
        const {token, slashToken, owner, otherAccount, thirdUser} = await loadFixture(
            deployDummyErc20TokenAndMint
        );
        let amounts = []
        let addressList = []
        for (let i = 0; i < 500; i++) {
          let wallet = ethers.Wallet.createRandom()
          addressList.push(wallet.address)
          amounts.push(Math.floor(Math.random() * (123456789 - 1000)) + 1000)
        }
        await expect(slashToken.buyTxnsBundle(0, 1, {value: ethers.parseEther("0.12"), from: owner}))
            .to.emit(slashToken, "TxnsBundleBought")
            .withArgs(owner.address, ethers.parseEther("0.12"), 5)
        const sum = amounts.reduce((acc, item) => BigInt(acc) + BigInt(item), 0);
        await expect(slashToken.nativeAirdropCustomAmount(addressList, amounts, {
          value: sum,
          from: owner
        }))
            .to.emit(slashToken, "NativeAirdropCustomAmount")
            .withArgs(owner.address, 500, sum);
        for (let i = 0; i < addressList.length; i++) {
          expect(await ethers.provider.getBalance(addressList[i])).to.equal(amounts[i]);
        }
        expect(await slashToken.getAvailableTxnsForWallet({from: owner}))
            .to.equal(4)
      });
      xit("Should buy 10 txns bundle and airdrop native with fixed price", async function () {
        const {token, slashToken, owner, otherAccount, thirdUser} = await loadFixture(
            deployDummyErc20TokenAndMint
        );

        let addressList = []
        for (let i = 0; i < 500; i++) {
          let wallet = ethers.Wallet.createRandom()
          addressList.push(wallet.address)
        }
        await expect(slashToken.buyTxnsBundle(1, 1, {value: ethers.parseEther("0.21"), from: owner}))
            .to.emit(slashToken, "TxnsBundleBought")
            .withArgs(owner.address, ethers.parseEther("0.21"), 10)
        await expect(slashToken.nativeAirdropEqualAmount(addressList, ethers.parseEther("0.01"), {
          value: ethers.parseEther("5"),
          from: owner
        }))
            .to.emit(slashToken, "NativeAirdropEqualAmount")
            .withArgs(owner.address, 500, ethers.parseEther("5"));
        for (let i = 0; i < addressList.length; i++) {
          expect(await ethers.provider.getBalance(addressList[i])).to.equal(ethers.parseEther("0.01"));
        }
        expect(await slashToken.getAvailableTxnsForWallet({from: owner}))
            .to.equal(9)
      });
      xit("Should buy a 10 txns bundle and airdrop native with custom price", async function () {
        const {token, slashToken, owner, otherAccount, thirdUser} = await loadFixture(
            deployDummyErc20TokenAndMint
        );
        let amounts = []
        let addressList = []
        for (let i = 0; i < 500; i++) {
          let wallet = ethers.Wallet.createRandom()
          addressList.push(wallet.address)
          amounts.push(Math.floor(Math.random() * (123456789 - 1000)) + 1000)
        }
        await expect(slashToken.buyTxnsBundle(1, 1, {value: ethers.parseEther("0.21"), from: owner}))
            .to.emit(slashToken, "TxnsBundleBought")
            .withArgs(owner.address, ethers.parseEther("0.21"), 10)
        const sum = amounts.reduce((acc, item) => BigInt(acc) + BigInt(item), 0);
        await expect(slashToken.nativeAirdropCustomAmount(addressList, amounts, {
          value: sum,
          from: owner
        }))
            .to.emit(slashToken, "NativeAirdropCustomAmount")
            .withArgs(owner.address, 500, sum);
        for (let i = 0; i < addressList.length; i++) {
          expect(await ethers.provider.getBalance(addressList[i])).to.equal(amounts[i]);
        }
        expect(await slashToken.getAvailableTxnsForWallet({from: owner}))
            .to.equal(9)
      });
      xit("Should buy 30 txns bundle and airdrop native with fixed price", async function () {
        const {token, slashToken, owner, otherAccount, thirdUser} = await loadFixture(
            deployDummyErc20TokenAndMint
        );

        let addressList = []
        for (let i = 0; i < 500; i++) {
          let wallet = ethers.Wallet.createRandom()
          addressList.push(wallet.address)
        }
        await expect(slashToken.buyTxnsBundle(2, 1, {value: ethers.parseEther("0.45"), from: owner}))
            .to.emit(slashToken, "TxnsBundleBought")
            .withArgs(owner.address, ethers.parseEther("0.45"), 30)
        await expect(slashToken.nativeAirdropEqualAmount(addressList, ethers.parseEther("0.01"), {
          value: ethers.parseEther("5"),
          from: owner
        }))
            .to.emit(slashToken, "NativeAirdropEqualAmount")
            .withArgs(owner.address, 500, ethers.parseEther("5"));
        for (let i = 0; i < addressList.length; i++) {
          expect(await ethers.provider.getBalance(addressList[i])).to.equal(ethers.parseEther("0.01"));
        }
        expect(await slashToken.getAvailableTxnsForWallet({from: owner}))
            .to.equal(29)
      });
      xit("Should buy a 30 txns bundle and airdrop native with custom price", async function () {
        const {token, slashToken, owner, otherAccount, thirdUser} = await loadFixture(
            deployDummyErc20TokenAndMint
        );
        let amounts = []
        let addressList = []
        for (let i = 0; i < 500; i++) {
          let wallet = ethers.Wallet.createRandom()
          addressList.push(wallet.address)
          amounts.push(Math.floor(Math.random() * (123456789 - 1000)) + 1000)
        }
        await expect(slashToken.buyTxnsBundle(2, 1, {value: ethers.parseEther("0.45"), from: owner}))
            .to.emit(slashToken, "TxnsBundleBought")
            .withArgs(owner.address, ethers.parseEther("0.45"), 30)
        const sum = amounts.reduce((acc, item) => BigInt(acc) + BigInt(item), 0);
        await expect(slashToken.nativeAirdropCustomAmount(addressList, amounts, {
          value: sum,
          from: owner
        }))
            .to.emit(slashToken, "NativeAirdropCustomAmount")
            .withArgs(owner.address, 500, sum);
        for (let i = 0; i < addressList.length; i++) {
          expect(await ethers.provider.getBalance(addressList[i])).to.equal(amounts[i]);
        }
        expect(await slashToken.getAvailableTxnsForWallet({from: owner}))
            .to.equal(29)
      });
      xit("Should whitelist a wallet and airdrop native with fixed price", async function () {
        const {token, slashToken, owner, otherAccount, thirdUser} = await loadFixture(
            deployDummyErc20TokenAndMint
        );

        await slashToken.setBaseFeeForWallet(owner.address, ethers.parseEther("0.02"), {from: owner})
        let addressList = []
        for (let i = 0; i < 500; i++) {
          let wallet = ethers.Wallet.createRandom()
          addressList.push(wallet.address)
        }
        await expect(slashToken.nativeAirdropEqualAmount(addressList, ethers.parseEther("0.01"), {
          value: ethers.parseEther("5.02"),
          from: owner
        }))
            .to.emit(slashToken, "NativeAirdropEqualAmount")
            .withArgs(owner.address, 500, ethers.parseEther("5"));
        for (let i = 0; i < addressList.length; i++) {
          expect(await ethers.provider.getBalance(addressList[i])).to.equal(ethers.parseEther("0.01"));
        }
      });
      xit("Should giveaway txns to a wallet and airdrop native with fixed price", async function () {
        const {token, slashToken, owner, otherAccount, thirdUser} = await loadFixture(
            deployDummyErc20TokenAndMint
        );

        let addressList = []

        for (let i = 0; i < 500; i++) {
          let wallet = ethers.Wallet.createRandom()
          addressList.push(wallet.address)
        }

        await expect(slashToken.addTxnsToWallets([owner.address], [1], {from: owner}))
            .to.emit(slashToken, "TxnsAdded")
            .withArgs([owner.address], [1])
        await expect(slashToken.nativeAirdropEqualAmount(addressList, ethers.parseEther("0.01"), {
          value: ethers.parseEther("5"),
          from: owner
        }))
            .to.emit(slashToken, "NativeAirdropEqualAmount")
            .withArgs(owner.address, 500, ethers.parseEther("5"));
      });
      xit("Should giveaway txns to a wallet and airdrop native with custom price", async function () {
        const {token, slashToken, owner, otherAccount, thirdUser} = await loadFixture(
            deployDummyErc20TokenAndMint
        );
        await expect(slashToken.addTxnsToWallets([owner.address], [1], {from: owner}))
            .to.emit(slashToken, "TxnsAdded")
            .withArgs([owner.address], [1])
        let amounts = []
        let addressList = []
        for (let i = 0; i < 500; i++) {
          let wallet = ethers.Wallet.createRandom()
          addressList.push(wallet.address)
          amounts.push(Math.floor(Math.random() * (123456789 - 1000)) + 1000)
        }
        const sum = amounts.reduce((acc, item) => BigInt(acc) + BigInt(item), 0);
        await expect(slashToken.nativeAirdropCustomAmount(addressList, amounts, {
          value: sum,
          from: owner
        }))
            .to.emit(slashToken, "NativeAirdropCustomAmount")
            .withArgs(owner.address, 500, sum);
        for (let i = 0; i < addressList.length; i++) {
          expect(await ethers.provider.getBalance(addressList[i])).to.equal(amounts[i]);
        }
      });
    });
    xdescribe("Native airdrop functionality tests", function () {
      it("Native should revert with NVV if not correct value", async function () {
        const {token, slashToken, owner, otherAccount, thirdUser} = await loadFixture(
            deployDummyErc20TokenAndMint
        );
        await expect(slashToken.nativeAirdropEqualAmount([owner.address], ethers.parseEther("1"), {
          value: ethers.parseEther("1.02"),
          from: owner
        })).revertedWith("NVV")
        await expect(slashToken.nativeAirdropCustomAmount([owner.address], [1], {
          value: ethers.parseEther("1.02"),
          from: owner
        })).revertedWith("NVV")
      });
      it("Native should revert if custom not valid amount length", async function () {
        const {token, slashToken, owner, otherAccount, thirdUser} = await loadFixture(
            deployDummyErc20TokenAndMint
        );
        await expect(slashToken.nativeAirdropCustomAmount([owner.address], [ethers.parseEther("1"), ethers.parseEther("1")], {
          value: ethers.parseEther("2.03"),
          from: owner
        })).revertedWith("NVL")
      });
      it("Native should revert if not valid recipients length", async function () {
        const {token, slashToken, owner, otherAccount, thirdUser} = await loadFixture(
            deployDummyErc20TokenAndMint
        );
        let addressList = []
        let amounts = []
        for (let i = 0; i < 501; i++) {
          let wallet = ethers.Wallet.createRandom()
          addressList.push(wallet.address)
          amounts.push(1)
        }
        await expect(slashToken.nativeAirdropEqualAmount(addressList, ethers.parseEther("1"), {
          value: ethers.parseEther("501.03"),
          from: owner
        })).revertedWith("NVL")
        await expect(slashToken.nativeAirdropCustomAmount(addressList, amounts, {
          value: ethers.parseEther("0.030000000000000501"),
          from: owner
        })).revertedWith("NVL")
      });
      it("Native revert when user is in denylist", async function () {
        const {token, slashToken, owner, otherAccount, thirdUser} = await loadFixture(
            deployDummyErc20TokenAndMint
        );
        await slashToken.addToDenylist([otherAccount.address], {from: owner})
        let addressList = []
        for (let i = 0; i < 10; i++) {
          let wallet = ethers.Wallet.createRandom()
          addressList.push(wallet.address)
        }
        await expect(slashToken.connect(otherAccount).nativeAirdropEqualAmount(addressList, ethers.parseEther("1"), {
          value: ethers.parseEther("10.03"),
        })).to.revertedWith('UD')
      });
    });
  });
  xdescribe("ERC721", function () {
    describe("E2E ERC721 Airdrop", function () {
      xit("Should mint and airdrop the NFTs", async function () {
        const {token, slashToken, owner, otherAccount, thirdUser} = await loadFixture(
            deployDummyErc721TokenAndSlashtoken
        );
        const slashTokenAddress = await slashToken.getAddress()
        const tokenAddress = await token.getAddress()
        for (let i = 0; i < 500; i++) {
          token.mint()
        }
        token.setApprovalForAll(slashTokenAddress, true);
        let addressList = []
        let ids = []
        for (let i = 0; i < 500; i++) {
          let wallet = ethers.Wallet.createRandom()
          addressList.push(wallet.address)
          ids.push(i + 1)
        }
        await expect(slashToken.erc721Airdrop(addressList, ids, tokenAddress, {
          value: ethers.parseEther("0.03"),
          from: owner
        }))
            .to.emit(slashToken, "Erc721Airdrop")
            .withArgs(owner.address, tokenAddress, 500);
        for (let i = 0; i < addressList.length; i++) {
          expect(await token.balanceOf(addressList[i])).to.equal(1);
          expect(await token.ownerOf(ids[i])).to.equal(addressList[i]);

        }
      }).timeout(100000);
      xit("Should buy a 5 txns bundle and airdrop the NFTs", async function () {
        const {token, slashToken, owner, otherAccount, thirdUser} = await loadFixture(
            deployDummyErc721TokenAndSlashtoken
        );

        const slashTokenAddress = await slashToken.getAddress()
        const tokenAddress = await token.getAddress()

        for (let i = 0; i < 1000; i++) {
          token.mint()
        }
        token.setApprovalForAll(slashTokenAddress, true);

        let addressList1 = []
        let addressList2 = []
        let ids1 = []
        let ids2 = []

        for (let i = 0; i < 500; i++) {
          let wallet1 = ethers.Wallet.createRandom()
          let wallet2 = ethers.Wallet.createRandom()
          addressList1.push(wallet1.address)
          addressList2.push(wallet2.address)
          ids1.push(i + 1)
          ids2.push(501 + i)
        }

        await expect(slashToken.buyTxnsBundle(0, 1, {value: ethers.parseEther("0.12"), from: owner}))
            .to.emit(slashToken, "TxnsBundleBought")
            .withArgs(owner.address, ethers.parseEther("0.12"), 5)
        await expect(slashToken.erc721Airdrop(addressList1, ids1, tokenAddress, {from: owner}))
            .to.emit(slashToken, "Erc721Airdrop")
            .withArgs(owner.address, tokenAddress, 500);
        const secondBundleTxn = await slashToken.erc721Airdrop(addressList2, ids2, tokenAddress, {from: owner});
        await expect(secondBundleTxn)
            .to.emit(slashToken, "Erc721Airdrop")
            .withArgs(owner.address, tokenAddress, 500);
        for (let i = 0; i < 500; i++) {
          expect(await token.balanceOf(addressList1[i])).to.equal(1);
          expect(await token.ownerOf(ids1[i])).to.equal(addressList1[i]);
          expect(await token.balanceOf(addressList2[i])).to.equal(1);
          expect(await token.ownerOf(ids2[i])).to.equal(addressList2[i]);
        }
        expect(await slashToken.getAvailableTxnsForWallet({from: owner}))
            .to.equal(3)
      }).timeout(300000);
      xit("Should buy a 10 txns bundle and airdrop the NFTs", async function () {
        const {token, slashToken, owner, otherAccount, thirdUser} = await loadFixture(
            deployDummyErc721TokenAndSlashtoken
        );

        const slashTokenAddress = await slashToken.getAddress()
        const tokenAddress = await token.getAddress()

        for (let i = 0; i < 1000; i++) {
          token.mint()
        }
        token.setApprovalForAll(slashTokenAddress, true);

        let addressList1 = []
        let addressList2 = []
        let ids1 = []
        let ids2 = []

        for (let i = 0; i < 500; i++) {
          let wallet1 = ethers.Wallet.createRandom()
          let wallet2 = ethers.Wallet.createRandom()
          addressList1.push(wallet1.address)
          addressList2.push(wallet2.address)
          ids1.push(i + 1)
          ids2.push(501 + i)
        }

        await expect(slashToken.buyTxnsBundle(0, 1, {value: ethers.parseEther("0.12"), from: owner}))
            .to.emit(slashToken, "TxnsBundleBought")
            .withArgs(owner.address, ethers.parseEther("0.12"), 5)
        await expect(slashToken.erc721Airdrop(addressList1, ids1, tokenAddress, {from: owner}))
            .to.emit(slashToken, "Erc721Airdrop")
            .withArgs(owner.address, tokenAddress, 500);
        const secondBundleTxn = await slashToken.erc721Airdrop(addressList2, ids2, tokenAddress, {from: owner});
        await expect(secondBundleTxn)
            .to.emit(slashToken, "Erc721Airdrop")
            .withArgs(owner.address, tokenAddress, 500);
        for (let i = 0; i < 500; i++) {
          expect(await token.balanceOf(addressList1[i])).to.equal(1);
          expect(await token.ownerOf(ids1[i])).to.equal(addressList1[i]);
          expect(await token.balanceOf(addressList2[i])).to.equal(1);
          expect(await token.ownerOf(ids2[i])).to.equal(addressList2[i]);
        }
        expect(await slashToken.getAvailableTxnsForWallet({from: owner}))
            .to.equal(3)
      }).timeout(300000);
      xit("Should buy a 30 txns bundle and airdrop the NFTs", async function () {
        const {token, slashToken, owner, otherAccount, thirdUser} = await loadFixture(
            deployDummyErc721TokenAndSlashtoken
        );

        const slashTokenAddress = await slashToken.getAddress()
        const tokenAddress = await token.getAddress()

        for (let i = 0; i < 1000; i++) {
          token.mint()
        }
        token.setApprovalForAll(slashTokenAddress, true);

        let addressList1 = []
        let addressList2 = []
        let ids1 = []
        let ids2 = []

        for (let i = 0; i < 500; i++) {
          let wallet1 = ethers.Wallet.createRandom()
          let wallet2 = ethers.Wallet.createRandom()
          addressList1.push(wallet1.address)
          addressList2.push(wallet2.address)
          ids1.push(i + 1)
          ids2.push(501 + i)
        }

        await expect(slashToken.buyTxnsBundle(0, 1, {value: ethers.parseEther("0.12"), from: owner}))
            .to.emit(slashToken, "TxnsBundleBought")
            .withArgs(owner.address, ethers.parseEther("0.12"), 5)
        await expect(slashToken.erc721Airdrop(addressList1, ids1, tokenAddress, {from: owner}))
            .to.emit(slashToken, "Erc721Airdrop")
            .withArgs(owner.address, tokenAddress, 500);
        const secondBundleTxn = await slashToken.erc721Airdrop(addressList2, ids2, tokenAddress, {from: owner});
        await expect(secondBundleTxn)
            .to.emit(slashToken, "Erc721Airdrop")
            .withArgs(owner.address, tokenAddress, 500);
        for (let i = 0; i < 500; i++) {
          expect(await token.balanceOf(addressList1[i])).to.equal(1);
          expect(await token.ownerOf(ids1[i])).to.equal(addressList1[i]);
          expect(await token.balanceOf(addressList2[i])).to.equal(1);
          expect(await token.ownerOf(ids2[i])).to.equal(addressList2[i]);
        }
        expect(await slashToken.getAvailableTxnsForWallet({from: owner}))
            .to.equal(3)
      }).timeout(300000);
      xit("Should whitelist a wallet and airdrop the NFTs", async function () {
        const {token, slashToken, owner, otherAccount, thirdUser} = await loadFixture(
            deployDummyErc721TokenAndSlashtoken
        );

        const slashTokenAddress = await slashToken.getAddress()
        const tokenAddress = await token.getAddress()
        await slashToken.setBaseFeeForWallet(owner.address, ethers.parseEther("0.02"), {from: owner})

        for (let i = 0; i < 1000; i++) {
          token.mint()
        }
        token.setApprovalForAll(slashTokenAddress, true);

        let addressList1 = []
        let ids1 = []

        for (let i = 0; i < 500; i++) {
          let wallet1 = ethers.Wallet.createRandom()
          addressList1.push(wallet1.address)
          ids1.push(i + 1)
        }

        await expect(slashToken.erc721Airdrop(addressList1, ids1, tokenAddress, {value: ethers.parseEther("0.02"), from: owner}))
            .to.emit(slashToken, "Erc721Airdrop")
            .withArgs(owner.address, tokenAddress, 500);
        for (let i = 0; i < 500; i++) {
          expect(await token.balanceOf(addressList1[i])).to.equal(1);
          expect(await token.ownerOf(ids1[i])).to.equal(addressList1[i]);
        }
      }).timeout(300000);
      xit("Should giveaway txns to a wallet and airdrop the NFTs", async function () {
        const {token, slashToken, owner, otherAccount, thirdUser} = await loadFixture(
            deployDummyErc721TokenAndSlashtoken
        );
        await expect(slashToken.addTxnsToWallets([owner.address], [1], {from: owner}))
            .to.emit(slashToken, "TxnsAdded")
            .withArgs([owner.address], [1])
        const slashTokenAddress = await slashToken.getAddress()
        const tokenAddress = await token.getAddress()

        for (let i = 0; i < 1000; i++) {
          token.mint()
        }
        token.setApprovalForAll(slashTokenAddress, true);

        let addressList1 = []
        let ids1 = []

        for (let i = 0; i < 500; i++) {
          let wallet1 = ethers.Wallet.createRandom()
          addressList1.push(wallet1.address)
          ids1.push(i + 1)
        }

        await expect(slashToken.erc721Airdrop(addressList1, ids1, tokenAddress, {from: owner}))
            .to.emit(slashToken, "Erc721Airdrop")
            .withArgs(owner.address, tokenAddress, 500);
        for (let i = 0; i < 500; i++) {
          expect(await token.balanceOf(addressList1[i])).to.equal(1);
          expect(await token.ownerOf(ids1[i])).to.equal(addressList1[i]);
        }
        expect(await slashToken.getAvailableTxnsForWallet({from: owner}))
            .to.equal(0)
      }).timeout(300000);
    });
    xdescribe("ERC721 functionality tests", function () {
      it("Should revert with NVV if not correct value", async function () {
        const {token, slashToken, owner, otherAccount, thirdUser} = await loadFixture(
            deployDummyErc721TokenAndSlashtoken
        );
        const tokenAddress = await token.getAddress()
        await expect(slashToken.erc721Airdrop([owner.address], [1], tokenAddress, {
          value: ethers.parseEther("0.02"),
          from: owner
        })).revertedWith("NVV")
      });
      it("Should revert if not valid approvals", async function () {
        const {token, slashToken, owner, otherAccount, thirdUser} = await loadFixture(
            deployDummyErc721TokenAndSlashtoken
        );
        const tokenAddress = await token.getAddress()
        token.mint()
        await expect(slashToken.erc721Airdrop([owner.address], [1], tokenAddress, {
          value: ethers.parseEther("0.03"),
          from: owner
        })).revertedWithCustomError(slashToken, "TransferFromFailed()")
      });
      it("Should revert if not valid id", async function () {
        const {token, slashToken, owner, otherAccount, thirdUser} = await loadFixture(
            deployDummyErc721TokenAndSlashtoken
        );
        const tokenAddress = await token.getAddress()
        await expect(slashToken.erc721Airdrop([owner.address], [1], tokenAddress, {
          value: ethers.parseEther("0.03"),
          from: owner
        })).revertedWithCustomError(slashToken, "TransferFromFailed()")
      });
      it("Should revert if not valid ids length", async function () {
        const {token, slashToken, owner, otherAccount, thirdUser} = await loadFixture(
            deployDummyErc721TokenAndSlashtoken
        );

        const tokenAddress = await token.getAddress()
        await expect(slashToken.erc721Airdrop([owner.address], [1, 2], tokenAddress, {
          value: ethers.parseEther("0.03"),
          from: owner
        })).revertedWith("NVL")
      });
      it("Should revert if not valid recipients length", async function () {
        const {token, slashToken, owner, otherAccount, thirdUser} = await loadFixture(
            deployDummyErc721TokenAndSlashtoken
        );
        let addressList = []
        let ids = []
        for (let i = 0; i < 501; i++) {
          let wallet = ethers.Wallet.createRandom()
          addressList.push(wallet.address)
          ids.push(i)
        }
        const slashTokenAddress = await slashToken.getAddress()
        const tokenAddress = await token.getAddress()
        await expect(slashToken.erc721Airdrop(addressList, ids, tokenAddress, {
          value: ethers.parseEther("0.03"),
          from: owner
        })).revertedWith("NVL")
      });
      it("ERC721 Should revert if user is in denylist", async function () {
        const {token, slashToken, owner, otherAccount, thirdUser} = await loadFixture(
            deployDummyErc721TokenAndSlashtoken
        );
        await slashToken.addToDenylist([otherAccount.address], {from: owner})
        const slashTokenAddress = await slashToken.getAddress()
        const tokenAddress = await token.getAddress()
        for (let i = 0; i < 10; i++) {
          token.connect(otherAccount).mint()
        }
        token.connect(otherAccount).setApprovalForAll(slashTokenAddress, true);
        let addressList = []
        let ids = []
        for (let i = 0; i < 10; i++) {
          let wallet = ethers.Wallet.createRandom()
          addressList.push(wallet.address)
          ids.push(i + 1)
        }
        await expect(slashToken.connect(otherAccount).erc721Airdrop(addressList, ids, tokenAddress, {
          value: ethers.parseEther("0.03"),
        })).to.revertedWith('UD')
      }).timeout(100000);
    });
  });
  xdescribe("Bundles functionality tests", function () {
    it("Should buy 5 txns bundle", async function () {
        const {token, slashToken, owner, otherAccount, thirdUser} = await loadFixture(
            deployDummyErc20TokenAndMint
        );
        const slashTokenAddress = await slashToken.getAddress()
        await expect(slashToken.buyTxnsBundle(0, 1, {value: ethers.parseEther("0.12"), from: owner}))
            .to.emit(slashToken, "TxnsBundleBought")
            .withArgs(owner.address, ethers.parseEther("0.12"), 5)
      });
    it("Should buy 10 txns bundle", async function () {
        const {token, slashToken, owner, otherAccount, thirdUser} = await loadFixture(
            deployDummyErc20TokenAndMint
        );
        await expect(slashToken.buyTxnsBundle(1, 1, {value: ethers.parseEther("0.21"), from: owner}))
            .to.emit(slashToken, "TxnsBundleBought")
            .withArgs(owner.address, ethers.parseEther("0.21"), 10)
      });
    it("Should buy 30 txns bundle", async function () {
        const {token, slashToken, owner, otherAccount, thirdUser} = await loadFixture(
            deployDummyErc20TokenAndMint
        );
      await expect(slashToken.buyTxnsBundle(2, 1, {value: ethers.parseEther("0.45"), from: owner}))
            .to.emit(slashToken, "TxnsBundleBought")
            .withArgs(owner.address, ethers.parseEther("0.45"), 30)
      });
    it("Should revert with NVV on buy 5 txns bundle with wrong value", async function () {
        const {token, slashToken, owner, otherAccount, thirdUser} = await loadFixture(
            deployDummyErc20TokenAndMint
        );
        await expect(slashToken.buyTxnsBundle(0, 1, {value: ethers.parseEther("0.1"), from: owner}))
            .to.revertedWith("NVV")
      });
    it("Should revert with NVV on buy 10 txns bundle with wrong value", async function () {
        const {token, slashToken, owner, otherAccount, thirdUser} = await loadFixture(
            deployDummyErc20TokenAndMint
        );
        await expect(slashToken.buyTxnsBundle(1, 1, {value: ethers.parseEther("0.2"), from: owner}))
            .to.revertedWith("NVV")
      });
    it("Should revert with NVV on buy 30 txns bundle with wrong value", async function () {
        const {token, slashToken, owner, otherAccount, thirdUser} = await loadFixture(
            deployDummyErc20TokenAndMint
        );
        await expect(slashToken.buyTxnsBundle(2, 1, {value: ethers.parseEther("0.4"), from: owner}))
            .to.revertedWith("NVV")
      });
    it("Should change available txns bundles", async function () {
        const {token, slashToken, owner, otherAccount, thirdUser} = await loadFixture(
            deployDummyErc20TokenAndMint
        );
        await expect(slashToken.updateBundles([7, 18], [ethers.parseEther("0.14"), ethers.parseEther("0.33")],  {from: owner}))
            .to.emit(slashToken, "BundlesUpdated")
            .withArgs(owner.address, [7, 18], [ethers.parseEther("0.14"), ethers.parseEther("0.33")])
        const response = await slashToken.getBundles()
        expect(response[0][0]).to.equal(7n)
        expect(response[0][1]).to.equal(18n)
        expect(response[1][0]).to.equal(140000000000000000n)
        expect(response[1][1]).to.equal(330000000000000000n)
      });
    it("Should buy new bundles when changed available txns", async function () {
        const {token, slashToken, owner, otherAccount, thirdUser} = await loadFixture(
            deployDummyErc20TokenAndMint
        );
        await expect(slashToken.updateBundles([7, 18], [ethers.parseEther("0.14"), ethers.parseEther("0.33")],  {from: owner}))
            .to.emit(slashToken, "BundlesUpdated")
            .withArgs(owner.address, [7, 18], [ethers.parseEther("0.14"), ethers.parseEther("0.33")])
        await expect(slashToken.buyTxnsBundle(0, 1, {value: ethers.parseEther("0.14"), from: owner}))
            .to.emit(slashToken, "TxnsBundleBought")
            .withArgs(owner.address, ethers.parseEther("0.14"), 7)
        await expect(slashToken.buyTxnsBundle(1, 1, {value: ethers.parseEther("0.33"), from: owner}))
            .to.emit(slashToken, "TxnsBundleBought")
            .withArgs(owner.address, ethers.parseEther("0.33"),  18)
        await expect(slashToken.buyTxnsBundle(2, 1, {value: ethers.parseEther("0.33"), from: owner}))
            .to.revertedWithPanic()
      });
    it("Should revert when user is in denylist", async function () {
        const {token, slashToken, owner, otherAccount, thirdUser} = await loadFixture(
            deployDummyErc20TokenAndMint
        );
        await slashToken.addToDenylist([otherAccount.address], {from: owner})
        await expect(slashToken.connect(otherAccount).buyTxnsBundle(0, 1, {value: ethers.parseEther("0.12")}))
            .to.revertedWith('UD')
        await slashToken.removeFromDenylist([otherAccount.address], {from: owner})
        await expect(slashToken.connect(otherAccount).buyTxnsBundle(0, 1, {value: ethers.parseEther("0.12")}))
            .to.emit(slashToken, 'TxnsBundleBought').withArgs(otherAccount.address, ethers.parseEther("0.12"), 5)
      });

  });
  xdescribe("Admin actions", function () {
    it("Should revert if airdrop cost is not set by admin", async function () {
        const {token, slashToken, owner, otherAccount, thirdUser} = await loadFixture(
            deployDummyErc20TokenAndMint
        );
        await expect(slashToken.connect(otherAccount).setBaseFeeForWallet(owner.address, ethers.parseEther("0.01"))).revertedWith("NVS")
      });
    it("Should revert if airdrop cost is not reset by admin", async function () {
        const {token, slashToken, owner, otherAccount, thirdUser} = await loadFixture(
            deployDummyErc20TokenAndMint
        );
        await expect(slashToken.connect(otherAccount).resetBaseFeeForWallet(owner.address)).revertedWith("NVS")
      });
    it("Should revert if addTxnsToWallets is not called by admin", async function () {
        const {token, slashToken, owner, otherAccount, thirdUser} = await loadFixture(
            deployDummyErc20TokenAndMint
        );
        await expect(slashToken.connect(otherAccount).addTxnsToWallets([owner.address], [2])).revertedWith("NVS")
      });
    it("Should revert if setNewBaseFee is not called by admin", async function () {
        const {token, slashToken, owner, otherAccount, thirdUser} = await loadFixture(
            deployDummyErc20TokenAndMint
        );
        await expect(slashToken.connect(otherAccount).setNewBaseFee(2)).revertedWith("NVS")
      });
    it("Should revert if updateBundles is not called by admin", async function () {
        const {token, slashToken, owner, otherAccount, thirdUser} = await loadFixture(
            deployDummyErc20TokenAndMint
        );
        await expect(slashToken.connect(otherAccount).updateBundles([1], [1])).revertedWith("NVS")
      });
    it("Should revert if freezeContract is not called by admin", async function () {
        const {token, slashToken, owner, otherAccount, thirdUser} = await loadFixture(
            deployDummyErc20TokenAndMint
        );
        await expect(slashToken.connect(otherAccount).freezeContract(1)).revertedWith("NVS")
      });
    it("Should revert if updateFeeSink is not called by admin", async function () {
        const {token, slashToken, owner, otherAccount, thirdUser} = await loadFixture(
            deployDummyErc20TokenAndMint
        );
        await expect(slashToken.connect(otherAccount).updateFeeSink(owner.address)).revertedWith("NVS")
      });
  });
  xdescribe("Freeze contract actions", function () {
    it("ERC20 airdrop should revert if contract is frozen", async function () {
      const {token, slashToken, owner, otherAccount, thirdUser} = await loadFixture(
            deployDummyErc20TokenAndMint
        );
      await slashToken.freezeContract(1)
      await token.mint(50000000000000n, {from: owner});
        let addressList = []

        for (let i = 0; i < 500; i++) {
          let wallet = ethers.Wallet.createRandom()
          addressList.push(wallet.address)
        }
        expect(await token.balanceOf(owner.address)).to.equal(50000000000000000000000000000000n);
        const tokenAddress = await token.getAddress()
        const slashTokenAddress = await slashToken.getAddress()
        await token.increaseAllowance(slashTokenAddress, 50000000000000000000000000000000n, {from: owner})
        expect(await token.allowance(owner.address, slashTokenAddress)).to.equal(50000000000000000000000000000000n)
        await expect(slashToken.erc20AirdropEqualAmount(addressList, ethers.parseEther("123456789"), tokenAddress, {
          value: ethers.parseEther("0.03"),
          from: owner
        })).to.revertedWith('CF')
      });
    it("Native airdrop should revert if contract is frozen", async function () {
      const {token, slashToken, owner, otherAccount, thirdUser} = await loadFixture(
            deployDummyErc20TokenAndMint
      );
      await slashToken.freezeContract(1)
      let addressList = []
      for (let i = 0; i < 500; i++) {
        let wallet = ethers.Wallet.createRandom()
        addressList.push(wallet.address)
      }
      await expect(slashToken.nativeAirdropEqualAmount(addressList, ethers.parseEther("0.01"), {
        value: ethers.parseEther("5.03"),
        from: owner
      })).to.revertedWith("CF")
    });
    it("ERC721 airdrop should revert if contract is frozen", async function () {
      const {token, slashToken, owner, otherAccount, thirdUser} = await loadFixture(
            deployDummyErc721TokenAndSlashtoken
      );
      await slashToken.freezeContract(1)
      const slashTokenAddress = await slashToken.getAddress()
      const tokenAddress = await token.getAddress()
      for (let i = 0; i < 500; i++) {
        token.mint()
      }
      token.setApprovalForAll(slashTokenAddress, true);
      let addressList = []
      let ids = []
      for (let i = 0; i < 500; i++) {
        let wallet = ethers.Wallet.createRandom()
        addressList.push(wallet.address)
        ids.push(i + 1)
      }
      await expect(slashToken.erc721Airdrop(addressList, ids, tokenAddress, {
        value: ethers.parseEther("0.03"),
        from: owner
      })).to.revertedWith("CF")
    });
    it("BuyBundleTxns should revert if contract is frozen", async function () {
      const {token, slashToken, owner, otherAccount, thirdUser} = await loadFixture(
            deployDummyErc20TokenAndMint
      );
      await slashToken.freezeContract(1)
      await expect(slashToken.buyTxnsBundle(0, 1, {
          value: ethers.parseEther("0.12"),
          from: owner
        })).to.revertedWith('CF')
      });
  });
  xdescribe("Events", function () {
    describe("Premium Bundle Event Emitter", function () {
      it("Should emit WalletBaseFeeSet", async function () {
        const {token, slashToken, owner, otherAccount, thirdUser} = await loadFixture(
            deployDummyErc20TokenAndMint
        );
        const tokenAddress = await token.getAddress()
        await expect(slashToken.setBaseFeeForWallet(owner.address, ethers.parseEther("0.01"), {from: owner}))
            .to.emit(slashToken, "WalletBaseFeeSet")
            .withArgs(owner.address, ethers.parseEther("0.01"))
      });
      it("Should emit WalletBaseFeeReset", async function () {
        const {token, slashToken, owner, otherAccount, thirdUser} = await loadFixture(
            deployDummyErc20TokenAndMint
        );
        const tokenAddress = await token.getAddress()
        await slashToken.setBaseFeeForWallet(owner.address, ethers.parseEther("0.01"), {from: owner})
        await expect(slashToken.resetBaseFeeForWallet(owner.address, {from: owner}))
            .to.emit(slashToken, "WalletBaseFeeReset")
            .withArgs(owner.address)
      });
      it("Should emit TxnsAdded", async function () {
        const {token, slashToken, owner, otherAccount, thirdUser} = await loadFixture(
            deployDummyErc20TokenAndMint
        );
        const tokenAddress = await token.getAddress()
        await expect(slashToken.addTxnsToWallets([owner.address], [3], {from: owner}))
            .to.emit(slashToken, "TxnsAdded")
            .withArgs([owner.address], [3])
      });
      it("Should emit BundlesUpdated", async function () {
        const {token, slashToken, owner, otherAccount, thirdUser} = await loadFixture(
            deployDummyErc20TokenAndMint
        );
        const tokenAddress = await token.getAddress()
        await expect(slashToken.updateBundles([1, 2], [1, 2], {from: owner}))
            .to.emit(slashToken, "BundlesUpdated")
            .withArgs(owner.address, [1, 2], [1, 2])
      });
    });
    describe("Bundle Buying Event Emitter", function () {
      it("Should emit TxnsBundleBought 5", async function () {
        const {token, slashToken, owner, otherAccount, thirdUser} = await loadFixture(
            deployDummyErc20TokenAndMint
        );
        await expect(slashToken.buyTxnsBundle(0, 1, {value: ethers.parseEther("0.12"), from: owner}))
            .to.emit(slashToken, "TxnsBundleBought")
            .withArgs(owner.address, ethers.parseEther("0.12"), 5)
      });
      it("Should emit TxnsBundleBought 10", async function () {
        const {token, slashToken, owner, otherAccount, thirdUser} = await loadFixture(
            deployDummyErc20TokenAndMint
        );
         await expect(slashToken.buyTxnsBundle(1, 1, {value: ethers.parseEther("0.21"), from: owner}))
            .to.emit(slashToken, "TxnsBundleBought")
            .withArgs(owner.address, ethers.parseEther("0.21"), 10)
      });
      it("Should emit TxnsBundleBought 30", async function () {
        const {token, slashToken, owner, otherAccount, thirdUser} = await loadFixture(
            deployDummyErc20TokenAndMint
        );
        await expect(slashToken.buyTxnsBundle(2, 1, {value: ethers.parseEther("0.45"), from: owner}))
            .to.emit(slashToken, "TxnsBundleBought")
            .withArgs(owner.address, ethers.parseEther("0.45"), 30)
      });
    });
  });
});



