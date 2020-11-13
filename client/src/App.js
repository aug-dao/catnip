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
import MultiCall from "./contracts/Multicall.json";
//notification
import { notification } from "antd";
import "antd/dist/antd.css";
import { LoadingOutlined } from "@ant-design/icons";

import configData from "./config.json";
const yesIcon =
  "https://cloudflare-ipfs.com/ipfs/QmRWo92JEL6s2ydN1fK2Q3KAX2rzBnTnfqkABFYHmA5EUT";
const noIcon =
  "https://cloudflare-ipfs.com/ipfs/QmUVCPwVDCTzM2kBxejB85MS2m3KRjSW7f2w81pSr8ZvTL";

const BigNumber = require("bignumber.js");

const BN = require("bn.js");
const MAX_UINT256 = new BN(2).pow(new BN(256)).sub(new BN(1));
const TEN_THOUSAND_BN = new BN(10000);

const network = "mainnet"; // set network as "ganache" or "kovan" or "mainnet"
const tokenMultiple = network === "kovan" ? new BN(100) : new BN(1000);
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
  yes: "0x3af375d9f77Ddd4F16F86A5D51a9386b7B4493Fa",
  no: "0x44Ea84a85616F8e9cD719Fc843DE31D852ad7240",
  dai: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
  pool: "0xed0413d19cdf94759bbe3fe9981c4bd085b430cf",
  multicall: "0xeefBa1e63905eF1D7ACbA5a8513c70307C1cE441",
};

const kovanContracts = {
  yes: "0x1dbCcF29375304c38bd0d162f636BAA8Dd6CcE44",
  no: "0xeb69840f09A9235df82d9Ed9D43CafFFea2a1eE9",
  dai: "0xb6085Abd65E21d205AEaD0b1b9981B8B221fA14E",
  pool: "0xacb57239c0d0c1c7e11a19c7af0f39a22749f9f0",
  multicall: "0x2cc8688C5f75E365aaEEb4ea8D6a480405A48D2A",
};

const contracts = network === "mainnet" ? mainnetContracts : kovanContracts;

const tokenSymbols = {};
tokenSymbols[contracts.yes] = "YES";
tokenSymbols[contracts.no] = "NO";
tokenSymbols[contracts.dai] = "DAI";

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
    fromAmount: new BN(0),
    fromAmountDisplay: 0,
    toAmountDisplay: 0,
    toAmount: new BN(0),
    slippage: "0.5", //parts per ten thousand * 100 (0.03% )
    yesContractAddress: "",
    noContractAddress: "",
    daiContractAddress: "",
    fromExact: true,
    fromBalance: 0,
    toBalance: 0,
    shouldUpdateFrom: true,
    pricePerShare: 0,
    avgYesPricePerShare: 0,
    avgNoPricePerShare: 0,
    maxProfit: 0,
    priceImpact: 0,
    swapFee: 0,
    tokenMultiple: tokenMultiple,
    priceImpactColor: "black",
    show: false,
    yesBalance: 0,
    noBalance: 0,
    yesPrice: 0,
    noPrice: 0,
    impliedOdds: 0,
    hasEnoughBalance: false,
    isApproveRequired: false,
    tokenSymbols: tokenSymbols,
    isSwapDisabled: false,
    totalSwapVolume: 0,
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
      var multicallContract = new web3.eth.Contract(
        MultiCall.abi,
        contracts.multicall
      );
      this.setState({
        web3: web3,
        accounts: accounts,
        yesContract: yesInstance,
        noContract: noInstance,
        daiContract: daiInstance,
        erc20Instance: erc20Instance,
        pool: poolInstance,
        multicall: multicallContract,
        yesContractAddress: contracts.yes,
        noContractAddress: contracts.no,
        daiContractAddress: contracts.dai,
        bpoolAddress: contracts.pool,
      });

      var swapFee = await this.state.pool.methods.getSwapFee().call();
      swapFee = web3.utils.fromWei(swapFee);
      swapFee = Number(swapFee);
      this.setState({ swapFee: swapFee });

      if (!this.state.fromToken) {
        this.setState({
          fromToken: this.state.noContractAddress,
          toToken: this.state.daiContractAddress,
        });
        this.setState({
          fromAmount: this.convertDisplayToAmount(100, this.state.fromToken),
          fromAmountDisplay: 100,
        });
      }
      await this.updateBalances();

      // Set starting parameters
      await this.calcToGivenFrom();
    } catch (error) {
      // Catch any errors for any of the above operations.
      console.error(error);
    }
  };
  getTotalVolumeForThePool = async () => {
    const URL =
      "https://api.thegraph.com/subgraphs/name/balancer-labs/balancer";
    let content = {
      query: `{
      pools(where: {id: "0xed0413d19cdf94759bbe3fe9981c4bd085b430cf"}) {
        id 
        totalSwapVolume
        swaps{
          poolTotalSwapVolume
        }
      }
    }`,
    };
    let body = JSON.stringify(content);
    let response = await fetch(URL, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: body,
    });

    if (response.status === 200) {
      let poolInfo = await response.json();
      // console.log(poolInfo.data.pools[0].totalSwapVolume);
      let totalSwapVolume = poolInfo.data.pools[0].totalSwapVolume;
      return totalSwapVolume;
    } else {
      console.log("error in getting the pool info");
      return 0;
    }
  };

  // This function updates state in response to user input
  handleChange = async (e) => {
    e.persist();
    await this.setState({ [e.target.name]: e.target.value });

    console.log("event", e.target.value);
    console.log("slippage", this.state.slippage);

    if (
      e.target.name === "fromAmountDisplay" &&
      this.state.fromToken &&
      this.state.toToken
    ) {
      if (e.target.value <= 0) {
        this.setState({ isSwapDisabled: true });
        this.setState({
          toAmountDisplay: 0,
          toAmount: new BN(0),
          fromAmount: new BN(0),
        });
      }
      if (e.target.value > 0) {
        this.setState({ isSwapDisabled: false });
        this.setState({
          fromAmount: this.convertDisplayToAmount(
            e.target.value,
            this.state.fromToken
          ),
        });
        await this.calcToGivenFrom();
        await this.checkIfhasEnoughBalance();
        await this.checkIfIsApproveRequired();
        await this.calcPriceProfitSlippage();
      } else {
        this.setState({ toAmount: new BN(0), toAmountDisplay: 0 });
      }
    }

    if (
      e.target.name === "toAmountDisplay" &&
      this.state.fromToken &&
      this.state.toToken
    ) {
      if (e.target.value <= 0) {
        this.setState({ isSwapDisabled: true });
        this.setState({
          fromAmountDisplay: 0,
          fromAmount: new BN(0),
          toAmount: new BN(0),
        });
      }
      if (e.target.value > 0) {
        this.setState({ isSwapDisabled: false });
        this.setState({
          toAmount: this.convertDisplayToAmount(
            e.target.value,
            this.state.toToken
          ),
        });

        await this.calcFromGivenTo();
        await this.checkIfhasEnoughBalance();
        await this.checkIfIsApproveRequired();
        await this.calcPriceProfitSlippage();
      } else {
        this.setState({ fromAmount: new BN(0), fromAmountDisplay: 0 });
      }
    }
    //To Do:If user selects fromToke == toToken convert the other one into DAI
    if (e.target.name === "toToken") {
      if (e.target.value) {
        if (e.target.value === this.state.fromToken) {
          if (
            e.target.value === this.state.yesContractAddress ||
            e.target.value === this.state.noContractAddress
          ) {
            this.setState({ fromToken: this.state.daiContractAddress });
          }
          if (e.target.value === this.state.daiContractAddress) {
            this.setState({ fromToken: this.state.noContractAddress });
          }
        }
        await this.updateBalances();

        await this.calcToGivenFrom();
        await this.checkIfhasEnoughBalance();
        await this.checkIfIsApproveRequired();
        await this.calcPriceProfitSlippage();
      }
    }
    if (e.target.name === "fromToken") {
      if (e.target.value) {
        if (e.target.value === this.state.toToken) {
          if (
            e.target.value === this.state.yesContractAddress ||
            e.target.value === this.state.noContractAddress
          ) {
            this.setState({ toToken: this.state.daiContractAddress });
          }
          if (e.target.value === this.state.daiContractAddress) {
            this.setState({ toToken: this.state.noContractAddress });
          }
        }
        await this.updateBalances();

        await this.calcFromGivenTo();
        await this.checkIfhasEnoughBalance();
        await this.checkIfIsApproveRequired();
        await this.calcPriceProfitSlippage();
      }
    }
    //add sanity checks for slippage
  };
  convertAmountToDisplay = (amount, token) => {
    const { web3, daiContractAddress } = this.state;

    //if the token is yes/no then decimals are 15
    if (token !== daiContractAddress) {
      amount = amount.mul(tokenMultiple);
    }
    amount = new BigNumber(web3.utils.fromWei(amount.toString()));
    //maybe round the number here
    return amount.toFixed(2);
  };
  convertDisplayToAmount = (amount, token) => {
    const { web3, daiContractAddress } = this.state;

    amount = new BN(web3.utils.toWei(amount.toString()));

    if (token !== daiContractAddress) {
      amount = amount.div(tokenMultiple);
    }

    return amount;
  };
  connectWallet = async () => {
    if (window.ethereum) {
      var web3 = new Web3(window.ethereum);

      await window.ethereum.enable();

      var accounts = await web3.eth.getAccounts();

      this.setState({ web3: web3, accounts: accounts });
      await this.componentDidMount();

      // //uncomment to test approval pattern
      // const { erc20Instance, bpoolAddress, fromToken } = this.state;
      // erc20Instance.options.address = fromToken;
      //
      // await erc20Instance.methods
      //   .approve(bpoolAddress, "0")
      //   .send({ from: accounts[0], gas: 46000 });
      await this.updateBalances();
    } else {
      this.showModal();
    }
  };

  getMax = async () => {
    const { accounts, erc20Instance, fromToken } = this.state;

    if (!accounts) {
      return;
    }
    erc20Instance.options.address = fromToken;

    let maxAmount = new BN(
      await erc20Instance.methods.balanceOf(accounts[0]).call()
    );

    this.setState({
      fromAmount: maxAmount,
      fromAmountDisplay: this.convertAmountToDisplay(maxAmount, fromToken),
    });

    await this.calcToGivenFrom();
    await this.checkIfhasEnoughBalance();
    await this.calcPriceProfitSlippage();
  };
  reversePair = async () => {
    const {
      fromAmount,
      toAmount,
      fromAmountDisplay,
      toAmountDisplay,
      fromToken,
      toToken,
      shouldUpdateFrom,
    } = this.state;
    if (shouldUpdateFrom) {
      await this.setState({
        toAmount: fromAmount,
        toAmountDisplay: fromAmountDisplay,
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
        fromAmountDisplay: toAmountDisplay,
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
  //get pools current info
  //Uses multicall to be a bit faster
  getPoolInfo = async (fromToken, toToken) => {
    const { pool } = this.state;
    const { web3 } = this.state;
    const { multicall } = this.state;

    var fromTokenBalanceCall = {};
    fromTokenBalanceCall.target = pool.options.address;
    fromTokenBalanceCall.callData = pool.methods
      .getBalance(fromToken)
      .encodeABI();

    var toTokenBalanceCall = {};
    toTokenBalanceCall.target = pool.options.address;
    toTokenBalanceCall.callData = pool.methods.getBalance(toToken).encodeABI();

    var fromTokenDenormlizedWeightCall = {};
    fromTokenDenormlizedWeightCall.target = pool.options.address;
    fromTokenDenormlizedWeightCall.callData = pool.methods
      .getDenormalizedWeight(fromToken)
      .encodeABI();

    var toTokenDenormlizedWeightCall = {};
    toTokenDenormlizedWeightCall.target = pool.options.address;
    toTokenDenormlizedWeightCall.callData = pool.methods
      .getDenormalizedWeight(toToken)
      .encodeABI();

    var swapFeesCall = {};
    swapFeesCall.target = pool.options.address;
    swapFeesCall.callData = pool.methods.getSwapFee().encodeABI();

    let result = await multicall.methods
      .aggregate([
        fromTokenBalanceCall,
        toTokenBalanceCall,
        fromTokenDenormlizedWeightCall,
        toTokenDenormlizedWeightCall,
        swapFeesCall,
      ])
      .call();

    let info = {};
    info.fromTokenBalance = web3.eth.abi.decodeParameter(
      "uint256",
      result.returnData[0]
    );
    info.toTokenBalance = web3.eth.abi.decodeParameter(
      "uint256",
      result.returnData[1]
    );
    info.fromTokenDenormlizedWeight = web3.eth.abi.decodeParameter(
      "uint256",
      result.returnData[2]
    );
    info.toTokenDenormlizedWeight = web3.eth.abi.decodeParameter(
      "uint256",
      result.returnData[3]
    );
    info.swapFees = web3.eth.abi.decodeParameter(
      "uint256",
      result.returnData[4]
    );
    return info;
  };
  // Calculates number of "to" tokens received for a given number of "from" tokens
  calcToGivenFrom = async () => {
    const { pool } = this.state;

    const { fromToken, fromAmount } = this.state;
    const { toToken } = this.state;

    try {
      //just to make things faster

      let poolInfo = await this.getPoolInfo(fromToken, toToken);
      // console.log(
      //   "compare",
      //   poolInfo.fromTokenBalance,
      //   poolInfo.fromTokenDenormlizedWeight,
      //   poolInfo.toTokenBalance,
      //   poolInfo.toTokenDenormlizedWeight,
      //   poolInfo.swapFees
      // );

      // console.log(
      //   "values",
      //   await pool.methods.getBalance(fromToken).call(),
      //   await pool.methods.getBalance(toToken).call(),
      //   await pool.methods.getDenormalizedWeight(fromToken).call(),
      //   await pool.methods.getDenormalizedWeight(toToken).call(),
      //   await pool.methods.getSwapFee().call()
      // );

      var toAmount = await pool.methods
        .calcOutGivenIn(
          poolInfo.fromTokenBalance,
          poolInfo.fromTokenDenormlizedWeight,
          poolInfo.toTokenBalance,
          poolInfo.toTokenDenormlizedWeight,
          fromAmount.toString(),
          poolInfo.swapFees
        )
        .call();

      toAmount = new BN(toAmount);

      this.setState({
        toAmount: toAmount,
        fromExact: true,
        toAmountDisplay: this.convertAmountToDisplay(toAmount, toToken),
      });
      await this.calcPriceProfitSlippage();

      return toAmount;
    } catch (error) {
      alert(
        `Calculate number of to tokens received failed. Check console for details.`
      );
      console.error(error);
    }
  };

  // Calculates number of "from" tokens spent for a given number of "to" tokens
  calcFromGivenTo = async () => {
    const { pool } = this.state;
    const { fromToken } = this.state;
    const { toToken, toAmount } = this.state;

    try {
      //using multicall to make things a bit faster
      let poolInfo = await this.getPoolInfo(fromToken, toToken);
      // console.log(
      //   "compare",
      //   poolInfo.fromTokenBalance,
      //   poolInfo.fromTokenDenormlizedWeight,
      //   poolInfo.toTokenBalance,
      //   poolInfo.toTokenDenormlizedWeight,
      //   poolInfo.swapFees
      // );

      // console.log(
      //   "values",
      //   await pool.methods.getBalance(fromToken).call(),
      //   await pool.methods.getBalance(toToken).call(),
      //   await pool.methods.getDenormalizedWeight(fromToken).call(),
      //   await pool.methods.getDenormalizedWeight(toToken).call(),
      //   await pool.methods.getSwapFee().call()
      // );

      var fromAmount = await pool.methods
        .calcInGivenOut(
          poolInfo.fromTokenBalance,
          poolInfo.fromTokenDenormlizedWeight,
          poolInfo.toTokenBalance,
          poolInfo.toTokenDenormlizedWeight,
          toAmount.toString(),
          poolInfo.swapFees
        )
        .call();

      fromAmount = new BN(fromAmount);

      this.setState({
        fromAmount: fromAmount,
        fromExact: false,
        fromAmountDisplay: this.convertAmountToDisplay(fromAmount, fromToken),
      });
      await this.calcPriceProfitSlippage();

      return fromAmount;
    } catch (error) {
      alert(
        `Calculate number of from tokens paid failed. Check console for details.`
      );
      console.error(error);
    }
  };

  // This function determines whether to swapExactAmountIn or swapExactAmountOut
  swapBranch = async () => {
    if (this.state.fromExact) {
      await this.swapExactAmountIn();
    } else {
      await this.swapExactAmountOut();
    }
  };

  // Swap with the number of "from" tokens fixed
  swapExactAmountIn = async () => {
    await this.calcToGivenFrom();

    const { accounts } = this.state;
    const { pool } = this.state;
    const { fromToken } = this.state;
    const { toToken } = this.state;
    var { fromAmount } = this.state;
    var { toAmount, slippage } = this.state;

    slippage = Number(slippage);
    slippage = new BN(slippage * 100);
    var minAmountOut = toAmount.sub(
      toAmount.mul(slippage).div(TEN_THOUSAND_BN)
    );

    var maxPrice = MAX_UINT256;

    try {
      await pool.methods
        .swapExactAmountIn(
          fromToken,
          fromAmount,
          toToken,
          minAmountOut,
          maxPrice
        )
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

      await this.updateBalances();
    } catch (error) {
      // alert(`Swap with from tokens fixed failed. Check console for details.`);

      console.error(error);
    }
  };

  // Swap with the number of "to"" tokens fixed
  swapExactAmountOut = async () => {
    await this.calcFromGivenTo();

    const { accounts } = this.state;
    const { pool } = this.state;
    const { fromToken } = this.state;
    const { toToken } = this.state;
    var { fromAmount } = this.state;
    var { toAmount, slippage } = this.state;

    slippage = Number(slippage);
    slippage = new BN(slippage * 100);
    var maxAmountIn = fromAmount.add(
      fromAmount.mul(slippage).div(TEN_THOUSAND_BN)
    );
    var maxPrice = MAX_UINT256;

    try {
      await pool.methods
        .swapExactAmountOut(fromToken, maxAmountIn, toToken, toAmount, maxPrice)
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

      await this.updateBalances();
    } catch (error) {
      // alert(
      //   `Swap with number of from tokens fixed failed. Check console for details.`
      // );

      console.error(error);
    }
  };
  approve = async () => {
    const { web3 } = this.state;
    const { accounts } = this.state;
    const { bpoolAddress } = this.state;
    var { erc20Instance } = this.state;
    //approve fromAmount of fromToken for spending by Trader1
    var allowanceLimit = MAX_UINT256;

    var allowance = await erc20Instance.methods
      .allowance(accounts[0], bpoolAddress)
      .call();

    allowance = web3.utils.fromWei(allowance);

    // this.setState({ isSwapDisabled: true });
    await erc20Instance.methods
      .approve(bpoolAddress, allowanceLimit)
      .send({ from: accounts[0], gas: 46000 })
      .on("transactionHash", (transactionHash) => {
        notification.info({
          message: "Approve Pending",
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
    await this.updateBalances();
  };
  getEtherscanLink = (transactionHash) => {
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

    let totalSwapVolume = await this.getTotalVolumeForThePool();

    // var yesPrice = await pool.methods
    //   .getSpotPrice(daiContractAddress, yesContractAddress)
    //   .call();
    // yesPrice = web3.utils.fromWei(yesPrice);
    // yesPrice = Number(yesPrice);
    // yesPrice = yesPrice / tokenMultiple;
    // yesPrice = yesPrice.toFixed(2);

    var noPrice = await pool.methods
      .getSpotPrice(daiContractAddress, noContractAddress)
      .call();
    noPrice = web3.utils.fromWei(noPrice);
    noPrice = Number(noPrice);
    noPrice = noPrice / tokenMultiple;
    noPrice = noPrice.toFixed(2);
    //update all the state variables at one for smoother experience
    this.setState({
      // yesPrice: yesPrice,
      noPrice: noPrice,
      totalSwapVolume: totalSwapVolume,
    });
    console.log("totalSwapVolume:", totalSwapVolume);

    if (!accounts) return;

    await this.checkIfhasEnoughBalance();
    await this.checkIfIsApproveRequired();

    var yesBalance = await yesContract.methods.balanceOf(accounts[0]).call();
    yesBalance = web3.utils.fromWei(yesBalance);
    yesBalance = Number(yesBalance);
    yesBalance = tokenMultiple * yesBalance;
    yesBalance = yesBalance.toFixed(2);

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
    const { daiContractAddress } = this.state;
    const { pool } = this.state;
    const { web3 } = this.state;
    const { tokenMultiple } = this.state;

    if (fromToken !== daiContractAddress) {
      fromAmount = fromAmount.mul(tokenMultiple);
    }
    if (toToken !== daiContractAddress) {
      toAmount = toAmount.mul(tokenMultiple);
    }
    let spotPrice = new BN(
      await pool.methods.getSpotPrice(fromToken, toToken).call()
    );

    if (fromToken !== daiContractAddress) {
      spotPrice = spotPrice.mul(tokenMultiple);
    } else {
      spotPrice = spotPrice.div(tokenMultiple);
    }
    spotPrice = new BigNumber(web3.utils.fromWei(spotPrice));

    // console.log("is spotPrice a bignumber:" + BigNumber.isBigNumber(spotPrice));
    // console.log("spotPrice: " + spotPrice);
    fromAmount = new BigNumber(fromAmount);
    toAmount = new BigNumber(toAmount);

    let pricePerShare = new BigNumber(0);

    if (toToken === daiContractAddress) {
      pricePerShare = toAmount.div(fromAmount);
    } else {
      pricePerShare = fromAmount.div(toAmount);
    }

    let priceImpact = pricePerShare
      .minus(spotPrice)
      .multipliedBy(new BigNumber(100))
      .dividedBy(pricePerShare);

    // console.log("priceImapct;" + priceImpact.toString());
    let priceImpactColor = "red";
    if (priceImpact < 1) {
      priceImpactColor = "green";
    } else if (priceImpact >= 1 && priceImpact <= 3) {
      priceImpactColor = "black";
    } else if (priceImpact > 3) {
      priceImpactColor = "red";
    }
    let impliedOdds = 0;

    if (fromToken !== daiContractAddress && toToken !== daiContractAddress) {
      impliedOdds = new BigNumber(100).minus(
        new BigNumber(100).dividedBy(new BigNumber(1).plus(pricePerShare))
      );
    }

    let maxProfit = 0;
    if (fromToken === daiContractAddress) {
      maxProfit = new BigNumber(1).minus(pricePerShare).multipliedBy(toAmount);
      maxProfit = new BigNumber(web3.utils.fromWei(maxProfit.toFixed(0)));
    }

    // console.log("fromAmount", fromAmount.toString());

    this.setState({
      pricePerShare: pricePerShare.toFixed(3),
      maxProfit: maxProfit.toFixed(2),
      priceImpact: priceImpact.toFixed(2),
      impliedOdds: impliedOdds.toFixed(2),
      priceImpactColor: priceImpactColor,
    });
  };
  showModal = () => {
    this.setState({ show: true });
  };

  hideModal = () => {
    this.setState({ show: false });
  };
  //Add yes token to Metamask
  AddYesTokenToMetamask = async () => {
    try {
      await this.AddTokenToMetamask(this.state.yesContractAddress);
    } catch (error) {
      alert(`Add yes token to Metamask failed. Check console for details.`);
      console.error(error);
    }
  };

  //Add no token to Metamask
  AddNoTokenToMetamask = async () => {
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

  checkIfhasEnoughBalance = async () => {
    const {
      accounts,
      fromToken,
      fromAmount,
      erc20Instance,
      daiContractAddress,
    } = this.state;

    if (!accounts) return;
    erc20Instance.options.address = fromToken;

    let balance = new BN(
      await erc20Instance.methods.balanceOf(accounts[0]).call()
    );

    if (balance.gte(fromAmount)) {
      this.setState({ hasEnoughBalance: true });
    } else {
      this.setState({ hasEnoughBalance: false });
    }
  };

  checkIfIsApproveRequired = async () => {
    const {
      accounts,
      fromToken,
      fromAmount,
      erc20Instance,
      bpoolAddress,
    } = this.state;

    if (!accounts) return;
    erc20Instance.options.address = fromToken;

    let allowance = new BN(
      await erc20Instance.methods.allowance(accounts[0], bpoolAddress).call()
    );

    if (allowance.lte(fromAmount)) {
      this.setState({ isApproveRequired: true });
    } else {
      this.setState({ isApproveRequired: false });
    }
  };

  changeSlippage = (slippage) => {
    console.log("slippage", this.state.slippage);
    this.setState({ slippage: slippage });
  };

  render() {
    return (
      <div className={`App ${this.props.isContrast ? "dark" : "light"}`}>
        <PageHeader
          slippage={this.state.slippage}
          changeSlippage={this.changeSlippage}
        />
        <Trading
          handleChange={this.handleChange}
          fromAmount={this.state.fromAmount}
          fromToken={this.state.fromToken}
          toAmount={this.state.toAmount}
          toToken={this.state.toToken}
          fromBalance={this.state.fromBalance}
          toBalance={this.state.toBalance}
          fromAmountDisplay={this.state.fromAmountDisplay}
          toAmountDisplay={this.state.toAmountDisplay}
          convertAmountToDisplay={this.convertAmountToDisplay}
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
          accounts={this.state.accounts}
          connectWallet={this.connectWallet}
          showModal={this.showModal}
          hideModal={this.hideModal}
          show={this.state.show}
          impliedOdds={this.state.impliedOdds}
          yesBalance={this.state.yesBalance}
          noBalance={this.state.noBalance}
          yesPrice={this.state.yesPrice}
          noPrice={this.state.noPrice}
          AddYesTokenToMetamask={this.AddYesTokenToMetamask}
          AddNoTokenToMetamask={this.AddNoTokenToMetamask}
          hasEnoughBalance={this.state.hasEnoughBalance}
          isApproveRequired={this.state.isApproveRequired}
          approve={this.approve}
          tokenSymbols={this.state.tokenSymbols}
          slippage={this.state.slippage}
          isSwapDisabled={this.state.isSwapDisabled}
          totalSwapVolume={Number(this.state.totalSwapVolume)}
        />
      </div>
    );
  }
}

function mapStateToProps(state) {
  return { isContrast: state.settings.isContrast };
}

export default connect(mapStateToProps)(App);
