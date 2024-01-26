import React, {useContext, useEffect, useRef, useState} from 'react';
import 'app/globals.css'
import css from './zoomBar.module.css'
import comCss from 'css/common.module.css'
import ContainerPopUp from "../EditingPopUp/ContainerPopUp";
import {LevelContext} from "app/page";
import ThemeSwitch from "components/layout/utils/ThemeSwitch";
import {debounce, preventTools} from "app/utils/utils";
import {setWhiteboardData} from "redux/Slices/shapesSlice";
import {useAppDispatch} from "redux/hooks";
import {setTimeout} from "timers";
import { AiOutlineSave } from "react-icons/ai"
import { GoPlus } from "react-icons/go";
import { FiMinus } from "react-icons/fi";




const ZoomBar = ({common}) => {

    const {zoomId, setZoomId} = useContext(LevelContext)
    const tableRef = useRef(null)
    const dispatch = useAppDispatch()
    const [timer, setTimer] = useState(false)

    useEffect(() => {
        if (tableRef.current) {
            tableRef.current.addEventListener('mouseup', preventTools)
            tableRef.current.addEventListener('mousedown', preventTools)
        }
    }, [])

    const zoomInHandler = () => {
        if (zoomId < 8)
            setZoomId(zoomId + 1)
    }
    const zoomOutHandler = () => {
        if (zoomId > 0)
            setZoomId(zoomId - 1)
    }

    const saveProgressHandler = debounce(() => {
        setTimer(true)
        dispatch(setWhiteboardData())
        setTimeout(() => {
            setTimer(false)
        }, 5000)
    }, 200)


    return (
        <div className={css.container} ref={tableRef}>

            <ContainerPopUp width={270} height={'2.5rem'}>
                <div className={`${css.flexZoom}`}>
                    <button className={comCss.button} onClick={zoomOutHandler}>
                        <FiMinus  style={{
                            fontSize: ".7rem"
                        }}/>
                    </button>
                    {Math.round(common.scale * 100)}%
                    <button className={comCss.button} onClick={zoomInHandler}>
                        <GoPlus style={{
                            fontSize: ".7rem"
                        }}/>
                    </button>
                    <button className={comCss.button} onClick={saveProgressHandler} disabled={timer}>
                        <AiOutlineSave/>
                    </button>
                    <ThemeSwitch/>
                </div>
            </ContainerPopUp>

        </div>
    );
};

export default ZoomBar;