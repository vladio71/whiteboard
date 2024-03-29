// import {ShapeConstructor} from "./Rectangle";
//
//
// const Circle = ({item}) => {
//     return (
//         <>
//             <ShapeConstructor
//                 item={item}
//                 drawPathsFunction={(p1, p2, p3) => {
//                     p1.arc(item.x + item.w / 2, item.y + item.h / 2, Math.abs((item.w / 2) + 30), 0, 2 * Math.PI);
//                     p2.arc(item.x + item.w / 2, item.y + item.h / 2, Math.abs(item.w / 2), 0, 2 * Math.PI);
//                     p3.arc(item.x + item.w / 2, item.y + item.h / 2, Math.abs((item.w / 2) - 30), 0, 2 * Math.PI);
//                 }}
//                 drawShapeFunction={(ctx) => {
//                     ctx.arc( 100+item.w / 2, 100+item.h / 2, Math.abs(item.w / 2), 0, 2 * Math.PI);
//                 }}
//
//             />
//         </>
//     )
// }
//
// export default Circle