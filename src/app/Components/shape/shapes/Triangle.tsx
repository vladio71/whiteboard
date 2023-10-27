import {useCallback, useEffect, useRef} from "react";
import {useCanvas} from "./useCanvas";
import {setPath} from "../../../redux/shapesSlice";
import {useAppDispatch} from "../../../redux/hooks";
import {configureContext, useGetItemStyle} from "./Rectangle";


const Triangle = ({item}) => {

    const dispatch = useAppDispatch()
    const object = useGetItemStyle(item)

     const draw = useCallback(((item, ctx) => {

        const out = new Path2D()
        const inside = new Path2D()
        const p = new Path2D()


        configureContext(ctx, item, ()=>{
            drawTriangle(ctx, item)
        })


        ctx.beginPath();
        drawTriangle(ctx, item)
        ctx.stroke()


        drawTriangle(out, {
            x: item.x-30,
            y: item.y-30,
            w:item.w+60,
            h:item.h+40
        })
         drawTriangle(p, item)
        drawTriangle(inside, {
            x: item.x+30,
            y: item.y+30,
            w:item.w-60,
            h:item.h-50
        })

         dispatch(setPath({
            id: item.id,
            o: out,
            i: inside,
            p: p,
            center: {x: item.x + item.w / 2, y: item.y + item.h / 2}
        }))





    }).bind(null, object), [object])


    function drawTriangle(context, item) {
        context.moveTo(item.x + item.w / 2, item.y);
        context.lineTo(item.x, item.y + item.h);
        context.lineTo(item.x + item.w, item.y + item.h);
        context.lineTo(item.x + item.w / 2, item.y);
        context.lineTo(item.x, item.y + item.h);

    }

    const ref = useCanvas(draw)


    return (

        <canvas ref={ref}></canvas>
    )

}

export default Triangle