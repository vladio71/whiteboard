import {addDrawing, selectDrawingStyle, addDataUrl, selectDrawings} from "../../../redux/Slices/drawingSlice";
import {useAppDispatch, useAppSelector} from "../../../redux/hooks";
import {removeDrawing} from "../../../redux/Slices/drawingSlice";
import {RefObject, useState} from "react";
import {checkRectIntersection} from "../Selection/SelectionTool";
import {setShapeInfo, setRectPath} from "../Shape/shapes/Rectangle";
import {selectCommon} from "redux/Slices/commonSlice";

const pica = require('pica')();

export function getPoint(e, scroll) {

    return {x: e.clientX, y: e.clientY}
}


export const useDrawing = (brush, canvasRef, hiddenCanvasRef, ctx, down, setDown) => {


    const dispatch = useAppDispatch()
    const [toggle, setToggle] = useState(false)
    const [path, setPath] = useState()
    const [points, setPoints] = useState([])
    const [borders, setBorders] = useState({minX: 10000, maxX: 0, minY: 10000, maxY: 0})
    const [start, setStart] = useState({x: 0, y: 0})
    const drawingStyle = useAppSelector(state => selectDrawingStyle(state))
    const thickness = drawingStyle.thickness
    const color = drawingStyle.color
    const drawings = useAppSelector(selectDrawings)
    // const scroll = useAppSelector(selectCommon)
    const common = useAppSelector(selectCommon)


    if (brush === "Pen") {
        const handleDown = (e) => {
            if (e.which == 2) return
            setPoints([])
            e.preventDefault()
            setDown(true)
            const p = {x: (e.clientX), y: (e.clientY)}
            setStart(p)
            checkForBorders(p.x, p.y, true)
            setPath(new Path2D())
        }

        const handleUp = () => {
            setBorders({minX: 10000, maxX: 0, minY: 10000, maxY: 0})
            setDown(false)
            setToggle(!toggle)

            setTimeout(() => {

                setPoints([])
                if (ctx === undefined) return
                 ctx.beginPath()


                const drawing = {
                    x: (borders.minX),
                    y: (borders.minY),
                    startX: (borders.minX),
                    startY: (borders.minY),
                    w: Math.abs(borders.maxX - borders.minX),
                    h: Math.abs(borders.maxY - borders.minY),
                    startW: Math.abs(borders.maxX - borders.minX),
                    startH: Math.abs(borders.maxY - borders.minY),
                    color: color,
                    thickness: thickness
                }


                const canvas = canvasRef.current
                const canv: HTMLCanvasElement = hiddenCanvasRef.current
                const ctx2: CanvasRenderingContext2D = canv.getContext('2d')
                canv.width = (drawing.w + 20)
                canv.height = (drawing.h + 20)
                if (common.theme === "dark")
                    ctx2.filter = 'invert(1)'



                 ctx2.drawImage(
                    canvas,
                    drawing.x - 10,
                    drawing.y - 10,
                    (drawing.w + 20),
                    (drawing.h + 20),
                    0,
                    0,
                    (drawing.w + 20),
                    (drawing.h + 20),
                )




                const dataUrl = canv.toDataURL('image/png', 1)


                dispatch(addDrawing({
                    ...drawing,
                    x: (borders.minX + common.scrollX) / common.scale,
                    y: (borders.minY + common.scrollY) / common.scale,
                    w: drawing.w / common.scale,
                    h: drawing.h / common.scale,
                    dataUrl,
                }))
                setTimeout(() => {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                }, 100)
            }, 100)
        }


        const midPointBtw = (p1, p2) => {
            return {
                x: p1.x + (p2.x - p1.x) / 2,
                y: p1.y + (p2.y - p1.y) / 2
            }
        }

        const drawArray = (ctx, points, newPoint) => {
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
            setPoints(prev => {
                return [
                    ...prev,
                    newPoint
                ]
            })

            if (points.length < 3) return

            let p1 = points[0]
            let p2 = points[1]

            ctx.moveTo(p2.x, p2.y)
            ctx.beginPath()

            for (let i = 1, len = points.length; i < len; i++) {
                // we pick the point between pi+1 & pi+2 as the
                // end point and p1 as our control point
                const midPoint = midPointBtw(p1, p2)
                ctx.quadraticCurveTo(p1.x, p1.y, midPoint.x, midPoint.y)
                p1 = points[i]
                p2 = points[i + 1]
            }
            // Draw last line as a straight line while
            // we wait for the next point to be able to calculate
            // the bezier control point
            ctx.lineTo(p1.x, p1.y)
            ctx.stroke()
        }


        const handleMove = (e) => {
            if (!down) return
            const p = getPoint(e, common)

            if (getDistance(start, p) < 4) return;
            const canvas = canvasRef.current
            const ctx = canvas.getContext('2d')
            canvas.height = window.innerHeight
            canvas.width = window.innerWidth


            ctx.lineWidth = getLineWidth(thickness, common.scale)
            ctx.strokeStyle = color
            ctx.lineJoin = 'round'
            ctx.lineCap = "round";
            if (common.theme === "dark")
                ctx.filter = 'invert(1)'

            requestAnimationFrame(() => {
                drawArray(ctx, points, p)
            })
            checkForBorders(p.x, p.y)
            setStart(p)
            setToggle(!toggle)
        }
        return {
            handleUp,
            handleDown,
            handleMove,
            down,
            toggle,
            getLineWidth,
            draw
        }
    }
    if (brush === "Eraser") {
        const handleDown = (e) => {
            setDown(true)
        }

        const handleUp = () => {
            setDown(false)

        }

        const handleMove = (e) => {
            if (!down) return
            const selection = {
                x: (e.clientX + common.scrollX) / common.scale,
                y: (e.clientY + common.scrollY) / common.scale,
                // x: e.clientX,
                // y: e.clientY,
                w: 2,
                h: 2
            }
            drawings.forEach((rect, id) => {
                if (checkRectIntersection(selection, rect)) {
                    dispatch(removeDrawing(rect.id))
                }
            })


        }
        return {
            handleUp,
            handleDown,
            handleMove,
            down,
            toggle,
            getLineWidth,
            draw,
            drawings
        }
    }

    function checkForBorders(x, y, newDrawing = false) {


        const temp = newDrawing ? {minX: 10000, maxX: 0, minY: 10000, maxY: 0} : {...borders}

        if (borders.minX > x) {
            temp.minX = x
        }
        if (borders.maxX < x) {
            temp.maxX = x
        }
        if (borders.minY > y) {
            temp.minY = y
        }
        if (borders.maxY < y) {
            temp.maxY = y
        }

        setBorders(temp)

    }


    function getDistance(p1, p2) {
        return Math.sqrt(Math.pow((p1.x - p2.x), 2) + Math.pow((p1.y - p2.y), 2))
    }


}

function getLineWidth(thickness, scale) {
    return (2 + 3 * thickness * (thickness * 10)) * scale
}


export function draw(drawing, ctx, canvas: HTMLCanvasElement, hiddenCanvasRef: RefObject<HTMLCanvasElement>, dispatch, common) {

    ctx.strokeStyle = drawing.color
    ctx.lineCap = "round";
    ctx.lineWidth = getLineWidth(drawing.thickness)


    ctx.resetTransform()

    const sclaeX = drawing.w / drawing.startW
    const sclaeY = drawing.h / drawing.startH


    var img = new Image;
    img.src = drawing.dataUrl;
    ctx.transform(sclaeX * (common.scale), 0, 0, sclaeY * (common.scale), 0, 0)
    ctx.drawImage(img, 0, 0)


    setRectPath(dispatch, drawing, "d" + drawing.id)


    ctx.resetTransform()
    ctx.beginPath()

}