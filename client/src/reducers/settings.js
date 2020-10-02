const initialState = {
    isContrast: false
}

export default function settings(state = initialState, action) {
    switch (action.type) {
        case 'OPEN_CONTRAST':
            return {
                ...state, 
                isContrast: true
            }
        case 'CLOSE_CONTRAST':
            return {
                ...state, 
                isContrast: false
            }
        default: 
            return state;
    }
}