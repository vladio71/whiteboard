import React, {useEffect, useRef, useState} from "react";
import {useCanvas} from "../Shape/shapes/useCanvas";
import css from '../../../css/curves.module.css'
import {useResizeLogic} from "../Shape/useResizeLogic";
import {useAppDispatch, useAppSelector} from "../../../redux/hooks";
import {removeCurve} from "../../../redux/Slices/curvesSlice";
import ControlPoint from "./ControlPoint";
import {useCurve} from "./useCurve";
import CurvePopUp from "./CurvePopUp/CurvePopUp";
import {selectStyles} from "../../../redux/Slices/shapesSlice";
import RemoveObject from "../../layout/utils/RemoveObject";
import {drawArrow, getDefaultBezierControlPoints, makeHightOrderCurvePath} from "./utils";

const CurveObject = ({curve, isUsable, handleTop, handleBottom}) => {


    const [sample, setSample] = useState(curve)
    const [borders, setBorders] = useState({maxX: 0, maxY: 0, minX: 0, minY: 0})
    const container = useRef()
    const style = useAppSelector(state => selectStyles(state, curve.id, "curves"))
    const common = useAppSelector(state => state.present.common)


    useEffect(() => {
        setSample({
            ...sample,
            points: curve.points
        })
    }, [curve.points])


    const styleContainer = {
        left: `${borders.minX * common.scale}px`,
        top: `${borders.minY * common.scale}px`,
        width: `${Math.abs(borders.maxX - borders.minX) * common.scale}px`,
        height: `${Math.abs(borders.maxY - borders.minY) * common.scale}px`,
    }
    const selectedStyle = {
        left: -10,
        top: -10,
        display: 'block',
        width: `${(borders.maxX - borders.minX) * common.scale + 20}px`,
        height: `${(borders.maxY - borders.minY) * common.scale + 20}px`,
        position: "absolute",
        border: "1px solid blue",
    }


    function draw(c, ctx, end = null) {
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
        const pointsForRender = getPoints(c.points).map((p, id) => {
            return {
                x: (p.x - borders.minX) * common.scale + 200,
                y: (p.y - borders.minY) * common.scale + 200
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
        ctx.stroke(cur)
        drawArrow(ctx, c.angle, pointsForRender[pointsForRender.length - 1])
    }


    function getBorders(plist) {
        let pointsList = getPoints(plist)
        let minX = pointsList[0].x
        let minY = pointsList[0].y
        let maxX = pointsList[0].x
        let maxY = pointsList[0].y
        pointsList.forEach(p => {
            if (p.x > maxX)
                maxX = p.x
            if (p.y > maxY)
                maxY = p.y
            if (p.x < minX)
                minX = p.x
            if (p.y < minY)
                minY = p.y
        })
        setBorders({maxX, maxY, minX, minY})
        return {
            x: minX - 10,
            y: minY - 10,
            w: Math.abs(maxX - minX) + 20,
            h: Math.abs(maxY - minY) + 20
        }

    }


    const ref = useCanvas(draw.bind(null, sample), borders)
    const {
        additionalPoints,
        plist,
        getPoints,
        handleMove,
        handleUp,
        handleMouseDown,
        handleControlPointDown,
        editMode,
        toggle,
        down,
        isAttachedBack
    } = useCurve(
        curve,
        ref,
        sample,
        setSample,
        draw,
        container,
        getBorders,
        isUsable,
        handleTop,
        borders,
        handleBottom
    )


    useResizeLogic(() => {
    }, handleUp, handleMove, down, toggle, isUsable)


    useEffect(() => {
        if (plist.length > 0) {
            getBorders(plist.concat(additionalPoints))
        }
    }, [sample])


    return (
        <>
            <RemoveObject removeFunc={removeCurve} id={curve.id}>
                <div ref={container} tabIndex={1}
                     style={styleContainer}
                     className={css.container}
                     onMouseDown={handleMouseDown}

                >

                    {(editMode && !down) &&
                        <CurvePopUp curve={curve}/>
                    }


                    {curve?.selected &&
                        <div style={selectedStyle}/>
                    }

                </div>


                {(editMode && !down) &&
                    <>
                        {plist.map((p, i) => {
                            return <ControlPoint key={i} handleMouseDown={() => handleControlPointDown(i, p)}
                                                 point={p}/>
                        })}

                        {additionalPoints.map((p, i) => {
                            if (isAttachedBack && i === 0) {
                            } else {
                                return <ControlPoint
                                    key={i}
                                    additional={true}
                                    handleMouseDown={() => handleControlPointDown('a' + i)}
                                    point={p}/>
                            }

                        })}

                    </>
                }

                <PositionCanvas borders={borders} common={common}>
                    <canvas ref={ref}/>
                </PositionCanvas>
            </RemoveObject>
        </>
    )
}

const PositionCanvas = ({borders, common, children}) => {

    const PositionStyle = {
        position: "absolute",
        top: `${(borders.minY) * common.scale - 200}px`,
        left: `${(borders.minX) * common.scale - 200}px`
    }


    return (
        <div style={PositionStyle}>
            {children}
        </div>

    )
}

export default CurveObject


