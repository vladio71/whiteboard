import {useEffect, useRef, useState} from "react";
import {setTimeout} from "timers";
import {useAppDispatch, useAppSelector} from "../redux/hooks";
import {selectCommon, updateTool} from "../redux/Slices/commonSlice";


export const useScreenMove = (ref) => {


    const common = useAppSelector(selectCommon)
    const dispatch = useAppDispatch()
    const tool = common.tool
    const isUsed = tool === "Move"
    const [start, setStart] = useState({x: 0, y: 0})
    const [previousOption, setPreviousOption] = useState(tool)
    const [scrollPosition, setScrollPosition] = useState({x: 0, y: 0})
    const [down, setDown] = useState(false)
    const counter = useRef(0)

    useEffect(() => {

        const handleDown = (e) => {
            if (e.which == 2) {
                e.preventDefault()
                setPreviousOption(tool)
                dispatch(updateTool("Move"))
                onMouseDown(e)
            }
        }
        const handleup = (e) => {
            if (e.which == 2) {
                dispatch(updateTool(previousOption))
                setDown(false)
            }
        }

        window.addEventListener('mousedown', handleDown)
        window.addEventListener('mouseup', handleup)
        return () => {
            window.removeEventListener('mousedown', handleDown)
            window.removeEventListener('mouseup', handleup)
        }
    }, [tool, previousOption])


    useEffect(() => {

        if (isUsed) {
            document.body.style.cursor = "grab"
            window.addEventListener("mousedown", onMouseDown)
            window.addEventListener("mousemove", onMouseMove)
            window.addEventListener("mouseup", onMouseUp)
        } else {
            document.body.style.cursor = "default"
            window.removeEventListener("mousedown", onMouseDown)
            window.removeEventListener("mousemove", onMouseMove)
            window.removeEventListener("mouseup", onMouseUp)
        }
        return () => {
            window.removeEventListener("mousedown", onMouseDown)
            window.removeEventListener("mousemove", onMouseMove)
            window.removeEventListener("mouseup", onMouseUp)
        }

    }, [down, isUsed])


    function onMouseDown(e: MouseEvent) {
        const field = ref.current
        setDown(true)
        setScrollPosition({
            x: field.scrollLeft,
            y: field.scrollTop
        })
        setStart({
            x: e.clientX,
            y: e.clientY
        })
    }

    function onMouseMove(e: MouseEvent) {
        if (!down) return


        document.body.style.cursor = "grabbing"
        const field = ref.current
        const delta = {
            x: e.clientX - start.x,
            y: e.clientY - start.y
        }

        field.scrollLeft = scrollPosition.x - delta.x
        field.scrollTop = scrollPosition.y - delta.y
    }

    function onMouseUp() {
        setDown(false)
    }


}