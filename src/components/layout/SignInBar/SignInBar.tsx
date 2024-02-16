import React, {useEffect, useRef} from 'react';
import css from './signIn.module.css'
import comCss from 'css/common.module.css'
import ContainerPopUp from "../EditingPopUp/ContainerPopUp";
import {CiLocationArrow1} from "react-icons/ci";
import Link from "next/link";
import {auth} from "@/firebase/firebase";
import usePreventOutsideMouseEvents from "app/hooks/usePreventMouseEvents";


const SignInBar = () => {

    const tableRef = usePreventOutsideMouseEvents()

    const isSignedIn = !!auth.currentUser
    return (
        <div className={css.signInBar} ref={tableRef}>
            <ContainerPopUp width={'fit-content'} height={'50px'} isBottomPositioned={false}>
                <div className={css.signInBar_content} style={{
                    width: `${isSignedIn ? '200px' : '300px'}`
                }}>
                    {isSignedIn ?
                        <>
                            <span>Back to menu</span>
                            <Link className={comCss.button} href={`/menu`}>
                                <CiLocationArrow1/>
                            </Link>
                        </>
                        :
                        <>
                            <span>Sign in for multiple boards!</span>
                            <Link className={comCss.button} href={`/auth`}>
                                <CiLocationArrow1/>
                            </Link>
                        </>
                    }

                </div>
            </ContainerPopUp>
        </div>
    );
};

export default SignInBar;