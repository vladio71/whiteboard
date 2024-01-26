import {useAppDispatch, useAppSelector} from "../../redux/hooks";
import {useEffect, useRef, useState} from "react";
import {addShape, removeShape, selectShapes, setWhiteboardData} from "../../redux/Slices/shapesSlice";
import {convertToRaw, EditorState} from "draft-js";
import {
    updateHeight,
    updateScale,
    updateScroll,
    setBoardId,
    selectCommon,
    setFetchStatus
} from "../../redux/Slices/commonSlice";
import * as React from "react";
import {Point} from "../page";
import {setAllData, addNewBoard, auth} from "../../firebase/firebase";
import {useRouter} from "next/navigation";
import {clearInterval, clearTimeout, setInterval, setTimeout} from "timers";
import {debounce} from "app/utils/utils";
import lifecycle from "page-lifecycle/dist/lifecycle.es5";
import document from "postcss/lib/document";
import {store} from "../../redux/store";


export const useHome = (boardId) => {


    const dispatch = useAppDispatch()
    const router = useRouter()


    const [shape, setShape] = useState('')
    const [option, setOption] = useState('Move')
    const [moveDown, setMoveDown] = useState(false)
    const common = useAppSelector(selectCommon)
    const mousePosition = useRef<Point>({x: 0, y: 0})
    const [isReady, setIsReady] = useState(false)
    const [zoomId, setZoomId] = useState(4)
    const [width, setWidth] = useState(0)
    const [height, setHeight] = useState(0)
    const [scrollLeft, setScrollLeft] = useState(0)
    const [scrollTop, setScrollTop] = useState(0)
    const userView = useRef<React.ReactNode>(null)
    const fieldRef = useRef(null)
    const backImage = useRef(null)
    const mountedRef = useRef()
    const addNewBoardRef = useRef(0)
    const zoomRef = useRef(1)
    const throttleRef = useRef(false)
    const intervalRef = useRef(0)
    const zoomWithMouseRef = useRef(false)

    const debouncedUpdateScroll = useRef(debounce(() => {
        dispatch(updateScroll({
            x: userView.current.scrollLeft,
            y: userView.current.scrollTop
        }))
    }, 300))

    const scale = [0.5, 0.75, 0.8, 0.9, 1, 1.1, 1.25, 1.5, 2]

    const shapes = useAppSelector(selectShapes)


    useEffect(() => {
        const x = window.innerWidth
        const y = window.innerHeight
        if (userView.current !== null) {
            setTimeout(() => {
                console.log(store.getState().present.shape.paths)
                const paths = store.getState().present.shape.paths.slice(0, 10)
                if (paths.length > 0) {
                    let path = paths.reduce((a, b) => {
                        let start = (a.center || a)
                        return {x: (start.x + b.center.x) / 2, y: (start.y + b.center.y) / 2}
                    })
                    if (paths.length === 1)
                        path = paths[0].center
                    userView.current.scrollTo(path.x - x * .5, path.y - y * .5)
                } else {
                    userView.current.scrollTo(x * 1.5, y * 1.5)
                }

                setIsReady(true)
            }, 200)

        }


        setTimeout(() => {
            const initaial = fieldRef.current.getBoundingClientRect()
            setWidth(initaial.width)
            setHeight(initaial.height)
        }, 200)
        setScrollLeft(userView.current?.scrollLeft)
        setScrollTop(userView.current?.scrollTop)

        dispatch(updateScroll({x: userView.current.scrollLeft, y: userView.current.scrollTop}))
        dispatch(updateHeight({w: userView.current.scrollWidth, h: userView.current.scrollHeight}))
        if (auth?.currentUser && boardId === "new") {
            addNewBoard(auth.currentUser?.uid).then((id) => {
                dispatch(setBoardId(id))
                router.replace(`/board/${id}`)
                dispatch(setFetchStatus(true))

            })
        }

        intervalRef.current = setInterval(() => {
            dispatch(setWhiteboardData())
        }, 30000)

        window.addEventListener('keydown', function (e) {
            if ((e.ctrlKey || e.metaKey) && (e.which === 61 || e.which === 107 || e.which === 173 || e.which === 109 || e.which === 187 || e.which === 189)) {
                e.preventDefault();
            }
        }, false);


        userView.current.addEventListener('scroll', () => debouncedUpdateScroll.current())
        window.addEventListener('wheel', (e) => {
            if (e.ctrlKey)
                e.preventDefault()
        }, {passive: false});

        lifecycle.addEventListener('visibilitychange', function (event) {
            if (event.originalEvent == 'visibilitychange' && event.newState == 'hidden') {
                navigator.sendBeacon(url, data);
            }
        });

        return () => {
            clearInterval(intervalRef.current)
        }
    }, [])


    useEffect(() => {
        if (mountedRef.current) {
            dispatch(updateHeight({w: width * scale[zoomId], h: height * scale[zoomId]}))
            fieldRef.current.style.width = width * scale[zoomId] + 'px'
            fieldRef.current.style.height = height * scale[zoomId] + 'px'
            backImage.current.style.width = width * scale[zoomId] + 'px'
            backImage.current.style.height = height * scale[zoomId] + 'px'
            if (zoomWithMouseRef.current) {
                userView.current.scrollLeft = scrollLeft * scale[zoomId] - mousePosition.current.x * (1 - scale[zoomId])
                userView.current.scrollTop = scrollTop * scale[zoomId] - mousePosition.current.y * (1 - scale[zoomId])
            } else {
                userView.current.scrollLeft = scrollLeft * scale[zoomId] - window.innerWidth / 2 * (1 - scale[zoomId])
                userView.current.scrollTop = scrollTop * scale[zoomId] - window.innerHeight / 2 * (1 - scale[zoomId])
            }

            // dispatch(asyncScale(scale[zoomId]))
            dispatch(updateScale(scale[zoomId]))
            zoomWithMouseRef.current = false
        } else {
            mountedRef.current = true
        }
    }, [zoomId])


    useEffect(() => {
        if (zoomRef.current === common.scale && mountedRef.current) {
            setScrollTop(userView.current?.scrollTop / (common.scale * 100 - (1 - common.scale) * 30) * 100)
            setScrollLeft(userView.current?.scrollLeft / (common.scale * 100 - (1 - common.scale) * 30) * 100)
        }
        zoomRef.current = common.scale
    }, [userView.current?.scrollLeft, userView.current?.scrollTop])


    useEffect(() => {
        function zoom(e) {
            if (e.ctrlKey) {
                if (e.deltaY < 0 || e.key === "+" || e.key === "=") {
                    if (zoomId < scale.length - 1) {
                        setZoomId(zoomId + 1)
                    }
                } else if (e.deltaY > 0 || e.key === "-") {
                    if (zoomId > 0) {
                        setZoomId(zoomId - 1)
                    }
                }
                zoomWithMouseRef.current = true
            }
        }

        const throttledZoom = throttle(zoom, 100, throttleRef.current)
        const throttledKeyDownZoom = throttle((e) => {
            if ((e.ctrlKey || e.metaKey) && (e.which === 61 || e.which === 107 || e.which === 173 || e.which === 109 || e.which === 187 || e.which === 189)) {
                zoom(e)
            }
        }, 100, throttleRef.current)
        window.addEventListener('wheel', throttledZoom, {passive: false});
        window.addEventListener('keydown', throttledKeyDownZoom, false);
        return () => {
            window.removeEventListener('wheel', throttledZoom)
            window.removeEventListener('keydown', throttledKeyDownZoom);

        }
    }, [zoomId, mousePosition.current, width, height, scrollLeft, scrollTop])


    useEffect(() => {
        function saveMousePosition(e) {
            mousePosition.current = {
                x: e.clientX,
                y: e.clientY
            }
        }

        window.addEventListener('mousemove', saveMousePosition)
        return () => {
            window.removeEventListener('mousemove', saveMousePosition)
        }
    }, [])


    function throttle(cb: Function, delay: number) {
        return (...args) => {
            if (throttleRef.current) return

            throttleRef.current = true
            cb(...args)

            setTimeout(() => {
                throttleRef.current = false
            }, delay)
        }
    }

    //
    // function debounce(cb: Function, delay: number) {
    //     let timer = null
    //     return (...args) => {
    //          clearTimeout(timer)
    //
    //         timer = setTimeout(() => {
    //             cb(args)
    //         }, delay)
    //
    //     }
    //
    // }


    function handleRemoveShape(e, id) {
        if (e.key === "Backspace" || e.key === "Delete") {
            dispatch(removeShape(id))
        }

    }

    function handleAddShape(e) {
        if (shape === '') return
        dispatch(addShape({
            shape: shape,
            x: (e.clientX + common.scrollX) / common.scale as number,
            y: (e.clientY + common.scrollY) / common.scale as number,
            w: 130,
            h: 130,
            style: {borderThickness: 0.1},
            editor: convertToRaw(EditorState.createEmpty().getCurrentContent())
        }))
        setShape('')
        setOption('Selection')
    }


    return {
        option,
        setOption,
        setShape,
        handleRemoveShape,
        handleAddShape,
        shapes,
        userView,
        isReady,
        fieldRef,
        backImage,
        zoomId,
        setZoomId,
        moveDown
    }
}