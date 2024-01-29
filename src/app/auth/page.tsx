"use client"
import React, {useEffect, useState} from 'react';
import css from './auth.module.css'
import AuthForm from "./AuthForm";
import {onAuthStateChanged} from "firebase/auth";
import {useAppDispatch, useAppSelector} from "../../redux/hooks";
import {auth} from "@/firebase/firebase";
import {useRouter, usePathname} from 'next/navigation'
import {setAuthStatus} from "../../redux/Slices/commonSlice";
import {createNewUser, signIn} from "@/firebase/auth";
import Image from "next/image";

const Page = () => {

    const dispatch = useAppDispatch()
    const [isSignUpOrSignIn, setIsSignUpOrSignIn] = useState(true)
    // const user = useAppSelector(state => state.present.auth.user)
    const router = useRouter()
    const pathname = usePathname()
    const [isSignedIn, setIsSignedIn] = useState(false)
    const [user, setUser] = useState(null)


    const blackBackground = {
        background: "var(--surface2-light)"
    }

    useEffect(() => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                setIsSignedIn(!isSignedIn)
                setUser(user.toJSON())
                // dispatch(setUser(user?.toJSON()))
            } else {
                setUser(null)
                router.push("/auth")
            }
        });
    }, [])


    useEffect(() => {
        if (auth.currentUser?.emailVerified && pathname === "/auth") {
            router.push("/")
        }
    }, [auth.currentUser?.emailVerified, isSignedIn])


    function handleSignUp(values) {
        dispatch(setAuthStatus(true))
        createNewUser(values.email, values.password).then(res => {
            dispatch(setAuthStatus(false))
        }
    }

    function handleSignIn(values) {
        dispatch(setAuthStatus(true))
        signIn(values.email, values.password).then(res => {
            dispatch(setAuthStatus(false))
            if (res?.emailVerified)
                router.push("/")
        })

    }


    function setSignUpMode() {
        setIsSignUpOrSignIn(true)
    }

    function setSignInMode() {
        setIsSignUpOrSignIn(false)
    }


    return (
        <div className={css.Wrapper}>
            <div className={css.background}>
                <div className={css.authCard}>
                    <div className={css.authHeader}>
                        <div
                            onClick={setSignUpMode}
                            style={isSignUpOrSignIn ? blackBackground : {}}
                            className={css.leftButton}>Sign Up
                        </div>
                        <div
                            onClick={setSignInMode}
                            style={!isSignUpOrSignIn ? blackBackground : {}}
                            className={css.rightButton}>Sign In
                        </div>
                    </div>
                    {isSignUpOrSignIn ?
                        <AuthForm user={user} callback={handleSignUp}/>
                        :
                        <AuthForm user={user} callback={handleSignIn}/>

                    }
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