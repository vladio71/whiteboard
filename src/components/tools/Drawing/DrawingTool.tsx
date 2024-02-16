import React, {useEffect, useRef, useState} from "react";
import {useAppDispatch, useAppSelector} from "../../../redux/hooks";
import {useDrawing} from "./useDrawing";
import {selectDrawings, selectDrawingStyle} from "redux/Slices/drawingSlice";
import {selectCommon} from "redux/Slices/commonSlice";

const DrawingTool = ({isUsed}) => {


    const [ctx, setContext] = useState()
    const [down, setDown] = useState(false)


    const canvasRef = useRef()
    const hiddenCanvasRef = useRef()
    const drawings = useAppSelector(selectDrawings)
    const brush = useAppSelector(state => state.present.drawing.brush)
    const common = useAppSelector(selectCommon)
    const drawingStyle = useAppSelector(state => selectDrawingStyle(state))
    const [delayedDown, setDelayedDown] = useState(false)


    const {
        handleDown,
        handleMove,
        handleUp,
        toggle,
    } = useDrawing(brush, drawingStyle, canvasRef, hiddenCanvasRef, ctx, down, setDown)

    useEffect(() => {
        if (!down) {
            setTimeout(()=>{
                setDelayedDown(down)
            },200)
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
        display: delayedDown ? "block" : 'none',
        zIndex: 10,
    }

    return (
        <>
            <canvas style={style} ref={canvasRef}></canvas>
        </>
    )


}


export default DrawingTool