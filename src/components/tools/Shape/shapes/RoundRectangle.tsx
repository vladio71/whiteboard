import {ShapeConstructor} from "./Rectangle";

const RoundRectangle = ({item}) => {
    return (
        <>
            <ShapeConstructor
                item={item}
                drawPathsFunction={(p1, p2, p3) => {
                    p1.roundRect(item.x - 15, item.y - 15, item.w + 30, item.h + 30, 20)
                    p2.roundRect(item.x, item.y, item.w, item.h, 20)
                    p3.roundRect(item.x + 15, item.y + 15, item.w - 30, item.h - 30, 20)

                }}
                drawShapeFunction={(ctx) => {
                    ctx.roundRect(item.x, item.y, item.w, item.h, 20)
                }}
            />
        </>
    )
}

export default RoundRectangle