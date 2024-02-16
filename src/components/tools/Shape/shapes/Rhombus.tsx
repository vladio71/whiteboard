import {ShapeConstructor} from "./Rectangle";


const Rhombus = ({item}) => {
    function drawRhombus(context, item) {
        context.moveTo(item.x + item.w / 2, item.y)
        context.lineTo(item.x, item.y + item.h / 2);
        context.lineTo(item.x + item.w / 2, item.h + item.y);
        context.lineTo(item.w + item.x, item.y + item.h / 2);
        context.lineTo(item.x + item.w / 2, item.y)
        if (!item.style?.line)
            context.lineTo(item.x, item.y + item.h / 2);

    }

    return (
        <>
            <ShapeConstructor
                item={item}
                drawPathsFunction={(p1, p2, p3) => {
                    drawRhombus(p1, {
                        x: item.x - 30,
                        y: item.y - 30,
                        w: item.w + 60,
                        h: item.h + 60
                    })
                    drawRhombus(p2, item)
                    drawRhombus(p3, {
                        x: item.x + 25,
                        y: item.y + 25,
                        w: item.w - 50,
                        h: item.h - 50,
                    })
                }}
                drawShapeFunction={(ctx, scale) => {
                    drawRhombus(ctx, {
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

export default Rhombus