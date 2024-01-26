'use client'

import {combineReducers, configureStore} from '@reduxjs/toolkit'
import undoable, {includeAction} from 'redux-undo';
import shapeReducer, {updateShape, addShape, addStyle, removeShape} from './Slices/shapesSlice'
import curveReducer, {updateCurve, addCurve} from './Slices/curvesSlice'
import commonReducer from './Slices/commonSlice'
import drawingReducer, {updateDrawing, addDrawing, removeDrawing} from './Slices/drawingSlice'
import textReducer, {updateTextObject, addText} from './Slices/textSlice'
import {FLUSH, PAUSE, PERSIST, PURGE, REGISTER, REHYDRATE} from "redux-persist/es/constants";
import storage from 'redux-persist/lib/storage';
import {persistReducer, persistStore} from "redux-persist";


const rootReducer = undoable(combineReducers({
        common: commonReducer,
        shape: shapeReducer,
        text: textReducer,
        curve: curveReducer,
        drawing: drawingReducer,
    }),
    {
        limit: 12,
        filter: includeAction([
            updateShape.type,
            addShape.type,
            removeShape.type,
            addStyle.type,
            updateCurve.type,
            addCurve.type,
            updateDrawing.type,
            addDrawing.type,
            removeDrawing.type,
            updateTextObject.type,
            addText.type
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
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }),
})

export const persistor = persistStore(store, {
    // manualPersist: true
});



export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch