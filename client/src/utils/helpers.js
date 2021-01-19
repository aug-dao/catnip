import Web3 from 'web3';
import BigNumber from 'bignumber.js';
import BN from 'bn.js';
import {
    MARKET_INFO,
    TOKEN_MULTIPLE,
    DAI_CONTRACT_ADDRESS,
    DEFAULT_MARKET,
    LS_TO_TOKEN,
    LS_FROM_TOKEN,
    LS_MARKET,

} from './constants';

BigNumber.config({ ROUNDING_MODE: BigNumber.ROUND_DOWN });

export const fetchJSON = async (url, params) => {
    try {
        url = new URL(url);
        params.excludedSources = 'MultiHop';
        Object.keys(params).forEach(key =>
            url.searchParams.append(key, params[key])
        );
        let res = await fetch(url);
        return await res.json();
    } catch (error) {
        console.log(error);
        return 0;
    }
};

export const convertAmountToDisplay = (amount, token) => {
    //if the token is yes/no then decimals are 15
    if (token !== DAI_CONTRACT_ADDRESS) {
        amount = amount.mul(TOKEN_MULTIPLE);
    }
    amount = new BigNumber(Web3.utils.fromWei(amount.toString()));
    //maybe round the number here
    return amount.toFixed(2);
};

export const convertDisplayToAmount = (amount, token) => {
    amount = new BN(Web3.utils.toWei(amount.toString()));

    if (token !== DAI_CONTRACT_ADDRESS) {
        amount = amount.div(TOKEN_MULTIPLE);
    }

    return amount;
};

export const setLocalStorage = (fromToken, toToken, market) => {
    const ls = window.localStorage;
    ls.setItem(LS_MARKET, market);
    const marketInfo = MARKET_INFO[market] || MARKET_INFO[DEFAULT_MARKET];
    switch (fromToken) {
        case marketInfo.yes:
            ls.setItem(LS_FROM_TOKEN, 'yes');
            break;
        case marketInfo.no:
            ls.setItem(LS_FROM_TOKEN, 'no');
            break;
        case DAI_CONTRACT_ADDRESS:
        default:
            ls.setItem(LS_FROM_TOKEN, 'dai');
            break;
    }
    switch (toToken) {
        case marketInfo.yes:
            ls.setItem(LS_TO_TOKEN, 'yes');
            break;
        case marketInfo.no:
            ls.setItem(LS_TO_TOKEN, 'no');
            break;
        case DAI_CONTRACT_ADDRESS:
        default:
            ls.setItem(LS_TO_TOKEN, 'dai');
            break;
    }
};

export const calcPriceProfitSlippage = async (
    fromToken,
    fromAmount,
    toToken,
    toAmount,
    pool,
    poolAddress
) => {
    fromAmount = new BigNumber(fromAmount);
    toAmount = new BigNumber(toAmount);
    if (fromAmount.lte(0) || toAmount.lte(0)) return;
    pool.options.address = poolAddress;

    let spotPrice = new BN(
        await pool.methods.getSpotPrice(fromToken, toToken).call()
    );
    //"real" because we are changing the price per share to always be in terms of DAI when DAI is one of the token
    let realSpotPrice = new BigNumber(Web3.utils.fromWei(spotPrice.toString()));
    let realFromAmount = new BigNumber(fromAmount);
    let realToAmount = new BigNumber(toAmount);
    let realPricePerShare = realFromAmount.div(realToAmount);
    let realSpotPercentage = realSpotPrice.div(realPricePerShare).times(100);
    let realPriceImpact = new BigNumber(100).minus(realSpotPercentage);

    if (fromToken !== DAI_CONTRACT_ADDRESS) {
        fromAmount = fromAmount.times(TOKEN_MULTIPLE.toString());
    }
    if (toToken !== DAI_CONTRACT_ADDRESS) {
        toAmount = toAmount.times(TOKEN_MULTIPLE.toString());
    }

    if (fromToken !== DAI_CONTRACT_ADDRESS) {
        spotPrice = spotPrice.mul(TOKEN_MULTIPLE);
    } else {
        spotPrice = spotPrice.div(TOKEN_MULTIPLE);
    }
    spotPrice = new BigNumber(Web3.utils.fromWei(spotPrice));

    let pricePerShare = new BigNumber(0);
    if (toToken === DAI_CONTRACT_ADDRESS) {
        pricePerShare = toAmount.div(fromAmount);
    } else {
        pricePerShare = fromAmount.div(toAmount);
    }

    let priceImpactColor = 'red';
    if (realPriceImpact < 1) {
        priceImpactColor = 'green';
    } else if (realPriceImpact >= 1 && realPriceImpact <= 3) {
        priceImpactColor = 'black';
    } else if (realPriceImpact > 3) {
        priceImpactColor = 'red';
    }

    let impliedOdds = 0;
    if (
        fromToken !== DAI_CONTRACT_ADDRESS &&
        toToken !== DAI_CONTRACT_ADDRESS
    ) {
        impliedOdds = new BigNumber(100).minus(
            new BigNumber(100).dividedBy(new BigNumber(1).plus(pricePerShare))
        );
    }

    let maxProfit = 0;
    if (fromToken === DAI_CONTRACT_ADDRESS) {
        maxProfit = new BigNumber(1).minus(pricePerShare).multipliedBy(toAmount);
        maxProfit = new BigNumber(Web3.utils.fromWei(maxProfit.toFixed(0)));
    }

    return {
        pricePerShare: pricePerShare.toFixed(3),
        maxProfit: maxProfit.toFixed(2),
        priceImpact: realPriceImpact.toFixed(2),
        impliedOdds: impliedOdds.toFixed(2),
        priceImpactColor: priceImpactColor,
    };
};

export const calcPriceProfitSlippage0xAPI = async (
    fromToken,
    fromAmount,
    toToken,
    toAmount,
    pricing
) => {
    if (fromToken !== DAI_CONTRACT_ADDRESS) {
        fromAmount = fromAmount.mul(TOKEN_MULTIPLE);
    }
    if (toToken !== DAI_CONTRACT_ADDRESS) {
        toAmount = toAmount.mul(TOKEN_MULTIPLE);
    }
    fromAmount = new BigNumber(fromAmount);
    toAmount = new BigNumber(toAmount);

    let pricePerShare = new BigNumber(0);

    if (toToken === DAI_CONTRACT_ADDRESS) {
        pricePerShare = toAmount.div(fromAmount);
    } else {
        pricePerShare = fromAmount.div(toAmount);
    }

    let impliedOdds = 0;

    if (
        fromToken !== DAI_CONTRACT_ADDRESS &&
        toToken !== DAI_CONTRACT_ADDRESS
    ) {
        impliedOdds = new BigNumber(100).minus(
            new BigNumber(100).dividedBy(new BigNumber(1).plus(pricePerShare))
        );
    }

    let maxProfit = 0;
    if (fromToken === DAI_CONTRACT_ADDRESS) {
        maxProfit = new BigNumber(1).minus(pricePerShare).multipliedBy(toAmount);
        maxProfit = new BigNumber(Web3.utils.fromWei(maxProfit.toFixed(0)));
    }

    let minAmountReceivedBN = new BigNumber(0);
    let price = new BigNumber(pricing.price);
    let guaranteedPrice = new BigNumber(pricing.guaranteedPrice);
    let buyAmount = new BigNumber(pricing.buyAmount);

    if (price.gte(guaranteedPrice)) {
        minAmountReceivedBN = guaranteedPrice
            .multipliedBy(buyAmount)
            .dividedBy(price);
    } else {
        minAmountReceivedBN = price
            .multipliedBy(buyAmount)
            .dividedBy(guaranteedPrice);
    }

    let minAmountReceived = convertAmountToDisplay(
        new BN(minAmountReceivedBN.toFixed(0)),
        pricing.buyTokenAddress
    );

    return {
        pricePerShare: pricePerShare.toFixed(3),
        maxProfit: maxProfit.toFixed(2),
        priceImpact: 0,
        impliedOdds: impliedOdds.toFixed(2),
        minAmountReceived: minAmountReceived,
    };
};

export const timeConverter = UNIX_timestamp => {
    var a = new Date(UNIX_timestamp * 1000);
    var time = a.toLocaleString('en-US', { timeZoneName: 'short' });
    return time;
};
