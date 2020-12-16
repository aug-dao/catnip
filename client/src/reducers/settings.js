const initialState = {
    isContrast: window.localStorage.isContrast === undefined ? 1 :  parseInt(window.localStorage.isContrast)
}

export default function settings(state = initialState, action) {
    switch (action.type) {
        case 'OPEN_CONTRAST':
            window.localStorage.isContrast = 0;
            return {
                ...state, 
                isContrast: false
            }
        case 'CLOSE_CONTRAST':
            window.localStorage.isContrast = 1;
            return {
                ...state, 
                isContrast: true
            }
        default: 
            return state;
    }
}