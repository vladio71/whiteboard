import React, {useEffect, useMemo, useRef, useState} from "react";
import css from '../../../css/curves.module.css'
import {useResizeLogic} from "../Shape/useResizeLogic";
import {useAppDispatch, useAppSelector} from "../../../redux/hooks";
import {removeItem} from "../../../redux/Slices/itemsSlice";
import ControlPoint from "./ControlPoint";
import {useCurve} from "./useCurve";
import CurvePopUp from "./CurvePopUp/CurvePopUp";
// import {selectStyles} from "../../../redux/Slices/shapesSlice";
import RemoveObject from "../../layout/utils/RemoveObject";
import {
    bezier,
    calculatePointOnCurve,
    drawArrow,
    getDefaultBezierControlPoints,
    getPoints,
    makeHightOrderCurvePath
} from "./utils";
import {checkForBorders} from "../Drawing/useDrawing";
import PositionCanvasCurve from "./PositionCanvasCurve";
import useRefState from "../../../hooks/useRefState";
import {debounce, getDistance} from "../../../utils/utils";
import {getPointOnCurve} from "./CurvesCreationTool";


const CurveObject = ({
    curve,
}) => {

    const [update, setUpdate] = useState(false)
    const [updateTemplateFromCurve, setUpdateTemplateFromCurve] = useState(false)
    const [sample, setSample] = useRefState(curve)
    const [borders, setBorders] = useState({maxX: 0, maxY: 0, minX: 0, minY: 0})
    const container = useRef()
    const ref = useRef()
    const common = useAppSelector(state => state.present.common)
    const isUsable = common.tool
    const [mergedPoints, setMergedPoints] = useState([])
    const firstMount = useRef(true)


    useEffect(() => {
        setSample({
            ...sample.current,
            points: curve.points,
            style: curve.style,
            angle: curve.angle
        })
        setUpdate(!update)
        setUpdateTemplateFromCurve(!updateTemplateFromCurve)
    }, [curve.points, curve.style])


    const styleContainer = {
        left: `${borders.minX * common.scale}px`,
        top: `${borders.minY * common.scale}px`,
        width: `${Math.abs(borders.maxX - borders.minX) * common.scale}px`,
        height: `${Math.abs(borders.maxY - borders.minY) * common.scale}px`,
        // zIndex: 15
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
        container,
        isUsable,
        borders,
    )


    useResizeLogic(() => {
    }, handleUp, handleMove, down, toggle, isUsable)

    useEffect(() => {
        setBorders(checkForBorders(getPoints(plist.current.concat(additionalPoints))))
    }, [plist.current])


    function setAdditionalInterpolationPoints(p1, p2, numberOfIntervals, res, intervalId) {
        const dist = getDistance(p1, p2)
        if (dist > 200) {
            const count = Math.floor(dist / 200)
            const singleIntervalValue = 100 / numberOfIntervals
            const step = singleIntervalValue / (count + 1)
            const intervalStart = intervalId * singleIntervalValue - singleIntervalValue
            for (let i = 1; i < count + 1; i++) {
                const pointOnCurve = intervalStart + step * i
                res.push(calculatePointOnCurve(sample.current.points, pointOnCurve / 100))
            }
        }
    }

    function sequentiallyMergeArrays(arr1, arr2) {
        const numberOfIntervals = arr2.length + arr1.length - 1
        let res = []
        arr1.forEach((point, id) => {
            if (id !== 0) {
                setAdditionalInterpolationPoints(arr2[id - 1], point, numberOfIntervals, res, id * 2)
            }
            res.push(point)
            if (id !== arr1.length - 1) {
                setAdditionalInterpolationPoints(point, arr2[id], numberOfIntervals, res, id * 2 + 1)
                res.push(arr2[id])
            }
        })
        return res
    }


    // console.log(down)

    useEffect(() => {
        if ((!down || firstMount.current) && additionalPoints.length >= 1) {
            setMergedPoints(
                sequentiallyMergeArrays(plist.current, additionalPoints)
            )
            firstMount.current = false
        }
    }, [additionalPoints, plist.current])


    return (
        <>
            <RemoveObject removeFunc={removeItem} id={curve.id}>
                <div
                    ref={container}
                    style={{
                        ...styleContainer,
                        pointerEvents: "none"
                    }}
                    className={css.container}
                >
                    {(editMode && !down) &&
                        <div style={{
                            pointerEvents: "all"
                        }}>
                            <CurvePopUp curve={curve}/>
                        </div>
                    }

                    {curve?.selected &&
                        <div style={selectedStyle}/>
                    }

                </div>


                {(editMode && !down) &&
                    <>
                        {plist.current.map((p, i) => {
                            return <ControlPoint key={i} handleMouseDown={() => handleControlPointDown(i, p)}
                                                 point={p}/>
                        })}

                        {additionalPoints.map((p, i) => {
                            if (isAttachedBack.current && i === 0) {
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
                {mergedPoints && mergedPoints.map((p, i, arr) => {

                    if (i !== mergedPoints.length - 1) {
                        let p2 = arr[i + 1]
                        let delX = (p.x - arr[i + 1].x) * -1
                        let delY = p.y - arr[i + 1].y

                        function calcAngleDegrees(x, y) {
                            return (Math.atan2(y, x) * 180) / Math.PI;
                        }

                        const dist = Math.sqrt((Math.pow(p.x - p2.x, 2) + (Math.pow(p.y - p2.y, 2)))) * common.scale
                        const centerX = (((p.x + arr[i + 1].x) * common.scale) / 2 - dist / 2)
                        const centerY = (((p.y + arr[i + 1].y) * common.scale) / 2 - 30)
                        const angle = -calcAngleDegrees(delX, delY)
                        return <div
                            data-curvecontrols={true}
                            onMouseDown={handleMouseDown}
                            tabIndex={-1}
                            style={{
                                position: "absolute",
                                background: "transparent",
                                outline: "none",
                                width: dist,
                                height: 60,
                                transform: `translate(${centerX}px,${centerY}px) 
                             rotate(${angle}deg)`
                            }}>
                        </div>
                    }

                })}

                <PositionCanvasCurve
                    sample={sample}
                    curve={curve}
                    canvasRef={ref}
                    down={down}
                    common={common}
                    updateTemplateFromCurve={updateTemplateFromCurve}
                    handleMouseDown={handleMouseDown}
                    positionContainer={container}
                />
            </RemoveObject>
        </>
    )

}


export default CurveObject


