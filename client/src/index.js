import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import { AppProvider } from "./contexts/AppContext";
import { Web3Provider } from "./contexts/Web3Context";

ReactDOM.render(
    <AppProvider>
        <Web3Provider>
            <App />
        </Web3Provider>
    </AppProvider>,
    document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
