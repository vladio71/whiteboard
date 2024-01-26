import './globals.css'
import {Inter} from 'next/font/google'
import {Provider} from "react-redux";
import {PersistGate} from 'redux-persist/integration/react';
import React from "react";
import {persistor, store} from "../redux/store";
import Head from 'next/head'
import {Providers} from "../components/layout/utils/Providers"
import {Toaster} from "react-hot-toast";
import {Metadata} from "next";


const inter = Inter({subsets: ['latin']})

const toastOptions = {
    duration: 5000,
    success: {
        duration: 2000,
        style: {
            background: "green",
            color: "white"
        }
    },
    error: {
        style: {
            background: "red",
            color: "white"
        }
    },
    loading: {
        duration: 2000
    }
}

export const metadata: Metadata = {
    title: 'WhiteBoard',
}

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    return (

        <html lang="en" suppressHydrationWarning={true}>
        <Head>

            <title>WhiteBoard</title>
            <meta name="viewport"
                  content="user-scalable=no height=device-height, width=device-width,  initial-scale=1"/>

        </Head>
        <body className={inter.className}>
        <Toaster position="bottom-left"
                 toastOptions={toastOptions}
        />
        <Providers>
            {children}
        </Providers>
        </body>

        </html>


    )
}
