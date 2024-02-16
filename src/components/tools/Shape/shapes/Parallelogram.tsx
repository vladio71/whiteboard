import {ShapeConstructor} from "./Rectangle";


const Parallelogram = ({item}) => {

    function drawParallelogram(context, item) {
        context.moveTo(item.x + item.w / 5, item.y);
        context.lineTo(item.x, item.y + item.h);
        context.lineTo(item.x + item.w / 5 * 4, item.y + item.h);
        context.lineTo(item.x + item.w, item.y);
        context.lineTo(item.x + item.w / 5, item.y);
        if (!item.style?.line)
            context.lineTo(item.x, item.y + item.h);

    }

    return (
        <>
            <ShapeConstructor
                item={item}
                drawPathsFunction={(p1, p2, p3) => {
                    drawParallelogram(p1, {
                        x: item.x - 15,
                        y: item.y - 15,
                        w: item.w + 30,
                        h: item.h + 30
                    })
                    drawParallelogram(p2, item)
                    drawParallelogram(p3, {
                        x: item.x + 15,
                        y: item.y + 15,
                        w: item.w - 30,
                        h: item.h - 30
                    })

                }}
                drawShapeFunction={(ctx, scale) => {
                    drawParallelogram(ctx, {
                        x: 100 / scale,
                        y: 100 / scale,
                        w: item.w,
                        h: item.h
                    })
                }}
            />
        </>
    )
}

export default Parallelogram