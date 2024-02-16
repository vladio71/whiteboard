import {useEffect, useRef, useState} from "react";
import {getPointOnCurve} from "./CurvesCreationTool";
import {setEditStatus, setShapeIndices, updateCurve} from "../../../redux/Slices/curvesSlice";
import {useAppDispatch, useAppSelector} from "../../../redux/hooks";
import {selectPaths, selectStyles} from "../../../redux/Slices/shapesSlice";
import {setTimeout} from "timers";
import {debounce} from "app/utils/utils";
import {selectCommon} from "redux/Slices/commonSlice";
import {
    AlignCurveToNearestPoint,
    AlignPointToObjectBorder,
    bezier,
    calculatePoints,
    drawArrow,
    getCurveArrowAngle,
    getAdditionalPoint,
    getDefaultBezierControlPoints,
    getPoints,
    makeHightOrderCurvePath,
    moveCurve
} from "./utils";
import useClickOutside from "../../../app/hooks/useClickOutside";
import {checkForBorders} from "../Drawing/useDrawing";
import useRefState from "../../../app/hooks/useRefState";


export function useCurve(curve, ref, sample, setSample, container, isUsable, handleTop, borders, handleBottom) {

    const paths = useAppSelector(selectPaths)
    const style = useAppSelector(state => selectStyles(state, curve.id, "curves"))
    const common = useAppSelector(selectCommon)


    useEffect(() => {
        const pointsForRender = getPoints(sample.current.points).map(p => {
            return {
                x: p.x,
                y: p.y
            }
        })
        if (sample.current.points.length > 2) {
            const {addPoints, points} = calculatePoints(pointsForRender)
            setAddPoints(addPoints)
            setPoints(points)
            setUpdate(!update)
        } else {
            setPoints(pointsForRender)
            const start = pointsForRender[0]
            const end = pointsForRender[sample.current.points.length - 1]
            const {cp1, cp2} = getDefaultBezierControlPoints(start, end)
            setAddPoints([getPointOnCurve(start, cp1, cp2, end, 0.5)])
            setUpdate(!update)
        }
    }, [sample.current, common.scale])


    const dispatch = useAppDispatch()
    const [additionalPoints, setAddPoints] = useState([])
    const [plist, setPoints] = useRefState([])
    const [ControlPoint, setControlPoint] = useRefState(!curve?.new ? '' : '2')
    const [editMode, setEditMode] = useState(false)
    const [isAttached, setIsAttached] = useRefState(false)
    const [isAttachedBack, setIsAttachedBack] = useRefState(false)
    const [down, setDown] = useState(curve?.new)
    const [editPoint, setEditPoint] = useState(1)
    const [replacePoint, setReplace] = useState({x: 0, y: 0})
    const [removeCount, setRemoveCount] = useState(0)
    const [update, setUpdate] = useState(false)
    const [pathIndexForward, setPathIndexForward] = useState((curve?.shapeIndexStart || -1))
    const [objectSnapshot, setObjectSnapshot] = useState(null)
    const [pathIndexBack, setPathIndexBack] = useState(curve.shapeIndex)
    const [objectSnapshotBack, setObjectSnapshotBack] = useState(null)
    const [shapeStartPath, shapeEndPath] = useAppSelector(selectShapes)
    const refVersion = useRef(true)
    const counter = useRef(0)
    const counterBack = useRef(0)
    const scale = useRef(common.scale)
    const mountedRef = useRef(0)
    const mountedRefPaths = useRef(0)
    const requestAnimationFrameRef = useRef(0)
    const debouncedUpdateCurve = useRef(debounce((data) => {
        dispatch(updateCurve(...data))
    }, 200))


    useEffect(() => {
        if (shapeEndPath?.shape && mountedRef.current !== 0) {
            if (shapeEndPath) {
                shapeChangeHandle(shapeEndPath, sample.current.points[0])
            }
            if (shapeStartPath) {
                shapeChangeHandle(shapeStartPath, sample.current.points[sample.current.points.length - 1], false)

            }
        }
    }, [shapeEndPath?.shape, shapeStartPath?.shape])

    useEffect(() => {
        if (down) {
            dispatch(setEditStatus(true))
        }
        dispatch(updateCurve({
            ...sample,
            new: false
        }))
        if (curve.shapeIndex !== -1)
            setIsAttached(true)

        if (curve?.shapeIndexStart && curve.shapeIndexStart !== -1)
            setIsAttachedBack(true)

    }, [])


    useEffect(() => {
        if (mountedRef.current !== 0) {
            dispatch(setShapeIndices({
                id: sample.id,
                shapeIndexStart: pathIndexForward,
                shapeIndex: pathIndexBack
            }))
            setUpdate(!update)

        } else {
            mountedRef.current = 1
        }
    }, [pathIndexForward, pathIndexBack])


    useEffect(() => {
        if (mountedRefPaths.current !== 0) {
            setDown(true)
            if (common.scale == scale.current)
                followShapes(objectSnapshot, shapeStartPath, true, followShapes(objectSnapshotBack, shapeEndPath, false))
            setObjectSnapshot(shapeStartPath)
            setObjectSnapshotBack(shapeEndPath)
            scale.current = common.scale
        } else {

            setTimeout(() => {
                mountedRefPaths.current = 1
            }, 100)
        }
    }, [shapeStartPath, shapeEndPath])


    function shapeChangeHandle(path, point, back = true) {
        // const ctx = getContext(ref)
        // const isPointOnTheLine = ctx.isPointInStroke(path.p, point.x, point.y);
        // const isPointNearPathLeft = ctx.isPointInPath(path.p, point.x + path.w / 2, point.y);
        // const isPointNearPathRight = ctx.isPointInPath(path.p, point.x - path.w / 2, point.y);
        // if (!isPointOnTheLine) {
        //     if (isPointNearPathLeft || isPointNearPathRight) {
        //         let side = null
        //         for (let i = 1; side === null; i++) {
        //             if (ctx.isPointInStroke(path.p, point.x + i, point.y)) {
        //                 side = true
        //             }
        //             if (ctx.isPointInStroke(path.p, point.x - i, point.y)) {
        //                 side = false
        //             }
        //             if (side !== null) {
        //                 const temp = back ?
        //                     [{x: point.x + (side ? i : -i), y: point.y}, ...sample.points.slice(1)] :
        //                     [...sample.points.slice(0, sample.points.length - 1), {
        //                         x: point.x + (side ? i : -i),
        //                         y: point.y
        //                     }]
        //
        //                 const {endingAngle} = drawHightOrderCurve(temp, ctx, borders, common, style)
        //                 setSample({
        //                     ...sample.current,
        //                     points: temp,
        //                     angle: endingAngle,
        //                 })
        //
        //                 setUpdate(!update)
        //             }
        //
        //         }
        //     }
        // }
        // refVersion.current = false

    }


    function followShapes(snapshot, currentPath, isForward, points?) {


        if (snapshot !== null && snapshot !== undefined && currentPath !== undefined) {
            const isMoved = snapshot.center.x !== currentPath.center.x || snapshot.center.y !== currentPath.center.y
            const isScaled = snapshot.w !== currentPath.w || snapshot.h !== currentPath.h
            const isRotated = snapshot.angle !== currentPath.angle

            let temp = points === undefined ? [...sample.current.points] : points
            const p = (isForward ? temp[temp.length - 1] : temp[0])
            let point


            if (isRotated) {
                const deltaAngle = -(snapshot.angle - currentPath.angle) * (Math.PI / 180)
                point = {
                    x: (p.x - currentPath.center.x) * Math.cos(deltaAngle) - (p.y - currentPath.center.y) * Math.sin(deltaAngle) + currentPath.center.x,
                    y: (p.y - currentPath.center.y) * Math.cos(deltaAngle) + (p.x - currentPath.center.x) * Math.sin(deltaAngle) + currentPath.center.y

                }
            } else if (isScaled) {
                const ratioX = snapshot.w / currentPath.w !== 0 ? snapshot.w / currentPath.w : 1
                const ratioY = snapshot.h / currentPath.h !== 0 ? snapshot.h / currentPath.h : 1

                let scaledDeltaX = (snapshot.center.x - p.x) / ratioX
                let scaledDeltaY = (snapshot.center.y - p.y) / ratioY

                point = {
                    x: currentPath.center.x - scaledDeltaX,
                    y: currentPath.center.y - scaledDeltaY
                }
            } else if (isMoved) {
                const deltaX = snapshot.center.x - currentPath.center.x
                const deltaY = snapshot.center.y - currentPath.center.y

                point = {x: p.x - deltaX, y: p.y - deltaY}
            }

            if (point !== undefined) {
                const result = [point, getAdditionalPoint(point, currentPath.center)]
                temp.splice(isForward ? temp.length - 2 : 0, temp.length === 2 ? 1 : 2, ...(isForward ? result.reverse() : result))


                // const ctx = getContext(ref)
                const {cur, endingAngle} = getCurveArrowAngle(temp, borders, common, style)
                setSample({
                    ...sample.current,
                    points: temp,
                    angle: endingAngle,
                })

                debouncedUpdateCurve.current({
                    ...sample.current,
                    points: temp,
                    angle: endingAngle,
                    borders: getBordersForSelection(plist.current.concat(additionalPoints))
                })
                return temp
            }

        }

    }


    function selectShapes(state) {
        return [
            state.present.shape.paths.find(el => el.id === pathIndexForward),
            state.present.shape.paths.find(el => el.id === pathIndexBack),
        ]
    }


    useClickOutside(container, (e) => {
        if (e.target.nodeName !== "SPAN")
            setEditMode(false)
    })


    // function loop() {
    //
    //     const canvas = ref.current
    //     const ctx = canvas.getContext("2d")
    //     // canvas.width = (borders.maxX - borders.minX) * common.scale + 400
    //     // canvas.height = (borders.maxY - borders.minY) * common.scale + 400
    //     canvas.width = 1000
    //     canvas.height = 1000
    //     if (ctx) {
    //         draw(sample.current, ctx)
    //     }
    //     requestAnimationFrameRef.current = requestAnimationFrame(loop)
    // }

    function handleMouseDown(e) {

        if (isUsable !== "Selection" || e.button === 1) return;

        // loop()


        setDown(true)
        setReplace({x: e.clientX, y: e.clientY})
        if (!editMode)
            setEditMode(true)
    }


    function handleUp(e) {
        if (!down) return

        cancelAnimationFrame(requestAnimationFrameRef.current)

        dispatch(updateCurve({
            ...sample.current,
            // borders: checkForBorders(getPoints(sample.current.points)),
            borders: getBordersForSelection(sample.current.points),
        }))
        setDown(false)
        setControlPoint('')
        setReplace({x: e.clientX, y: e.clientY})
        setUpdate(!update)
        setEditPoint(null)
        handleTop()
        dispatch(setEditStatus(false))


    }

    function getBordersForSelection(points) {
        const borders = checkForBorders(getPoints(points))
        return {
            x: borders.minX - 10,
            y: borders.minY - 10,
            w: Math.abs(borders.maxX - borders.minX) + 20,
            h: Math.abs(borders.maxY - borders.minY) + 20
        }
    }

    function getContext(ref) {
        const canvas = ref.current
        const ctx = canvas.getContext("2d")
        // canvas.width = (borders.maxX - borders.minX) * common.scale + 400
        // canvas.height = (borders.maxY - borders.minY) * common.scale + 400
        // ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (curve.style?.background) {
            ctx.fillStyle = curve.style?.background
            ctx.strokeStyle = style?.background
        }


        return ctx
        // return document.createElement('canvas').getContext('2d')
    }

    const isSimpleDragging = ControlPoint.current === '' && editMode
    const isRecreatingCubicBezier = () => sample.current.points.length === 2 && ControlPoint.current[0] !== 'a'
    const isUpdatingHightOrderBezier = editPoint !== null


    function handleMove(e) {

        if (!down) return;
        e.preventDefault()


        const clientX = (e.clientX + common.scrollX) / common.scale
        const clientY = (e.clientY + common.scrollY) / common.scale

        if (isSimpleDragging) {
            if (isAttached.current || isAttachedBack.current) return;
            // const ctx = getContext(ref)

            const delta = {
                x: (e.clientX - replacePoint.x) / common.scale,
                y: (e.clientY - replacePoint.y) / common.scale
            }

            const {
                newCurve,
                points,
                end,
            } = moveCurve(curve, delta)
            setSample({
                ...newCurve,
                points: points,
            })
            setUpdate(!update)
            // draw({
            //     ...newCurve,
            // }, ctx, end)
            return;

        }
        if (isRecreatingCubicBezier()) {
            updateCubicBezier(e, clientX, clientY)
            return;
        }
        if (isUpdatingHightOrderBezier) {

            let {
                deleteCount,
                cPointId,
                del,
                newIndx,
                temp,
                ctx
            } = getInitialData()

            let nPoint
            let isAlignmentCheckNeeded = (newIndx === 0 && ControlPoint[0] !== 'a') || cPointId == sample.current.points.length - 1

            if (isAlignmentCheckNeeded) {
                nPoint = {x: clientX, y: clientY}
                nPoint = magnetAlignment(ctx, e, nPoint, cPointId, clientX, clientY)
            } else {
                nPoint = {x: Math.round(clientX + del.x), y: Math.round(clientY + del.y)}
            }


            let isAlignmentNeeded = Array.isArray(nPoint)
            if (isAlignmentNeeded) {
                if (cPointId !== 0) {
                    temp.splice(temp.length - 1, 1, nPoint[nPoint.length - 1])
                    setIsAttached(true)
                    if (counter.current == 0) {
                        temp.splice(temp.length - 1, 0, nPoint[0])
                        setControlPoint(cPointId + 1)
                    } else {
                        temp.splice(temp.length - 2, 1, nPoint[0])
                    }
                    counter.current++

                }
                if (cPointId === 0) {
                    temp.splice(cPointId, 1, nPoint[nPoint.length - 1])
                    setIsAttachedBack(true)
                    if (counterBack.current == 0) {
                        temp.splice(1, 0, nPoint[0])
                    } else {
                        temp.splice(1, 1, nPoint[0])
                    }
                    counterBack.current++
                }

            } else {
                let forward = false
                let back = false
                if (isAttached.current && cPointId >= temp.length - 1) {
                    setIsAttached(false)
                    forward = true
                    setPathIndexForward(-1)
                    counter.current = 0
                }
                if (isAttachedBack.current && cPointId === 0) {
                    setIsAttachedBack(false)
                    setRemoveCount(0)
                    back = true
                    setPathIndexBack(-1)
                    counterBack.current = 0
                }


                let isNewOne = (curve.points.length === sample.current.points.length) ? 0 : 1
                const curId = (cPointId + isNewOne > plist.current.length - 1 ? plist.current.length - 1 : cPointId + isNewOne)
                const point = bezier((1 / (temp.length - 1)) * (curId), getPoints(temp))
                const newPoint = {
                    point: nPoint,
                    delta: {
                        x: del.x - (point.x - clientX),
                        y: del.y - (point.y - clientY)
                    }
                }


                if (isNewOne === 1) {
                    if (forward && cPointId >= temp.length - 1) {
                        temp.splice(newIndx - 1, deleteCount + removeCount + 1, newPoint)
                    } else if (back && cPointId === 0) {
                        temp.splice(0, deleteCount + removeCount + 1, newPoint)
                    } else {
                        temp.splice(newIndx, deleteCount + removeCount, newPoint)
                    }

                } else {

                    if (isAttached.current && cPointId >= temp.length - 1) {
                        temp.splice(newIndx - 1, deleteCount + 1, newPoint)

                    } else if (isAttachedBack.current && cPointId === 0) {
                        temp.splice(0, deleteCount + 1, newPoint)

                    } else {

                        temp.splice(newIndx, deleteCount, newPoint)
                    }

                }

                if (cPointId > sample.current.points.length - 1)
                    setControlPoint(cPointId - 1)
            }


            const {endingAngle} = getCurveArrowAngle(temp, borders, common, style)

            setSample({
                ...sample.current,
                points: temp,
                angle: endingAngle,
            })
            return;
        }
    }

    const getInitialData = () => {
        let deleteCount
        let cPointId
        let del = {x: 0, y: 0}
        let newIndx
        let temp = [...sample.current.points]
        const ctx = getContext(ref)


        let isAddingNewPoint = ControlPoint.current[0] === 'a'

        if (isAddingNewPoint) {
            cPointId = ControlPoint.current.substring(1) * 1
            deleteCount = sample.current.points.length === curve.points.length ? 0 : 1
            newIndx = cPointId + 1

        } else {
            cPointId = ControlPoint.current * 1
            deleteCount = 1
            newIndx = (cPointId > temp.length - 1 ? temp.length - 1 : cPointId)
        }

        if (temp[newIndx]?.delta) {
            del = temp[newIndx]?.delta
        }
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
            ctx.fillStyle = style?.backgroundas
        }

        return {
            deleteCount,
            cPointId,
            del,
            newIndx,
            temp,
            ctx
        }
    }


    function magnetAlignment(ctx, e, nPoint, cPointId, clientX, clientY) {
        for (let i = 0; i < paths.length; i++) {
            const p = paths[i]
            const isPointInside = ctx.isPointInPath(p.i, clientX, clientY);
            const isPointNearLine = ctx.isPointInPath(p.o, clientX, clientY);
            if (isPointInside) {
                setPathIds(cPointId, p.id)
                const last = curve.points[curve.points.length - 1]?.point ? curve.points[curve.points.length - 1]?.point :
                    curve.points[curve.points.length - 1]
                return AlignCurveToNearestPoint(p, ctx, scale, last)
            } else if (isPointNearLine) {
                setPathIds(cPointId, p.id)
                return AlignPointToObjectBorder(p, ctx, clientX, clientY)
            }
        }
        return nPoint

    }


    function setPathIds(pointId, id) {
        if (pointId === 0) {
            setPathIndexBack(id)
        } else {
            setPathIndexForward(id)
        }
    }


    function simpleCubicBezierUpdate(ctx, clientX, clientY) {
        const newCurve = {...sample.current}
        let newArr = [...newCurve.points]
        newArr[ControlPoint.current] = {x: clientX, y: clientY}
        newCurve.points = newArr
        const start = newCurve.points[0]
        const end = newCurve.points[newCurve.points.length - 1]
        let {cp1, cp2} = getDefaultBezierControlPoints(start, end)
        const tStart = getPointOnCurve(start, cp1, cp2, end, 0.95)
        const dx = end.x - tStart.x;
        const dy = end.y - tStart.y;
        const endingAngle = Math.atan2(dy, dx);
        // draw({...newCurve, angle: endingAngle}, ctx, end)
        if (!refVersion.current && shapeEndPath !== undefined) {
            const p = sample.current.points[0]
            const isPointOnTheLine = ctx.isPointInStroke(shapeEndPath.p, p.x, p.y);

            if (isPointOnTheLine) refVersion.current = true
        }
        if (refVersion.current || shapeEndPath === undefined) {
            setSample({
                ...newCurve,
                angle: endingAngle,
                points: [newCurve.points[0], newCurve.points[newCurve.points.length - 1]],
            })
        }
    }

    function convertCubicToHighOrderCurve(nPoint, ctx) {
        let temp = [...sample.current.points]
        const newIndx = ControlPoint.current * 1
        if (newIndx === 0)
            nPoint.reverse()

        temp.splice(newIndx, 1, ...nPoint)
        if (newIndx !== 0)
            setControlPoint(temp.length - 1)

        const delta = {x: temp[1].x - temp[0].x, y: temp[1].y - temp[0].y}


        temp.splice(1, 1, {x: temp[0].x + delta.x / 3, y: temp[0].y + delta.y / 3})

        const cur = new Path2D()
        const tStart = bezier(0.98, getPoints(temp))
        const dx = getPoints(temp)[temp.length - 1].x - tStart.x;
        const dy = getPoints(temp)[temp.length - 1].y - tStart.y;
        const endingAngle = Math.atan2(dy, dx);
        // makeHightOrderCurvePath(cur, getPoints(temp))
        // drawArrow(ctx, endingAngle, temp[temp.length - 1])
        setSample({
            ...sample.current, points: temp,
            angle: endingAngle,
        })
    }


    function updateCubicBezier(e, clientX, clientY) {
        const ctx = getContext(ref)

        let nPoint
        nPoint = magnetAlignment(ctx, e, nPoint, ControlPoint.current * 1, clientX, clientY)

        if (nPoint === undefined) {
            simpleCubicBezierUpdate(ctx, clientX, clientY)
            setUpdate(!update)

        } else {
            convertCubicToHighOrderCurve(nPoint, ctx)
            setUpdate(!update)
        }

    }

    function handleControlPointDown(string, p = null) {
        handleBottom()
        dispatch(setEditStatus(true))
        setDown(true)
        // loop()
        setControlPoint(string)
        let cPointId
        let cPoint
        if (string[0] === 'a') {
            cPointId = string.substring(1) * 1
            cPoint = additionalPoints[cPointId]

        } else {
            cPointId = string * 1
            if (sample.current.points)
                cPoint = sample.current.points[cPointId]

        }
        if (p !== null && plist.current.length > 2) {
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
        handleControlPointDown,
        editMode,
        toggle: update,
        down,
        isAttached,
        isAttachedBack
    }
}


