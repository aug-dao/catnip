import React, { useEffect, useState, useContext, useCallback } from "react";
import BPoolContractABI from "../contracts/BPool.json";
import DaiContractABI from "../contracts/Dai.json";
import ERC20WrapperABI from "../contracts/ERC20Wrapper.json";
import MultiCallContractABI from "../contracts/Multicall.json";
import MarketContractABI from "../contracts/Market.json";
import ShareTokenContractABI from "../contracts/ShareToken.json";
import { Web3Context } from "./Web3Context";
import { AppContext } from "./AppContext";
import {
    TOKEN_MULTIPLE,
    ZRX_MARKET_ADDRESS,
    DAI_CONTRACT_ADDRESS,
    MULTICALL_CONTRACT_ADDRESS,
    SHARETOKEN_ADDRESS,
    MARKETS,
    DEFAULT_MARKET,
    MARKET_INFO,
    MAX_UINT256,
    TEN_THOUSAND_BN,
    ZRX_QUOTE_URL,
    ZRX_PRICE_URL,
    ALLOWANCE_TARGET,
    LS_MARKET,
    LS_TO_TOKEN,
    LS_FROM_TOKEN
} from "../utils/constants";
import {
    convertAmountToDisplay,
    calcPriceProfitSlippage,
    calcPriceProfitSlippage0xAPI,
    fetchJSON,
    convertDisplayToAmount,
    setLocalStorage,
    isMarketFinalized,
    getOutcomeAssocitedWithToken,
    getWinningPayoutNumerator,
    getNumTicks
} from "../utils/helpers";
import { getPoolInfo, getTotalVolumeForThePool } from "../utils/balancer";
import BN from "bn.js";
import { notification } from "antd";
import Web3 from "web3";

import { LoadingOutlined } from "@ant-design/icons";
import { EtherscanLink } from "../components/EtherscanLink";

notification.config({
    duration: null,
    top: 7
});

export const TradingContext = React.createContext({});

export const TradingProvider = ({ children }) => {
    const { slippage } = useContext(AppContext);
    const { web3, account } = useContext(Web3Context);
    const [zrxPricing, setZRXPricing] = useState({});
    const [contractInstances, setContractInstances] = useState({
        dai: null,
        erc20: null,
        pool: null,
        multicall: null,
        marketContract: null,
        shareToken: null,
    });
    const [hasEnoughBalance, setHasEnoughBalance] = useState(false);
    const [hasEnoughLiquidity, setHasEnoughLiquidity] = useState(true);
    const [swapFee, setSwapFee] = useState();

    const [priceProfitSlippage, setPriceProfitSlippage] = useState({});
    const [price, setPrice] = useState({});
    const [market, setMarket] = useState({
        address: MARKETS[0],
        info: MARKET_INFO[MARKETS[0]]
    });
    const [fromValueIsExact, setFromValueIsExact] = useState(true);
    const [fromToken, setFromToken] = useState(DAI_CONTRACT_ADDRESS);

    const [fromAmount, setFromAmount] = useState(new BN(0));
    const [fromAmountDisplay, setFromAmountDisplay] = useState("0.00");
    const [toToken, setToToken] = useState(MARKET_INFO[MARKETS[0]].no);
    const [toAmount, setToAmount] = useState(new BN(0));
    const [toAmountDisplay, setToAmountDisplay] = useState("0.00");
    const [fromAmountLoading, setFromAmountLoading] = useState(false);
    const [toAmountLoading, setToAmountLoading] = useState(false);

    const [isApprovalRequired, setApprovalRequired] = useState(false);
    const [approveLoading, setApproveLoading] = useState(false);
    const [allowanceTarget, setAllowanceTarget] = useState(ALLOWANCE_TARGET);
    const [balances, setBalances] = useState({});
    const [claimableTokens, setClaimableTokens] = useState([]);
    const [displayBalances, setDisplayBalances] = useState({});
    const [tokenSymbols, setTokenSymbols] = useState({});
    const [nonFinalizedMarkets, setNonFinalizedMarkets] = useState(MARKETS);
    const [tokenIcons, setTokenIcons] = useState({});
    const [allowances, setAllowances] = useState({});

    const [hasWinningTokens, setHasWinningTokens] = useState(false);

    const [isSwapDisabled, setSwapDisabled] = useState(false);

    useEffect(() => {
        const ls = window.localStorage;
        let chosenMarket = ls.getItem(LS_MARKET);
        const from = ls.getItem(LS_FROM_TOKEN);
        const to = ls.getItem(LS_TO_TOKEN);
        if (MARKETS.indexOf(chosenMarket) === -1) {
            chosenMarket = DEFAULT_MARKET;
        }
        const marketInfo = MARKET_INFO[chosenMarket];
        let fromTokenAddress = DAI_CONTRACT_ADDRESS;
        let toTokenAddress = marketInfo.no;
        if (from && to) {
            fromTokenAddress =
                from === "dai" ? DAI_CONTRACT_ADDRESS : marketInfo[from];
            toTokenAddress =
                to === "dai" ? DAI_CONTRACT_ADDRESS : marketInfo[to];
        }
        setMarket({ address: chosenMarket, info: marketInfo });
        setFromToken(fromTokenAddress);
        setToToken(toTokenAddress);
        setFromAmountDisplay("100");
        setFromAmount(convertDisplayToAmount("100", fromTokenAddress));
    }, []);

    useEffect(() => {
        if (web3) {
            var daiInstance = new web3.eth.Contract(
                DaiContractABI.abi,
                DAI_CONTRACT_ADDRESS
            );
            var erc20Instance = new web3.eth.Contract(
                ERC20WrapperABI.abi,
                DAI_CONTRACT_ADDRESS
            );
            var poolInstance = new web3.eth.Contract(
                BPoolContractABI.abi,
                MARKET_INFO[MARKETS[0]].pool
            );
            var multicallInstance = new web3.eth.Contract(
                MultiCallContractABI.abi,
                MULTICALL_CONTRACT_ADDRESS
            );
            var marketInstance = new web3.eth.Contract(
                MarketContractABI.abi
            );
            var shareTokenInstance = new web3.eth.Contract(
                ShareTokenContractABI.abi,
                SHARETOKEN_ADDRESS
            );
            setContractInstances({
                dai: daiInstance,
                erc20: erc20Instance,
                pool: poolInstance,
                multicall: multicallInstance,
                marketContract: marketInstance,
                shareToken: shareTokenInstance,
            });
        }
    }, [web3]);

    useEffect(() => {
        const { pool } = contractInstances;
        const { info } = market;
        if (pool && info) {
            pool.options.address = info.pool;
            pool.methods
                .getSwapFee()
                .call()
                .then(gotSwapFee => {
                    gotSwapFee = Web3.utils.fromWei(gotSwapFee);
                    gotSwapFee = Number(gotSwapFee);
                    setSwapFee(gotSwapFee);
                });
        }
    }, [market, contractInstances]);

    const calcToGivenFrom0xAPI = useCallback(async isQuote => {
        setToAmountLoading(true);
        console.log("calcToGivenFrom0xAPI");
        const { pool } = contractInstances;
        const { info } = market;
        if (fromToken && toToken && pool && info && fromAmountDisplay) {
            const fromAmount = convertDisplayToAmount(
                fromAmountDisplay,
                fromToken
            );
            pool.options.address = info.pool;
            let params = {
                sellToken: fromToken,
                buyToken: toToken,
                sellAmount: fromAmount.toString()
            };
            let newToAmount = new BN(0);
            const url = isQuote ? ZRX_QUOTE_URL : ZRX_PRICE_URL;
            // let url = isQuote ? ZRX_QUOTE_URL : ZRX_QUOTE_URL;
            // const url = ZRX_QUOTE_URL;

            let pricing = await fetchJSON(url, params);
            // const { code } = pricing;

            if (pricing) {
                newToAmount = new BN(pricing.buyAmount);
                setToAmount(newToAmount);
                setToAmountDisplay(
                    convertAmountToDisplay(newToAmount, toToken)
                );
                setAllowanceTarget(pricing.allowanceTarget);
                console.log(pricing);
                const gotPriceProfitSlippage = await calcPriceProfitSlippage0xAPI(
                    fromToken,
                    fromAmount,
                    toToken,
                    newToAmount,
                    pricing
                );
                setPriceProfitSlippage(_init => ({
                    ..._init,
                    ...gotPriceProfitSlippage
                }));
                setZRXPricing(pricing);
            }
        }
        setToAmountLoading(false);
    }, [fromToken, toToken, contractInstances, market, fromAmountDisplay]);

    // Calculates number of "from" tokens spent for a given number of "to" tokens
    const calcFromGivenTo0xAPI = useCallback(
        async isQuote => {
            setFromAmountLoading(true);
            const { pool } = contractInstances;
            const { info } = market;
            if (fromToken && toToken && pool && info && toAmountDisplay) {
                const toAmount = convertDisplayToAmount(
                    toAmountDisplay,
                    toToken
                );
                pool.options.address = info.pool;
                let params = {
                    sellToken: fromToken,
                    buyToken: toToken,
                    buyAmount: toAmount.toString()
                };
                let newFromAmount = new BN(0);
                let url = isQuote ? ZRX_QUOTE_URL : ZRX_PRICE_URL;
                let pricing = await fetchJSON(url, params);
                const { code } = pricing;
                if (code === 200) {
                    newFromAmount = new BN(pricing.sellAmount);
                }

                setFromAmount(newFromAmount);
                setFromAmountDisplay(
                    convertAmountToDisplay(newFromAmount, fromToken)
                );
                const gotPriceProfitSlippage = await calcPriceProfitSlippage0xAPI(
                    fromToken,
                    newFromAmount,
                    toToken,
                    toAmount,
                    pricing
                );
                setPriceProfitSlippage(_init => ({
                    ..._init,
                    ...gotPriceProfitSlippage
                }));
                setZRXPricing(pricing);
            }
            setFromAmountLoading(false);
        },
        [fromToken, toToken, market, contractInstances, toAmountDisplay]
    );

    // Calculates number of "from" tokens spent for a given number of "to" tokens
    const calcFromGivenTo = useCallback(async () => {
        console.log("calcFromGivenTo");
        setFromAmountLoading(true);
        const { pool, multicall } = contractInstances;
        const { address, info } = market;
        if (
            web3 &&
            fromToken &&
            toToken &&
            address &&
            info &&
            pool &&
            multicall &&
            toAmountDisplay
        ) {
            const toAmount = convertDisplayToAmount(toAmountDisplay, toToken);
            pool.options.address = info.pool;
            try {
                if (market.address === ZRX_MARKET_ADDRESS) {
                    calcFromGivenTo0xAPI();
                } else {

                    let poolInfo = await getPoolInfo(
                        web3,
                        fromToken,
                        toToken,
                        multicall,
                        pool,
                        info.pool
                    );

                    var newFromAmount = new BN(
                        await pool.methods
                            .calcInGivenOut(
                                poolInfo.fromTokenBalance,
                                poolInfo.fromTokenDenormlizedWeight,
                                poolInfo.toTokenBalance,
                                poolInfo.toTokenDenormlizedWeight,
                                toAmount.toString(),
                                poolInfo.swapFees
                            )
                            .call()
                    );

                    setFromAmount(newFromAmount);
                    setFromAmountDisplay(
                        convertAmountToDisplay(newFromAmount, fromToken)
                    );
                    const gotPriceProfitSlippage = await calcPriceProfitSlippage(
                        fromToken,
                        newFromAmount,
                        toToken,
                        toAmount,
                        pool,
                        info.pool
                    );
                    setPriceProfitSlippage(_init => ({
                        ..._init,
                        ...gotPriceProfitSlippage
                    }));
                }
            } catch (error) {
                notification.error({
                    duration: 7,
                    message: "Error",
                    description:
                        "Calculate From Amount failed. Check console for details."
                });
                console.error(error);
            }
        }
        setFromAmountLoading(false);
    }, [
        web3,
        contractInstances,
        fromToken,
        toToken,
        calcFromGivenTo0xAPI,
        market,
        toAmountDisplay
    ]);

    const calcToGivenFrom = useCallback(async () => {
        console.log("calcToGivenFrom");
        setToAmountLoading(true);
        const { pool, multicall } = contractInstances;
        const { info } = market;
        if (
            web3 &&
            fromToken &&
            toToken &&
            pool &&
            multicall &&
            info &&
            fromAmountDisplay
        ) {
            // console.log({
            //     fromToken:
            //         info.yes === fromToken
            //             ? "yes"
            //             : info.no === fromToken
            //             ? "no"
            //             : DAI_CONTRACT_ADDRESS === fromToken
            //             ? "dai"
            //             : "unknown",
            //     toToken:
            //         info.yes === toToken
            //             ? "yes"
            //             : info.no === toToken
            //             ? "no"
            //             : DAI_CONTRACT_ADDRESS === toToken
            //             ? "dai"
            //             : "unknown",
            //     fromAmount: fromAmountDisplay
            // });
            const fromAmount = convertDisplayToAmount(
                fromAmountDisplay,
                fromToken
            );
            pool.options.address = market.info.pool;
            try {
                //if the market is election market then use 0x API
                if (market.address === ZRX_MARKET_ADDRESS) {
                    calcToGivenFrom0xAPI();

                } else {

                    let poolInfo = await getPoolInfo(
                        web3,
                        fromToken,
                        toToken,
                        multicall,
                        pool,
                        market.info.pool
                    );
                    if (new BN(poolInfo.fromTokenBalance).lt(fromAmount)) {
                        setHasEnoughLiquidity(false);
                        setToAmount(0);
                        setToAmountDisplay(
                            convertAmountToDisplay(new BN(0), toToken)
                        );
                        setToAmountLoading(false);
                        return;
                    } else {
                        setHasEnoughLiquidity(true);
                    }
                    var newToAmount = new BN(
                        await pool.methods
                            .calcOutGivenIn(
                                poolInfo.fromTokenBalance,
                                poolInfo.fromTokenDenormlizedWeight,
                                poolInfo.toTokenBalance,
                                poolInfo.toTokenDenormlizedWeight,
                                fromAmount.toString(),
                                poolInfo.swapFees
                            )
                            .call()
                    );

                    setToAmount(newToAmount);
                    setToAmountDisplay(
                        convertAmountToDisplay(newToAmount, toToken)
                    );

                    const gotPriceProfitSlippage = await calcPriceProfitSlippage(
                        fromToken,
                        fromAmount,
                        toToken,
                        newToAmount,
                        pool,
                        info.pool
                    );
                    setPriceProfitSlippage(_init => ({
                        ..._init,
                        ...gotPriceProfitSlippage
                    }));
                }
            } catch (error) {
                notification.error({
                    duration: 7,
                    message: "Error",
                    description:
                        "Calculate To Amount failed. Check console for details."
                });
                console.error(error);
            }
        }
        setToAmountLoading(false);
    }, [
        web3,
        contractInstances,
        fromToken,
        toToken,
        market,
        calcToGivenFrom0xAPI,
        fromAmountDisplay
    ]);

    // This function updates trader allowances initially and after sale
    const updateAllowances = useCallback(async () => {
        const { dai, erc20 } = contractInstances;
        const { info } = market;

        if (dai && erc20 && account && info && market.address) {
            try {
                const spender =
                    market.address === ZRX_MARKET_ADDRESS
                        ? allowanceTarget
                        : info.pool;

                erc20.options.address = info.yes;
                const yesAllowance = new BN(
                    await erc20.methods.allowance(account, spender).call()
                );

                erc20.options.address = info.no;
                const noAllowance = new BN(
                    await erc20.methods.allowance(account, spender).call()
                );

                const daiAllowance = new BN(
                    await dai.methods.allowance(account, spender).call()
                );

                setAllowances({
                    [info.yes]: yesAllowance,
                    [info.no]: noAllowance,
                    [DAI_CONTRACT_ADDRESS]: daiAllowance
                });
            } catch (balancesError) {
                console.error({ balancesError });
            }
        }
    }, [market, account, contractInstances, allowanceTarget]);

    // This function updates trader balances initially and after sale
    // Also resets price per share, max profit and price impact to 0
    const updateBalances = useCallback(async () => {
        const { dai, pool, erc20 } = contractInstances;
        const { info } = market;

        if (pool && dai && erc20 && account && info) {

            pool.options.address = info.pool;

            let totalSwapVolume = await getTotalVolumeForThePool(info.pool);
            var yesPrice = "0.0";
            var noPrice = "0.0";

            if (market.address === ZRX_MARKET_ADDRESS) {
                let params = {
                    sellToken: info.yes,
                    buyToken: DAI_CONTRACT_ADDRESS,
                    sellAmount: convertDisplayToAmount(
                        new BN(100),
                        info.yes
                    ),
                };
                let pricing = await fetchJSON(ZRX_PRICE_URL, params);
                yesPrice = parseFloat(pricing.price);
                yesPrice = yesPrice.toFixed(2);
            }
            else {

                try {
                    yesPrice = await pool.methods
                        .getSpotPrice(DAI_CONTRACT_ADDRESS, info.yes)
                        .call();
                    yesPrice = Web3.utils.fromWei(yesPrice);
                    yesPrice = Number(yesPrice);
                    yesPrice = yesPrice / TOKEN_MULTIPLE;
                    yesPrice = yesPrice.toFixed(2);
                }
                catch (spotPriceError) {
                    // handle the case when spot price throws 
                    // it is when pool token does not have any liquidity  

                    setHasEnoughLiquidity(false);
                    console.error({ spotPriceError });
                }
            }

            if (market.address === ZRX_MARKET_ADDRESS) {
                let params = {
                    sellToken: info.no,
                    buyToken: DAI_CONTRACT_ADDRESS,
                    sellAmount: convertDisplayToAmount(
                        new BN(100),
                        info.no
                    ),
                };
                let pricing = await fetchJSON(ZRX_PRICE_URL, params);
                noPrice = parseFloat(pricing.price);
                noPrice = noPrice.toFixed(2);
            }
            else {
                try {
                    noPrice = await pool.methods
                        .getSpotPrice(DAI_CONTRACT_ADDRESS, info.no)
                        .call();
                    noPrice = Web3.utils.fromWei(noPrice);
                    noPrice = Number(noPrice);
                    noPrice = noPrice / TOKEN_MULTIPLE;
                    noPrice = noPrice.toFixed(2);
                }
                catch (spotPriceError) {
                    // handle the case when spot price throws 
                    // it is when pool token does not have any liquidity  

                    setHasEnoughLiquidity(false);
                    console.error({ spotPriceError });
                }
            }
            console.log("yesPrice", yesPrice);
            console.log("noPrice", noPrice);
            setPrice(_init => ({
                ..._init,
                yesPrice: yesPrice,
                noPrice: noPrice,
                totalSwapVolume: totalSwapVolume
            }));

            erc20.options.address = info.yes;
            var yesBalance = new BN(
                await erc20.methods.balanceOf(account).call()
            );

            erc20.options.address = info.no;
            var noBalance = new BN(
                await erc20.methods.balanceOf(account).call()
            );

            var daiBalance = new BN(
                await dai.methods.balanceOf(account).call()
            );

            setBalances({
                [info.yes]: yesBalance,
                [info.no]: noBalance,
                [DAI_CONTRACT_ADDRESS]: daiBalance
            });

            yesBalance = Web3.utils.fromWei(yesBalance);
            yesBalance = Number(yesBalance);
            yesBalance = TOKEN_MULTIPLE * yesBalance;
            yesBalance = yesBalance.toFixed(2);

            noBalance = Web3.utils.fromWei(noBalance);
            noBalance = Number(noBalance);
            noBalance = TOKEN_MULTIPLE * noBalance;
            noBalance = noBalance.toFixed(2);

            daiBalance = Web3.utils.fromWei(daiBalance);
            daiBalance = Number(daiBalance);
            daiBalance = daiBalance.toFixed(2);

            setDisplayBalances({
                [info.yes]: yesBalance,
                [info.no]: noBalance,
                [DAI_CONTRACT_ADDRESS]: daiBalance
            });
        }
    }, [market, account, contractInstances]);

    const claimBalances = useCallback(async () => {
        const { erc20, shareToken, marketContract } = contractInstances;

        if (contractInstances && account) {
            //loop through all the outcome tokens and check if it claimmable 
            //meaning if the market associated with it was finalized and if it is the winning outcome
            let claimableTokens = [];
            let balancesOfClaimableTokensForDisplay = {};
            let tokenSymbols = {};
            let hasWinningTokens = false;
            let nonFinalizedMarkets = [];
            for (let i = 0; i < MARKETS.length; i++) {
                const marketFinalized = await isMarketFinalized(MARKETS[i], marketContract);

                const marketNumTicks = await getNumTicks(MARKETS[i], marketContract);
                const { outcomeTokens, outcomeSymbols, outcomeIcons } = MARKET_INFO[MARKETS[i]];
                if (marketFinalized) {
                    for (let j = 0; j < outcomeTokens.length; j++) {
                        // const outcome = await getOutcomeAssocitedWithToken(outcomeTokens[j], erc20, shareToken);
                        erc20.options.address = outcomeTokens[j];
                        const tokenId = await erc20.methods.tokenId().call();
                        const outcome = await shareToken.methods.getOutcome(tokenId).call();
                        //if the winning payout numberator for this token is equal to numTicks then provide a claim button
                        //It means that this method does not support a scalar market
                        const payoutNumerator = await getWinningPayoutNumerator(outcome, MARKETS[i], marketContract);


                        // console.log("isMarketFinalized", marketFinalized);
                        // console.log("market", MARKETS[i]);
                        // console.log("payoutNumerator", payoutNumerator);
                        // console.log("marketNumTicks", marketNumTicks);
                        // console.log("outcomeToken", outcomeTokens[j]);
                        // console.log("outcome", outcome);
                        if (marketNumTicks === payoutNumerator) {
                            claimableTokens.push(outcomeTokens[j]);
                            //TODO: make a getBlance method
                            erc20.options.address = outcomeTokens[j];
                            var balance = await erc20.methods.balanceOf(account).call();
                            balance = Web3.utils.fromWei(balance);
                            balance = Number(balance);
                            balance = TOKEN_MULTIPLE * balance;
                            if (balance > 0) {
                                hasWinningTokens = true;
                            }
                            balance = balance.toFixed(2);

                            balancesOfClaimableTokensForDisplay[outcomeTokens[j]] = balance;
                            tokenSymbols[outcomeTokens[j]] = outcomeSymbols[j];
                            tokenIcons[outcomeTokens[j]] = outcomeIcons[j];
                        }

                    }
                } else {
                    nonFinalizedMarkets.push(MARKETS[i]);
                }
            }
            // console.log("claimbaleTokens", claimableTokens);
            // console.log("balancesOfClaimableTokensForDisplay", balancesOfClaimableTokensForDisplay);
            setClaimableTokens(claimableTokens);
            setDisplayBalances(balancesOfClaimableTokensForDisplay);
            setTokenSymbols(tokenSymbols);
            setTokenIcons(tokenIcons);
            setHasWinningTokens(hasWinningTokens);
            setNonFinalizedMarkets(nonFinalizedMarkets);
        }
    }, [contractInstances, account]);

    const getTokenSymbol = useCallback(async (tokenAddress) => {
        const { erc20 } = contractInstances;
        erc20.options.address = tokenAddress;

        return await erc20.methods.symbol().call();
    }, [contractInstances]);
    const claim = useCallback(async (tokenAddress) => {
        const { erc20 } = contractInstances;

        if (erc20 && account) {

            erc20.options.address = tokenAddress;
            await erc20.methods
                .claim(account)
                .send({ from: account })
                .on("transactionHash", transactionHash => {
                    notification.info({
                        message: "Redeem Pending",
                        description: (
                            <div>
                                <p>This can take a moment...</p>
                                <EtherscanLink hash={transactionHash} />
                            </div>
                        ),
                        icon: <LoadingOutlined />
                    });
                    setApproveLoading(true);
                })
                .on("receipt", function () {
                    notification.destroy();
                    notification.success({
                        duration: 7,
                        message: "Redeem Done"
                    });
                })
                .on("error", function (error) {
                    notification.destroy();
                    if (
                        error.message.includes(
                            "User denied transaction signature"
                        )
                    ) {
                        notification.error({
                            duration: 7,
                            message: "Transaction Rejected"
                        });
                    } else {
                        notification.error({
                            duration: 7,
                            message:
                                "There was an error in executing the transaction"
                        });
                    }
                });
            updateBalances();
            claimBalances();
        }
    }, [account,
        contractInstances, claimBalances, updateBalances
    ]);

    const approve = useCallback(async () => {
        const { erc20 } = contractInstances;
        const { address, info } = market;
        if (erc20 && address && info && fromToken && account) {
            //approve fromAmount of fromToken for spending by Trader1
            var allowanceLimit = MAX_UINT256;
            let spender;
            if (market.address === ZRX_MARKET_ADDRESS) {
                spender = allowanceTarget;
            } else {
                spender = info.pool;
            }

            erc20.options.address = fromToken;
            await erc20.methods
                .approve(spender, allowanceLimit)
                .send({ from: account, gas: 46000 })
                .on("transactionHash", transactionHash => {
                    notification.info({
                        message: "Approve Pending",
                        description: (
                            <div>
                                <p>This can take a moment...</p>
                                <EtherscanLink hash={transactionHash} />
                            </div>
                        ),
                        icon: <LoadingOutlined />
                    });
                    setApproveLoading(true);
                })
                .on("receipt", function () {
                    notification.destroy();
                    notification.success({
                        duration: 7,
                        message: "Approve Done"
                    });
                })
                .on("error", function (error) {
                    notification.destroy();
                    if (
                        error.message.includes(
                            "User denied transaction signature"
                        )
                    ) {
                        notification.error({
                            duration: 7,
                            message: "Transaction Rejected"
                        });
                    } else {
                        notification.error({
                            duration: 7,
                            message:
                                "There was an error in executing the transaction"
                        });
                    }
                });
            await updateAllowances();
            setApproveLoading(false);
        }
    }, [
        account,
        contractInstances,
        fromToken,
        allowanceTarget,
        market,
        updateAllowances
    ]);

    const getMax = useCallback(async () => {
        if (balances && fromToken) {
            const { [fromToken]: balance } = balances;
            if (balance) {
                setFromAmount(balance);
                setFromAmountDisplay(
                    convertAmountToDisplay(balance, fromToken)
                );
            }
        }
    }, [balances, fromToken]);

    // Swap with the number of "from" tokens fixed
    const swapExactAmountIn0xAPI = useCallback(async () => {
        if (fromAmountLoading || toAmountLoading) return;

        const { pool } = contractInstances;
        const { info } = market;
        if (web3 && account && info && pool) {
            pool.options.address = info.pool;

            try {
                await web3.eth
                    .sendTransaction({
                        from: account,
                        to: zrxPricing.to,
                        data: zrxPricing.data
                    })
                    .on("transactionHash", transactionHash => {
                        notification.info({
                            message: "Transaction Pending",
                            description: (
                                <div>
                                    <p>This can take a moment...</p>
                                    <EtherscanLink hash={transactionHash} />
                                </div>
                            ),
                            icon: <LoadingOutlined />
                        });
                    })
                    .on("receipt", function (receipt) {
                        notification.destroy();
                        notification.success({
                            duration: 7,
                            message: "swap done",
                            description: (
                                <EtherscanLink hash={receipt.transactionHash} />
                            )
                        });
                    })
                    .on("error", function (error) {
                        notification.destroy();
                        if (
                            error.message.includes(
                                "User denied transaction signature"
                            )
                        ) {
                            notification.error({
                                duration: 7,
                                message: "Transaction Rejected"
                            });
                        } else {
                            notification.error({
                                duration: 7,
                                message:
                                    "There was an error in executing the transaction"
                            });
                        }
                    });
            } catch (error) {
                console.error(error);
            }
        }
    }, [
        web3,
        account,
        market,
        contractInstances,
        fromAmountLoading,
        toAmountLoading,
        zrxPricing
    ]);

    // Swap with the number of "from" tokens fixed
    const swapExactAmountIn = useCallback(async () => {
        if (fromAmountLoading || toAmountLoading) return;
        if (market.address === ZRX_MARKET_ADDRESS) {
            swapExactAmountIn0xAPI();
        } else {
            const { pool } = contractInstances;
            const { info } = market;
            if (
                slippage &&
                info &&
                pool &&
                fromToken &&
                toToken &&
                account &&
                toAmount &&
                fromAmount
            ) {
                pool.options.address = info.pool;
                let BNslippage = Number(slippage);
                BNslippage = new BN(BNslippage * 100);
                var minAmountOut = toAmount.sub(
                    toAmount.mul(BNslippage).div(TEN_THOUSAND_BN)
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
                        .send({ from: account, gas: 150000 })
                        .on("transactionHash", transactionHash => {
                            notification.info({
                                message: "Transaction Pending",
                                description: (
                                    <div>
                                        <p>This can take a moment...</p>
                                        <EtherscanLink hash={transactionHash} />
                                    </div>
                                ),
                                icon: <LoadingOutlined />
                            });
                        })
                        .on("receipt", function (receipt) {
                            notification.destroy();
                            notification.success({
                                duration: 7,
                                message: "swap done",
                                description: (
                                    <EtherscanLink
                                        hash={receipt.transactionHash}
                                    />
                                )
                            });
                        })
                        .on("error", function (error) {
                            notification.destroy();
                            if (
                                error.message.includes(
                                    "User denied transaction signature"
                                )
                            ) {
                                notification.error({
                                    duration: 7,
                                    message: "Transaction Rejected"
                                });
                            } else {
                                notification.error({
                                    duration: 7,
                                    message:
                                        "There was an error in executing the transaction"
                                });
                            }
                        });
                } catch (error) {
                    console.error(error);
                }
            }
        }
    }, [
        slippage,
        contractInstances,
        account,
        fromToken,
        toToken,
        fromAmount,
        toAmount,
        fromAmountLoading,
        toAmountLoading,
        market,
        swapExactAmountIn0xAPI
    ]);

    // Swap with the number of "to"" tokens fixed
    const swapExactAmountOut0xAPI = useCallback(async () => {
        if (fromAmountLoading || toAmountLoading) return;

        const { info } = market;
        const { pool } = contractInstances;

        if (zrxPricing && account && web3 && info && pool) {
            pool.options.address = info.pool;

            try {
                await web3.eth
                    .sendTransaction({
                        from: account,
                        to: zrxPricing.to,
                        data: zrxPricing.data
                    })
                    .on("transactionHash", transactionHash => {
                        notification.info({
                            message: "Transaction Pending",
                            description: (
                                <div>
                                    <p>This can take a moment...</p>
                                    <EtherscanLink hash={transactionHash} />
                                </div>
                            ),
                            icon: <LoadingOutlined />
                        });
                    })
                    .on("receipt", function (receipt) {
                        notification.destroy();
                        notification.success({
                            duration: 7,
                            message: "swap done",
                            description: (
                                <EtherscanLink hash={receipt.transactionHash} />
                            )
                        });
                    })
                    .on("error", function (error) {
                        notification.destroy();
                        if (
                            error.message.includes(
                                "User denied transaction signature"
                            )
                        ) {
                            notification.error({
                                duration: 7,
                                message: "Transaction Rejected"
                            });
                        } else {
                            notification.error({
                                duration: 7,
                                message:
                                    "There was an error in executing the transaction"
                            });
                        }
                    });
            } catch (error) {
                console.error(error);
            }
        }
    }, [
        web3,
        account,
        zrxPricing,
        fromAmountLoading,
        toAmountLoading,
        market,
        contractInstances
    ]);

    // Swap with the number of "to"" tokens fixed
    const swapExactAmountOut = useCallback(async () => {
        if (fromAmountLoading || toAmountLoading) return;
        if (market.address === ZRX_MARKET_ADDRESS) {
            swapExactAmountOut0xAPI();
        } else {
            const { pool } = contractInstances;
            const { info } = market;
            if (
                account &&
                pool &&
                info &&
                fromToken &&
                toToken &&
                slippage &&
                fromAmount &&
                toAmount
            ) {
                pool.options.address = info.pool;
                let BNslippage = Number(slippage);
                BNslippage = new BN(BNslippage * 100);
                var maxAmountIn = fromAmount.add(
                    fromAmount.mul(BNslippage).div(TEN_THOUSAND_BN)
                );
                var maxPrice = MAX_UINT256;

                try {
                    await pool.methods
                        .swapExactAmountOut(
                            fromToken,
                            maxAmountIn,
                            toToken,
                            toAmount,
                            maxPrice
                        )
                        .send({ from: account, gas: 150000 })
                        .on("transactionHash", transactionHash => {
                            notification.info({
                                message: "Transaction Pending",
                                description: (
                                    <div>
                                        <p>This can take a moment...</p>
                                        <EtherscanLink hash={transactionHash} />
                                    </div>
                                ),
                                icon: <LoadingOutlined />
                            });
                        })
                        .on("receipt", function (receipt) {
                            notification.destroy();
                            notification.success({
                                duration: 7,
                                message: "swap done",
                                description: (
                                    <EtherscanLink
                                        hash={receipt.transactionHash}
                                    />
                                )
                            });
                        })
                        .on("error", function (error) {
                            notification.destroy();
                            if (
                                error.message.includes(
                                    "User denied transaction signature"
                                )
                            ) {
                                notification.error({
                                    duration: 7,
                                    message: "Transaction Rejected"
                                });
                            } else {
                                notification.error({
                                    duration: 7,
                                    message:
                                        "There was an error in executing the transaction"
                                });
                            }
                        });
                } catch (error) {
                    console.error(error);
                }
            }
        }
    }, [
        account,
        fromToken,
        toToken,
        fromAmount,
        toAmount,
        contractInstances,
        swapExactAmountOut0xAPI,
        market,
        fromAmountLoading,
        toAmountLoading,
        slippage
    ]);

    // This function determines whether to swapExactAmountIn or swapExactAmountOut
    const swapBranch = useCallback(async () => {
        if (fromValueIsExact) {
            await swapExactAmountIn();
        } else {
            await swapExactAmountOut();
        }
        updateBalances();
        updateAllowances();
    }, [
        fromValueIsExact,
        swapExactAmountOut,
        swapExactAmountIn,
        updateAllowances,
        updateBalances
    ]);

    const reversePair = useCallback(async () => {
        if (fromAmountLoading || toAmountLoading || !fromToken || !toToken)
            return;
        setFromToken(toToken);
        setToToken(fromToken);
        setFromAmountDisplay(
            convertAmountToDisplay(toAmount || new BN(0), toToken)
        );
        setFromAmount(toAmount || new BN(0));
        setFromValueIsExact(true);
    }, [fromAmountLoading, toAmountLoading, fromToken, toToken, toAmount]);

    const updateFromAmount = useCallback(
        async e => {
            if (!fromToken) return;
            setSwapDisabled(!e.target.value || e.target.value <= 0);
            setFromAmountDisplay(e.target.value);
            setFromAmount(
                !!e.target.value && e.target.value >= 0
                    ? convertDisplayToAmount(e.target.value, fromToken)
                    : new BN(0)
            );
        },
        [fromToken]
    );

    const updateToAmount = useCallback(
        async e => {
            if (!toToken) return;
            setSwapDisabled(!e.target.value || e.target.value <= 0);
            setToAmountDisplay(e.target.value);
            setToAmount(
                !!e.target.value && e.target.value >= 0
                    ? convertDisplayToAmount(e.target.value, toToken)
                    : new BN(0)
            );
        },
        [toToken]
    );

    const updateToToken = useCallback(
        async e => {
            const newAddress = e.target.value;
            const { info } = market;
            if (newAddress && info) {
                setToToken(newAddress);
                if (newAddress === fromToken) {
                    let newFromAddress =
                        newAddress === DAI_CONTRACT_ADDRESS
                            ? info.no
                            : DAI_CONTRACT_ADDRESS;
                    setFromToken(newFromAddress);
                }
                setFromValueIsExact(false);
            }
        },
        [market, fromToken]
    );

    const updateFromToken = useCallback(
        async e => {
            const newAddress = e.target.value;
            const { info } = market;
            if (newAddress && info) {
                setFromToken(newAddress);
                if (newAddress === toToken) {
                    let newToAddress =
                        newAddress === DAI_CONTRACT_ADDRESS
                            ? info.no
                            : DAI_CONTRACT_ADDRESS;
                    setToToken(newToAddress);
                }
                setFromValueIsExact(true);
            }
        },
        [market, toToken]
    );

    const updateMarket = useCallback(async marketAddress => {
        const info = MARKET_INFO[marketAddress];
        setMarket({
            address: marketAddress,
            info
        });
        const isMarket0 = marketAddress === MARKETS[0];
        setFromToken(DAI_CONTRACT_ADDRESS);
        setFromAmount(convertDisplayToAmount("100", DAI_CONTRACT_ADDRESS));
        setFromAmountDisplay("100");
        setToToken(isMarket0 ? info.no : info.yes);
        setHasEnoughLiquidity(true);
    }, []);

    const handleChange = useCallback(
        async e => {
            e.persist();
            if (e.target.name === "fromAmountDisplay") {
                setFromValueIsExact(true);
                updateFromAmount(e);
            } else if (e.target.name === "toAmountDisplay") {
                setFromValueIsExact(false);
                updateToAmount(e);
            } else if (e.target.name === "toToken") {
                updateToToken(e);
            } else if (e.target.name === "fromToken") {
                updateFromToken(e);
            }
        },
        [updateFromToken, updateToToken, updateToAmount, updateFromAmount]
    );

    useEffect(() => {
        if (!fromAmountLoading && fromValueIsExact) {
            calcToGivenFrom();
        }
    }, [calcToGivenFrom, fromAmountLoading, fromValueIsExact]);

    useEffect(() => {
        if (!toAmountLoading && !fromValueIsExact) {
            calcFromGivenTo();
        }
    }, [calcFromGivenTo, toAmountLoading, fromValueIsExact]);
    useEffect(() => {
        claimBalances();
    }, [claimBalances]);
    useEffect(() => {
        updateBalances();
    }, [market, updateBalances]);

    useEffect(() => {
        updateAllowances();
    }, [market, updateAllowances]);

    useEffect(() => {
        if (balances && fromToken && fromAmount) {
            const { [fromToken]: balance } = balances;
            if (balance) {
                setHasEnoughBalance(balance.gte(fromAmount));
            }
        }
    }, [balances, fromToken, fromAmount]);

    useEffect(() => {
        if (allowances && fromToken && fromAmount) {
            const { [fromToken]: allowance } = allowances;
            if (allowance) {
                setApprovalRequired(allowance.lte(fromAmount));
            }
        }
    }, [allowances, fromToken, fromAmount]);

    useEffect(() => {
        setLocalStorage(fromToken, toToken, market.address);
    }, [fromToken, toToken, market]);

    // Add token to Metamask
    const addTokenToMetamask = useCallback(
        async tokenAddress => {
            const { info } = market;
            const { erc20 } = contractInstances;
            if (!(info && erc20 && web3)) return;
            let tokenSymbol;
            let decimals;
            let tokenImage;
            erc20.options.address = tokenAddress;
            tokenSymbol = await erc20.methods.symbol().call();
            decimals = await erc20.methods.decimals().call();

            if (tokenAddress === info.yes) {
                tokenImage = info.yesIcon;
            } else if (tokenAddress === info.no) {
                tokenImage = info.noIcon;
            } else {
                throw new Error("Cannot add this token to Metamask");
            }
            const provider = window.ethereum;
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
                                image: tokenImage
                            }
                        },
                        id: Math.round(Math.random() * 100000)
                    },
                    (err, added) => {
                        if (err || "error" in added) {
                            notification.error({
                                duration: 7,
                                message:
                                    "There was an error in adding token to Metamask Wallet"
                            });
                        }
                        return;
                    }
                );
            } catch (error) {
                notification.error({
                    duration: 7,
                    message: "Error",
                    description:
                        "Add token to Metamask failed. Check console for details."
                });
                console.error(error);
            }
        },
        [contractInstances, web3, market]
    );

    return (
        <TradingContext.Provider
            value={{
                contractInstances,
                fromToken,
                fromAmount,
                fromAmountDisplay,
                fromAmountLoading,
                toToken,
                toAmount,
                toAmountDisplay,
                toAmountLoading,
                market,
                isApprovalRequired,
                ...priceProfitSlippage,
                hasEnoughBalance,
                hasEnoughLiquidity,
                balances: displayBalances,
                claimableTokens,
                claim,
                nonFinalizedMarkets,
                tokenSymbols,
                tokenIcons,
                hasWinningTokens,
                approveLoading,
                swapBranch,
                ...price,
                reversePair,
                getMax,
                handleChange,
                isSwapDisabled,
                approve,
                swapFee,
                updateMarket,
                addTokenToMetamask,
                getTokenSymbol,
            }}
        >
            {children}
        </TradingContext.Provider>
    );
};
