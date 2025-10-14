// this is the main redux provider for the app
import { configureStore, combineReducers } from '@reduxjs/toolkit'
import { slices } from './slices'

const rootReducer = combineReducers({
    ...slices
})

export function makeStore() {
    return (
        configureStore({
            reducer: rootReducer,
        })
    )
}


export const store = makeStore()
    