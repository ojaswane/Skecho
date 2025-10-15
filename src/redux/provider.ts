// this is the main redux provider for the app
import { configureStore, combineReducers } from '@reduxjs/toolkit'
import { slices } from './slices'
// import { middleware } from '@/middleware'
export type Rootstate = ReturnType<typeof store.getState>

const rootReducer = combineReducers({
    ...slices
})

export function makeStore(preloadedState?: Partial<Rootstate>): ReturnType<typeof configureStore> {
    return (
        configureStore({
            reducer: rootReducer,
            middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat()
            
        })
    )
}


export const store = makeStore()
