import {useEffect, useRef, useState} from "react";
import {useAppDispatch, useAppSelector} from "../../../redux/hooks";
import {updateItems, selectItems, setObjectInfo, getUpdates} from "../../../redux/Slices/itemsSlice";
import {selectCommon} from "redux/Slices/commonSlice";


const SelectionTool = ({isUsed}) => {


    const dispatch = useAppDispatch()

    const [start, setStart] = useState({x: 0, y: 0})
    const [isSelecting, setIsSelecting] = useState(false)
    const [toggle, setToggle] = useState(false)
    const stepX = useRef(0)
    const stepY = useRef(0)
    const [style, setStyle] = useState({})


    // const drawings = useAppSelector(selectDrawings)
    // const curves = useAppSelector(selectCurves)
    const shapes = useAppSelector(selectItems)
    // const texts = useAppSelector(selectTexts)
    const common = useAppSelector(selectCommon)


    useEffect(() => {
        if (isUsed) {
            window.addEventListener('mousedown', handleDown)
            if (isSelecting)
                window.addEventListener('mousemove', handleMove)
            window.addEventListener('mouseup', handleUp)

            return () => {
                window.removeEventListener('mousemove', handleMove)
                window.removeEventListener('mousedown', handleDown)
                window.removeEventListener('mouseup', handleUp)
            }
        }
    }, [isSelecting, isUsed, toggle, stepX, common.scrollX, common.scrollY])


    function getRect(object) {
        if (object === undefined) return

        return {
            x: object.x - 20,
            y: object.y - 20,
            w: object.w + 40,
            h: (object?.shape === "Circle" ? object.w : object.h) + 60
        }
    }

    function handleDown(e) {
        if (e.which == 2) return


        const selection = {
            x: (e.clientX + common.scrollX) / common.scale,
            y: (e.clientY + common.scrollY) / common.scale,
            w: 5,
            h: 5
        }


        function checkCollection(arr, name) {
            if (arr.length > 0 && arr.some((el, id) => {

                if (checkRectIntersection(selection, getRect(el?.borders || el))) {
                    dispatch(setObjectInfo({
                        type: name,
                        object: el
                    }))
                    return true
                }
                return false

            })) return true
            return false
        }



        if (checkCollection(shapes, 'shape')) return
        // if (checkCollection(curves, 'curve')) return
        // if (checkCollection(texts, 'text')) return
        // if (checkCollection(drawings, 'drawing')) return


        setStart({
            x: e.clientX + common.scrollX,
            y: e.clientY + common.scrollY,
        })
        setIsSelecting(true)
        setStyle({
            position: 'absolute'
        })
    }


    function handleMove(e) {
        if (!isSelecting) return

        e.preventDefault()
        const endX = (e.clientX + common.scrollX)
        const endY = (e.clientY + common.scrollY)


        const selection = {
            x: (start.x < endX ? start.x : endX),
            y: (start.y < endY ? start.y : endY),
            w: Math.abs(start.x - endX),
            h: Math.abs(start.y - endY)
        }

        setStyle({
            background: 'rgba(123, 141, 255, 0.2)',
            border: '2px solid rgba(123, 141, 255, 0.8)',
            left: `${selection.x}px`,
            top: `${selection.y}px`,
            width: `${selection.w}px`,
            height: `${selection.h}px`,
            position: 'absolute'
        })
        selection.x /= common.scale
        selection.y /= common.scale

        const isUpdating = Math.floor(selection.w / 50) > stepX.current || Math.floor(selection.h / 50) > stepY.current
        const isUpdatingBack = Math.floor(stepX.current) > selection.w / 50 || Math.floor(stepY.current) > selection.h / 50
        stepX.current = selection.w / 50
        stepY.current = selection.h / 50


        if (isUpdating || isUpdatingBack) {
            // let temp = drawings.map(el => {
            //     return {...el}
            // })
            //
            // drawings.forEach((rect, id) => {
            //     temp[id].selected = checkRectIntersection(selection, rect);
            // })
            // dispatch(updateDrawings(temp))
            //
            // temp = texts.map(el => {
            //     return {...el}
            // })
            //
            //
            // texts.forEach((rect, id) => {
            //     temp[id].selected = checkRectIntersection(selection, rect);
            // })
            // dispatch(updateTexts(temp))
            //
            // temp = curves.map(el => {
            //     return {...el}
            // })
            // temp.forEach((curve, id) => {
            //     temp[id].selected = checkRectIntersection(selection, curve.borders);
            // })
            // dispatch(updateCurves(temp))


            const temp = shapes.map(el => {
                return {...el}
            })
            temp.forEach((shape, id) => {

                temp[id].selected = checkRectIntersection(selection, getRect(shape?.borders || shape));
            })
            dispatch(updateItems(getUpdates(temp)))
        }
    }


    function handleUp(e) {
        setTimeout(() => {
            setToggle(!toggle)
        }, 0)
        setIsSelecting(false)
        setStyle({})
    }


    return (

        <>
            {(isUsed && isSelecting) &&
                <div style={style}/>

            }

        </>
    )

}

export function checkRectIntersection(r1, r2) {
    if (!r1?.x || !r2?.x) return false
    return !(r1.x + r1.w < r2.x ||
        r2.x + r2.w < r1.x ||
        r1.y + r1.h < r2.y ||
        r2.y + r2.h < r1.y);


}


export default SelectionTool