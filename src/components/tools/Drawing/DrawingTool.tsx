import React, {useEffect, useRef, useState} from "react";
import {useAppDispatch, useAppSelector} from "../../../redux/hooks";
import {useDrawing} from "./useDrawing";
import {selectDrawings} from "redux/Slices/drawingSlice";
import {selectCommon} from "redux/Slices/commonSlice";

const DrawingTool = ({isUsed}) => {


    const [ctx, setContext] = useState()
    const [down, setDown] = useState(false)


    const canvasRef = useRef()
    const hiddenCanvasRef = useRef()
    const drawings = useAppSelector(selectDrawings)
    const brush = useAppSelector(state => state.present.drawing.brush)
    const common = useAppSelector(selectCommon)


    const {
        handleDown,
        handleMove,
        handleUp,
        toggle,
    } = useDrawing(brush, canvasRef, hiddenCanvasRef, ctx, down, setDown)

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
    }, [down, toggle, isUsed, brush, drawings])

    const style = {
        position: "absolute",
        left: `${common.scrollX}px`,
        top: `${common.scrollY}px`,
        display: "block",
        cursor: "crosshair",

    }


    return (
        <>
            <canvas  style={style} ref={canvasRef}></canvas>
            <div
                style={{visibility: "hidden"}}
            >
                <canvas ref={hiddenCanvasRef}></canvas>
            </div>
        </>


    )


}


export default DrawingTool