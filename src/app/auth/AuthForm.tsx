import React, {useEffect, useReducer, useState} from 'react';
import {createNewUser, removeUser, signIn, signInWithGoogle} from "../../firebase/auth";
import css from './auth.module.css'
import {Formik, Form, Field} from 'formik';
import Letter from "../../../public/letter.svg";
import google from "../../../public/google.svg";
import * as Yup from 'yup';
import Image from "next/image";
import {setAuthStatus} from "../../redux/Slices/commonSlice";
import {useAppDispatch, useAppSelector} from "../../redux/hooks";
import {auth} from "@/firebase/firebase"
import {useRouter} from "next/navigation";
import {onAuthStateChanged} from "firebase/auth";

const SignupSchema = Yup.object().shape({
    email: Yup.string().email('Invalid email').required('Required'),
    password: Yup.string()
        .min(8, 'Too Short!')
        .max(50, 'Too Long!')
        .required('Required'),
});


export const AuthForm = (
    {
        user,
        callback
    }) => {
    const router = useRouter()
    const dispatch = useAppDispatch()
    const [isSignUpOrSignIn, setIsSignUpOrSignIn] = useState(true)
    const [isSignedIn, setIsSignedIn] = useState(false)


    useEffect(() => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                setIsSignedIn(!isSignedIn)
                // setUser(user.toJSON())
                // dispatch(setUser(user?.toJSON()))
            } else {
                // setUser(null)
                router.push("/auth")
            }
        });
    }, [])


    useEffect(() => {
        // if (auth.currentUser?.emailVerified && pathname === "/auth") {
        if (auth.currentUser?.emailVerified) {
            router.push("/menu")
        }
    }, [auth.currentUser])

    const handleBack = () => {
        removeUser()
    }

    function setSignUpMode() {
        setIsSignUpOrSignIn(true)
    }

    function setSignInMode() {
        setIsSignUpOrSignIn(false)
    }

    const blackBackground = {
        background: "var(--surface2-light)"
    }

    function handleSignUp(values) {
        dispatch(setAuthStatus(true))
        createNewUser(values.email, values.password).then(res => {
            dispatch(setAuthStatus(false))
        })
    }

    function handleSignIn(values) {
        dispatch(setAuthStatus(true))
        signIn(values.email, values.password).then(res => {
            dispatch(setAuthStatus(false))
            if (res?.emailVerified)
                router.push("/menu")
        })

    }

    return (
        <>
            <div className={css.authHeader}>

                <div
                    onClick={setSignUpMode}
                    style={isSignUpOrSignIn ? blackBackground : {}}
                    className={css.leftButton}>
                    Sign Up
                </div>
                <div
                    onClick={setSignInMode}
                    style={!isSignUpOrSignIn ? blackBackground : {}}
                    className={css.rightButton}>Sign In
                </div>
            </div>
            {auth?.currentUser ?
                <>
                    {!auth?.currentUser.emailVerified ?
                        <div className={css.emailVerification}>
                            <Image src={Letter} width={100} height={100} alt="svg letter"/>
                            <div>
                                Check you Email to verify account!
                            </div>
                            <button onClick={handleBack} className={css.form_submit}>Back</button>
                        </div>
                        :
                        <div>
                            Redirecting...
                        </div>
                    }
                </>
                :
                <EmailAndPasswordForm onSubmit={isSignUpOrSignIn ? handleSignUp : handleSignIn}/>
            }


        </>
    )
}


const EmailAndPasswordForm = ({onSubmit}) => {
    const isLoading = useAppSelector(state => state.present.common.isAuthLoading)
    return (
        <Formik
            initialValues={{
                email: '',
                password: '',
            }}
            validationSchema={SignupSchema}
            onSubmit={onSubmit}
        >
            {({errors, touched}) => (
                <Form className={css.form}>

                    <button onClick={signInWithGoogle} className={css.withGoogle}>
                        <Image src={google} width={20} height={20} alt={'googleIcon'}/>
                        Sign In with Google
                    </button>
                    <div className={css.divider}>Or</div>
                    <div>
                        <Field name="email" type="email"/>
                        {errors.email && touched.email ? <div>{errors.email}</div> : null}
                    </div>
                    <div>
                        <Field name="password"/>
                        {errors.password && touched.password ? (
                            <div>{errors.password}</div>
                        ) : null}
                    </div>

                    {isLoading ?

                        <button type="submit"
                                disabled={true}
                                style={{
                                    color: "#a8a8a8"
                                }} className={css.form_submit}>Submit
                            {/*<div className={css.loadingAnimation}/>*/}
                            <div style={{
                                position: "relative",
                                top: '-.1rem'
                            }}>
                                <LoadingAnimation/>
                            </div>
                        </button>
                        :
                        <button type="submit" className={css.form_submit}>Submit</button>
                    }
                </Form>
            )}
        </Formik>
    )
}

export const LoadingAnimation = () => {
    return (
        <>
            <div className={css.loadingAnimation}/>
        </>
    )
}


export default AuthForm;