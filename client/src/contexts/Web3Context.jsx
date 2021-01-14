import WalletConnectProvider from "@walletconnect/web3-provider";
import React, { useCallback, useEffect, useState } from "react";
import Web3 from "web3";
import Web3Modal from "web3modal";

import configData from "../config.json";
import { NETWORK } from "../utils/constants";

export const Web3Context = React.createContext({});

const providerOptions = {
    walletconnect: {
        package: WalletConnectProvider,
        options: {
            infuraId: configData.providers.infura.projectId
        }
    }
};

const web3Modal = new Web3Modal({
    cacheProvider: true,
    providerOptions
});

const networkLabels = {
    1: "mainnet",
    42: "kovan"
};

const getNetworkLabel = id => networkLabels[id] || "unknown";

export const Web3Provider = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [provider, setProvider] = useState({
        web3: new Web3(
            new Web3.providers.HttpProvider(
                configData.providers.infura[NETWORK]
            )
        )
    });
    const { web3, account, chainId } = provider;

    const setWeb3Provider = async (prov, updateAccount = false) => {
        if (prov) {
            const web3Provider = new Web3(prov);

            const providerNetwork = await web3Provider.eth.getChainId();
            if (updateAccount) {
                const gotAccounts = await web3Provider.eth.getAccounts();
                setProvider(_provider => ({
                    ..._provider,
                    web3: web3Provider,
                    chainId: providerNetwork,
                    account: gotAccounts[0]
                }));
            } else {
                setProvider(_provider => ({
                    ..._provider,
                    web3: web3Provider,
                    chainId: providerNetwork
                }));
            }
        }
    };

    const connectWeb3 = useCallback(async () => {
        try {
            setLoading(true);
            const modalProvider = await web3Modal.connect();

            await setWeb3Provider(modalProvider, true);

            // Subscribe to accounts change
            modalProvider.on("accountsChanged", accounts => {
                setProvider(_provider => ({
                    ..._provider,
                    account: accounts[0]
                }));
            });

            // Subscribe to chainId change
            modalProvider.on("chainChanged", () => {
                setWeb3Provider(modalProvider);
            });
        } catch (error) {
            // eslint-disable-next-line no-console
            console.log({ web3ModalError: error });
        }
        setLoading(false);
    }, []);

    const disconnect = useCallback(async () => {
        web3Modal.clearCachedProvider();
        setProvider({});
    }, []);

    useEffect(() => {
        if (window.ethereum) {
            window.ethereum.autoRefreshOnNetworkChange = false;
        }
        if (web3Modal.cachedProvider) {
            setLoading(true);
            connectWeb3().catch(error => {
                // eslint-disable-next-line
                console.error({ web3ModalError: error });
            });
        } else {
            setLoading(false);
        }
    }, [connectWeb3]);

    return (
        <Web3Context.Provider
            value={{
                web3,
                chainId,
                network: getNetworkLabel(chainId),
                account,
                connectWeb3,
                loading,
                disconnect
            }}
        >
            {children}
        </Web3Context.Provider>
    );
};
