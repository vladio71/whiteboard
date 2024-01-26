import React, {useReducer, useState} from 'react';
import {removeUser, signInWithGoogle} from "../../firebase/auth";
import css from './auth.module.css'
import {Formik, Form, Field} from 'formik';
import Letter from "../../../public/letter.svg";
import google from "../../../public/google.svg";
import * as Yup from 'yup';
import Image from "next/image";
import {setAuthStatus} from "../../redux/Slices/commonSlice";
import {useAppDispatch, useAppSelector} from "../../redux/hooks";
import {auth} from "@/firebase/firebase"

const SignupSchema = Yup.object().shape({
    email: Yup.string().email('Invalid email').required('Required'),
    password: Yup.string()
        .min(8, 'Too Short!')
        .max(50, 'Too Long!')
        .required('Required'),
});


const AuthForm = ({user, callback}) => {


    const dispatch = useAppDispatch()
    const [, forceUpdate] = useReducer(x => x + 1, 0);


    const handleBack = () => {
        removeUser()
    }

    return (
        <>

            {user?
                <>
                    {!auth?.currentUser.emailVerified ?
                        <div className={css.emailVerification}>
                            <Image src={Letter}  width={100} height={100} alt="svg letter"/>
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
                <EmailAndPasswordForm onSubmit={callback}/>
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
                            <div className={css.loadingAnimation}/>
                        </button>
                        :
                        <button type="submit" className={css.form_submit}>Submit</button>
                    }
                </Form>
            )}
        </Formik>
    )
}


export default AuthForm;