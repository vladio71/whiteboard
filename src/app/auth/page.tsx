'use client'
import React, {Suspense} from 'react';
import css from './auth.module.css'
import Image from "next/image";
import AuthForm from "./AuthForm";

const Page = () => {


    return (
        <div className={css.Wrapper}>
            <div className={css.background}>
                <div className={css.authCard}>
                    <AuthForm/>
                </div>
            </div>
            <div className={css.backImage}>
                <Image src={'https://ucarecdn.com/52d4790f-9ab2-4ba9-828b-3b49a970b773/'}
                       alt={'backImage'}
                       quality="100"
                       fill={true}
                       priority={true}
                       sizes="(max-width: 600px) 600px,(max-width: 1000px) 1000px, (max-width: 1200px) 1200px, 100vw"
                />
            </div>

        </div>
    );
};


export default Page;