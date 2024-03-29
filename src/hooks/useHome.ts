import {useAppDispatch, useAppSelector} from "../redux/hooks";
import {useEffect, useMemo, useRef, useState} from "react";
import {addItem, removeItem, selectPaths, selectItems, setWhiteboardData, fetchData} from "../redux/Slices/itemsSlice";
import {convertToRaw, EditorState} from "draft-js";
import {
    updateHeight,
    updateScale,
    updateScroll,
    selectCommon,
    setFetchStatus, setBoardId, setRefreshFlag, setBoardName, updateZoom, updateTool
} from "../redux/Slices/commonSlice";
import * as React from "react";
import {useParams,} from "next/navigation";
import {clearInterval, clearTimeout, setInterval, setTimeout} from "timers";
import {debounce, throttle} from "utils/utils";
import {store} from "../redux/store";
import {v4 as uuidv4} from 'uuid';
import {Point} from "../types/types";

const scale = [0.5, 0.75, 0.8, 0.9, 1, 1.1, 1.25, 1.5, 2]


export const useHome = () => {


    const dispatch = useAppDispatch()
    const params = useParams()
    const shapes = useAppSelector(selectItems)
    const common = useAppSelector(selectCommon)
    const zoomId = common.zoomId
    const [shape, setShape] = useState('')
    const mousePosition = useRef<Point>({x: 0, y: 0})
    const [isReady, setIsReady] = useState(false)
    const [width, setWidth] = useState(0)
    const [height, setHeight] = useState(0)
    const [scrollLeft, setScrollLeft] = useState(0)
    const [scrollTop, setScrollTop] = useState(0)

    const userView = useRef<React.ReactNode>(null)
    const fieldRef = useRef(null)
    const backImage = useRef(null)

    const mountedRef = useRef(false)
    const zoomRef = useRef(1)
    const intervalRef = useRef(0)
    const zoomWithMouseRef = useRef(false)


    useEffect(() => {

        let observerRefValue = userView.current;
        if (typeof window !== 'undefined') {
            fetchOrPersistData()
            scrollToContentOrCenter()
            setInitialData()

            window.addEventListener('keydown', handlePreventKeyDown, false);
            observerRefValue.addEventListener('scroll', debouncedUpdateScroll)
            window.addEventListener('wheel', handlePreventWheel, {passive: false});
            window.addEventListener('mousemove', saveMousePosition)

            intervalRef.current = setInterval(() => {
                dispatch(setWhiteboardData())
            }, 30000)
        }
        return () => {
            window.removeEventListener('keydown', handlePreventKeyDown, false);
            observerRefValue.removeEventListener('scroll', debouncedUpdateScroll)
            window.removeEventListener('wheel', handlePreventWheel, {passive: false});
            window.removeEventListener('mousemove', saveMousePosition)
            clearInterval(intervalRef.current)
        }
    }, [])


    useEffect(() => {
        if (mountedRef.current) {
            handleCustomZoom()
        } else {
            setTimeout(() => mountedRef.current = true, 100)
        }
    }, [zoomId])


    useEffect(() => {
        updateScrollValues()
    }, [userView.current?.scrollLeft, userView.current?.scrollTop])


    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.addEventListener('wheel', throttledUpdateZoomId, {passive: false});
            window.addEventListener('keydown', throttledKeyDownUpdateZoomId, false);
        }
        return () => {
            window.removeEventListener('wheel', throttledUpdateZoomId)
            window.removeEventListener('keydown', throttledKeyDownUpdateZoomId);
        }
    }, [zoomId, mousePosition.current, width, height, scrollLeft, scrollTop])


    function fetchOrPersistData() {
        if (params?.id) {
            if (!common.isRefreshed) {
                dispatch(fetchData(params.id))
            }
            dispatch(setBoardId(params.id))
        } else {
            dispatch(setFetchStatus(true))
        }
        dispatch(setRefreshFlag(true))

        if (params?.boardName) {
            dispatch(setBoardName(params?.boardName))
        }

    }

    function scrollToContentOrCenter() {
        const x = window.innerWidth
        const y = window.innerHeight
        if (userView.current !== null) {
            setTimeout(() => {

                const paths = selectPaths(store.getState()).slice(0, 10)
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
    }

    function setInitialData() {
        setTimeout(() => {
            const initaial = fieldRef.current.getBoundingClientRect()
            setWidth(initaial.width)
            setHeight(initaial.height)
        }, 200)
        setScrollLeft(userView.current?.scrollLeft)
        setScrollTop(userView.current?.scrollTop)

        dispatch(updateScroll({x: userView.current.scrollLeft, y: userView.current.scrollTop}))
        dispatch(updateHeight({w: userView.current.scrollWidth, h: userView.current.scrollHeight}))
    }


    const debouncedUpdateScroll = debounce(() => {
        dispatch(updateScroll({
            x: userView.current.scrollLeft,
            y: userView.current.scrollTop
        }))
    }, 300)

    function handlePreventKeyDown(e) {
        if ((e.ctrlKey || e.metaKey) && (e.which === 61 || e.which === 107 || e.which === 173 || e.which === 109 || e.which === 187 || e.which === 189)) {
            e.preventDefault();
        }
    }

    function handlePreventWheel(e) {
        if (e.ctrlKey)
            e.preventDefault()
    }

    function saveMousePosition(e) {
        mousePosition.current = {
            x: e.clientX,
            y: e.clientY
        }
    }

    function handleCustomZoom() {
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

        dispatch(updateScale(scale[zoomId]))
        zoomWithMouseRef.current = false
    }


    const throttledUpdateZoomId = throttle(updateZoomId, 100)
    const throttledKeyDownUpdateZoomId = throttle((e) => {
        if ((e.ctrlKey || e.metaKey) && (e.which === 61 || e.which === 107 || e.which === 173 || e.which === 109 || e.which === 187 || e.which === 189)) {
            updateZoomId(e)
        }
    }, 100)

    function updateZoomId(e) {
        if (e.ctrlKey) {
            if (e.deltaY < 0 || e.key === "+" || e.key === "=") {
                if (zoomId < scale.length - 1) {
                    dispatch(updateZoom(zoomId + 1))
                    // setZoomId(zoomId + 1)
                }
            } else if (e.deltaY > 0 || e.key === "-") {
                if (zoomId > 0) {
                    dispatch(updateZoom(zoomId - 1))
                    // setZoomId(zoomId - 1)
                }
            }
            zoomWithMouseRef.current = true
        }
    }

    function updateScrollValues() {
        if (zoomRef.current === common.scale && mountedRef.current) {
            setScrollTop(userView.current?.scrollTop / (common.scale * 100 - (1 - common.scale) * 30) * 100)
            setScrollLeft(userView.current?.scrollLeft / (common.scale * 100 - (1 - common.scale) * 30) * 100)
        }
        zoomRef.current = common.scale
    }


    function handleAddShape(e) {
        if (shape === '') return
        dispatch(addItem({
            id: uuidv4(),
            shape: shape,
            x: (e.clientX + common.scrollX) / common.scale as number,
            y: (e.clientY + common.scrollY) / common.scale as number,
            w: 130,
            h: 130,
            style: {borderThickness: 0.1},
            editor: convertToRaw(EditorState.createEmpty().getCurrentContent()),
            creationTime: Date.now()
        }))
        setShape('')
        dispatch(updateTool('Selection'))
    }


    return {
        setShape,
        handleAddShape,
        shapes,
        userView,
        isReady: isReady && !common.isFetching,
        fieldRef,
        backImage,
    }
}