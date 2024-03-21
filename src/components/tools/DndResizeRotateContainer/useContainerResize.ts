import {useContext, useEffect, useMemo, useRef, useState} from "react";
import {LevelContext} from "../../../app/page";
import {useAppSelector} from "../../../redux/hooks";
import useClickOutside from "../../../hooks/useClickOutside";
import {batchGroupBy} from "../../../utils/batchGroupBy";


export const useContainerResize = (editorObject, isUsable, child, container, saveChanges) => {

    const level = useContext(LevelContext)


    const common = useAppSelector(state => state.present.common)
    const [start, setStart] = useState({x: 0, y: 0})
    const [center, setCenter] = useState({
        x: editorObject.x + editorObject.w / 2,
        y: editorObject.y + editorObject.h / 2
    })
    const [down, setDown] = useState(false)
    const [editMode, setEditMode] = useState(false)
    const [direction, setDirection] = useState('')
    const [object, setObject] = useState({
        ...editorObject,
        angle: 0,
    })
    const [toggle, setToggle] = useState(true)
    const leftEdge = useMemo(() => (object.w + object.x), [down, toggle])
    const edge = useMemo(() => object.x, [down, direction])
    const topEdge = useMemo(() => (object.h + object.y), [direction])
    const timerRef = useRef<null | Date>(null)


    const TextStyle = {
        position: "absolute",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        left: (object.x) * common.scale - 10,
        top: (object.y) * common.scale - 10,
        width: (object.w) * common.scale + 20,
        height: (object.shape === "Circle" ? object.w : object.h) * common.scale + 20,
        padding: "10px",
        outline: editMode ? "2px solid lightblue" : "none",
        transform: `rotate(${object?.angle}deg)`,
        transition: 'background .2s ease-out',
        zIndex: 100,
    }
    const overlayStyle = {

        position: "absolute",
        display: "flex",
        alignItems: "center",
        left: -10,
        top: -10,
        width: (object.w + 60) * common.scale,
        height: ((object.shape === "Circle" ? object.w : object.h) + 60) * common.scale,
        padding: "10px",
    }


    useEffect(() => {
        setObject({...editorObject, angle: object.angle}) // here is the gem
    }, [editorObject.x, editorObject.y, editorObject.w, editorObject.h, editorObject?.shape])

    useEffect(() => {
        setToggle(!toggle)
    }, [common.scrollX, common.scrollY])

    useEffect(() => {
        setCenter(
            {x: object.x + object.w / 2, y: object.y + object.h / 2}
        )
    }, [object.x, object.y, object.w, object.h])


    useClickOutside(container, (e) => {
        setEditMode(false)
    })


    function handleMouseDown(e) {

        if (e.button != 0 || isUsable !== "Selection") return
        //TODO:if(thereis curves attached and it`s shape wrapper)
        batchGroupBy.start()


        timerRef.current = new Date();
        const clientX = e.clientX + common.scrollX
        const clientY = e.clientY + common.scrollY

        let dndCheck = e.target.nodeName
        if (dndCheck === "DIV") {
            dndCheck = e.target.getAttribute('data-offset-key')

        }

        const outsideTextEditor = e.target !== child.current && !child.current.contains(e.target) && e.button === 0
        if (dndCheck === null || outsideTextEditor || !editMode) {
            setStart({x: clientX, y: clientY})
            setDown(true)
        }
    }

    function handleMouseMove(e) {
        if (object.angle % 360 !== 0 && !(direction === "rotate" || direction === "")) return;
        if (!down || isUsable !== "Selection") return
        const clientX = (e.clientX + common.scrollX) / common.scale
        const clientY = (e.clientY + common.scrollY) / common.scale

        if (direction !== "") {
            setObject(prev => {

                switch (direction) {
                    case "bottom":
                        if (clientY <= object.y) {
                            setDirection("top")
                            setToggle(!toggle)
                            return {
                                ...object,
                                y: clientY,
                                h: 2
                            }
                        }

                        return {
                            ...object,
                            h: (clientY - object.y)
                        }
                    case "top":
                        if (clientY >= topEdge) {
                            setDirection("bottom")
                            setToggle(!toggle)
                            return {
                                ...object,
                                y: object.h + object.y,
                                h: 2
                            }
                        }
                        return {
                            ...object,
                            y: clientY,
                            h: (topEdge - clientY),
                        }
                    case "left":
                        if (clientX >= leftEdge) {
                            setDirection("right")
                            setToggle(!toggle)
                            return {
                                ...object,
                                w: 2,
                                x: clientX,
                            }
                        }
                        return {
                            ...object,
                            x: clientX,
                            w: (leftEdge - clientX),
                        }
                    case "right":
                        if (clientX <= object.x) {
                            setDirection("left")
                            setToggle(!toggle)
                            return {
                                ...object,
                                w: 2,
                                x: clientX,
                            }

                        }
                        return {
                            ...object,
                            w: (clientX - object.x),
                        }
                    case "rt":
                        if (clientY >= topEdge || clientX <= object.x) {
                            return handleReverseRt(clientX, clientY, object)
                        }
                        return {
                            ...object,
                            w: (clientX - object.x),
                            y: clientY,
                            h: (topEdge - clientY),
                        }
                    case "lt":
                        if (clientY >= object.h + object.y || clientX >= leftEdge) {
                            return handleReverseLt(clientX, clientY, object)
                        }
                        return {
                            ...object,
                            y: clientY,
                            x: clientX,
                            w: leftEdge - clientX,
                            h: topEdge - clientY,
                        }
                    case "br":
                        if (clientY <= object.y || clientX <= object.x) {
                            return handleReverseBr(clientX, clientY, object)
                        }
                        return {

                            ...object,
                            w: clientX - object.x,
                            h: clientY - object.y

                        }
                    case "bl":
                        if (clientY <= object.y || clientX >= leftEdge) {
                            return handleReverseBl(clientX, clientY, object)
                        }
                        return {
                            ...object,
                            w: clientX >= leftEdge ? object.w : object.w - clientX + object.x,
                            x: clientX >= leftEdge ? leftEdge - 2 : clientX,
                            h: clientY - object.y
                        }
                    case "rotate":
                        const center = {x: object.x + object.w / 2, y: object.y + object.h / 2}
                        const v1 = {x: start.x - center.x, y: start.y - center.y}
                        const v2 = {x: clientX - center.x, y: clientY - center.y}

                        const firstAngle = Math.atan2(v1.y, v1.x);
                        const secondAngle = Math.atan2(v2.y, v2.x);
                        const a = secondAngle - firstAngle;
                        const newAngle = a * 180 / Math.PI;
                        if (Math.abs((object.angle + newAngle) % 45) < 10) {
                            return {
                                ...object,
                                angle: object.angle + newAngle - (object.angle + newAngle) % 45
                            }
                        } else {
                            return {
                                ...object,
                                angle: object.angle + newAngle
                            }
                        }
                }
                return prev

            })
        } else {


            const d = {x: clientX * common.scale - start.x, y: clientY * common.scale - start.y}
            setObject({
                ...object,
                x: object.x + d.x / common.scale,
                y: object.y + d.y / common.scale,
            })
            // setToggle(!toggle)
        }

    }

    function handleReverseRt(clientX, clientY, el) {
        if (clientY >= topEdge) {
            setDirection("br")
            setToggle(!toggle)
            return {
                ...el,
                y: el.h + el.y,
                h: 2
            }
        } else {
            setDirection("lt")
            setToggle(!toggle)
            return {
                ...el,
                w: 2,
                x: clientX,
            }
        }
    }

    function handleReverseLt(clientX, clientY, el) {
        if (clientY >= el.h + el.y) {
            setDirection("bl")
            setToggle(!toggle)
            return {
                ...el,
                y: el.h + el.y,
                h: 2
            }
        } else {
            setDirection("rt")
            setToggle(!toggle)
            return {
                ...el,
                w: 2,
                x: clientX,
            }

        }
    }

    function handleReverseBr(clientX, clientY, el) {
        if (clientY <= el.y) {
            setDirection("rt")
            setToggle(!toggle)
            return {
                ...el,
                y: clientY,
                h: 2
            }
        } else {
            setDirection("bl")
            setToggle(!toggle)
            return {
                ...el,
                w: 2,
                x: clientX,
            }

        }
    }

    function handleReverseBl(clientX, clientY, el) {
        if (clientY <= el.y) {
            setDirection("lt")
            setToggle(!toggle)
            return {
                ...el,
                y: clientY + 10,
                h: 2
            }
        } else {
            setDirection("br")
            setToggle(!toggle)
            return {
                ...el,
                w: el.x - clientX,
                x: leftEdge,
            }

        }
    }

    async function handleMouseUp(e) {
        batchGroupBy.confirmEnd()
        setDown(false)
        // setToggle(!toggle)
        setDirection('')
        setObject(prev => {
            saveChanges(prev)
            return prev
        })

        // if (object) {
        //     saveChanges(object)
        // }
    }

    const handleClearDir = () => {
        if (down) return
        setToggle(!toggle)
        setDirection('')
    }

    const handleMouseOver = (str) => {
        if (!down)
            setDirection(str)
    }

    function addCurve(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {

        const style = getComputedStyle(e.target)
        const rect = e.target.getBoundingClientRect()
        let x = rect.x + rect.width / 2
        let y = rect.y + rect.height / 2


        if (style.top === "-30px")
            y += 35
        if (style.bottom === "-30px")
            y -= 35
        if (style.right === "-30px")
            x -= 35
        if (style.left === "-30px")
            x += 35


        setEditMode(false)
        level?.setOption("Curve")
        level?.setStart({x: (x + common.scrollX) / common.scale, y: (y + common.scrollY) / common.scale})
        level?.setShapeId(editorObject.id)

    }


    return {
        handleClearDir,
        handleMouseOver,
        handleMouseDown,
        handleMouseMove,
        handleMouseUp,
        addCurve,
        toggle,
        object,
        center,
        editMode,
        setEditMode,
        timerRef,
        down,
        TextStyle,
        overlayStyle,
        common
    }


}