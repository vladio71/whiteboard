import {useCallback, useEffect, useRef} from "react";
import {useCanvas} from "./useCanvas";
import {setPath} from "../../../redux/shapesSlice";
import {useAppDispatch} from "../../../redux/hooks";
import {configureContext, useGetItemStyle} from "./Rectangle";


const Parallelogram = ({item}) => {
    const dispatch = useAppDispatch()
    const object = useGetItemStyle(item)


    const draw = useCallback(((item, ctx) => {

        const out = new Path2D()
        const inside = new Path2D()
        const p = new Path2D()


        configureContext(ctx, item, ()=>{
            drawParallelogram(ctx,item)

        })



        ctx.beginPath();
        drawParallelogram(ctx,item)
        ctx.stroke()

        drawParallelogram(out, {
            x: item.x-15,
            y: item.y-15,
            w:item.w+30,
            h:item.h+30
        })
        drawParallelogram(p, item)
        drawParallelogram(inside, {
            x: item.x+15,
            y: item.y+15,
            w:item.w-30,
            h:item.h-30
        })
        dispatch(setPath({
            id: item.id,
            o: out,
            i: inside,
            p: p,
            center: {x: item.x + item.w / 2, y: item.y + item.h / 2}
        }))


    }).bind(null, object), [object])

    function drawParallelogram(context, item) {
        context.moveTo(item.x + item.w / 5, item.y);
        context.lineTo(item.x, item.y + item.h);
        context.lineTo(item.x + item.w / 5 * 4, item.y + item.h);
        context.lineTo(item.x + item.w, item.y);
        context.lineTo(item.x + item.w / 5, item.y);
        context.lineTo(item.x, item.y + item.h);

    }


    const ref = useCanvas(draw)


    return (

        <canvas ref={ref}></canvas>
    )

}

export default Parallelogram