import React, {useEffect, useRef, useState} from "react";
import css from '../../../css/curves.module.css'
import {useResizeLogic} from "../Shape/useResizeLogic";
import {useAppDispatch, useAppSelector} from "../../../redux/hooks";
import {removeItem} from "../../../redux/Slices/itemsSlice";
import ControlPoint from "./ControlPoint";
import {useCurve} from "./useCurve";
import CurvePopUp from "./CurvePopUp/CurvePopUp";
// import {selectStyles} from "../../../redux/Slices/shapesSlice";
import RemoveObject from "../../layout/utils/RemoveObject";
import {drawArrow, getDefaultBezierControlPoints, getPoints, makeHightOrderCurvePath} from "./utils";
import {checkForBorders} from "../Drawing/useDrawing";
import PositionCanvasCurve from "./PositionCanvasCurve";
import useRefState from "../../../hooks/useRefState";


const CurveObject = ({
    curve,
    isUsable,
}) => {

    const [update, setUpdate] = useState(false)
    const [sample, setSample] = useRefState(curve)
    const [borders, setBorders] = useState({maxX: 0, maxY: 0, minX: 0, minY: 0})
    const container = useRef()
    const ref = useRef()
    const common = useAppSelector(state => state.present.common)


    useEffect(() => {
        setSample({
            ...sample.current,
            points: curve.points,
            style: curve.style
        })
        setUpdate(!update)
    }, [curve.points, curve.style])


    const styleContainer = {
        left: `${borders.minX * common.scale}px`,
        top: `${borders.minY * common.scale}px`,
        width: `${Math.abs(borders.maxX - borders.minX) * common.scale}px`,
        height: `${Math.abs(borders.maxY - borders.minY) * common.scale}px`,
        zIndex: 15
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
        // handleTop,
        borders,
        // handleBottom
    )


    useResizeLogic(() => {
    }, handleUp, handleMove, down, toggle, isUsable)

    useEffect(() => {
        setBorders(checkForBorders(getPoints(plist.current.concat(additionalPoints))))
    }, [plist.current])


    return (
        <>
            <RemoveObject removeFunc={removeItem} id={curve.id}>
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
                <PositionCanvasCurve sample={sample} curve={curve} canvasRef={ref} down={down} common={common}/>
            </RemoveObject>
        </>
    )

}


export default CurveObject


