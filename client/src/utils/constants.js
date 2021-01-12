import BN from "bn.js";
import addresses from "../config/addresses.js";

export const NETWORK = addresses.network; // set NETWORK as "ganache" or "kovan" or "mainnet"
const isKovanNetwork = NETWORK === "kovan";
// if network is ganache, run truffle migrate --develop and disable metamask
// if network is kovan, enable metamask, set to kovan network and open account with kovan eth
export const TOKEN_MULTIPLE = isKovanNetwork ? new BN(100) : new BN(1000);
export const DAI_CONTRACT_ADDRESS = addresses[NETWORK].dai;
export const MULTICALL_CONTRACT_ADDRESS = addresses[NETWORK].multicall;
export const MARKETS = addresses[NETWORK].markets;
export const MARKET_INFO = addresses[NETWORK].marketInfo;
export const MAX_UINT256 = new BN(2).pow(new BN(256)).sub(new BN(1));
export const TEN_THOUSAND_BN = new BN(10000);
export const ETHERSCAN_PREFIX = isKovanNetwork
    ? "https://kovan.etherscan.io/tx/"
    : "https://etherscan.io/tx/";
export const ZRX_QUOTE_URL = "https://api.0x.org/swap/v1/quote";
export const ZRX_PRICE_URL = "https://api.0x.org/swap/v1/price";
export const ZRX_MARKET_ADDRESS = "0x1ebb89156091eb0d59603c18379c03a5c84d7355".toLowerCase();
export const ALLOWANCE_TARGET = "0xf740b67da229f2f10bcbd38a7979992fcc71b8eb".toLowerCase();

export const LS_MARKET = "market-address";
export const LS_FROM_TOKEN = "from-token";
export const LS_TO_TOKEN = "to-token";
