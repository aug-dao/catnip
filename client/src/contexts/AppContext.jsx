import React, { useCallback, useState } from "react";

export const AppContext = React.createContext({});

export const AppProvider = ({ children }) => {
    const [isContrast, setContrast] = useState(
        window.localStorage.isContrast
            ? parseInt(window.localStorage.isContrast)
            : 1
    );

    const [slippage, setSlippage] = useState(0.5);

    const toggleContrast = useCallback(() => {
        if (isContrast) {
            window.localStorage.isContrast = 0;
            setContrast(0);
        } else {
            window.localStorage.isContrast = 1;
            setContrast(1);
        }
    }, [isContrast, setContrast]);

    return (
        <AppContext.Provider
            value={{
                isContrast: isContrast === 1,
                toggleContrast,
                slippage,
                setSlippage
            }}
        >
            {children}
        </AppContext.Provider>
    );
};
