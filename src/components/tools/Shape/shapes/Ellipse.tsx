import {ShapeConstructor} from "./Rectangle";


const Ellipse = ({item}) => {
    const radiusX = Math.abs(item.w / 2)
    const radiusY = Math.abs(item.h / 2)
    const centerX = Math.abs(item.x + radiusX)
    const centerY = Math.abs(item.y + radiusY)
    return (
        <>
            <ShapeConstructor
                item={item}
                drawPathsFunction={(p1,p2,p3) => {
                    p1.ellipse(centerX, centerY, radiusX + 15, radiusY + 30, Math.PI, 0, 2 * Math.PI)
                    p2.ellipse(centerX, centerY, radiusX, radiusY, Math.PI, 0, 2 * Math.PI)
                    p3.ellipse(centerX, centerY, Math.abs(radiusX - 15), Math.abs(radiusY - 30), Math.PI, 0, 2 * Math.PI)
                }}
                drawShapeFunction={(ctx,scale) => {
                    ctx.ellipse(100/scale+radiusX, 100/scale+radiusY, radiusX, radiusY, Math.PI, 0, 2 * Math.PI)
                }}
            />
        </>
    )
}

export default Ellipse