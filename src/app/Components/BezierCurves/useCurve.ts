import {useEffect, useState} from "react";
import {getPointOnCurve} from "./CurvesCanvas";
import {updateCurve} from "../../redux/curvesSlice";
import {useAppDispatch, useAppSelector} from "../../redux/hooks";
import {is} from "immer/dist/utils/common";
import {selectStyles} from "../../redux/shapesSlice";


export function useCurve(curve, ref, sample, setSample, draw, drawArrow, container, getBorders, isUsable) {

    const paths = useAppSelector(state => state.present.shape.paths)
    const style = useAppSelector(state => selectStyles(state, curve.id, "curves"))


    const dispatch = useAppDispatch()
    const [additionalPoints, setAddPoints] = useState([])
    const [plist, setPoints] = useState([])
    const [ControlPoint, setControlPoint] = useState('')
    const [editMode, setEditMode] = useState(false)
    const [down, setDown] = useState(false)
    const [editPoint, setEditPoint] = useState(null)
    const [replacePoint, setReplace] = useState({x: 0, y: 0})
    const [removeCount, setRemoveCount] = useState(0)
    const [update, setUpdate] = useState(false)


    function calculatePoints() {
        const addPoints = []
        const points = []
        const step = 1 / ((sample.points.length - 1) * 2)
        let progress = 0
        sample.points.forEach((p, i) => {

            points.push(bezier(progress, getPoints(sample.points)))
            progress += step

            if (i !== sample.points.length - 1) {
                addPoints.push(bezier(progress, getPoints(sample.points)))
                progress += step
            }
        })

        return {
            addPoints,
            points
        }
    }

    function getDefaultBezierControlPoints(start, end) {
        let cp1 = {x: (end.x - start.x) / 5 + start.x, y: ((end.y - start.y) / 5) * 4 + start.y};
        let cp2 = {x: ((end.x - start.x) / 5) * 4 + start.x, y: (end.y - start.y) / 5 + start.y};
        return {cp1, cp2}
    }


    useEffect(() => {
        if (sample.points.length > 2) {
            const {addPoints, points} = calculatePoints()
            setAddPoints(addPoints)
            setPoints(points)
            setUpdate(!update)
        } else {
            setPoints(sample.points)
            const start = sample.points[0]
            const end = sample.points[sample.points.length - 1]
            const {cp1, cp2} = getDefaultBezierControlPoints(start, end)
            setAddPoints([getPointOnCurve(start, cp1, cp2, end, 0.5)])
            setUpdate(!update)
        }
    }, [sample])


    useEffect(() => {
        function handleClickOutside(e) {
            if (container.current && !container.current.contains(e.target) &&
                e.target.nodeName !== "SPAN") {
                setEditMode(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [container])


    function getPoints(data) {
        if (data.length <= 2) return data
        return data.map(el => {
            return el?.point ? el.point : el
        })
    }

    function makeCurve(start, end, path) {
        const {cp1, cp2} = getDefaultBezierControlPoints(start, end)
        path.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, end.x, end.y);
        return {cp1, cp2}
    }


    /*
     CALCULATE HIGH ORDER BEZIER EQUATION
    */
    function binom(n, k) {
        let coeff = 1;
        for (let i = n - k + 1; i <= n; i++) coeff *= i;
        for (let i = 1; i <= k; i++) coeff /= i;
        return coeff;
    }


    function bezier(t, plist) {
        var order = plist.length - 1;

        var y = 0;
        var x = 0;

        for (let i = 0; i <= order; i++) {
            x = x + (binom(order, i) * Math.pow((1 - t), (order - i)) * Math.pow(t, i) * (plist[i].x));
            y = y + (binom(order, i) * Math.pow((1 - t), (order - i)) * Math.pow(t, i) * (plist[i].y));
        }

        return {
            x: x,
            y: y
        };
    }

    /*
        END  
    */

    function handleMouseDown(e) {
        if (isUsable !== "Selection") return;

        if (ref.current.getContext("2d").isPointInPath(curve.curve, e.clientX, e.clientY)) {
            if (editMode) {
                setDown(true)
                setReplace({x: e.clientX, y: e.clientY})
                return
            }
            setEditMode(true)
            setReplace({x: e.clientX, y: e.clientY})


        } else {
            setEditMode(false)
        }
        setDown(true)
    }


    function handleUp(e) {

        if (!down) return

        dispatch(updateCurve({
            ...sample,
            borders: getBorders(plist.concat(additionalPoints))
        }))
        setDown(false)
        setControlPoint('')
        setReplace({x: e.clientX, y: e.clientY})
        setUpdate(!update)
        setEditPoint(null)


    }

    function getContext(ref) {
        const canvas = ref.current
        const ctx = canvas.getContext("2d")
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return ctx
    }

    const isSimpleDragging = ControlPoint === '' && editMode
    const isRecreatingCubicBezier = sample.points.length === 2 && ControlPoint[0] !== 'a'
    const isUpdatingHightOrderBezier = editPoint !== null


    function handleMove(e) {
        if (!down || isUsable !== "Selection") return;
        e.preventDefault()
        if (isSimpleDragging) {
            const ctx = getContext(ref)

            const d = {x: e.clientX - replacePoint.x, y: e.clientY - replacePoint.y}
            const path = new Path2D();
            const newCurve = {
                ...curve,
                points: curve.points.map(p => {
                    if (p?.point) {
                        return {
                            ...p,
                            point: {x: p.point.x + d.x, y: p.point.y + d.y}
                        }
                    } else {
                        return {x: p.x + d.x, y: p.y + d.y}
                    }

                }),
            }
            if (newCurve.points.length < 3) {
                path.moveTo(newCurve.points[0].x, newCurve.points[0].y);
                const start = newCurve.points[0]
                const end = newCurve.points[newCurve.points.length - 1]
                makeCurve(start, end, path)
                setSample({
                    ...newCurve, curve: path, points: [start, end],
                })
                setUpdate(!update)
                draw({...newCurve, curve: path}, ctx, end)
                return;
            } else {
                const points = getPoints(newCurve.points)
                makeHightOrderCurvePath(path, points, ctx)
                setSample({...newCurve, curve: path,})
                setUpdate(!update)
                draw({...newCurve, curve: path}, ctx, points[points.length - 1])

                return;

            }
        }
        if (isRecreatingCubicBezier) {
            updateCubicBezier(e)
            return;
        }
        if (isUpdatingHightOrderBezier) {

            let deleteCount
            let cPointId
            let del
            let newIndx
            let point = editPoint.curveP ? editPoint.curveP : editPoint
            let temp = [...sample.points]


            if (ControlPoint[0] === 'a') {
                cPointId = ControlPoint.substring(1) * 1
                deleteCount = sample.points.length === curve.points.length ? 0 : 1
                newIndx = cPointId + 1

            } else {
                cPointId = ControlPoint * 1
                deleteCount = 1
                newIndx = cPointId
            }
            del = {x: 0, y: 0}

            if (temp[newIndx]?.delta) {
                del = temp[newIndx]?.delta
            }


            let nPoint: any
            const ctx = getContext(ref)


            if ((cPointId === 0 && ControlPoint[0] !== 'a') || cPointId === curve.points.length - 1) {
                nPoint = {x: e.clientX, y: e.clientY}
                nPoint = magnetAlignment(ctx, e, nPoint)
                if (Array.isArray(nPoint) && cPointId === 0)
                    nPoint.reverse()
            } else {
                nPoint = {x: e.clientX + del.x, y: e.clientY + del.y}
            }


            const newPoint = {
                point: nPoint,
                delta: del

            }

            if (Array.isArray(nPoint)) {
                temp.splice(newIndx, deleteCount + removeCount, ...nPoint)

            } else {

                let newOne = curve.points.length === sample.points.length ? 0 : 1
                newPoint.delta = {
                    x: newPoint.delta.x - (plist[cPointId + newOne].x - e.clientX) / 3,
                    y: newPoint.delta.y - (plist[cPointId + newOne].y - e.clientY) / 3
                }
                if (newOne === 1) {
                    temp.splice(newIndx, deleteCount + removeCount, newPoint)
                } else {
                    temp.splice(newIndx, deleteCount + Array.isArray(nPoint) ? 1 : 0, newPoint)
                }
            }


            if (Array.isArray(nPoint)) {
                setRemoveCount(1)
            } else {
                setRemoveCount(0)
            }

            const cur = new Path2D()
            const tStart = bezier(0.98, getPoints(temp))
            const dx = getPoints(temp)[temp.length - 1].x - tStart.x;
            const dy = getPoints(temp)[temp.length - 1].y - tStart.y;
            const endingAngle = Math.atan2(dy, dx);


            if (style?.background) {
                if (style?.line) {
                    if (style.line < 2) {
                        ctx.setLineDash([5, 15]);
                    } else {
                        ctx.setLineDash([3, 3]);
                    }
                }
                ctx.lineWidth = style?.thickness * 10
                ctx.strokeStyle = style?.background
                ctx.fillStyle = style?.background
            }


            makeHightOrderCurvePath(cur, getPoints(temp), ctx)
            ctx.stroke(cur)
            ctx.lineWidth = style?.thickness * 10 / 3 < 1 ? 1 : style?.thickness * 10 / 3
            if (cPointId === temp.length - 1) {
                drawArrow(ctx, endingAngle, newPoint.point)
            } else {
                drawArrow(ctx, endingAngle)
            }
            setSample({
                ...sample,
                points: temp,
                curve: cur,
                angle: endingAngle,
            })
            setUpdate(!update)
            return;
        }


    }


    function magnetAlignment(ctx, e, nPoint) {
        for (let i = 0; i < paths.length; i++) {
            const p = paths[i]
            const isPointInside = ctx.isPointInPath(p.i, e.clientX, e.clientY);
            const isPointNearLine = ctx.isPointInPath(p.o, e.clientX, e.clientY);

            if (isPointInside) {
                const last = curve.points[curve.points.length - 1]?.point ? curve.points[curve.points.length - 1]?.point :
                    curve.points[curve.points.length - 1]
                const diff = {x: p.center.x - last.x, y: p.center.y - last.y}
                let n = 1
                if (Math.abs(diff.y) > Math.abs(diff.x)) {
                    if (diff.y > 0) {
                        while (ctx.isPointInPath(p.i, p.center.x, p.center.y - n)) {
                            n++
                        }
                        return [getAdditionalPoint({
                            x: p.center.x,
                            y: p.center.y - n - 10
                        }, p.center), {x: p.center.x, y: p.center.y - n - 10}]
                    } else {
                        while (ctx.isPointInPath(p.i, p.center.x, p.center.y + n)) {
                            n++
                        }
                        return [getAdditionalPoint({
                            x: p.center.x,
                            y: p.center.y + n + 10
                        }, p.center), {x: p.center.x, y: p.center.y + n + 10}]
                    }
                } else {
                    if (diff.x > 0) {
                        while (ctx.isPointInPath(p.i, p.center.x - n, p.center.y)) {
                            n++
                        }
                        return [getAdditionalPoint({
                            x: p.center.x - n - 10,
                            y: p.center.y
                        }, p.center), {x: p.center.x - n - 10, y: p.center.y}]
                    } else {
                        while (ctx.isPointInPath(p.i, p.center.x + n, p.center.y)) {
                            n++
                        }
                        return [getAdditionalPoint({
                            x: p.center.x + n + 10,
                            y: p.center.y
                        }, p.center), {x: p.center.x + n + 10, y: p.center.y}]
                    }
                }
            } else if (isPointNearLine) {
                let posX = e.clientX
                let posY = e.clientY
                for (let i = 1; i < 15; i++) {
                    if (ctx.isPointInStroke(p.p, posX + i, posY)) {
                        return [getAdditionalPoint({x: posX + i, y: posY}, p.center), {x: posX + i, y: posY}]

                    }
                    if (ctx.isPointInStroke(p.p, posX - i, posY)) {
                        return [getAdditionalPoint({x: posX - i, y: posY}, p.center), {x: posX - i, y: posY}]

                    }
                    if (ctx.isPointInStroke(p.p, posX, posY + i)) {
                        return [getAdditionalPoint({x: posX, y: posY + i}, p.center), {x: posX, y: posY + i}]

                    }
                    if (ctx.isPointInStroke(p.p, posX, posY - i)) {
                        return [getAdditionalPoint({x: posX, y: posY - i}, p.center), {x: posX, y: posY - i}]

                    }
                }
            }


        }

        return nPoint

    }

    function getAdditionalPoint(point, center) {
        let d = {x: point.x - center.x, y: point.y - center.y}
        if (Math.abs(d.y) > 180) {
            d.y = d.y > 0 ? 180 : -180
        }
        if (Math.abs(d.x) > 180) {
            d.x = d.x > 0 ? 180 : -180
        }
        if (Math.abs(d.y) < 50) {
            d.y = d.y > 0 ? d.y + 50 : d.y - 50
        }
        if (Math.abs(d.x) > 50) {
            d.x = d.x > 0 ? d.x + 50 : d.x - 50
        }
        return {x: point.x + d.x, y: point.y + d.y}

    }

    function updateCubicBezier(e) {
        const ctx = getContext(ref)


        let nPoint
        nPoint = magnetAlignment(ctx, e, nPoint)


        if (nPoint === undefined) {
            // update curve based on mouse position
            const path = new Path2D();
            const newCurve = {...sample}
            let newArr = [...newCurve.points]
            newArr[ControlPoint] = {x: e.clientX, y: e.clientY}
            newCurve.points = newArr
            path.moveTo(newCurve.points[0].x, newCurve.points[0].y);
            const start = newCurve.points[0]
            const end = newCurve.points[newCurve.points.length - 1]
            let {cp1, cp2} = makeCurve(start, end, path)
            const tStart = getPointOnCurve(start, cp1, cp2, end, 0.95)
            const dx = end.x - tStart.x;
            const dy = end.y - tStart.y;
            const endingAngle = Math.atan2(dy, dx);
            draw({...newCurve, curve: path, angle: endingAngle}, ctx, end)
            setSample({
                ...newCurve,
                curve: path,
                angle: endingAngle,
                points: [newCurve.points[0], newCurve.points[newCurve.points.length - 1]],
            })
            setUpdate(!update)

        } else {

            let temp = [...sample.points]
            const newIndx = ControlPoint * 1
            if (newIndx === 0)
                nPoint.reverse()
            temp.splice(newIndx, 1, ...nPoint)
            setRemoveCount(1)

            const cur = new Path2D()
            const tStart = bezier(0.98, getPoints(temp))
            const dx = getPoints(temp)[temp.length - 1].x - tStart.x;
            const dy = getPoints(temp)[temp.length - 1].y - tStart.y;
            const endingAngle = Math.atan2(dy, dx);
            makeHightOrderCurvePath(cur, getPoints(temp), ctx)
            drawArrow(ctx, endingAngle, temp[temp.length - 1])
            ctx.stroke(cur)
            setSample({
                ...sample, points: temp, curve: cur, angle: endingAngle,
            })
            setUpdate(!update)
        }

    }

    function makeHightOrderCurvePath(path, points) {

        let accuracy = 0.01;
        for (let i = 0; i < 1; i += accuracy) {
            let p = bezier(i, points);
            path.lineTo(p.x, p.y);
        }
        const last = points[points.length - 1]
        path.lineTo(last.x, last.y)

    }

    function handleDown(string, p = null) {
        setDown(true)
        setControlPoint(string)
        let cPointId
        let cPoint
        if (string[0] === 'a') {
            cPointId = string.substring(1) * 1
            cPoint = additionalPoints[cPointId]

        } else {
            cPointId = string * 1
            if (sample.points)
                cPoint = sample.points[cPointId]

        }
        if (p !== null && plist.length > 2) {
            setEditPoint({
                point: cPoint,
                curveP: p
            })
        } else {
            setEditPoint(cPoint)
        }
    }


    return {
        additionalPoints,
        plist,
        getPoints,
        handleMove,
        handleUp,
        handleMouseDown,
        handleDown,
        editMode,
        toggle: update,
        down
    }
}
