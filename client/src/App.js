import React, { Component } from 'react'
import BFactoryContract from './contracts/BFactory.json'
import BPoolContract from './contracts/BPool.json'
import YesContract from './contracts/Yes.json'
import NoContract from './contracts/No.json'
import DaiContract from './contracts/Dai.json'
import Web3 from 'web3'
import './App.css'
import Trading from './components/Trading.js'
import PageHeader from './components/PageHeader.js'
import { connect } from 'react-redux'
import MultiCall from './contracts/Multicall.json'
//notification
import { notification } from 'antd'
import 'antd/dist/antd.css'
import { LoadingOutlined } from '@ant-design/icons'

import configData from './config.json'
const addresses = require('./config/addresses.json')

const BigNumber = require('bignumber.js')
BigNumber.config({ ROUNDING_MODE: BigNumber.ROUND_DOWN })
const BN = require('bn.js')
const MAX_UINT256 = new BN(2).pow(new BN(256)).sub(new BN(1))
const TEN_THOUSAND_BN = new BN(10000)

const network = addresses.network // set network as "ganache" or "kovan" or "mainnet"
const tokenMultiple = network === 'kovan' ? new BN(100) : new BN(1000)
// if network is ganache, run truffle migrate --develop and disable metamask
// if network is kovan, enable metamask, set to kovan network and open account with kovan eth
const kovanEtherscanPrefix = 'https://kovan.etherscan.io/tx/'
const mainnetEtherscanPrefix = 'https://etherscan.io/tx/'
const etherscanPrefix =
    network === 'kovan' ? kovanEtherscanPrefix : mainnetEtherscanPrefix
notification.config({
    duration: null,
    top: 7,
})
const infuraProvider =
    network === 'kovan'
        ? configData.providers.infura.kovan
        : configData.providers.infura.mainnet

const provider = new Web3.providers.HttpProvider(infuraProvider)

const mainnetContracts = addresses.mainnet
const kovanContracts = addresses.kovan

const contracts = network === 'mainnet' ? mainnetContracts : kovanContracts

const markets = addresses[network].markets
const marketInfo = addresses[network].marketInfo

const ls = window.localStorage
const ZRX_QUOTE_URL = 'https://api.0x.org/swap/v1/quote'
const ZRX_PRICE_URL = 'https://api.0x.org/swap/v1/price'

//App controls the user interface
class App extends Component {
    constructor(props) {
        super(props)
        this.handleChange = this.handleChange.bind(this)
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
        fromToken: '',
        toToken: '',
        fromAmount: new BN(0),
        fromAmountDisplay: 0,
        toAmountDisplay: 0,
        toAmount: new BN(0),
        slippage: '0.5', //parts per ten thousand * 100 (0.03% )
        yesContractAddress: '',
        noContractAddress: '',
        daiContractAddress: '',
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
        priceImpactColor: 'black',
        show: false,
        yesBalance: 0,
        noBalance: 0,
        yesPrice: 0,
        noPrice: 0,
        impliedOdds: 0,
        hasEnoughBalance: false,
        isApproveRequired: false,
        isSwapDisabled: false,
        totalSwapVolume: 0,
        market: markets[0],
        showApproveLoading: false,
        allowanceTarget: '0xf740b67da229f2f10bcbd38a7979992fcc71b8eb',
    }

    componentDidMount = async () => {
        try {
            console.log('market is ', this.state.market)
            var { web3, accounts } = this.state
            //here it connects if metamask is already connected and if not then it relies on the infura
            //provider to get the data
            if (!accounts) {
                if (window.ethereum) {
                    web3 = new Web3(window.ethereum)
                    accounts = await web3.eth.getAccounts()
                }
                let isAddress = false
                if (accounts) {
                    isAddress = web3.utils.isAddress(accounts[0])
                }
                if (!isAddress) {
                    //making accounts to null because web3.eth.accouts returns an array of 0 length
                    //when metamask is not connected and in other parts of code assumption is made that
                    //accounts is null is metamask is not connected (an array of 0 length is not null)
                    accounts = null
                    web3 = new Web3(provider)
                    await web3.eth.net.isListening()
                }
            }
            var daiInstance = new web3.eth.Contract(
                DaiContract.abi,
                contracts.dai
            )
            var erc20Instance = new web3.eth.Contract(DaiContract.abi)
            var poolInstance = new web3.eth.Contract(BPoolContract.abi)
            var multicallContract = new web3.eth.Contract(
                MultiCall.abi,
                contracts.multicall
            )
            await this.setState({
                web3: web3,
                accounts: accounts,
                daiContract: daiInstance,
                erc20Instance: erc20Instance,
                pool: poolInstance,
                multicall: multicallContract,
                daiContractAddress: contracts.dai,
            })
            //set it only the first time around not when wallet gets connected
            if (!this.state.fromToken) {
                const ls = window.localStorage
                await this.setState({
                    market: ls.getItem('market') || markets[2],
                })
                // await this.setState({
                //   market: markets[2],
                // });

                await this.setState({
                    yesContractAddress: marketInfo[this.state.market].yes,
                    noContractAddress: marketInfo[this.state.market].no,
                    bpoolAddress: marketInfo[this.state.market].pool,
                    fromAmount: this.convertDisplayToAmount(
                        100,
                        this.state.daiContractAddress
                    ), //18 decimals because of the frmToken == DAI
                    fromAmountDisplay: 100,
                })
                //for testing purposes
                // erc20Instance.options.address = addresses.kovan.dai;
                // await erc20Instance.methods
                //   .approve(marketInfo[this.state.market].pool, 0)
                //   .send({ from: accounts[0], gas: 46000 });

                // await this.setState({
                //   fromToken: ls.getItem("fromToken") || this.state.daiContractAddress,
                //   toToken: ls.getItem("toToken") || this.state.yesContractAddress,

                // });
                let from = ls.getItem('from')
                let to = ls.getItem('to')
                let fromToken =
                    from === 'dai'
                        ? this.state.daiContractAddress
                        : marketInfo[this.state.market][from]
                let toToken =
                    to === 'dai'
                        ? this.state.daiContractAddress
                        : marketInfo[this.state.market][to]
                await this.setState({
                    fromToken: fromToken || this.state.daiContractAddress,
                    toToken: toToken || this.state.yesContractAddress,
                })

                console.log('market', this.state.market)
                console.log('from', this.state.fromToken)
                console.log('to', this.state.toToken)
                this.state.pool.options.address = this.state.bpoolAddress
                var swapFee = await this.state.pool.methods.getSwapFee().call()
                swapFee = web3.utils.fromWei(swapFee)
                swapFee = Number(swapFee)
                await this.setState({ swapFee: swapFee })
            }
            console.log('marketAddress', this.state.market)
            await this.updateBalances()

            // Set starting parameters
            await this.calcToGivenFrom()
            this.setlocalStorage()
        } catch (error) {
            // Catch any errors for any of the above operations.
            console.error(error)
        }
    }
    getTotalVolumeForThePool = async () => {
        let { market } = this.state
        const URL =
            'https://api.thegraph.com/subgraphs/name/balancer-labs/balancer'
        let content = {
            query: `{
      pools(where: {id: "${marketInfo[market].pool}"}) {
        id 
        totalSwapVolume
        swaps{
          poolTotalSwapVolume
        }
      }
    }`,
        }
        let body = JSON.stringify(content)
        let response = await fetch(URL, {
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
            },
            body: body,
        })

        if (response.status === 200) {
            let poolInfo = await response.json()
            // console.log(poolInfo.data.pools[0].totalSwapVolume);
            //let totalSwapVolume = poolInfo.data.pools[0].totalSwapVolume;
            //return totalSwapVolume;
        } else {
            console.log('error in getting the pool info')
            return 0
        }
    }

    // This function updates state in response to user input
    handleChange = async (e) => {
        e.persist()
        console.log('set:' + e.target.name + '\nto:' + e.target.value)

        if (
            e.target.name === 'fromAmountDisplay' &&
            this.state.fromToken &&
            this.state.toToken
        ) {
            await this.setState({ [e.target.name]: e.target.value })
            if (e.target.value <= 0) {
                this.setState({ isSwapDisabled: true })
                this.setState({
                    toAmountDisplay: 0,
                    toAmount: new BN(0),
                    fromAmount: new BN(0),
                })
            }
            if (e.target.value > 0) {
                this.setState({ isSwapDisabled: false })
                this.setState({
                    fromAmount: this.convertDisplayToAmount(
                        e.target.value,
                        this.state.fromToken
                    ),
                })
                await this.calcToGivenFrom()
                await this.checkIfhasEnoughBalance()
                await this.checkIfIsApproveRequired()
                await this.calcPriceProfitSlippage()
            } else {
                this.setState({ toAmount: new BN(0), toAmountDisplay: 0 })
            }
        } else if (
            e.target.name === 'toAmountDisplay' &&
            this.state.fromToken &&
            this.state.toToken
        ) {
            await this.setState({ [e.target.name]: e.target.value })
            if (e.target.value <= 0) {
                this.setState({ isSwapDisabled: true })
                this.setState({
                    fromAmountDisplay: 0,
                    fromAmount: new BN(0),
                    toAmount: new BN(0),
                })
            }
            if (e.target.value > 0) {
                this.setState({ isSwapDisabled: false })
                this.setState({
                    toAmount: this.convertDisplayToAmount(
                        e.target.value,
                        this.state.toToken
                    ),
                })

                await this.calcFromGivenTo()
                await this.checkIfhasEnoughBalance()
                await this.checkIfIsApproveRequired()
                await this.calcPriceProfitSlippage()
            } else {
                this.setState({ fromAmount: new BN(0), fromAmountDisplay: 0 })
            }
        }
        //To Do:If user selects fromToke == toToken convert the other one into DAI
        else if (e.target.name === 'toToken') {
            await this.setState({ [e.target.name]: e.target.value })

            if (e.target.value) {
                if (e.target.value === this.state.fromToken) {
                    if (
                        e.target.value === this.state.yesContractAddress ||
                        e.target.value === this.state.noContractAddress
                    ) {
                        this.setState({
                            fromToken: this.state.daiContractAddress,
                        })
                    }
                    if (e.target.value === this.state.daiContractAddress) {
                        this.setState({
                            fromToken: this.state.noContractAddress,
                        })
                    }
                }
                await this.updateBalances()

                await this.calcToGivenFrom()
                await this.checkIfhasEnoughBalance()
                await this.checkIfIsApproveRequired()
                await this.calcPriceProfitSlippage()
            }
        } else if (e.target.name === 'fromToken') {
            await this.setState({ [e.target.name]: e.target.value })

            if (e.target.value) {
                if (e.target.value === this.state.toToken) {
                    if (
                        e.target.value === this.state.yesContractAddress ||
                        e.target.value === this.state.noContractAddress
                    ) {
                        this.setState({
                            toToken: this.state.daiContractAddress,
                        })
                    }
                    if (e.target.value === this.state.daiContractAddress) {
                        this.setState({ toToken: this.state.noContractAddress })
                    }
                }
                await this.updateBalances()

                await this.calcFromGivenTo()
                await this.checkIfhasEnoughBalance()
                await this.checkIfIsApproveRequired()
                await this.calcPriceProfitSlippage()
            }
        } else if (e.target.name === 'market') {
            console.log('market change', marketInfo[e.target.value])

            if (e.target.value === markets[0]) {
                //if the trump markets then default is no->DAI
                await this.setState({
                    [e.target.name]: e.target.value,
                    bpoolAddress: marketInfo[e.target.value].pool,
                    yesContractAddress: marketInfo[e.target.value].yes,
                    noContractAddress: marketInfo[e.target.value].no,
                    fromToken: this.state.daiContractAddress,
                    toToken: marketInfo[e.target.value].no,
                })
            } else {
                await this.setState({
                    [e.target.name]: e.target.value,
                    bpoolAddress: marketInfo[e.target.value].pool,
                    yesContractAddress: marketInfo[e.target.value].yes,
                    noContractAddress: marketInfo[e.target.value].no,
                    fromToken: this.state.daiContractAddress,
                    toToken: marketInfo[e.target.value].yes,
                })
            }
            await this.setState({
                fromAmount: this.convertDisplayToAmount(
                    100,
                    this.state.fromToken
                ),
                fromAmountDisplay: 100,
            })
            await this.updateBalances()

            // // Set starting parameters
            await this.calcToGivenFrom()
        }
        this.setlocalStorage()
        //add sanity checks for slippage
    }
    convertAmountToDisplay = (amount, token) => {
        const { web3, daiContractAddress } = this.state

        //if the token is yes/no then decimals are 15
        if (token !== daiContractAddress) {
            amount = amount.mul(tokenMultiple)
        }
        amount = new BigNumber(web3.utils.fromWei(amount.toString()))
        //maybe round the number here
        return amount.toFixed(2)
    }
    convertDisplayToAmount = (amount, token) => {
        const { web3, daiContractAddress } = this.state

        amount = new BN(web3.utils.toWei(amount.toString()))

        if (token !== daiContractAddress) {
            amount = amount.div(tokenMultiple)
        }

        return amount
    }
    connectWallet = async () => {
        if (window.ethereum) {
            var web3 = new Web3(window.ethereum)

            await window.ethereum.enable()

            var accounts = await web3.eth.getAccounts()

            this.setState({ web3: web3, accounts: accounts })
            await this.componentDidMount()

            // //uncomment to test approval pattern
            // const { erc20Instance, bpoolAddress, fromToken } = this.state;
            // erc20Instance.options.address = fromToken;
            //
            // await erc20Instance.methods
            //   .approve(bpoolAddress, "0")
            //   .send({ from: accounts[0], gas: 46000 });
            await this.updateBalances()
        } else {
            this.showModal()
        }
    }

    getMax = async () => {
        const { accounts, erc20Instance, fromToken } = this.state

        if (!accounts) {
            return
        }
        erc20Instance.options.address = fromToken

        let maxAmount = new BN(
            await erc20Instance.methods.balanceOf(accounts[0]).call()
        )

        this.setState({
            fromAmount: maxAmount,
            fromAmountDisplay: this.convertAmountToDisplay(
                maxAmount,
                fromToken
            ),
        })

        await this.calcToGivenFrom()
        await this.checkIfhasEnoughBalance()
        await this.calcPriceProfitSlippage()
    }
    setlocalStorage = () => {
        const { fromToken, toToken, market } = this.state
        ls.setItem('market', market)
        if (fromToken != this.state.daiContractAddress) {
            ls.setItem('from', marketInfo[this.state.market][fromToken])
        } else {
            ls.setItem('from', 'dai')
        }
        if (toToken != this.state.daiContractAddress) {
            ls.setItem('to', marketInfo[this.state.market][toToken])
        } else {
            ls.setItem('to', 'dai')
        }
    }
    reversePair = async () => {
        const {
            fromAmount,
            toAmount,
            fromAmountDisplay,
            toAmountDisplay,
            fromToken,
            toToken,
            shouldUpdateFrom,
        } = this.state
        if (shouldUpdateFrom) {
            await this.setState({
                toAmount: fromAmount,
                toAmountDisplay: fromAmountDisplay,
                fromToken: toToken,
                toToken: fromToken,
                shouldUpdateFrom: false,
            })
            await this.calcFromGivenTo()
            await this.calcPriceProfitSlippage()
            await this.updateBalances()
            this.setlocalStorage()
        } else {
            await this.setState({
                fromAmount: toAmount,
                fromAmountDisplay: toAmountDisplay,
                fromToken: toToken,
                toToken: fromToken,
                shouldUpdateFrom: true,
            })
            await this.calcToGivenFrom()
            await this.calcPriceProfitSlippage()
            await this.updateBalances()
        }
        //the toAmount will be the same as fromAmount and the fromAmount will be recalculated(uniswap)
    }
    //get pools current info
    //Uses multicall to be a bit faster
    getPoolInfo = async (fromToken, toToken) => {
        const { pool } = this.state
        const { web3 } = this.state
        const { multicall } = this.state
        pool.options.address = this.state.bpoolAddress

        var fromTokenBalanceCall = {}
        fromTokenBalanceCall.target = pool.options.address
        fromTokenBalanceCall.callData = pool.methods
            .getBalance(fromToken)
            .encodeABI()

        var toTokenBalanceCall = {}
        toTokenBalanceCall.target = pool.options.address
        toTokenBalanceCall.callData = pool.methods
            .getBalance(toToken)
            .encodeABI()

        var fromTokenDenormlizedWeightCall = {}
        fromTokenDenormlizedWeightCall.target = pool.options.address
        fromTokenDenormlizedWeightCall.callData = pool.methods
            .getDenormalizedWeight(fromToken)
            .encodeABI()

        var toTokenDenormlizedWeightCall = {}
        toTokenDenormlizedWeightCall.target = pool.options.address
        toTokenDenormlizedWeightCall.callData = pool.methods
            .getDenormalizedWeight(toToken)
            .encodeABI()

        var swapFeesCall = {}
        swapFeesCall.target = pool.options.address
        swapFeesCall.callData = pool.methods.getSwapFee().encodeABI()

        let result = await multicall.methods
            .aggregate([
                fromTokenBalanceCall,
                toTokenBalanceCall,
                fromTokenDenormlizedWeightCall,
                toTokenDenormlizedWeightCall,
                swapFeesCall,
            ])
            .call()

        let info = {}
        info.fromTokenBalance = web3.eth.abi.decodeParameter(
            'uint256',
            result.returnData[0]
        )
        info.toTokenBalance = web3.eth.abi.decodeParameter(
            'uint256',
            result.returnData[1]
        )
        info.fromTokenDenormlizedWeight = web3.eth.abi.decodeParameter(
            'uint256',
            result.returnData[2]
        )
        info.toTokenDenormlizedWeight = web3.eth.abi.decodeParameter(
            'uint256',
            result.returnData[3]
        )
        info.swapFees = web3.eth.abi.decodeParameter(
            'uint256',
            result.returnData[4]
        )
        return info
    }
    // Calculates number of "to" tokens received for a given number of "from" tokens
    calcToGivenFrom = async () => {
        const { pool, market } = this.state

        const { fromToken, fromAmount } = this.state
        const { toToken } = this.state
        pool.options.address = this.state.bpoolAddress
        try {
            //if the market is election market then use 0x API
            if (market === '0x1ebb89156091eb0d59603c18379c03a5c84d7355') {
                this.calcToGivenFrom0xAPI()
            } else {
                let poolInfo = await this.getPoolInfo(fromToken, toToken)
                var toAmount = await pool.methods
                    .calcOutGivenIn(
                        poolInfo.fromTokenBalance,
                        poolInfo.fromTokenDenormlizedWeight,
                        poolInfo.toTokenBalance,
                        poolInfo.toTokenDenormlizedWeight,
                        fromAmount.toString(),
                        poolInfo.swapFees
                    )
                    .call()

                toAmount = new BN(toAmount)

                this.setState({
                    toAmount: toAmount,
                    fromExact: true,
                    toAmountDisplay: this.convertAmountToDisplay(
                        toAmount,
                        toToken
                    ),
                })
                await this.calcPriceProfitSlippage()

                return toAmount
            }
        } catch (error) {
            alert(
                `Calculate number of to tokens received failed. Check console for details.`
            )
            console.error(error)
        }
    }
    // Calculates number of "to" tokens received for a given number of "from" tokens
    calcToGivenFrom0xAPI = async (isQuote) => {
        const { pool } = this.state

        const { fromToken, fromAmount } = this.state
        const { toToken } = this.state
        pool.options.address = this.state.bpoolAddress
        try {
            let params = {
                sellToken: fromToken,
                buyToken: toToken,
                sellAmount: fromAmount.toString(),
            }
            let toAmount = new BN(0)
            // let url = isQuote ? ZRX_QUOTE_URL : ZRX_PRICE_URL
            let url = isQuote ? ZRX_QUOTE_URL : ZRX_QUOTE_URL

            let pricing = await this.fetchJSON(url, params)
            if (pricing.code && pricing.code !== 200) {
                console.log(pricing)
                console.log('error occurred')
            } else {
                console.log(pricing)
                toAmount = new BN(pricing.buyAmount)
                await this.setState({
                    toAmount: toAmount,
                    fromExact: true,
                    toAmountDisplay: this.convertAmountToDisplay(
                        toAmount,
                        toToken
                    ),
                    allowanceTarget: pricing.allowanceTarget,
                    pricing: pricing,
                })
                await this.calcPriceProfitSlippage0xAPI()

                return pricing
            }
        } catch (error) {
            alert(
                `Calculate number of to tokens received failed. Check console for details.`
            )
            console.error(error)
        }
    }

    // Calculates number of "from" tokens spent for a given number of "to" tokens
    calcFromGivenTo = async () => {
        const { pool } = this.state
        const { fromToken } = this.state
        const { toToken, toAmount, market } = this.state
        pool.options.address = this.state.bpoolAddress
        try {
            if (market === '0x1ebb89156091eb0d59603c18379c03a5c84d7355') {
                this.calcFromGivenTo0xAPI()
            } else {
                let poolInfo = await this.getPoolInfo(fromToken, toToken)

                var fromAmount = await pool.methods
                    .calcInGivenOut(
                        poolInfo.fromTokenBalance,
                        poolInfo.fromTokenDenormlizedWeight,
                        poolInfo.toTokenBalance,
                        poolInfo.toTokenDenormlizedWeight,
                        toAmount.toString(),
                        poolInfo.swapFees
                    )
                    .call()

                fromAmount = new BN(fromAmount)

                this.setState({
                    fromAmount: fromAmount,
                    fromExact: false,
                    fromAmountDisplay: this.convertAmountToDisplay(
                        fromAmount,
                        fromToken
                    ),
                })
                await this.calcPriceProfitSlippage()

                return fromAmount
            }
        } catch (error) {
            alert(
                `Calculate number of from tokens paid failed. Check console for details.`
            )
            console.error(error)
        }
    }
    // Calculates number of "from" tokens spent for a given number of "to" tokens
    calcFromGivenTo0xAPI = async (isQuote) => {
        const { pool } = this.state
        const { fromToken } = this.state
        const { toToken, toAmount } = this.state
        pool.options.address = this.state.bpoolAddress
        try {
            let params = {
                sellToken: fromToken,
                buyToken: toToken,
                buyAmount: toAmount.toString(),
            }
            let fromAmount = new BN(0)
            let url = isQuote ? ZRX_QUOTE_URL : ZRX_PRICE_URL
            let pricing = await this.fetchJSON(url, params)
            if (pricing.code && pricing.code !== 200) {
                console.log(pricing)
                console.log('error occurred')
            } else {
                console.log(pricing)
                fromAmount = new BN(pricing.sellAmount)
            }

            await this.setState({
                fromAmount: fromAmount,
                fromExact: false,
                fromAmountDisplay: this.convertAmountToDisplay(
                    fromAmount,
                    fromToken
                ),
                pricing: pricing,
            })
            await this.calcPriceProfitSlippage0xAPI()

            return fromAmount
        } catch (error) {
            alert(
                `Calculate number of from tokens paid failed. Check console for details.`
            )
            console.error(error)
        }
    }

    // This function determines whether to swapExactAmountIn or swapExactAmountOut
    swapBranch = async () => {
        if (this.state.fromExact) {
            await this.swapExactAmountIn()
        } else {
            await this.swapExactAmountOut()
        }
    }

    // Swap with the number of "from" tokens fixed
    swapExactAmountIn = async () => {
        const { market } = this.state
        if (market === '0x1ebb89156091eb0d59603c18379c03a5c84d7355') {
            this.swapExactAmountIn0xAPI()
        } else {
            await this.calcToGivenFrom()

            const { accounts } = this.state
            const { pool } = this.state
            const { fromToken } = this.state
            const { toToken } = this.state
            var { fromAmount } = this.state
            var { toAmount, slippage } = this.state
            pool.options.address = this.state.bpoolAddress
            slippage = Number(slippage)
            slippage = new BN(slippage * 100)
            var minAmountOut = toAmount.sub(
                toAmount.mul(slippage).div(TEN_THOUSAND_BN)
            )

            var maxPrice = MAX_UINT256

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
                    .on('transactionHash', (transactionHash) => {
                        notification.info({
                            message: 'Transaction Pending',
                            description: (
                                <div>
                                    <p>This can take a moment...</p>
                                    {this.getEtherscanLink(transactionHash)}
                                </div>
                            ),
                            icon: <LoadingOutlined />,
                        })
                    })
                    .on('receipt', function (receipt) {
                        notification.destroy()
                        // console.log("receipt", receipt);
                        notification.success({
                            duration: 7,
                            message: 'swap done',
                            //maybe I am missing something but using this.getEtherscanLink(receipt.transactionHash) is not working
                            description: (
                                <a
                                    href={
                                        etherscanPrefix +
                                        receipt.transactionHash
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    See on Etherscan
                                </a>
                            ),
                        })
                    })
                    .on('error', function (error) {
                        notification.destroy()
                        if (
                            error.message.includes(
                                'User denied transaction signature'
                            )
                        ) {
                            notification.error({
                                duration: 7,
                                message: 'Transaction Rejected',
                                // description: "",
                            })
                        } else {
                            notification.error({
                                duration: 7,
                                message:
                                    'There was an error in executing the transaction',
                                // description: "",
                            })
                        }
                    })

                await this.updateBalances()
            } catch (error) {
                // alert(`Swap with from tokens fixed failed. Check console for details.`);

                console.error(error)
            }
        }
    }
    // Swap with the number of "from" tokens fixed
    swapExactAmountIn0xAPI = async () => {
        let quote = await this.calcToGivenFrom0xAPI(true)

        const { accounts, web3 } = this.state
        const { pool } = this.state
        const { fromToken } = this.state
        const { toToken } = this.state
        var { fromAmount } = this.state
        var { toAmount, slippage } = this.state
        pool.options.address = this.state.bpoolAddress
        slippage = Number(slippage)
        slippage = new BN(slippage * 100)
        var minAmountOut = toAmount.sub(
            toAmount.mul(slippage).div(TEN_THOUSAND_BN)
        )

        var maxPrice = MAX_UINT256

        try {
            await web3.eth
                .sendTransaction({
                    from: accounts[0],
                    to: quote.to,
                    data: quote.data,
                    // gas: quote.gas,
                })
                .on('transactionHash', (transactionHash) => {
                    notification.info({
                        message: 'Transaction Pending',
                        description: (
                            <div>
                                <p>This can take a moment...</p>
                                {this.getEtherscanLink(transactionHash)}
                            </div>
                        ),
                        icon: <LoadingOutlined />,
                    })
                })
                .on('receipt', function (receipt) {
                    notification.destroy()
                    // console.log("receipt", receipt);
                    notification.success({
                        duration: 7,
                        message: 'swap done',
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
                    })
                })
                .on('error', function (error) {
                    notification.destroy()
                    if (
                        error.message.includes(
                            'User denied transaction signature'
                        )
                    ) {
                        notification.error({
                            duration: 7,
                            message: 'Transaction Rejected',
                            // description: "",
                        })
                    } else {
                        notification.error({
                            duration: 7,
                            message:
                                'There was an error in executing the transaction',
                            // description: "",
                        })
                    }
                })

            await this.updateBalances()
        } catch (error) {
            // alert(`Swap with from tokens fixed failed. Check console for details.`);

            console.error(error)
        }
    }

    // Swap with the number of "to"" tokens fixed
    swapExactAmountOut = async () => {
        const { market } = this.state
        if (market === '0x1ebb89156091eb0d59603c18379c03a5c84d7355') {
            this.swapExactAmountOut0xAPI()
        } else {
            await this.calcFromGivenTo()

            const { accounts } = this.state
            const { pool } = this.state
            const { fromToken } = this.state
            const { toToken } = this.state
            var { fromAmount } = this.state
            var { toAmount, slippage } = this.state
            pool.options.address = this.state.bpoolAddress
            slippage = Number(slippage)
            slippage = new BN(slippage * 100)
            var maxAmountIn = fromAmount.add(
                fromAmount.mul(slippage).div(TEN_THOUSAND_BN)
            )
            var maxPrice = MAX_UINT256

            try {
                await pool.methods
                    .swapExactAmountOut(
                        fromToken,
                        maxAmountIn,
                        toToken,
                        toAmount,
                        maxPrice
                    )
                    .send({ from: accounts[0], gas: 150000 })
                    .on('transactionHash', (transactionHash) => {
                        notification.info({
                            message: 'Transaction Pending',
                            description: (
                                <div>
                                    <p>This can take a moment...</p>
                                    {this.getEtherscanLink(transactionHash)}
                                </div>
                            ),
                            icon: <LoadingOutlined />,
                        })
                    })
                    .on('receipt', function (receipt) {
                        notification.destroy()
                        // console.log("receipt", receipt);
                        notification.success({
                            duration: 7,
                            message: 'swap done',
                            //maybe I am missing something but using this.getEtherscanLink(receipt.transactionHash) is not working
                            description: (
                                <a
                                    href={
                                        etherscanPrefix +
                                        receipt.transactionHash
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    See on Etherscan
                                </a>
                            ),
                        })
                    })
                    .on('error', function (error) {
                        notification.destroy()
                        if (
                            error.message.includes(
                                'User denied transaction signature'
                            )
                        ) {
                            notification.error({
                                duration: 7,
                                message: 'Transaction Rejected',
                                // description: "",
                            })
                        } else {
                            notification.error({
                                duration: 7,
                                message:
                                    'There was an error in executing the transaction',
                                // description: "",
                            })
                        }
                    })

                await this.updateBalances()
            } catch (error) {
                // alert(
                //   `Swap with number of from tokens fixed failed. Check console for details.`
                // );

                console.error(error)
            }
        }
    }
    // Swap with the number of "to"" tokens fixed
    swapExactAmountOut0xAPI = async () => {
        let quote = await this.calcFromGivenTo0xAPI(true)

        const { accounts, web3 } = this.state
        const { pool } = this.state
        const { fromToken } = this.state
        const { toToken } = this.state
        var { fromAmount } = this.state
        var { toAmount, slippage } = this.state
        pool.options.address = this.state.bpoolAddress
        slippage = Number(slippage)
        slippage = new BN(slippage * 100)
        var maxAmountIn = fromAmount.add(
            fromAmount.mul(slippage).div(TEN_THOUSAND_BN)
        )
        var maxPrice = MAX_UINT256

        try {
            await web3.eth
                .sendTransaction({
                    from: accounts[0],
                    to: quote.to,
                    data: quote.data,
                    // gas: quote.gas,
                })
                .on('transactionHash', (transactionHash) => {
                    notification.info({
                        message: 'Transaction Pending',
                        description: (
                            <div>
                                <p>This can take a moment...</p>
                                {this.getEtherscanLink(transactionHash)}
                            </div>
                        ),
                        icon: <LoadingOutlined />,
                    })
                })
                .on('receipt', function (receipt) {
                    notification.destroy()
                    // console.log("receipt", receipt);
                    notification.success({
                        duration: 7,
                        message: 'swap done',
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
                    })
                })
                .on('error', function (error) {
                    notification.destroy()
                    if (
                        error.message.includes(
                            'User denied transaction signature'
                        )
                    ) {
                        notification.error({
                            duration: 7,
                            message: 'Transaction Rejected',
                            // description: "",
                        })
                    } else {
                        notification.error({
                            duration: 7,
                            message:
                                'There was an error in executing the transaction',
                            // description: "",
                        })
                    }
                })

            await this.updateBalances()
        } catch (error) {
            // alert(
            //   `Swap with number of from tokens fixed failed. Check console for details.`
            // );

            console.error(error)
        }
    }
    approve = async () => {
        const { web3 } = this.state
        const { accounts } = this.state
        const { bpoolAddress } = this.state
        const { fromToken } = this.state
        var { erc20Instance, allowanceTarget, market } = this.state

        //approve fromAmount of fromToken for spending by Trader1
        var allowanceLimit = MAX_UINT256
        let spender
        if (market === '0x1ebb89156091eb0d59603c18379c03a5c84d7355') {
            spender = allowanceTarget
        } else {
            spender = bpoolAddress
        }

        // var allowance = await erc20Instance.methods
        //   .allowance(accounts[0], bpoolAddress)
        //   .call();

        // allowance = web3.utils.fromWei(allowance);

        // this.setState({ isSwapDisabled: true });
        erc20Instance.options.address = fromToken
        await erc20Instance.methods
            .approve(spender, allowanceLimit)
            .send({ from: accounts[0], gas: 46000 })
            .on('transactionHash', (transactionHash) => {
                notification.info({
                    message: 'Approve Pending',
                    description: (
                        <div>
                            <p>This can take a moment...</p>
                            {this.getEtherscanLink(transactionHash)}
                        </div>
                    ),
                    icon: <LoadingOutlined />,
                })
                this.setState({ showApproveLoading: true })
            })
            .on('receipt', function (receipt) {
                notification.destroy()
                notification.success({
                    duration: 7,
                    message: 'Approve Done',
                })
                // this.setState({ showApproveLoading: false });
            })
            .on('error', function (error) {
                notification.destroy()
                // this.setState({ showApproveLoading: false });
                if (
                    error.message.includes('User denied transaction signature')
                ) {
                    notification.error({
                        duration: 7,
                        message: 'Transaction Rejected',
                        // description: "",
                    })
                } else {
                    notification.error({
                        duration: 7,
                        message:
                            'There was an error in executing the transaction',
                        // description: "",
                    })
                }
            })
        this.setState({ showApproveLoading: false })

        // allowance = await erc20Instance.methods
        //   .allowance(accounts[0], bpoolAddress)
        //   .call();
        await this.updateBalances()
    }
    getEtherscanLink = (transactionHash) => {
        return (
            <a
                href={etherscanPrefix + transactionHash}
                target="_blank"
                rel="noopener noreferrer"
            >
                See on Etherscan
            </a>
        )
    }
    // This function updates trader balances initially and after sale
    // Also resets price per share, max profit and price impact to 0
    updateBalances = async () => {
        const { web3 } = this.state
        const { fromToken } = this.state
        const { toToken } = this.state
        const { daiContract } = this.state
        const { noContractAddress } = this.state
        const { yesContractAddress } = this.state
        const { daiContractAddress } = this.state
        const { accounts } = this.state
        const { tokenMultiple } = this.state
        const { pool } = this.state
        const { erc20Instance } = this.state
        const { market } = this.state
        pool.options.address = this.state.bpoolAddress

        console.log('updating balances state', this.state)

        let totalSwapVolume = await this.getTotalVolumeForThePool()
        var yesPrice = 0
        if (market !== markets[0]) {
            yesPrice = await pool.methods
                .getSpotPrice(daiContractAddress, yesContractAddress)
                .call()
            yesPrice = web3.utils.fromWei(yesPrice)
            yesPrice = Number(yesPrice)
            yesPrice = yesPrice / tokenMultiple
            yesPrice = yesPrice.toFixed(2)
        }

        var noPrice = await pool.methods
            .getSpotPrice(daiContractAddress, noContractAddress)
            .call()
        noPrice = web3.utils.fromWei(noPrice)
        noPrice = Number(noPrice)
        noPrice = noPrice / tokenMultiple
        noPrice = noPrice.toFixed(2)
        //update all the state variables at one for smoother experience
        this.setState({
            yesPrice: yesPrice,
            noPrice: noPrice,
            totalSwapVolume: totalSwapVolume,
        })
        console.log('totalSwapVolume:', totalSwapVolume)

        if (!accounts) return

        await this.checkIfhasEnoughBalance()
        await this.checkIfIsApproveRequired()

        erc20Instance.options.address = yesContractAddress
        var yesBalance = await erc20Instance.methods
            .balanceOf(accounts[0])
            .call()
        yesBalance = web3.utils.fromWei(yesBalance)
        yesBalance = Number(yesBalance)
        yesBalance = tokenMultiple * yesBalance
        yesBalance = yesBalance.toFixed(2)

        if (fromToken === yesContractAddress) {
            this.setState({ fromBalance: yesBalance })
        }
        if (toToken === yesContractAddress) {
            this.setState({ toBalance: yesBalance })
        }

        erc20Instance.options.address = noContractAddress
        var noBalance = await erc20Instance.methods
            .balanceOf(accounts[0])
            .call()
        noBalance = web3.utils.fromWei(noBalance)
        noBalance = Number(noBalance)
        noBalance = tokenMultiple * noBalance
        noBalance = noBalance.toFixed(2)

        if (fromToken === noContractAddress) {
            this.setState({ fromBalance: noBalance })
        }
        if (toToken === noContractAddress) {
            this.setState({ toBalance: noBalance })
        }

        //update all the state variables at one for smoother experience
        this.setState({
            noBalance: noBalance,
            yesBalance: yesBalance,
        })

        var daiBalance = await daiContract.methods.balanceOf(accounts[0]).call()
        daiBalance = web3.utils.fromWei(daiBalance)
        daiBalance = Number(daiBalance)
        daiBalance = daiBalance.toFixed(2)

        if (fromToken === daiContractAddress) {
            this.setState({ fromBalance: daiBalance })
        }
        if (toToken === daiContractAddress) {
            this.setState({ toBalance: daiBalance })
        }
    }

    // This function calculates miscellaneous numbers after quote

    calcPriceProfitSlippage = async () => {
        const { fromToken } = this.state
        const { toToken } = this.state
        var { fromAmount } = this.state
        var { toAmount } = this.state
        const { daiContractAddress } = this.state
        const { pool } = this.state
        const { web3 } = this.state
        const { tokenMultiple } = this.state

        let spotPrice = new BN(
            await pool.methods.getSpotPrice(fromToken, toToken).call()
        )
        //"real" because we are changing the price per share to always be in terms of DAI when DAI is one of the token
        let realSpotPrice = new BigNumber(
            web3.utils.fromWei(spotPrice.toString())
        )

        let realFromAmount = new BigNumber(fromAmount)
        let realToAmount = new BigNumber(toAmount)

        let realPricePerShare = realFromAmount.div(realToAmount)

        // console.log("realPricePerShare", realPricePerShare.toString());
        // console.log("realSpotPrice", realSpotPrice.toString());

        let realSpotPercentage = realSpotPrice.div(realPricePerShare).times(100)

        // console.log("realspotPercentage", realSpotPercentage.toString());

        let realPriceImpact = new BigNumber(100).minus(realSpotPercentage)

        if (fromToken !== daiContractAddress) {
            fromAmount = fromAmount.mul(tokenMultiple)
        }
        if (toToken !== daiContractAddress) {
            toAmount = toAmount.mul(tokenMultiple)
        }
        // let spotPrice = new BN(
        //   await pool.methods.getSpotPrice(fromToken, toToken).call()
        // );

        if (fromToken !== daiContractAddress) {
            spotPrice = spotPrice.mul(tokenMultiple)
        } else {
            spotPrice = spotPrice.div(tokenMultiple)
        }
        spotPrice = new BigNumber(web3.utils.fromWei(spotPrice))

        // console.log("is spotPrice a bignumber:" + BigNumber.isBigNumber(spotPrice));
        // console.log("spotPrice: " + spotPrice);
        fromAmount = new BigNumber(fromAmount)
        toAmount = new BigNumber(toAmount)

        let pricePerShare = new BigNumber(0)

        if (toToken === daiContractAddress) {
            pricePerShare = toAmount.div(fromAmount)
        } else {
            pricePerShare = fromAmount.div(toAmount)
        }

        // console.log("priceImapct;" + priceImpact.toString());
        let priceImpactColor = 'red'
        if (realPriceImpact < 1) {
            priceImpactColor = 'green'
        } else if (realPriceImpact >= 1 && realPriceImpact <= 3) {
            priceImpactColor = 'black'
        } else if (realPriceImpact > 3) {
            priceImpactColor = 'red'
        }
        let impliedOdds = 0

        if (
            fromToken !== daiContractAddress &&
            toToken !== daiContractAddress
        ) {
            impliedOdds = new BigNumber(100).minus(
                new BigNumber(100).dividedBy(
                    new BigNumber(1).plus(pricePerShare)
                )
            )
        }

        let maxProfit = 0
        if (fromToken === daiContractAddress) {
            maxProfit = new BigNumber(1)
                .minus(pricePerShare)
                .multipliedBy(toAmount)
            maxProfit = new BigNumber(web3.utils.fromWei(maxProfit.toFixed(0)))
        }

        // console.log("fromAmount", fromAmount.toString());

        this.setState({
            pricePerShare: pricePerShare.toFixed(3),
            maxProfit: maxProfit.toFixed(2),
            priceImpact: realPriceImpact.toFixed(2),
            impliedOdds: impliedOdds.toFixed(2),
            priceImpactColor: priceImpactColor,
        })
    }

    calcPriceProfitSlippage0xAPI = async () => {
        const { fromToken } = this.state
        const { toToken } = this.state
        var { fromAmount } = this.state
        var { toAmount } = this.state
        const { daiContractAddress } = this.state
        const { pool } = this.state
        const { web3 } = this.state
        const { tokenMultiple } = this.state
        let { pricing } = this.state

        // console.log(spotPrice)

        // spotPrice = new BigNumber(spotPrice)
        // //"real" because we are changing the price per share to always be in terms of DAI when DAI is one of the token
        // let realSpotPrice = new BigNumber(
        //     web3.utils.fromWei(spotPrice.toString())
        // )

        // let realFromAmount = new BigNumber(fromAmount)
        // let realToAmount = new BigNumber(toAmount)

        // let realPricePerShare = realFromAmount.div(realToAmount)

        // // console.log("realPricePerShare", realPricePerShare.toString());
        // // console.log("realSpotPrice", realSpotPrice.toString());

        // let realSpotPercentage = realSpotPrice.div(realPricePerShare).times(100)

        // // console.log("realspotPercentage", realSpotPercentage.toString());

        // let realPriceImpact = new BigNumber(100).minus(realSpotPercentage)

        if (fromToken !== daiContractAddress) {
            fromAmount = fromAmount.mul(tokenMultiple)
        }
        if (toToken !== daiContractAddress) {
            toAmount = toAmount.mul(tokenMultiple)
        }
        // // let spotPrice = new BN(
        // //   await pool.methods.getSpotPrice(fromToken, toToken).call()
        // // );

        // if (fromToken !== daiContractAddress) {
        //     spotPrice = spotPrice.multipliedBy(new BigNumber(tokenMultiple.toString()))
        // } else {
        //     spotPrice = spotPrice.dividedBy(new BigNumber(tokenMultiple.toString()))
        // }
        // spotPrice = new BigNumber(web3.utils.fromWei(spotPrice))

        // console.log("is spotPrice a bignumber:" + BigNumber.isBigNumber(spotPrice));
        // console.log("spotPrice: " + spotPrice);
        fromAmount = new BigNumber(fromAmount)
        toAmount = new BigNumber(toAmount)

        let pricePerShare = new BigNumber(0)

        if (toToken === daiContractAddress) {
            pricePerShare = toAmount.div(fromAmount)
        } else {
            pricePerShare = fromAmount.div(toAmount)
        }

        // // console.log("priceImapct;" + priceImpact.toString());
        // let priceImpactColor = 'red'
        // if (realPriceImpact < 1) {
        //     priceImpactColor = 'green'
        // } else if (realPriceImpact >= 1 && realPriceImpact <= 3) {
        //     priceImpactColor = 'black'
        // } else if (realPriceImpact > 3) {
        //     priceImpactColor = 'red'
        // }
        let impliedOdds = 0

        if (
            fromToken !== daiContractAddress &&
            toToken !== daiContractAddress
        ) {
            impliedOdds = new BigNumber(100).minus(
                new BigNumber(100).dividedBy(
                    new BigNumber(1).plus(pricePerShare)
                )
            )
        }

        let maxProfit = 0
        if (fromToken === daiContractAddress) {
            maxProfit = new BigNumber(1)
                .minus(pricePerShare)
                .multipliedBy(toAmount)
            maxProfit = new BigNumber(web3.utils.fromWei(maxProfit.toFixed(0)))
        }

        let minAmountReceivedBN = new BigNumber(0)
        let price = new BigNumber(pricing.price)
        let guaranteedPrice = new BigNumber(pricing.guaranteedPrice)
        let buyAmount = new BigNumber(pricing.buyAmount)

        if (price.gte(guaranteedPrice)) {
            minAmountReceivedBN = guaranteedPrice
                .multipliedBy(buyAmount)
                .dividedBy(price)
        } else {
            minAmountReceivedBN = price
                .multipliedBy(buyAmount)
                .dividedBy(guaranteedPrice)
        }

        let minAmountReceived = this.convertAmountToDisplay(
            new BN(minAmountReceivedBN.toFixed(0)),
            pricing.buyTokenAddress
        )
        console.log('minAmountReceived', minAmountReceived)

        // console.log("fromAmount", fromAmount.toString());

        this.setState({
            pricePerShare: pricePerShare.toFixed(3),
            maxProfit: maxProfit.toFixed(2),
            priceImpact: 0,
            impliedOdds: impliedOdds.toFixed(2),
            // priceImpactColor: priceImpactColor,
            minAmountReceived: minAmountReceived,
        })
    }
    showModal = () => {
        this.setState({ show: true })
    }

    hideModal = () => {
        this.setState({ show: false })
    }
    //Add yes token to Metamask
    AddYesTokenToMetamask = async () => {
        try {
            await this.AddTokenToMetamask(this.state.yesContractAddress)
        } catch (error) {
            alert(
                `Add yes token to Metamask failed. Check console for details.`
            )
            console.error(error)
        }
    }

    //Add no token to Metamask
    AddNoTokenToMetamask = async () => {
        try {
            await this.AddTokenToMetamask(this.state.noContractAddress)
        } catch (error) {
            alert(`Add no token to Metamask failed. Check console for details.`)
            console.error(error)
        }
    }

    // Add token to Metamask
    AddTokenToMetamask = async (tokenAddress) => {
        const { yesContractAddress } = this.state
        const { noContractAddress } = this.state

        const { erc20Instance } = this.state
        let tokenSymbol
        let decimals
        let tokenImage
        erc20Instance.options.address = tokenAddress
        tokenSymbol = await erc20Instance.methods.symbol().call()
        decimals = await erc20Instance.methods.decimals().call()

        if (tokenAddress === yesContractAddress) {
            tokenImage = marketInfo[this.state.market].yesIcon
        } else if (tokenAddress === noContractAddress) {
            tokenImage = marketInfo[this.state.market].noIcon
        } else {
            throw new Error('Cannot add this token to Metamask')
        }
        const provider = window.web3.currentProvider
        try {
            provider.sendAsync(
                {
                    method: 'metamask_watchAsset',
                    params: {
                        type: 'ERC20',
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
                    if (err || 'error' in added) {
                        notification.error({
                            duration: 7,
                            message:
                                'There was an error in adding token to Metamask Wallet',
                        })
                    }
                    return
                }
            )
        } catch (error) {
            alert(`Add token to Metamask failed. Check console for details.`)
            console.error(error)
        }
    }

    checkIfhasEnoughBalance = async () => {
        const {
            accounts,
            fromToken,
            fromAmount,
            erc20Instance,
            daiContractAddress,
        } = this.state

        if (!accounts) return
        erc20Instance.options.address = fromToken

        let balance = new BN(
            await erc20Instance.methods.balanceOf(accounts[0]).call()
        )

        if (balance.gte(fromAmount)) {
            this.setState({ hasEnoughBalance: true })
        } else {
            this.setState({ hasEnoughBalance: false })
        }
    }

    checkIfIsApproveRequired = async () => {
        const {
            accounts,
            fromToken,
            fromAmount,
            erc20Instance,
            bpoolAddress,
            allowanceTarget,
            market,
        } = this.state

        if (!accounts) return
        let spender
        if (market === '0x1ebb89156091eb0d59603c18379c03a5c84d7355') {
            spender = allowanceTarget
        } else {
            spender = bpoolAddress
        }

        erc20Instance.options.address = fromToken

        let allowance = new BN(
            await erc20Instance.methods.allowance(accounts[0], spender).call()
        )

        if (allowance.lte(fromAmount)) {
            this.setState({ isApproveRequired: true })
        } else {
            this.setState({ isApproveRequired: false })
        }
    }

    changeSlippage = (slippage) => {
        console.log('slippage', this.state.slippage)
        this.setState({ slippage: slippage })
    }
    fetchJSON = async (url, params) => {
        url = new URL(url)
        // params.excludedSources =
        //     'Uniswap,Uniswap_V2,Kyber,Curve,LiquidityProvider,MultiBridge,CREAM,Bancor,mStable,Mooniswap,MultiHop,Shell,Swerve,SnowSwap,SushiSwap,DODO'
        params.excludedSources = 'MultiHop'
        Object.keys(params).forEach((key) =>
            url.searchParams.append(key, params[key])
        )
        console.log(url)
        let res = await fetch(url)
        return await res.json()
    }

    render() {
        return (
            <div className={`App ${this.props.isContrast ? 'dark' : 'light'}`}>
                <PageHeader
                    slippage={this.state.slippage}
                    changeSlippage={this.changeSlippage}
                />
                <Trading
                    market={this.state.market}
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
                    AddTokenToMetamask={this.AddTokenToMetamask}
                    hasEnoughBalance={this.state.hasEnoughBalance}
                    isApproveRequired={this.state.isApproveRequired}
                    approve={this.approve}
                    slippage={this.state.slippage}
                    isSwapDisabled={this.state.isSwapDisabled}
                    totalSwapVolume={Number(this.state.totalSwapVolume)}
                    showApproveLoading={this.state.showApproveLoading}
                    minAmountReceived={this.state.minAmountReceived}
                />
            </div>
        )
    }
}

function mapStateToProps(state) {
    return { isContrast: state.settings.isContrast }
}

export default connect(mapStateToProps)(App)
