import {ShapeConstructor} from "./Rectangle";


const Triangle = ({item}) => {
    function drawTriangle(context, item) {
        context.moveTo(item.x + item.w / 2, item.y);
        context.lineTo(item.x, item.y + item.h);
        context.lineTo(item.x + item.w, item.y + item.h);
        context.lineTo(item.x + item.w / 2, item.y);
        if (!item.style?.line)
            context.lineTo(item.x, item.y + item.h);
    }
    return (
        <>
            <ShapeConstructor
                item={item}
                drawPathsFunction={(p1, p2, p3) => {
                    drawTriangle(p1, {
                        x: item.x-30,
                        y: item.y-30,
                        w:item.w+60,
                        h:item.h+40
                    })
                    drawTriangle(p2, item)
                    drawTriangle(p3, {
                        x: item.x+30,
                        y: item.y+30,
                        w:item.w-60,
                        h:item.h-50
                    })

                }}
                drawShapeFunction={(ctx,scale) => {
                    drawTriangle(ctx, {
                        x: 100/scale,
                        y: 100/scale,
                        w: item.w,
                        h: item.h
                    })
                }}
            />
        </>
    )
}

export default Triangle