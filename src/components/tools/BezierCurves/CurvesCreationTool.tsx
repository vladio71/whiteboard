import React, {useContext, useEffect, useRef, useState} from "react";
import {useAppDispatch, useAppSelector} from "../../../redux/hooks";
import {addCurve, removeCurve, selectCurves} from "../../../redux/Slices/curvesSlice"
import {LevelContext} from "../../../app/page";
import {selectCommon} from "redux/Slices/commonSlice";

const CurvesCreationTool = ({add, setShape, isUsable}) => {

    const dispatch = useAppDispatch()

    const level = useContext(LevelContext)

    const [down, setDown] = useState(false)
    const [end, setEnd] = useState(false)
    const [curvePath, setCurvePath] = useState({})
    const [start, setStart] = useState({x: 0, y: 0})
    const refAdding = useRef(null)
    const curves = useAppSelector(selectCurves)
    const common = useAppSelector(selectCommon)
    const curveRef = useRef({})


    useEffect(() => {
        setStart(level?.start)
        handleDown(null)
    }, [level?.start])

    useEffect(() => {

        window.addEventListener('mousedown', handleDown)
        if (down)
            window.addEventListener('mousemove', handleMove)
        return () => {
            window.removeEventListener('mousemove', handleMove)
            window.removeEventListener('mousedown', handleDown)
        }
    }, [down, end === add])


    function handleDown(e) {
        if (!add) return;
        if (down) {
            setEnd(true)
            return
        }
        setDown(true)
        setEnd(false)
         if (e !== null) {
            setStart({
                // x: (e.clientX + common.scrollX) / common.scale - change,
                // y: (e.clientY + common.scrollY) / common.scale - change
                x: (e.clientX + common.scrollX) / common.scale ,
                y: (e.clientY + common.scrollY) / common.scale
                // x: e.clientX,
                // y: e.clientY
            })
        }


        setTimeout(() => {
            dispatch(addCurve({
                ...curveRef.current,
                shapeIndex: e === null ? level?.shapeId : -1,
                new: true,
            }))
            setShape('Selection')
            setDown(false)
            setEnd(!end)
            level?.setStart({x: 0, y: 0})
            setTimeout(() => {
                const canvas = refAdding.current
                canvas.width = window.innerWidth
                canvas.height = window.innerHeight
            }, 30)
        }, 400)


    }


    function handleMove(e) {

        if (!down || !add) return
        const canvas = refAdding.current
        const ctx = canvas.getContext("2d")
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight

        let end = {
            x: (e.clientX + common.scrollX) / common.scale,
            y: (e.clientY + common.scrollY) / common.scale
        };
        let cp1 = {x: (end.x - start.x) / 5 + start.x, y: ((end.y - start.y) / 5) * 4 + start.y};
        let cp2 = {x: ((end.x - start.x) / 5) * 4 + start.x, y: (end.y - start.y) / 5 + start.y};


        const curve = new Path2D();
        curve.moveTo(start.x, start.y);
        curve.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, end.x, end.y);
        ctx.stroke(curve);

        const tStart = getPointOnCurve(start, cp1, cp2, end, 0.95)
        const dx = end.x - tStart.x;
        const dy = end.y - tStart.y;
        const endingAngle = Math.atan2(dy, dx);


        const size = ctx.lineWidth * 10;
        ctx.beginPath();
        ctx.save();
        ctx.translate(end.x, end.y);
        ctx.rotate(endingAngle);
        ctx.moveTo(-size / 2, 0);
        ctx.lineTo(-size, -size * 1);
        ctx.lineTo(size / 2, 0);
        ctx.lineTo(-size, size * 1);
        ctx.lineTo(-size / 2, 0);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        curveRef.current = {
            id: 0,
            curve: true,
            angle: endingAngle,
            points: [start, end],
        }


    }


    return (
        <>
            <canvas ref={refAdding}></canvas>
        </>
    )

}

export const getPointOnCurve = function (p0, p1, p2, p3, t) {
    const x = (1 - t) * (1 - t) * (1 - t) * p0.x + 3 * (1 - t) * (1 - t) * t * p1.x + 3 * (1 - t) * t * t * p2.x + t * t * t * p3.x
    const y = (1 - t) * (1 - t) * (1 - t) * p0.y + 3 * (1 - t) * (1 - t) * t * p1.y + 3 * (1 - t) * t * t * p2.y + t * t * t * p3.y
    return {x: x, y: y}
}

export default CurvesCreationTool


