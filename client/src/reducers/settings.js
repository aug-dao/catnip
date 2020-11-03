const initialState = {
    isContrast: true
}

export default function settings(state = initialState, action) {
    switch (action.type) {
        case 'OPEN_CONTRAST':
            return {
                ...state, 
                isContrast: false
            }
        case 'CLOSE_CONTRAST':
            return {
                ...state, 
                isContrast: true
            }
        default: 
            return state;
    }
}