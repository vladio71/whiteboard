import React, {useContext, useEffect, useRef} from "react";
import {ObjectContext} from "../DndResizeRotateContainer/ContainerResizeComponent";


const Draw = ({draw}) => {


    const canvasRef = useRef()
    const object = useContext(ObjectContext)


    useEffect(() => {
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
        draw(object, ctx)
    }, [object])


    return (

        <>
            <canvas ref={canvasRef}></canvas>
        </>
    )
}

export default Draw


