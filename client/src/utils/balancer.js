export const getTotalVolumeForThePool = async poolAddress => {
    const URL =
        "https://api.thegraph.com/subgraphs/name/balancer-labs/balancer";
    let content = {
        query: `
            {
              pools(where: {id: "${poolAddress}"}) {
                id 
                totalSwapVolume
                swaps{
                  poolTotalSwapVolume
                }
              }
            }`
    };
    let body = JSON.stringify(content);
    let response = await fetch(URL, {
        method: "post",
        headers: {
            "Content-Type": "application/json"
        },
        body: body
    });

    if (response.status === 200) {
        let poolInfo = await response.json();
        if (
            poolInfo &&
            poolInfo.data &&
            poolInfo.data.pools &&
            poolInfo.data.pools[0]
        ) {
            return Number(poolInfo.data.pools[0].totalSwapVolume);
        }
    }
    console.log("error in getting the pool info");
    return 0;
};

export const getPoolInfo = async (
    web3,
    fromToken,
    toToken,
    multicall,
    pool,
    poolAddress
) => {
    pool.options.address = poolAddress;

    const fromTokenBalanceCall = {
        target: pool.options.address,
        callData: pool.methods.getBalance(fromToken).encodeABI()
    };

    const toTokenBalanceCall = {
        target: pool.options.address,
        callData: pool.methods.getBalance(toToken).encodeABI()
    };

    const fromTokenDenormlizedWeightCall = {
        target: pool.options.address,
        callData: pool.methods.getDenormalizedWeight(fromToken).encodeABI()
    };

    const toTokenDenormlizedWeightCall = {
        target: pool.options.address,
        callData: pool.methods.getDenormalizedWeight(toToken).encodeABI()
    };

    const swapFeesCall = {
        target: pool.options.address,
        callData: pool.methods.getSwapFee().encodeABI()
    };

    const result = await multicall.methods
        .aggregate([
            fromTokenBalanceCall,
            toTokenBalanceCall,
            fromTokenDenormlizedWeightCall,
            toTokenDenormlizedWeightCall,
            swapFeesCall
        ])
        .call();

    return {
        fromTokenBalance: web3.eth.abi.decodeParameter(
            "uint256",
            result.returnData[0]
        ),
        toTokenBalance: web3.eth.abi.decodeParameter(
            "uint256",
            result.returnData[1]
        ),
        fromTokenDenormlizedWeight: web3.eth.abi.decodeParameter(
            "uint256",
            result.returnData[2]
        ),
        toTokenDenormlizedWeight: web3.eth.abi.decodeParameter(
            "uint256",
            result.returnData[3]
        ),
        swapFees: web3.eth.abi.decodeParameter("uint256", result.returnData[4])
    };
};
