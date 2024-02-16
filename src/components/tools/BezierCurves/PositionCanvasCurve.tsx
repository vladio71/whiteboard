import {useAppSelector} from "../../../redux/hooks";
import {selectStyles} from "../../../redux/Slices/shapesSlice";
import React, {useEffect, useRef} from "react";
import {checkForBorders} from "../Drawing/useDrawing";
import {drawArrow, getDefaultBezierControlPoints, getPoints, makeHightOrderCurvePath} from "./utils";


// let canvas, ctx
const PositionCanvasCurve = ({canvasRef, sample, down, common}) => {


    const requestAnimationFrameRef = useRef(0)
    const borders = useRef(checkForBorders(getPoints(sample.current.points)))
    const context = useRef(null)
    const downRef = useRef(false)
    const positionContainer = useRef(null)


    useEffect(() => {
        if (canvasRef?.current) {
            context.current = canvasRef.current.getContext("2d")
        }
    }, [canvasRef.current])


    const loop = () => {
        if (context.current) {
            canvasRef.current.width = (borders.current.maxX - borders.current.minX) * common.scale + 400
            canvasRef.current.height = (borders.current.maxY - borders.current.minY) * common.scale + 400
            borders.current = checkForBorders(getPoints(sample.current.points))
            if (positionContainer.current) {
                positionContainer.current.style.transform = `translate(${(borders.current?.minX) * common.scale - 200}px,${(borders.current?.minY) * common.scale - 200}px)`
            }
            draw(sample.current, context.current, borders)
        }

        if (downRef.current)
            requestAnimationFrameRef.current = requestAnimationFrame(loop)
    }

    useEffect(() => {
        downRef.current = down
        if (down) {
            loop()
        } else {
            loop()
            cancelAnimationFrame(requestAnimationFrameRef.current)
        }
        return ()=>{
            cancelAnimationFrame(requestAnimationFrameRef.current)
        }
    }, [down, common.scale, sample.current.style, common.theme])



    function draw(c, ctx, bords, end = null) {
        const style = sample.current?.style
        if (style?.line) {
            if (style.line < 2) {

                ctx.setLineDash([5, 15]);
            } else {
                ctx.setLineDash([3, 3]);

            }
        }
        ctx.strokeStyle = style?.background
        ctx.fillStyle = style?.background
        const cur = new Path2D()
        const pointsForRender = getPoints(c.points)
            .map((p, id) => {
                return {
                    x: (p.x - bords.current.minX) * common.scale + 200,
                    y: (p.y - bords.current.minY) * common.scale + 200
                }
            })

        if (pointsForRender.length === 2) {
            const {
                cp1,
                cp2
            } = getDefaultBezierControlPoints(pointsForRender[0], pointsForRender[pointsForRender.length - 1])
            pointsForRender.splice(1, 0, cp1, cp2)
        }
        makeHightOrderCurvePath(cur, pointsForRender)



        if (common.theme === "dark")
            ctx.filter = 'invert(1)'
        ctx.lineWidth = style?.thickness * 30 / 3 < 1 ? 1 : style?.thickness * 30 / 3
        ctx.stroke(cur);
        drawArrow(ctx, c.angle, pointsForRender[pointsForRender.length - 1])
    }

    const PositionStyle = {
        position: "absolute",
        zIndex: -10,
        transform: `translate(${(borders.current?.minX) * common.scale - 200}px,${(borders.current?.minY) * common.scale - 200}px)`,
        transition: '0s'
    }

    return (
        <div style={PositionStyle} ref={positionContainer}>
            <canvas ref={canvasRef}/>
        </div>

    )
}

export default PositionCanvasCurve