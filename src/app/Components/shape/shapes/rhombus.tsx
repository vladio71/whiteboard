import {useCallback, useEffect, useRef} from "react";
import {useCanvas} from "./useCanvas";
import {useAppDispatch} from "../../../redux/hooks";
import {setPath} from "../../../redux/shapesSlice";
import {configureContext, useGetItemStyle} from "./Rectangle";


const Rhombus = ({item}) => {

    const dispatch = useAppDispatch()
    const object = useGetItemStyle(item)


    const draw = useCallback(((item, ctx)=>{

        const out = new Path2D()
        const inside = new Path2D()
        const p = new Path2D()

        configureContext(ctx, item, ()=>{
            drawRhombus(ctx, item)

        })


        ctx.beginPath();
        drawRhombus(ctx, item)
        ctx.stroke()

        drawRhombus(out, {
            x: item.x-30,
            y: item.y-30,
            w:item.w+60,
            h:item.h+60
        })
        drawRhombus(p, item)
        drawRhombus(inside, {
            x: item.x+25,
            y: item.y+25,
            w:item.w-50,
            h:item.h-50,
        })
        dispatch(setPath({
            id: item.id,
            o: out,
            i: inside,
            p: p,
            center: {x: item.x + item.w / 2, y: item.y + item.h / 2}
        }))






    }).bind(null, object) , [object])

    function drawRhombus(context, item) {
        context.moveTo(item.x+item.w/2, item.y)
        context.lineTo(item.x, item.y+item.h/2);
        context.lineTo(item.x +item.w/2, item.h + item.y);
        context.lineTo(item.w + item.x, item.y + item.h/2);
        context.lineTo(item.x+item.w/2, item.y)
        context.lineTo(item.x, item.y+item.h/2);

    }


    const ref = useCanvas(draw)


    return (

        <canvas  ref={ref}></canvas>
    )

}

export default Rhombus