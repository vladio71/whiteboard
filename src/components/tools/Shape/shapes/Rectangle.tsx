import {useEffect, useRef} from "react";
import {useAppDispatch, useAppSelector} from "../../../../redux/hooks";
import {selectItem, setPath} from "../../../../redux/Slices/itemsSlice";


const Rectangle = ({item}) => {
    return (
        <>
            <ShapeConstructor
                item={item}
                drawPathsFunction={(p1, p2, p3) => {
                    p1.rect(item.x - 15, item.y - 15, item.w + 30, item.h + 30)
                    p2.rect(item.x, item.y, item.w, item.h)
                    p3.rect(item.x + 15, item.y + 15, item.w - 30, item.h - 30)
                }}
                drawShapeFunction={(ctx, scale) => {
                    ctx.rect(100 / scale, 100 / scale, item.w, item.h)
                }}

            />
        </>
    )
}


export const ShapeConstructor = ({item, drawShapeFunction, drawPathsFunction}) => {

    const dispatch = useAppDispatch()
    const object = useGetItemStyle(item)
    const common = useAppSelector(state => state.present.common)
    const previousValueRef = useRef(0)
    const canvasRef = useRef(null)
    const contextRef = useRef(null)


    useEffect(() => {
        const canvas = canvasRef.current
        contextRef.current = canvas.getContext("2d")
        canvas.width = object.w * common.scale + 200
        canvas.height = object.h * common.scale + 200
    }, [])

    useEffect(() => {
        const ctx = contextRef.current
        const canvas = canvasRef.current
        if (ctx) {
            const prev = previousValueRef.current
            const stepW = Math.abs(prev.w - object.w)
            const stepH = Math.abs(prev.h - object.h)
            if (stepH > 20 || stepW > 20) {
                const w = Math.abs(stepW / 20)
                const h = Math.abs(stepH / 20)
                for (let i = 0; (i < w || i < h); i++) {
                    canvas.width = object.w * common.scale + 200
                    canvas.height = object.h * common.scale + 200
                    drawOnce({
                            ...object,
                            w: prev.w + stepW * Math.min(w, i),
                            h: prev.h + stepH * Math.min(h, i)
                        },
                        contextRef.current)
                }
            }
            if (stepW === 0 && stepH === 0) {
                setNewPath()
            } else {
                canvas.width = object.w * common.scale + 200
                canvas.height = object.h * common.scale + 200
                drawOnce(object, contextRef.current)
            }
            previousValueRef.current = {...object}
        }
    }, [object.x, object.y, object.w, object.h])

    useEffect(() => {
        canvasRef.current.width = object.w * common.scale + 200
        canvasRef.current.height = object.h * common.scale + 200
        drawOnce(object, contextRef.current)
    }, [object.angle, object.style, common.scale, common.theme])

    function setNewPath() {
        const out = new Path2D()
        const inside = new Path2D()
        const p = new Path2D()
        drawPathsFunction(out, p, inside)
        if (object.style !== undefined)
            setShapeInfo(dispatch, object, out, p, inside, common.scale)
    }

    function drawOnce(item, ctx) {
        const out = new Path2D()
        const inside = new Path2D()
        const p = new Path2D()
        drawPathsFunction(out, p, inside)
        ctx.transform(common.scale, 0, 0, common.scale, 0, 0)
        configureContext(ctx, item, (ctx) => drawShapeFunction(ctx, common.scale))
        drawShapeFunction(ctx, common.scale)
        if (common.theme === "dark")
            ctx.filter = 'invert(1)'
        ctx.stroke()
        if (item.style !== undefined)
            setShapeInfo(dispatch, item, out, p, inside, common.scale)
    }


    return (
        <canvas style={{position: "absolute", inset: 0}} ref={canvasRef}></canvas>
    )

}


export function useGetItemStyle(item) {
    const style = useAppSelector(state => selectItem(state, item.id))?.style
    return {...item, style}
}

export function setShapeInfo(dispatch, item, out, p, inside, scale = 1) {
    dispatch(setPath({
        id: item.id,
        shape: item.shape,
        o: out,
        i: inside,
        p: p,
        center: {
            x: (item.x + item.w / 2),
            y: (item.y + item.h / 2)
        },
        w: item.w * scale,
        h: item.h * scale,
        angle: item.angle
    }))
}

export function setRectPath(dispatch, item, id) {
    const out = new Path2D()
    const inside = new Path2D()
    const p = new Path2D()
    out.rect(item.x - 15, item.y - 15, item.w + 30, item.h + 30)
    p.rect(item.x-10, item.y-10, item.w+20, item.h+20)
    inside.rect(item.x, item.y, item.w, item.h)
    setShapeInfo(dispatch, {...item, id: id}, out, p, inside)
}

export function configureContext(ctx, item, func) {

    if (item.style?.opacity >= 0) {
        ctx.globalAlpha = item.style.opacity
    }
    if (item.style?.background) {
        ctx.fillStyle = item.style.background;
        func(ctx)
        ctx.fill()
    }

    ctx.globalAlpha = item.style?.borderOpacity >= 0 ? item.style?.borderOpacity : 1
    ctx.strokeStyle = item.style?.borderColor ? item.style?.borderColor : 'black'
    let dashedStepLength = 5
    if (item.style?.borderThickness) {
        ctx.lineWidth = 12 * item.style?.borderThickness
        dashedStepLength = 5 * ctx.lineWidth
    }

    if (item.style?.line) {
        if (item.style.line < 2) {
            ctx.setLineDash([dashedStepLength, 15]);
        } else {
            ctx.setLineDash([dashedStepLength / 5, 3]);
        }
    }
}


export default Rectangle