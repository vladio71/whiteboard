import React, {memo, useContext, useEffect, useRef} from "react";
import ContainerResizeComponent from "../DndResizeRotateContainer/ContainerResizeComponent";
import {removeDrawing, updateDrawing} from "../../../redux/Slices/drawingSlice";
import RemoveObject from "../../layout/utils/RemoveObject";
import {useAppDispatch, useAppSelector} from "../../../redux/hooks";
import {setRectPath, setShapeInfo} from "components/tools/Shape/shapes/Rectangle";


const DrawingObject = ({drawing, isUsable}) => {

    const dispatch = useAppDispatch()


    function saveChangesDrawing(object) {
        dispatch(updateDrawing(object))
    }

    return (
        <RemoveObject key={drawing.id} removeFunc={removeDrawing} id={drawing.id}>
            <ContainerResizeComponent
                isUsable={isUsable}
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
        const scaleX = object.w / object.startW
        const scaleY = object.h / object.startH
        canvas.width = (object.w + 15) * (common.scale)
        canvas.height = (object.h + 15) * (common.scale)


        var img = new Image;
        img.src = object.dataUrl;

        console.log(common.theme)

        if (common.theme === "dark")
            ctx.filter = 'invert(1)'
        ctx.transform(scaleX * (common.scale), 0, 0, scaleY * (common.scale), 0, 0)


        if (img.complete) {
            ctx.drawImage(img, 0, 0)
        } else {
            img.onload = function () {
                ctx.drawImage(img, 0, 0)

            }
        }
        setRectPath(dispatch, object, "d" + object.id)

    }, [object.center.x, object.center.y, object.angle, object.style, object.down, common.scale, common.theme])

    const urlImageStyle = {
        position: "absolute",
        left: (object.x) * common.scale - 10,
        top: (object.y) * common.scale - 10,
        width: object.w + 20,
        height: object.h + 20

    }

    return (
        <>
            <div style={urlImageStyle}>
                <canvas style={{
                    transform: `rotate(${object.angle}deg)`
                }} ref={canvasRef}></canvas>
            </div>


        </>
    )
}


export default DrawingObject


