import './globals.css'
import {Inter} from 'next/font/google'
import React from "react";
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
        {/*<Head>*/}
        {/*    /!*<script src="http://localhost:8097"></script>*!/*/}

        {/*    <title>WhiteBoard</title>*/}
        {/*    <meta name="viewport"*/}
        {/*          content="user-scalable=no height=device-height, width=device-width,  initial-scale=1"/>*/}

        {/*</Head>*/}
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
