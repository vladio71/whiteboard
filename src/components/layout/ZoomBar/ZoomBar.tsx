import React, {useContext, useEffect, useRef, useState} from 'react';
import 'app/globals.css'
import css from './zoomBar.module.css'
import comCss from 'css/common.module.css'
import ContainerPopUp from "../EditingPopUp/ContainerPopUp";
import ThemeSwitch from "components/layout/utils/ThemeSwitch";
import {debounce, preventTools} from "utils/utils";
import {setWhiteboardData} from "redux/Slices/itemsSlice";
import {useAppDispatch, useAppSelector} from "redux/hooks";
import {setTimeout} from "timers";
import {AiOutlineSave} from "react-icons/ai"
import {GoPlus} from "react-icons/go";
import {FiMinus} from "react-icons/fi";
import usePreventOutsideMouseEvents from "../../../hooks/usePreventMouseEvents";
import {selectCommon, updateZoom} from "../../../redux/Slices/commonSlice";


const ZoomBar = () => {

    const common = useAppSelector(selectCommon)
    const dispatch = useAppDispatch()
    const zoomId = common.zoomId
    const [timer, setTimer] = useState(false)

    const tableRef = usePreventOutsideMouseEvents()

    const zoomInHandler = () => {
        if (zoomId < 8)
            dispatch(updateZoom(zoomId + 1))
    }
    const zoomOutHandler = () => {
        if (zoomId > 0)
            dispatch(updateZoom(zoomId - 1))
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

            <ContainerPopUp width={270} height={'2.5rem'} isBottomPositioned={false}>
                <div className={`${css.flexZoom}`}>
                    <button className={comCss.button} onClick={zoomOutHandler}>
                        <FiMinus style={{
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