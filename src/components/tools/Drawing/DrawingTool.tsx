import React, {useEffect, useRef, useState} from "react";
import {useAppDispatch, useAppSelector} from "../../../redux/hooks";
import {useDrawing} from "./useDrawing";
import {selectDrawingStyle} from "redux/Slices/itemsSlice";
import {selectCommon} from "redux/Slices/commonSlice";

const DrawingTool = () => {


    const [ctx, setContext] = useState()
    const [down, setDown] = useState(false)


    const canvasRef = useRef()
    const hiddenCanvasRef = useRef()
    const brush = useAppSelector(state => state.present.items.brush)
    const common = useAppSelector(selectCommon)
    const drawingStyle = useAppSelector(state => selectDrawingStyle(state))
    const [delayedDown, setDelayedDown] = useState(false)
    const isUsed = common.tool === "Drawing"


    const {
        handleDown,
        handleMove,
        handleUp,
    } = useDrawing(brush, drawingStyle, canvasRef, hiddenCanvasRef, ctx, down, setDown)

    useEffect(() => {
        if (!down) {
            setTimeout(() => {
                setDelayedDown(down)
            }, 300)
        } else {
            setDelayedDown(down)
        }
    }, [down])


    useEffect(() => {
        if (isUsed) {
            const canvas = canvasRef.current
            const ctx = canvas.getContext('2d')
            setContext(ctx)
            window.addEventListener('mousedown', handleDown)
            if (down) {
                window.addEventListener('mousemove', handleMove)
            }
            window.addEventListener('mouseup', handleUp)
            return () => {
                window.removeEventListener('mousemove', handleMove)
                window.removeEventListener('mousedown', handleDown)
                window.removeEventListener('mouseup', handleUp)
            }
        }
    }, [down, isUsed, brush, drawingStyle])

    const style = {
        position: "fixed",
        display: down ? "block" : 'none',
        zIndex: 10,
    }

    return (
        <>
            <canvas style={style} ref={canvasRef}></canvas>
        </>
    )


}


export default DrawingTool