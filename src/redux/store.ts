'use client'

import {combineReducers, configureStore} from '@reduxjs/toolkit'
import undoable, {groupByActionTypes, includeAction} from 'redux-undo';
// import curveReducer, {updateCurve, addCurve} from './Slices/curvesSlice'
import commonReducer from './Slices/commonSlice'
// import drawingReducer, {updateDrawing, addDrawing, removeDrawing} from './Slices/drawingSlice'
// import textReducer, {updateTextObject, addText} from './Slices/textSlice'
import {FLUSH, PAUSE, PERSIST, PURGE, REGISTER, REHYDRATE} from "redux-persist/es/constants";
import storage from 'redux-persist/lib/storage';
import {persistReducer, persistStore} from "redux-persist";
import ItemsReducer, {addItem, removeItem, setItem, updateItem} from "./Slices/itemsSlice";
import {batchGroupBy} from "../utils/batchGroupBy";
import {lastActionMiddleware} from "./middleware/getLastAction";
// import {ignoreSerializableCheck} from "./middleware/ignoreSerializableWarnings";


const rootReducer = undoable(combineReducers({
        common: commonReducer,
        items: ItemsReducer,
    }),
    {
        limit: 15,
        // groupBy: groupByActionTypes([updateItem.type, setItem.type]),
        groupBy: batchGroupBy.init(['SOME_ACTION']),

        filter: includeAction([
            addItem.type,
            removeItem.type,
            updateItem.type,
            setItem.type
        ]),
    })


const persistConfig = {
    timeout: 2000,
    key: 'root',
    storage,
    whitelist: ['present']
};

const persistedReducer = persistReducer(persistConfig, rootReducer);




export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: false
    }).concat(lastActionMiddleware),
})

export const persistor = persistStore(store);


export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch