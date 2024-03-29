import React, {memo, useContext, useEffect, useMemo, useRef} from "react";
import ContainerResizeComponent from "../DndResizeRotateContainer/ContainerResizeComponent";
import RemoveObject from "../../layout/utils/RemoveObject";
import {useAppDispatch, useAppSelector} from "../../../redux/hooks";
import {setRectPath, setShapeInfo} from "components/tools/Shape/shapes/Rectangle";
import {drawPoints, getLineWidth, midPointBtw} from "./useDrawing";
import {getUpdates, removeItem, updateItem} from "redux/Slices/itemsSlice";


const DrawingObject = ({drawing}) => {

    const dispatch = useAppDispatch()


    function saveChangesDrawing(object) {
        dispatch(updateItem(getUpdates(object)))
    }

    return (
        <RemoveObject key={drawing.id} removeFunc={removeItem} id={drawing.id}>
            <ContainerResizeComponent
                editorObject={drawing}
                saveChanges={saveChangesDrawing}
                renderProp={(object) => <DrawingImage object={object}/>}
            />
        </RemoveObject>
    )
}


const DrawingImage = ({object}) => {


    const canvasRef = useRef()
    const dispatch = useAppDispatch()
    const common = useAppSelector(state => state.present.common)


    useEffect(() => {
        const canvas: HTMLCanvasElement = canvasRef.current
        const ctx: CanvasRenderingContext2D = canvas.getContext('2d')
        const scaleX = (object.w +20)/ (object.startW+20)
        const scaleY = (object.h +20)/ (object.startH+20)
        canvas.width = (object.w + 20) * (common.scale)
        canvas.height = (object.h + 20) * (common.scale)
        ctx.lineJoin = 'round'
        ctx.lineCap = "round";

        if (common.theme === "dark")
            ctx.filter = 'invert(1)'
        ctx.transform(scaleX * (common.scale), 0, 0, scaleY * (common.scale), 0, 0)

        ctx.strokeStyle = object.color
        ctx.lineWidth = getLineWidth(object.thickness, common.scale)

        drawPoints([...object.points], ctx)
        setRectPath(dispatch, object, object.id)

    }, [object.x, object.y, object.h, object.w, object.angle, object.style, object.down, common.scale, common.theme])

    const urlImageStyle = {
        position: "absolute",
        left: 90,
        top: 90,
    }

    return (
        <>
            <div style={urlImageStyle}>
                <canvas style={{
                    // transform: `rotate(${object.angle}deg)`
                }} ref={canvasRef}></canvas>
            </div>


        </>
    )
}


export default DrawingObject


