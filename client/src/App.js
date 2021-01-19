import React, { useContext } from 'react';
import './App.css';
import Trading from './components/Trading.js';
import PageHeader from './components/PageHeader.js';
import 'antd/dist/antd.css';
import { AppContext } from './contexts/AppContext';
import {
    BrowserRouter as Router,
    Redirect,
    Route,
    Switch,
} from 'react-router-dom';
import { TradingProvider } from './contexts/TradingContext';

import { DEFAULT_MARKET } from './utils/constants';

//App controls the user interface
const App = () => {
    const { isContrast } = useContext(AppContext);

    return (
        <div className={`App ${isContrast ? 'dark' : 'light'}`}>
            <PageHeader />
            <TradingProvider>
                <Router>
                    <Switch>
                        <Route
                            path="/markets/:marketAddress"
                            exact
                            component={Trading}
                        />
                        <Redirect path="*" to={`/markets/${DEFAULT_MARKET}`} />
                    </Switch>
                </Router>
            </TradingProvider>
        </div>
    );
};

export default App;
