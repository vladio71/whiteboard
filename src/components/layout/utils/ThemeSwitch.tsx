'use client'
import React, {useEffect, useState} from 'react';
import {FaMoon, FaSun} from "react-icons/fa";
import {useTheme} from "next-themes"
import {useAppDispatch} from "redux/hooks";
import {updateTheme} from 'redux/Slices/commonSlice'
import css from 'css/common.module.css'

const storageKey = 'theme-preference'


const ThemeSwitch = () => {


    const dispatch = useAppDispatch()

    const {theme, setTheme, systemTheme} = useTheme()

    useEffect(() => {
        const preference = localStorage.getItem(storageKey) || systemTheme
        if (preference) {
            setTheme(preference)
            dispatch(updateTheme(preference))
        }

    }, [])

    const handleThemeSwitch = (theme) => {
        setTheme(theme)
        dispatch(updateTheme(theme))
        localStorage.setItem(storageKey, theme)
    }


    return (
        <>
            {theme === "dark" &&
                <div className={css.button}>
                    <FaSun onClick={() => handleThemeSwitch("light")}/>
                </div>
            }

            {theme === "light" &&
                <div className={css.button}>

                    <FaMoon onClick={() => handleThemeSwitch("dark")}/>
                </div>
            }

        </>
    );
};

export default ThemeSwitch;