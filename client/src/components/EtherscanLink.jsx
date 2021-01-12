import React from "react";
import { ETHERSCAN_PREFIX } from "../utils/constants";

export const EtherscanLink = transactionHash => {
    return (
        <a
            href={ETHERSCAN_PREFIX + transactionHash.hash}
            target="_blank"
            rel="noopener noreferrer"
        >
            See on Etherscan
        </a>
    );
};
