import {useAppDispatch, useAppSelector} from "../../../redux/hooks";
import {addItem, removeItem, selectDrawings} from "redux/Slices/itemsSlice";
import {RefObject, useEffect, useRef, useState} from "react";
import {checkRectIntersection} from "../Selection/SelectionTool";
import {setRectPath} from "../Shape/shapes/Rectangle";
import {selectCommon} from "redux/Slices/commonSlice";
import {Point} from "/app/page";
import {v4 as uuidv4} from 'uuid';


// webp.grant_permission();


export function getPoint(e, scroll) {

    return {x: e.clientX, y: e.clientY}
}


export const useDrawing = (brush, drawingStyle, canvasRef, hiddenCanvasRef, ctx, down, setDown) => {


    const dispatch = useAppDispatch()
    const [toggle, setToggle] = useState(false)
    const [path, setPath] = useState()
    const [points, setPoints] = useState([])
    const [start, setStart] = useState({x: 0, y: 0})
    const thickness = drawingStyle.thickness
    const color = drawingStyle.color
    const drawings = useAppSelector(selectDrawings)
    const common = useAppSelector(selectCommon)
    const requestAnimationRef = useRef()
    const currentPoints = useRef<Point[]>([])


    if (brush === "Pen") {
        const handleDown = (e) => {
            if (e.which == 2) return
            const sideBar = document.getElementById('sidebar')
            if (sideBar.contains(e.target)) return
            setPoints([])
            e.preventDefault()
            setDown(true)
            const p = {x: (e.clientX), y: (e.clientY)}
            setStart(p)
            // checkForBorders(p.x, p.y, true)
            setPath(new Path2D())

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
            loop(ctx)
        }

        const handleUp = () => {
            cancelAnimationFrame(requestAnimationRef.current)
            setDown(false)
            setToggle(!toggle)

            const borders = checkForBorders(currentPoints.current)
            if (ctx === undefined) return
            const drawing = {
                x: (borders.minX + common.scrollX) / common.scale,
                y: (borders.minY + common.scrollY) / common.scale,
                startX: (borders.minX),
                startY: (borders.minY),
                w: Math.abs(borders.maxX - borders.minX) / common.scale,
                h: Math.abs(borders.maxY - borders.minY) / common.scale,
                startW: Math.abs(borders.maxX - borders.minX),
                startH: Math.abs(borders.maxY - borders.minY),
                color: color,
                thickness: thickness
            }

            dispatch(addItem({
                id: uuidv4(),
                ...drawing,
                points: currentPoints.current.map(point => {
                    return {
                        // x: point.x - drawing.startX + 50,
                        // y: point.y - drawing.startY + 50
                        x: point.x - drawing.startX + 10,
                        y: point.y - drawing.startY + 10
                    }
                }),
                drawing: true
            }))

            setTimeout(() => {
                ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                currentPoints.current = []
                // }, 100)
            },)
        }

        const loop = (ctx) => {


            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
            drawPoints(currentPoints.current, ctx)
            requestAnimationRef.current = requestAnimationFrame(() => loop(ctx))

        }


        const handleMove = (e) => {
            if (!down) return
            const p = getPoint(e, common)
            currentPoints.current.push(p)

        }
        return {
            handleUp,
            handleDown,
            handleMove,
            down,
            toggle,
            getLineWidth,
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
                w: 2,
                h: 2
            }
            drawings.forEach((rect, id) => {
                if (checkRectIntersection(selection, rect)) {
                    dispatch(removeItem(rect.id))
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
            drawings
        }
    }



}

export function drawPoints(points, ctx) {

    if (points.length < 2) return

    let p1 = points[0]
    let p2 = points[1]

    ctx.moveTo(p2.x, p2.y)
    ctx.beginPath()

    for (let i = 1, len = points.length; i < len; i++) {
        const midPoint = midPointBtw(p1, p2)
        ctx.quadraticCurveTo(p1.x, p1.y, midPoint.x, midPoint.y)
        p1 = points[i]
        p2 = points[i + 1]
    }

    ctx.lineTo(p1.x, p1.y)
    ctx.stroke()

}

export function getLineWidth(thickness, scale) {
    return (2 + 3 * thickness * (thickness * 10)) * scale
}

//
// export function draw(drawing, ctx, canvas: HTMLCanvasElement, hiddenCanvasRef: RefObject<HTMLCanvasElement>, dispatch, common) {
//
//     ctx.strokeStyle = drawing.color
//     ctx.lineCap = "round";
//     ctx.lineWidth = getLineWidth(drawing.thickness)
//
//
//     ctx.resetTransform()
//
//     const sclaeX = drawing.w / drawing.startW
//     const sclaeY = drawing.h / drawing.startH
//
//
//     var img = new Image;
//     img.src = drawing.dataUrl;
//     ctx.transform(sclaeX * (common.scale), 0, 0, sclaeY * (common.scale), 0, 0)
//     ctx.drawImage(img, 0, 0)
//
//
//     setRectPath(dispatch, drawing, "d" + drawing.id)
//
//
//     ctx.resetTransform()
//     ctx.beginPath()
//
// }

export function checkForBorders(arr) {

    const temp = {
        minX: 10000,
        maxX: 0,
        minY: 10000,
        maxY: 0
    }

    arr.forEach(p => {
        if (temp.minX > p.x) {
            temp.minX = p.x
        }
        if (temp.maxX < p.x) {
            temp.maxX = p.x
        }
        if (temp.minY > p.y) {
            temp.minY = p.y
        }
        if (temp.maxY < p.y) {
            temp.maxY = p.y
        }
    })
    return temp
}

export const midPointBtw = (p1, p2) => {
    return {
        x: p1.x + (p2.x - p1.x) / 2,
        y: p1.y + (p2.y - p1.y) / 2
    }
}
