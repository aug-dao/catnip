import React, { Component } from "react";
import BFactoryContract from "./contracts/BFactory.json";
import BPoolContract from "./contracts/BPool.json";
import YesContract from "./contracts/Yes.json";
import NoContract from "./contracts/No.json";
import DaiContract from "./contracts/Dai.json";
import Web3 from "web3";
import "./App.css";
import Trading from "./components/Trading.js";
import PageHeader from "./components/PageHeader.js";
import { connect } from "react-redux";
import TImg from "./assets/images/t.png";
import NTImg from "./assets/images/nt.png";
//notification
import { notification } from "antd";
import "antd/dist/antd.css";
import { LoadingOutlined } from "@ant-design/icons";

import configData from "./config.json";
const yesIcon =
  "https://cloudflare-ipfs.com/ipfs/QmRWo92JEL6s2ydN1fK2Q3KAX2rzBnTnfqkABFYHmA5EUT";
const noIcon =
  "https://cloudflare-ipfs.com/ipfs/QmUVCPwVDCTzM2kBxejB85MS2m3KRjSW7f2w81pSr8ZvTL";

const { abi } = require("./contracts/BPool.json");
const BigNumber = require("bignumber.js");
const unlimitedAllowance = new BigNumber(2).pow(256).minus(1);
const network = "kovan"; // set network as "ganache" or "kovan" or "mainnet"
const tokenMultiple = network === "kovan" ? 100 : 1000;
// if network is ganache, run truffle migrate --develop and disable metamask
// if network is kovan, enable metamask, set to kovan network and open account with kovan eth
const kovanEtherscanPrefix = "https://kovan.etherscan.io/tx/";
const mainnetEtherscanPrefix = "https://etherscan.io/tx/";
const etherscanPrefix =
  network === "kovan" ? kovanEtherscanPrefix : mainnetEtherscanPrefix;
notification.config({
  duration: null,
  top: 7,
});
const infuraProvider =
  network === "kovan"
    ? configData.providers.infura.kovan
    : configData.providers.infura.mainnet;

const provider = new Web3.providers.HttpProvider(infuraProvider);

const mainnetContracts = {
  yes: "0x3af375d9f77ddd4f16f86a5d51a9386b7b4493fa",
  no: "0x44ea84a85616f8e9cd719fc843de31d852ad7240",
  dai: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
  pool: "0x6b74fb4e4b3b177b8e95ba9fa4c3a3121d22fbfb",
};

const kovanContracts = {
  yes: "0x1dbccf29375304c38bd0d162f636baa8dd6cce44",
  no: "0xeb69840f09A9235df82d9Ed9D43CafFFea2a1eE9",
  dai: "0xb6085abd65e21d205aead0b1b9981b8b221fa14e",
  pool: "0xbc6d6f508657c3c84983cd92f3eda6997e877e90",
};

const contracts = network === "mainnet" ? mainnetContracts : kovanContracts;

//App controls the user interface
class App extends Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  state = {
    web3: null,
    accounts: null,
    bfactoryContract: null,
    yesContract: null,
    noContract: null,
    daiContract: null,
    erc20Instance: null,
    // erc20Contract:null,
    pool: null,
    bpoolAddress: null,
    fromToken: "",
    toToken: "",
    fromAmount: 0,
    toAmount: 0,
    yesContractAddress: "",
    noContractAddress: "",
    daiContractAddress: "",
    fromExact: true,
    fromBalance: 0,
    toBalance: 0,
    shouldUpdateFrom: true,
    pricePerShare: 0,
    maxProfit: 0,
    priceImpact: 0,
    swapFee: 0,
    tokenMultiple: tokenMultiple,
    priceImpactColor: "black",
    isSwapDisabled: false,
    show: false,
    yesBalance: 0,
    noBalance: 0,
    yesPrice: 0,
    noPrice: 0,
    impliedOdds: 0,
  };

  componentDidMount = async () => {
    try {
      var { web3, accounts } = this.state;
      if (!accounts) {
        accounts = null;
        web3 = new Web3(provider);
        await web3.eth.net.isListening();
      }

      var yesInstance = new web3.eth.Contract(YesContract.abi, contracts.yes);
      var noInstance = new web3.eth.Contract(NoContract.abi, contracts.no);
      var daiInstance = new web3.eth.Contract(DaiContract.abi, contracts.dai);
      var erc20Instance = new web3.eth.Contract(DaiContract.abi);
      var poolInstance = new web3.eth.Contract(
        BPoolContract.abi,
        contracts.pool
      );

      this.setState({
        web3: web3,
        accounts: accounts,
        yesContract: yesInstance,
        noContract: noInstance,
        daiContract: daiInstance,
        erc20Instance: erc20Instance,
        pool: poolInstance,
        yesContractAddress: contracts.yes,
        noContractAddress: contracts.no,
        daiContractAddress: contracts.dai,
        bpoolAddress: contracts.pool,
      });

      var swapFee = await this.state.pool.methods.getSwapFee().call();
      swapFee = web3.utils.fromWei(swapFee);
      swapFee = Number(swapFee);
      this.setState({ swapFee: swapFee });
      console.log("swapFee: ", swapFee);

      // resets all allowances to 0 to test approve function
      /*
        await this.state.yesContract.methods.approve(this.state.bpoolAddress, web3.utils.toWei('0')).send( {from: accounts[0], gas: 6000000 });
        var yesAllowance = await this.state.yesContract.methods.allowance(accounts[0], this.state.bpoolAddress).call();
        yesAllowance = web3.utils.fromWei(yesAllowance);
        console.log("yesAllowance: ", yesAllowance);

        await this.state.noContract.methods.approve(this.state.bpoolAddress, web3.utils.toWei('0')).send( {from: accounts[0], gas: 6000000 });
        var noAllowance = await this.state.noContract.methods.allowance(accounts[0], this.state.bpoolAddress).call();
        noAllowance = web3.utils.fromWei(noAllowance);
        console.log("noAllowance: ", noAllowance);

        await this.state.daiContract.methods.approve(this.state.bpoolAddress, web3.utils.toWei('0')).send( {from: accounts[0], gas: 6000000 });
        var daiAllowance = await this.state.daiContract.methods.allowance(accounts[0], this.state.bpoolAddress).call();
        daiAllowance = web3.utils.fromWei(daiAllowance);
        console.log("daiAllowance: ", daiAllowance);
        */

      if (network === "ganache") {
        // Get the BFactory contract instance.
        const networkId = await web3.eth.net.getId();
        const deployedNetwork = BFactoryContract.networks[networkId];
        var bfactoryInstance = new web3.eth.Contract(
          BFactoryContract.abi,
          deployedNetwork && deployedNetwork.address
        );
        // Get Yes contract instance
        const networkId2 = await web3.eth.net.getId();
        const deployedNetwork2 = YesContract.networks[networkId2];
        yesInstance = new web3.eth.Contract(
          YesContract.abi,
          deployedNetwork2 && deployedNetwork2.address
        );
        // Get No contract instance
        const networkId3 = await web3.eth.net.getId();
        const deployedNetwork3 = NoContract.networks[networkId3];
        noInstance = new web3.eth.Contract(
          NoContract.abi,
          deployedNetwork3 && deployedNetwork3.address
        );

        // Get Dai contract instance
        const networkId4 = await web3.eth.net.getId();
        const deployedNetwork4 = DaiContract.networks[networkId4];
        daiInstance = new web3.eth.Contract(
          DaiContract.abi,
          deployedNetwork4 && deployedNetwork4.address
        );

        // Set web3, accounts, and contracts to the state
        this.setState({
          web3,
          accounts,
          bfactoryContract: bfactoryInstance,
          yesContract: yesInstance,
          noContract: noInstance,
          daiContract: daiInstance,
        });

        var { bfactoryContract } = this.state;
        var { noContract } = this.state;
        var { yesContract } = this.state;
        var { daiContract } = this.state;

        // @ mint YES, NO and Dai and send to LP1
        await yesContract.methods
          .mint(accounts[1], web3.utils.toWei("5000"))
          .send({ from: accounts[0] });
        await noContract.methods
          .mint(accounts[1], web3.utils.toWei("5000"))
          .send({ from: accounts[0] });
        await daiContract.methods
          .mint(accounts[1], web3.utils.toWei("5000"))
          .send({ from: accounts[0] });

        this.setState({
          yesContractAddress: yesContract.options.address,
          noContractAddress: noContract.options.address,
          daiContractAddress: daiContract.options.address,
        });

        // @ mint Dai and send to Trader1
        await daiContract.methods
          .mint(accounts[0], web3.utils.toWei("5000"))
          .send({ from: accounts[0] });

        console.log(
          "Balances of LP1 and Trader1 after minting and before pool creation"
        );
        var LP1YesBalance = await yesContract.methods
          .balanceOf(accounts[1])
          .call();
        LP1YesBalance = web3.utils.fromWei(LP1YesBalance);
        console.log("LP1 Yes balance: ", LP1YesBalance);
        var LP1NoBalance = await noContract.methods
          .balanceOf(accounts[1])
          .call();
        LP1NoBalance = web3.utils.fromWei(LP1NoBalance);
        console.log("LP1 No balance: ", LP1NoBalance);
        var trader1DaiBalance = await daiContract.methods
          .balanceOf(accounts[0])
          .call();
        trader1DaiBalance = web3.utils.fromWei(trader1DaiBalance);
        trader1DaiBalance = Number(trader1DaiBalance);
        trader1DaiBalance = trader1DaiBalance.toFixed(2);
        var zero = 0;
        zero = zero.toFixed(2);
        var trader1YesBalance = zero;
        var trader1NoBalance = zero;
        console.log("Trader1 Dai balance: ", trader1DaiBalance);
        this.setState({
          trader1YesBalance: trader1YesBalance,
          trader1NoBalance: trader1NoBalance,
          trader1DaiBalance: trader1DaiBalance,
        });

        // create a new balancer pool and save address to state, bind tokens and set public
        const tx = await bfactoryContract.methods
          .newBPool()
          .send({ from: accounts[1], gas: 6000000 });
        var bpoolAddress = tx.events.LOG_NEW_POOL.returnValues[1];
        this.setState({ bpoolAddress: bpoolAddress });
        var pool = new web3.eth.Contract(abi, this.state.bpoolAddress);
        this.setState({ pool: pool });

        await yesContract.methods
          .approve(this.state.bpoolAddress, web3.utils.toWei("5000"))
          .send({ from: accounts[1], gas: 6000000 });

        await pool.methods
          .bind(
            yesContract.options.address,
            web3.utils.toWei("5000"),
            web3.utils.toWei("18.75")
          )
          .send({ from: accounts[1], gas: 6000000 });
        await noContract.methods
          .approve(this.state.bpoolAddress, web3.utils.toWei("5000"))
          .send({ from: accounts[1], gas: 6000000 });
        await pool.methods
          .bind(
            noContract.options.address,
            web3.utils.toWei("5000"),
            web3.utils.toWei("6.25")
          )
          .send({ from: accounts[1], gas: 6000000 });
        await daiContract.methods
          .approve(this.state.bpoolAddress, web3.utils.toWei("5000"))
          .send({ from: accounts[1], gas: 6000000 });
        await pool.methods
          .bind(
            daiContract.options.address,
            web3.utils.toWei("5000"),
            web3.utils.toWei("25")
          )
          .send({ from: accounts[1], gas: 6000000 });
        await pool.methods
          .setPublicSwap(true)
          .send({ from: accounts[1], gas: 6000000 });

        tokenMultiple = 1;
        this.setState({ tokenMultiple: tokenMultiple });
      }
      if (!this.state.fromToken) {
        this.setState({
          fromToken: this.state.daiContractAddress,
          toToken: this.state.yesContractAddress,
        });
        this.setState({ fromAmount: 100 });
      }
      await this.updateBalances();

      // Set starting parameters
      await this.calcToGivenFrom();
    } catch (error) {
      // Catch any errors for any of the above operations.
      console.error(error);
    }
  };

  // This function updates state in response to user input
  handleChange = async (e) => {
    e.persist();
    console.log("handleChange working", e.target.name, ": ", e.target.value);
    await this.setState({ [e.target.name]: e.target.value });
    console.log("this.state.toToken: ", this.state.toToken);
    console.log("this.state.noContractAddress: ", this.state.noContractAddress);
    console.log(
      "this.state.yesContractAddress: ",
      this.state.yesContractAddress
    );

    if (
      e.target.name === "fromAmount" &&
      this.state.fromToken &&
      this.state.toToken
    ) {
      await this.calcToGivenFrom();
      await this.calcPriceProfitSlippage();
    }
    if (
      e.target.name === "toAmount" &&
      this.state.fromToken &&
      this.state.toToken
    ) {
      await this.calcFromGivenTo();
      await this.calcPriceProfitSlippage();
    }
    //add a condition when toToken == fromToken
    if (e.target.name === "toToken") {
      await this.setState({
        [e.target.name]: e.target.value,
      });
      console.log("about to update balances");
      this.updateBalances();

      await this.calcToGivenFrom();
      await this.calcPriceProfitSlippage();
    }
    if (e.target.name === "fromToken") {
      await this.setState({ [e.target.name]: e.target.value });
      console.log("about to update balances");
      this.updateBalances();

      await this.calcFromGivenTo();
      await this.calcPriceProfitSlippage();
    }
  };
  connectWallet = async () => {
    if (window.ethereum) {
      console.log("connecting wallet");
      var web3 = new Web3(window.ethereum);

      await window.ethereum.enable();
      console.log(await web3.eth.net.isListening());

      // console.log(web3);
      var accounts = await web3.eth.getAccounts();
      // console.log(accounts);

      console.log(web3.currentProvider);

      this.setState({ web3: web3, accounts: accounts });
      await this.componentDidMount();
    } else {
      this.showModal();
    }
  };

  // Calculates number of "to" tokens received for a given number of "from" tokens
  calcToGivenFrom = async () => {
    const { pool } = this.state;
    const { web3 } = this.state;
    const { fromToken } = this.state;
    const { toToken } = this.state;
    const { daiContractAddress } = this.state;
    const { swapFee } = this.state;
    const { tokenMultiple } = this.state;

    try {
      var fromTokenBalance = await pool.methods.getBalance(fromToken).call();
      fromTokenBalance = Number(web3.utils.fromWei(fromTokenBalance));
      if (fromToken !== daiContractAddress) {
        fromTokenBalance = tokenMultiple * fromTokenBalance;
      }
      console.log("CTGF fromTokenBalance: ", fromTokenBalance);

      var fromTokenWeight = await pool.methods
        .getNormalizedWeight(fromToken)
        .call();
      fromTokenWeight = web3.utils.fromWei(fromTokenWeight);

      var toTokenBalance = await pool.methods.getBalance(toToken).call();
      toTokenBalance = web3.utils.fromWei(toTokenBalance);
      if (toToken !== daiContractAddress) {
        toTokenBalance = tokenMultiple * toTokenBalance;
      }
      console.log("CFGT toTokenBalance: ", toTokenBalance);

      var toTokenWeight = await pool.methods
        .getNormalizedWeight(toToken)
        .call();
      toTokenWeight = web3.utils.fromWei(toTokenWeight);

      console.log(
        "fromTokenBalance + fromAmount: ",
        Number(fromTokenBalance) + Number(this.state.fromAmount)
      );

      var intermediate1 =
        Number(fromTokenBalance) /
        (Number(fromTokenBalance) + Number(this.state.fromAmount));
      console.log(
        "fromTokenWeight / toTokenWeight: ",
        fromTokenWeight / toTokenWeight
      );
      var intermediate2 = intermediate1 ** (fromTokenWeight / toTokenWeight);
      console.log("intermediate2: ", intermediate2);
      var toAmount = Number(toTokenBalance) * (1 - intermediate2);
      toAmount = toAmount * (1.0 - swapFee);
      toAmount = toAmount.toFixed(2);
      console.log("toAmount: ", toAmount);
      this.setState({ toAmount: toAmount, fromExact: true });
      await this.calcPriceProfitSlippage();

      return toAmount;
    } catch (error) {
      alert(
        `Calculate number of to tokens received failed. Check console for details.`
      );
      console.error(error);
    }
  };
  getMax = async () => {
    const {
      web3,
      accounts,
      erc20Instance,
      fromToken,
      daiContractAddress,
    } = this.state;
    console.log(fromToken);
    erc20Instance.options.address = fromToken;
    if (!accounts) {
      return;
    }

    let balanceInWei = await erc20Instance.methods
      .balanceOf(accounts[0])
      .call();

    let maxFromAmount = web3.utils.fromWei(balanceInWei);
    maxFromAmount =
      fromToken !== daiContractAddress
        ? maxFromAmount * tokenMultiple
        : maxFromAmount;
    //rounding error solution
    maxFromAmount = Number(maxFromAmount)
      .toString()
      .match(/^-?\d+(?:\.\d{0,2})?/)[0];

    this.setState({ fromAmount: maxFromAmount });
    console.log("max:" + web3.utils.fromWei(balanceInWei));

    await this.calcToGivenFrom();
    await this.calcPriceProfitSlippage();
  };
  reversePair = async () => {
    console.log("reverse the pair");
    const {
      fromAmount,
      toAmount,
      fromToken,
      toToken,
      shouldUpdateFrom,
    } = this.state;
    if (shouldUpdateFrom) {
      await this.setState({
        toAmount: fromAmount,
        fromToken: toToken,
        toToken: fromToken,
        shouldUpdateFrom: false,
      });
      await this.calcFromGivenTo();
      await this.calcPriceProfitSlippage();
      await this.updateBalances();
    } else {
      await this.setState({
        fromAmount: toAmount,
        fromToken: toToken,
        toToken: fromToken,
        shouldUpdateFrom: true,
      });
      await this.calcToGivenFrom();
      await this.calcPriceProfitSlippage();
      await this.updateBalances();
    }
    //the toAmount will be the same as fromAmount and the fromAmount will be recalculated(uniswap)
  };
  // Calculates number of "from" tokens spent for a given number of "to" tokens
  calcFromGivenTo = async () => {
    const { pool } = this.state;
    const { web3 } = this.state;
    const { fromToken } = this.state;
    const { toToken } = this.state;
    const { daiContractAddress } = this.state;
    const { swapFee } = this.state;
    const { tokenMultiple } = this.state;

    try {
      var fromTokenBalance = await pool.methods.getBalance(fromToken).call();
      fromTokenBalance = Number(web3.utils.fromWei(fromTokenBalance));
      if (fromToken !== daiContractAddress) {
        fromTokenBalance = tokenMultiple * fromTokenBalance;
      }
      console.log("CFGT fromTokenBalance: ", fromTokenBalance);

      var fromTokenWeight = await pool.methods
        .getNormalizedWeight(fromToken)
        .call();
      fromTokenWeight = web3.utils.fromWei(fromTokenWeight);

      var toTokenBalance = await pool.methods.getBalance(toToken).call();
      toTokenBalance = web3.utils.fromWei(toTokenBalance);
      if (toToken !== daiContractAddress) {
        toTokenBalance = tokenMultiple * toTokenBalance;
      }
      console.log("CFGT toTokenBalance: ", toTokenBalance);

      var toTokenWeight = await pool.methods
        .getNormalizedWeight(toToken)
        .call();
      toTokenWeight = web3.utils.fromWei(toTokenWeight);

      var intermediate1 =
        Number(toTokenBalance) /
        (Number(toTokenBalance) - Number(this.state.toAmount));
      console.log(
        "Number(toTokenBalance) + Number(this.state.toAmount): ",
        Number(toTokenBalance) - Number(this.state.toAmount)
      );
      console.log("intermediate1: ", intermediate1);
      var intermediate2 = intermediate1 ** (toTokenWeight / fromTokenWeight);
      var exponent = toTokenWeight / fromTokenWeight;
      console.log("exponent: ", exponent);
      console.log("intermediate2: ", intermediate2);
      var fromAmount = fromTokenBalance * (intermediate2 - 1);
      console.log("fromAmount before add fee: ", fromAmount);
      fromAmount = fromAmount * (1.0 + swapFee);
      console.log("fromAmount after add fee: ", fromAmount);
      fromAmount = fromAmount.toFixed(2);
      this.setState({ fromAmount: fromAmount, fromExact: false });
      console.log("fromAmount: ", fromAmount);
      await this.calcPriceProfitSlippage();
    } catch (error) {
      alert(
        `Calculate number of from tokens paid failed. Check console for details.`
      );
      console.error(error);
    }
  };

  // This function determines whether to swapExactAmountIn or swapExactAmountOut
  swapBranch = async () => {
    console.log("swapBranch started");
    if (this.state.fromExact) {
      await this.swapExactAmountIn();
    } else {
      await this.swapExactAmountOut();
    }
  };

  // Swap with the number of "from" tokens fixed
  swapExactAmountIn = async () => {
    const { web3 } = this.state;
    const { accounts } = this.state;
    const { pool } = this.state;
    const { fromToken } = this.state;
    const { toToken } = this.state;
    const { noContract } = this.state;
    const { noContractAddress } = this.state;
    const { yesContract } = this.state;
    const { yesContractAddress } = this.state;
    const { daiContract } = this.state;
    const { daiContractAddress } = this.state;
    const { bpoolAddress } = this.state;
    var { fromAmount } = this.state;
    var { toAmount } = this.state;
    var { tokenMultiple } = this.state;
    var { erc20Instance } = this.state;

    console.log("SEAI toAmount: ", toAmount);
    if (fromToken !== daiContractAddress) {
      fromAmount = fromAmount / tokenMultiple;
    }

    console.log("SEAI fromAmount: ", fromAmount);
    if (toToken !== daiContractAddress) {
      toAmount = toAmount / tokenMultiple;
    }
    console.log("SEAI toAmount: ", toAmount);
    var maxPrice = 2 * (fromAmount / toAmount);
    console.log("SEAI maxPrice: ", maxPrice);
    console.log("SEAI typeof maxPrice: ", typeof maxPrice);

    maxPrice = maxPrice.toFixed(18);

    toAmount = toAmount * 0.997;
    toAmount = Number(toAmount).toFixed(18);

    toAmount = web3.utils.toWei(toAmount.toString());
    maxPrice = web3.utils.toWei(maxPrice.toString());
    var allowanceLimit = unlimitedAllowance.toFixed();

    try {
      //approve fromAmount of fromToken for spending by Trader1

      //here we are just going to do the same thing but without the if conditions
      erc20Instance.options.address = fromToken;
      //uncomment for testing
      // await erc20Instance.methods
      //   .approve(bpoolAddress, "0")
      //   .send({ from: accounts[0], gas: 46000 });
      var allowance = await erc20Instance.methods
        .allowance(accounts[0], bpoolAddress)
        .call();

      allowance = web3.utils.fromWei(allowance);
      console.log("allowance Before:" + allowance.toString());
      if (Number(allowance) < Number(fromAmount)) {
        this.setState({ isSwapDisabled: true });
        await erc20Instance.methods
          .approve(bpoolAddress, allowanceLimit)
          .send({ from: accounts[0], gas: 46000 })
          .on("transactionHash", (transactionHash) => {
            notification.info({
              message: "Approve Pending",
              description: "Please Wait....",
            });
            console.log(transactionHash);
          })
          .on("receipt", function (receipt) {
            notification.destroy();
            notification.success({
              duration: 7,
              message: "Approve Done",
            });
          })
          .on("error", function (error) {
            notification.destroy();
            if (error.message.includes("User denied transaction signature")) {
              notification.error({
                duration: 7,
                message: "Transaction Rejected",
                // description: "",
              });
            } else {
              notification.error({
                duration: 7,
                message: "There was an error in executing the transaction",
                // description: "",
              });
            }
          });

        allowance = await erc20Instance.methods
          .allowance(accounts[0], bpoolAddress)
          .call();

        console.log("Allowance of fromToken after approval: ", allowance);
      }

      fromAmount = web3.utils.toWei(fromAmount.toString());
      await pool.methods
        .swapExactAmountIn(fromToken, fromAmount, toToken, toAmount, maxPrice)
        .send({ from: accounts[0], gas: 150000 })
        .on("transactionHash", (transactionHash) => {
          notification.info({
            message: "Transaction Pending",
            description: (
              <div>
                <p>This can take a moment...</p>
                {this.getEtherscanLink(transactionHash)}
              </div>
            ),
            icon: <LoadingOutlined />,
          });
        })
        .on("receipt", function (receipt) {
          notification.destroy();
          // console.log("receipt", receipt);
          notification.success({
            duration: 7,
            message: "swap done",
            //maybe I am missing something but using this.getEtherscanLink(receipt.transactionHash) is not working
            description: (
              <a
                href={etherscanPrefix + receipt.transactionHash}
                target="_blank"
                rel="noopener noreferrer"
              >
                See on Etherscan
              </a>
            ),
          });
        })
        .on("error", function (error) {
          notification.destroy();
          if (error.message.includes("User denied transaction signature")) {
            notification.error({
              duration: 7,
              message: "Transaction Rejected",
              // description: "",
            });
          } else {
            notification.error({
              duration: 7,
              message: "There was an error in executing the transaction",
              // description: "",
            });
          }
        });
      this.setState({ isSwapDisabled: false });
      // console.log("Successful transaction: ", tx.status);
      // console.log("Checking balances after transaction ...");
      var trader1YesBalance = await yesContract.methods
        .balanceOf(accounts[0])
        .call();
      trader1YesBalance = web3.utils.fromWei(trader1YesBalance);
      trader1YesBalance = Number(trader1YesBalance);
      trader1YesBalance = trader1YesBalance.toFixed(2);
      console.log("trader1YesBalance: ", trader1YesBalance);
      var trader1NoBalance = await noContract.methods
        .balanceOf(accounts[0])
        .call();
      trader1NoBalance = web3.utils.fromWei(trader1NoBalance);
      trader1NoBalance = Number(trader1NoBalance);
      trader1NoBalance = trader1NoBalance.toFixed(2);
      console.log("trader1NoBalance: ", trader1NoBalance);
      var trader1DaiBalance = await daiContract.methods
        .balanceOf(accounts[0])
        .call();
      trader1DaiBalance = web3.utils.fromWei(trader1DaiBalance);
      trader1DaiBalance = Number(trader1DaiBalance);
      trader1DaiBalance = trader1DaiBalance.toFixed(2);
      console.log("Trader1 Dai balance: ", trader1DaiBalance);
      this.setState({
        trader1YesBalance: trader1YesBalance,
        trader1NoBalance: trader1NoBalance,
        trader1DaiBalance: trader1DaiBalance,
      });
      await this.updateBalances();
    } catch (error) {
      // alert(`Swap with from tokens fixed failed. Check console for details.`);
      this.setState({ isSwapDisabled: false });
      console.error(error);
    }
  };

  // Swap with the number of "to"" tokens fixed
  swapExactAmountOut = async () => {
    const { web3 } = this.state;
    const { accounts } = this.state;
    const { pool } = this.state;
    const { fromToken } = this.state;
    const { toToken } = this.state;
    const { noContract } = this.state;
    const { noContractAddress } = this.state;
    const { yesContract } = this.state;
    const { yesContractAddress } = this.state;
    const { daiContract } = this.state;
    const { daiContractAddress } = this.state;
    const { bpoolAddress } = this.state;
    var { fromAmount } = this.state;
    var { toAmount } = this.state;
    var { tokenMultiple } = this.state;
    var { erc20Instance } = this.state;

    var maxPrice = 2 * (toAmount / fromAmount);

    if (toToken !== daiContractAddress) {
      toAmount = toAmount / tokenMultiple;
      maxPrice = maxPrice * tokenMultiple;
    }
    maxPrice = maxPrice.toFixed(18);
    toAmount = Number(toAmount).toFixed(18);
    console.log("SEAO toAmount: ", toAmount);
    if (fromToken !== daiContractAddress) {
      fromAmount = fromAmount / tokenMultiple;
    }
    fromAmount = 1.003 * fromAmount;
    console.log("SEAO toAmount: ", toAmount);
    console.log("SEAO fromAmount including allowed slippage: ", fromAmount);
    console.log("SEAO maxPrice: ", maxPrice);

    toAmount = web3.utils.toWei(toAmount.toString());
    maxPrice = web3.utils.toWei(maxPrice.toString());
    var allowanceLimit = unlimitedAllowance.toFixed();

    try {
      //approve fromAmount of fromToken for spending by Trader1

      erc20Instance.options.address = fromToken;
      //uncomment for testing
      // await erc20Instance.methods
      //   .approve(bpoolAddress, "0")
      //   .send({ from: accounts[0], gas: 46000 });

      var allowance = await erc20Instance.methods
        .allowance(accounts[0], bpoolAddress)
        .call();
      allowance = web3.utils.fromWei(allowance);
      console.log("allowance Before:" + allowance.toString());

      if (Number(allowance) < Number(fromAmount)) {
        this.setState({ isSwapDisabled: true });
        await erc20Instance.methods
          .approve(bpoolAddress, allowanceLimit)
          .send({ from: accounts[0], gas: 46000 })
          .on("transactionHash", (transactionHash) => {
            notification.info({
              message: "Approval Pending",
              description: "Please Wait....",
            });
            console.log(transactionHash);
          })
          .on("receipt", function (receipt) {
            notification.destroy();
            notification.success({
              duration: 7,
              message: "Approval Done",
            });
          })
          .on("error", function (error) {
            notification.destroy();

            if (error.message.includes("User denied transaction signature")) {
              notification.error({
                duration: 7,
                message: "Transaction Rejected",
                // description: "",
              });
            } else {
              notification.error({
                duration: 7,
                message: "There was an error in executing the transaction",
                // description: "",
              });
            }
          });

        allowance = await erc20Instance.methods
          .allowance(accounts[0], bpoolAddress)
          .call();

        console.log("Allowance of fromToken after approval: ", allowance);
      }

      fromAmount = Number(fromAmount).toFixed(18);
      fromAmount = web3.utils.toWei(fromAmount.toString());

      await pool.methods
        .swapExactAmountOut(fromToken, fromAmount, toToken, toAmount, maxPrice)
        .send({ from: accounts[0], gas: 150000 })
        .on("transactionHash", (transactionHash) => {
          notification.info({
            message: "Transaction Pending",
            description: (
              <div>
                <p>This can take a moment...</p>
                {this.getEtherscanLink(transactionHash)}
              </div>
            ),
            icon: <LoadingOutlined />,
          });
        })
        .on("receipt", function (receipt) {
          notification.destroy();
          // console.log("receipt", receipt);
          notification.success({
            duration: 7,
            message: "swap done",
            //maybe I am missing something but using this.getEtherscanLink(receipt.transactionHash) is not working
            description: (
              <a
                href={etherscanPrefix + receipt.transactionHash}
                target="_blank"
                rel="noopener noreferrer"
              >
                See on Etherscan
              </a>
            ),
          });
        })
        .on("error", function (error) {
          notification.destroy();
          if (error.message.includes("User denied transaction signature")) {
            notification.error({
              duration: 7,
              message: "Transaction Rejected",
              // description: "",
            });
          } else {
            notification.error({
              duration: 7,
              message: "There was an error in executing the transaction",
              // description: "",
            });
          }
        });
      this.setState({ isSwapDisabled: false });

      console.log("Checking balances after transaction ...");
      var trader1YesBalance = await yesContract.methods
        .balanceOf(accounts[0])
        .call();
      trader1YesBalance = web3.utils.fromWei(trader1YesBalance);
      trader1YesBalance = Number(trader1YesBalance);
      trader1YesBalance = trader1YesBalance.toFixed(2);
      console.log("trader1YesBalance: ", trader1YesBalance);
      var trader1NoBalance = await noContract.methods
        .balanceOf(accounts[0])
        .call();
      trader1NoBalance = web3.utils.fromWei(trader1NoBalance);
      trader1NoBalance = Number(trader1NoBalance);
      trader1NoBalance = trader1NoBalance.toFixed(2);
      console.log("trader1NoBalance: ", trader1NoBalance);
      var trader1DaiBalance = await daiContract.methods
        .balanceOf(accounts[0])
        .call();
      trader1DaiBalance = web3.utils.fromWei(trader1DaiBalance);
      trader1DaiBalance = Number(trader1DaiBalance);
      trader1DaiBalance = trader1DaiBalance.toFixed(2);
      console.log("Trader1 Dai balance: ", trader1DaiBalance);
      this.setState({
        trader1YesBalance: trader1YesBalance,
        trader1NoBalance: trader1NoBalance,
        trader1DaiBalance: trader1DaiBalance,
      });
      await this.updateBalances();
    } catch (error) {
      // alert(
      //   `Swap with number of from tokens fixed failed. Check console for details.`
      // );
      this.setState({ isSwapDisabled: false });
      console.error(error);
    }
  };

  getEtherscanLink = (transactionHash) => {
    console.log("etherscanLink", etherscanPrefix + transactionHash);
    return (
      <a
        href={etherscanPrefix + transactionHash}
        target="_blank"
        rel="noopener noreferrer"
      >
        See on Etherscan
      </a>
    );
  };
  // This function updates trader balances initially and after sale
  // Also resets price per share, max profit and price impact to 0
  updateBalances = async () => {
    const { web3 } = this.state;
    const { fromToken } = this.state;
    const { toToken } = this.state;
    const { noContract } = this.state;
    const { yesContract } = this.state;
    const { daiContract } = this.state;
    const { noContractAddress } = this.state;
    const { yesContractAddress } = this.state;
    const { daiContractAddress } = this.state;
    const { accounts } = this.state;
    const { tokenMultiple } = this.state;
    const { pool } = this.state;

    var yesPrice = await pool.methods
      .getSpotPrice(daiContractAddress, yesContractAddress)
      .call();
    yesPrice = web3.utils.fromWei(yesPrice);
    yesPrice = Number(yesPrice);
    yesPrice = yesPrice / tokenMultiple;
    console.log("yesPrice", yesPrice);
    yesPrice = yesPrice.toFixed(2);
    console.log("yesPrice", yesPrice);

    var noPrice = await pool.methods
      .getSpotPrice(daiContractAddress, noContractAddress)
      .call();
    noPrice = web3.utils.fromWei(noPrice);
    noPrice = Number(noPrice);
    noPrice = noPrice / tokenMultiple;
    console.log("noPrice", noPrice);
    noPrice = noPrice.toFixed(2);
    console.log("noPrice", noPrice);
    //update all the state variables at one for smoother experience
    this.setState({
      yesPrice: yesPrice,
      noPrice: noPrice,
    });

    if (!accounts) return;
    var yesBalance = await yesContract.methods.balanceOf(accounts[0]).call();
    yesBalance = web3.utils.fromWei(yesBalance);
    yesBalance = Number(yesBalance);
    yesBalance = tokenMultiple * yesBalance;
    yesBalance = yesBalance.toFixed(2);
    console.log("yesBalance", yesBalance);
    if (fromToken === yesContractAddress) {
      this.setState({ fromBalance: yesBalance });
    }
    if (toToken === yesContractAddress) {
      this.setState({ toBalance: yesBalance });
    }

    var noBalance = await noContract.methods.balanceOf(accounts[0]).call();
    noBalance = web3.utils.fromWei(noBalance);
    noBalance = Number(noBalance);
    noBalance = tokenMultiple * noBalance;
    noBalance = noBalance.toFixed(2);

    console.log("noBalance", noBalance);
    if (fromToken === noContractAddress) {
      this.setState({ fromBalance: noBalance });
    }
    if (toToken === noContractAddress) {
      this.setState({ toBalance: noBalance });
    }

    //update all the state variables at one for smoother experience
    this.setState({
      noBalance: noBalance,
      yesBalance: yesBalance,
    });

    var daiBalance = await daiContract.methods.balanceOf(accounts[0]).call();
    daiBalance = web3.utils.fromWei(daiBalance);
    daiBalance = Number(daiBalance);
    daiBalance = daiBalance.toFixed(2);
    console.log("daiBalance", daiBalance);
    if (fromToken === daiContractAddress) {
      this.setState({ fromBalance: daiBalance });
    }
    if (toToken === daiContractAddress) {
      this.setState({ toBalance: daiBalance });
    }
  };

  // This function calculates miscellaneous numbers after quote
  calcPriceProfitSlippage = async () => {
    const { fromToken } = this.state;
    const { toToken } = this.state;
    var { fromAmount } = this.state;
    var { toAmount } = this.state;
    const { yesContractAddress } = this.state;
    const { noContractAddress } = this.state;
    const { daiContractAddress } = this.state;
    const { pool } = this.state;
    const { web3 } = this.state;
    const { swapFee } = this.state;
    const { tokenMultiple } = this.state;

    if (fromAmount === "" || toAmount === "") {
      this.setState({
        pricePerShare: 0,
        maxProfit: 0,
        priceImpact: 0,
      });
    } else {
      if (
        (toToken === yesContractAddress || toToken === noContractAddress) &&
        fromToken === daiContractAddress
      ) {
        var spotPrice = await pool.methods
          .getSpotPriceSansFee(fromToken, toToken)
          .call();
        spotPrice = web3.utils.fromWei(spotPrice);
        console.log("spotPrice from pool: ", spotPrice);
        spotPrice = Number(spotPrice);
        spotPrice = spotPrice / tokenMultiple;
        console.log("spotPrice", spotPrice);
        spotPrice = spotPrice * (1.0 + swapFee);
        spotPrice = spotPrice.toFixed(6);
        console.log("spotPrice", spotPrice);
        var pricePerShare = fromAmount / toAmount;
        var maxProfit = (1 - pricePerShare) * toAmount;
        var priceImpact = ((pricePerShare - spotPrice) * 100) / pricePerShare;
        pricePerShare = Number(pricePerShare);
        console.log("pricePerShare: ", pricePerShare);
        pricePerShare = pricePerShare.toFixed(3);
        maxProfit = maxProfit.toFixed(2);
        priceImpact = priceImpact.toFixed(2);
        console.log("maxProfit: ", maxProfit);
        if (priceImpact < 1) {
          this.setState({ priceImpactColor: "green" });
        } else if (priceImpact >= 1 && priceImpact <= 3) {
          this.setState({ priceImpactColor: "black" });
        } else if (priceImpact > 3) {
          this.setState({ priceImpactColor: "red" });
        }
        console.log(
          "this.state.priceImpactColor: ",
          this.state.priceImpactColor
        );
        this.setState({
          pricePerShare: pricePerShare,
          maxProfit: maxProfit,
          priceImpact: priceImpact,
        });
      } else if (
        (fromToken === yesContractAddress || fromToken === noContractAddress) &&
        toToken === daiContractAddress
      ) {
        spotPrice = await pool.methods
          .getSpotPriceSansFee(fromToken, toToken)
          .call();
        spotPrice = web3.utils.fromWei(spotPrice);
        spotPrice = Number(spotPrice);
        console.log("spotPrice from pool: ", spotPrice);
        spotPrice = 1 / spotPrice;
        console.log("spotPrice reciprocal: ", spotPrice);
        spotPrice = spotPrice * (1 - swapFee);
        console.log("Kovan spotPrice with fee", spotPrice);
        spotPrice = spotPrice / tokenMultiple;
        pricePerShare = toAmount / fromAmount;
        console.log("pricePerShare: ", pricePerShare);
        console.log("spotPrice: ", spotPrice);
        priceImpact = ((spotPrice - pricePerShare) * 100) / spotPrice;
        spotPrice = spotPrice.toFixed(3);
        pricePerShare = pricePerShare.toFixed(3);
        console.log("priceImpact: ", priceImpact);
        if (priceImpact < 1) {
          this.setState({ priceImpactColor: "green" });
        } else if (priceImpact >= 1 && priceImpact <= 3) {
          this.setState({ priceImpactColor: "black" });
        } else if (priceImpact > 3) {
          this.setState({ priceImpactColor: "red" });
        }
        pricePerShare = Number(pricePerShare);
        priceImpact = priceImpact.toFixed(2);
        console.log(
          "this.state.priceImpactColor: ",
          this.state.priceImpactColor
        );
        pricePerShare = pricePerShare.toFixed(3);
        this.setState({
          pricePerShare: pricePerShare,
          maxProfit: 0,
          priceImpact: priceImpact,
        });
      } else {
        spotPrice = await pool.methods
          .getSpotPriceSansFee(fromToken, toToken)
          .call();
        spotPrice = web3.utils.fromWei(spotPrice);
        console.log("spotPrice from pool: ", spotPrice);
        spotPrice = Number(spotPrice);
        spotPrice = spotPrice * (1.0 + swapFee);
        spotPrice = spotPrice.toFixed(6);
        console.log("spotPrice", spotPrice);
        pricePerShare = fromAmount / toAmount;
        let impliedOdds;
        impliedOdds = 100 - 100 / (1 + pricePerShare);
        impliedOdds = Number(impliedOdds).toFixed(2);

        priceImpact = ((pricePerShare - spotPrice) * 100) / pricePerShare;
        pricePerShare = Number(pricePerShare);
        console.log("pricePerShare: ", pricePerShare);
        pricePerShare = pricePerShare.toFixed(3);
        priceImpact = priceImpact.toFixed(2);

        if (priceImpact < 1) {
          this.setState({ priceImpactColor: "green" });
        } else if (priceImpact >= 1 && priceImpact <= 3) {
          this.setState({ priceImpactColor: "black" });
        } else if (priceImpact > 3) {
          this.setState({ priceImpactColor: "red" });
        }
        this.setState({
          pricePerShare: pricePerShare,
          maxProfit: 0,
          priceImpact: priceImpact,
          impliedOdds: impliedOdds,
        });
      }
    }
  };
  showModal = () => {
    this.setState({ show: true });
  };

  hideModal = () => {
    this.setState({ show: false });
  };
  //Add yes token to Metamask
  AddYesTokenToMetamask = async () => {
    console.log("hit add yes token");
    try {
      await this.AddTokenToMetamask(this.state.yesContractAddress);
    } catch (error) {
      alert(`Add yes token to Metamask failed. Check console for details.`);
      console.error(error);
    }
  };

  //Add no token to Metamask
  AddNoTokenToMetamask = async () => {
    console.log("hit add no token");
    try {
      await this.AddTokenToMetamask(this.state.noContractAddress);
    } catch (error) {
      alert(`Add no token to Metamask failed. Check console for details.`);
      console.error(error);
    }
  };

  // Add token to Metamask
  AddTokenToMetamask = async (tokenAddress) => {
    const { yesContractAddress } = this.state;
    const { noContractAddress } = this.state;
    const { yesContract } = this.state;
    const { noContract } = this.state;
    let tokenSymbol;
    let decimals;
    let tokenImage;
    if (tokenAddress === yesContractAddress) {
      tokenSymbol = await yesContract.methods.symbol().call();
      decimals = await yesContract.methods.decimals().call();
      tokenImage = yesIcon;
    } else if (tokenAddress === noContractAddress) {
      tokenSymbol = await noContract.methods.symbol().call();
      decimals = await noContract.methods.decimals().call();
      tokenImage = noIcon;
    } else {
      throw new Error("Cannot add this token to Metamask");
    }
    const provider = window.web3.currentProvider;
    try {
      provider.sendAsync(
        {
          method: "metamask_watchAsset",
          params: {
            type: "ERC20",
            options: {
              address: tokenAddress,
              symbol: tokenSymbol,
              decimals: decimals,
              image: tokenImage,
            },
          },
          id: Math.round(Math.random() * 100000),
        },
        (err, added) => {
          console.log("provider returned", err, added);
          if (err || "error" in added) {
            notification.error({
              duration: 7,
              message: "There was an error in adding token to Metamask Wallet",
            });
          }
          return;
        }
      );
    } catch (error) {
      alert(`Add token to Metamask failed. Check console for details.`);
      console.error(error);
    }
  };
  // render(<Example />);

  render() {
    return (
      <div className={`App ${this.props.isContrast ? "dark" : "light"}`}>
        <PageHeader
          yesBalance={this.state.yesBalance}
          noBalance={this.state.noBalance}
          yesPrice={this.state.yesPrice}
          noPrice={this.state.noPrice}
          AddYesTokenToMetamask={this.AddYesTokenToMetamask}
          AddNoTokenToMetamask={this.AddNoTokenToMetamask}
        />
        <Trading
          handleChange={this.handleChange}
          fromAmount={this.state.fromAmount}
          fromToken={this.state.fromToken}
          toAmount={this.state.toAmount}
          toToken={this.state.toToken}
          fromBalance={this.state.fromBalance}
          toBalance={this.state.toBalance}
          yesContractAddress={this.state.yesContractAddress}
          noContractAddress={this.state.noContractAddress}
          daiContractAddress={this.state.daiContractAddress}
          pricePerShare={this.state.pricePerShare}
          maxProfit={this.state.maxProfit}
          priceImpact={this.state.priceImpact}
          priceImpactColor={this.state.priceImpactColor}
          swapBranch={this.swapBranch}
          getMax={this.getMax}
          reversePair={this.reversePair}
          isSwapDisabled={this.state.isSwapDisabled}
          accounts={this.state.accounts}
          connectWallet={this.connectWallet}
          showModal={this.showModal}
          hideModal={this.hideModal}
          show={this.state.show}
          yesBalance={this.state.yesBalance}
          noBalance={this.state.noBalance}
          impliedOdds={this.state.impliedOdds}
        />
      </div>
    );
  }
}

function mapStateToProps(state) {
  return { isContrast: state.settings.isContrast };
}

export default connect(mapStateToProps)(App);
