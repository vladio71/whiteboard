'use client'
import React from 'react';
import {ThemeProvider} from 'next-themes'
import {persistor, store} from "../../../redux/store";
import {Provider} from "react-redux";
import {PersistGate} from "redux-persist/integration/react";

export function Providers({children}) {
    return (

        <ThemeProvider
            enableSystem={true}>
            <Provider store={store}>
                <PersistGate loading={null} persistor={persistor}>
                    {children}
                </PersistGate>
            </Provider>
        </ThemeProvider>
    );
};

