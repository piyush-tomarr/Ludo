import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    lang: 'en' // default language
}

const languageSlice = createSlice({
    name: 'language',
    initialState,
    reducers: {
        changeLanguage: (state, action) => {
            state.lang = action.payload
        }
    }
})

export const { changeLanguage } = languageSlice.actions
export default languageSlice.reducer
