import {MdOutlineRectangle} from "react-icons/md";
import {BsPen} from "react-icons/bs";
import * as React from "react";
import {memo, useEffect, useRef, useState} from "react";
import css from '../../css/layout.module.css'
import {HiArrowNarrowUp} from "react-icons/hi";
import {LuMousePointer2} from "react-icons/lu";
import ChoseShapePopUp from "./SideBarPopUps/ChoseShapePopUp";
import DrawingPopUp from "./SideBarPopUps/DrawingPopUp";
import CaptionOnHover from "./utils/CaptionOnHover";
import {
    updateItems,
    saveObjectInfo,
    addItem,
    selectItems,
    getUpdates,
    setAllItems
} from "../../redux/Slices/itemsSlice";
import {useAppDispatch, useAppSelector} from "../../redux/hooks";
import {BiText} from "react-icons/bi";
import {ActionCreators} from 'redux-undo';
import {IoReturnDownBack, IoReturnUpForwardOutline} from "react-icons/io5";
import {selectCommon, updateTool} from "redux/Slices/commonSlice";
import {moveCurve} from "../tools/BezierCurves/utils";
import {v4 as uuidv4} from 'uuid';
import {Point} from "../../types/types";


const SideBar = memo(({setShape}) => {

    const dispatch = useAppDispatch()

    const [open, setOpen] = useState('')
    const popUps = useRef(null)
    const [selected, setSelected] = useState(1)
    const [toggle, setToggle] = useState(false)
    const [caption, setCaption] = useState('')
    const shapes = useAppSelector(selectItems)
    const common = useAppSelector(selectCommon)
    const option = common.tool
    const savedObject = useAppSelector(state => state.present.items.savedObject.saved)
    const toolbarRef = useRef(null)
    const bottomRef = useRef(null)
    const mousePositionRef = useRef<Point>(null)


    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown)
        return () => {
            window.removeEventListener('keydown', handleKeyDown)
        }
    }, [open, toggle, shapes, mousePositionRef.current, option])


    useEffect(() => {
        function saveMousePosition(e) {
            mousePositionRef.current = {
                x: e.clientX,
                y: e.clientY
            }
        }

        window.addEventListener('mousemove', saveMousePosition)
        return () => {
            window.removeEventListener('mousemove', saveMousePosition)
        }
    }, [])

    function handleEnter(name) {
        setCaption(name)
    }

    function handleLeave() {
        setCaption('')
    }

    function handleCurveCopy(object) {
        const center = {
            x: object.borders.x + object.borders.w / 2,
            y: object.borders.y + object.borders.h / 2,
        }

        const d = {
            x: mousePositionRef.current.x + common.scrollX - center.x,
            y: mousePositionRef.current.y + common.scrollY - center.y
        }

        const {
            newCurve,
            path
        } = moveCurve(object, d)

        dispatch(addItem({
            ...newCurve,
            curve: path,
            id: uuidv4()
        }))

    }


    function handleKeyDown(e) {
        if (e.code === "KeyZ" && e.ctrlKey && e.shiftKey) {
            e.preventDefault()
            e.stopPropagation()
            dispatch(ActionCreators.redo())
        } else if (e.code === "KeyZ" && e.ctrlKey) {
            e.preventDefault()
            e.stopPropagation()
            dispatch(ActionCreators.undo())
        }

        if (e.code === "Backspace" || e.code === "Delete") {
            dispatch(setAllItems({
                items: shapes.filter(el => !el.selected),
                removeIds: shapes.filter(el => el.selected).map(el => el.id)
            }))
            setToggle(!toggle)

        }

        if (e.code === 'KeyC' && e.ctrlKey) {
            dispatch(saveObjectInfo())
        }

        if (e.code === 'KeyV' && e.ctrlKey) {
            if (!savedObject) return

            const temp = (savedObject.object)

            const object = {
                ...temp,
                id: uuidv4(),
                x: (mousePositionRef.current.x + common.scrollX) / common.scale - (temp?.borders?.w || temp.w) / 2,
                y: (mousePositionRef.current.y + common.scrollY) / common.scale - (temp?.borders?.h || temp.h) / 2,
                copy: true
            }

            if (savedObject.type === 'shape') {
                dispatch(addItem(object))
            }
            if (savedObject.type === 'text') {
                dispatch(addItem(object))
            }
            if (savedObject.type === 'drawing') {
                dispatch(addItem(object))
            }
            if (savedObject.type === 'curve') {
                handleCurveCopy(object)
            }
        }

        if (e.code === 'KeyA' && e.altKey) {
            setOpen('')
            dispatch(updateTool("Selection"))
            dispatch(updateItems(getUpdates(shapes.map(el => {
                return {...el, selected: true}
            }))))
            setToggle(!toggle)
        }

        if (e.code === 'KeyV') {
            setOpen('')
            if (option === 'Selection') {
                dispatch(updateTool('Move'))
            } else {
                dispatch(updateTool('Selection'))
            }
        }
        if (e.code === 'KeyT') {
            setOpen('')
            dispatch(updateTool("Text"))
        }
        if (e.code === 'KeyD') {
            if (open !== 'Drawing') {
                setOpen('Drawing')
            } else {
                setOpen('')
            }
            dispatch(updateTool("Drawing"))
        }
        if (e.code === 'KeyS') {
            if (open !== 'Shape') {
                setOpen('Shape')
            } else {
                setOpen('')
            }
            dispatch(updateTool("Shape"))
        }
        if (e.code === 'KeyC' && !e.ctrlKey) {
            setOpen('')
            dispatch(updateTool("Curve"))
        }

    }

    function handleOpenPopUp(name) {
        if (open === name) {
            setOpen('')
        } else {
            setOpen(name)
        }
    }


    return (
        <>
            <div
                onMouseDown={e => {
                    e.preventDefault()
                    e.stopPropagation();
                    e.nativeEvent.stopImmediatePropagation()
                }}
                onMouseUp={e => {
                    if (!popUps.current || popUps.current.contains(e.target)) return;
                    e.stopPropagation();
                }}
                className={css.sideBar}

            >
                <div className={`${css.toolBar} rad-shadow`}
                     ref={toolbarRef} id={'sidebar'}
                     onKeyDown={handleKeyDown}>
                    <div className={option === 'Selection' ? `${css.item} ${css.selectedTool}` : css.item}
                         onMouseEnter={() => handleEnter('Selection')}
                         onMouseLeave={handleLeave}
                         onClick={() => {
                             if (option === 'Selection') {
                                 dispatch(updateTool('Move'))
                             } else {
                                 dispatch(updateTool('Selection'))
                             }
                             setOpen('')
                         }}>
                        {caption === 'Selection' && open === '' &&
                            <CaptionOnHover text={'Select'} short={"V, alt + A"}/>
                        }
                        <LuMousePointer2/>
                    </div>
                    <div className={option === 'Drawing' ? `${css.item} ${css.selectedTool}` : css.item}
                         onMouseEnter={() => handleEnter('Drawing')}
                         onMouseLeave={handleLeave}
                         onClick={() => {
                             dispatch(updateTool('Drawing'))
                             handleOpenPopUp('Drawing')
                         }}>
                        {caption === 'Drawing' && open === '' &&
                            <CaptionOnHover text={'Draw'} short={"D"}/>
                        }
                        <BsPen/>
                    </div>
                    <div className={option === 'Text' ? `${css.item} ${css.selectedTool}` : css.item}
                         onMouseEnter={() => handleEnter('Text')}
                         onMouseLeave={handleLeave}
                         onClick={() => {
                             dispatch(updateTool('Text'))
                             handleOpenPopUp('Text')
                         }}>
                        {caption === 'Text' && open === '' &&
                            <CaptionOnHover text={'Text'} short={"T"}/>
                        }
                        <BiText/>
                    </div>
                    <div className={option === 'Shape' ? `${css.item} ${css.selectedTool}` : css.item}
                         onMouseEnter={() => handleEnter('Shape')}
                         onMouseLeave={handleLeave}
                         onClick={() => {
                             dispatch(updateTool("Shape"))
                             handleOpenPopUp('Shape')
                         }}>
                        {caption === 'Shape' && open === '' &&
                            <CaptionOnHover text={'Shape'} short={"S"}/>
                        }
                        <MdOutlineRectangle/>
                    </div>
                    <div className={option === 'Curve' ? `${css.item} ${css.selectedTool}` : css.item}
                         onMouseEnter={() => handleEnter('Curve')}
                         onMouseLeave={handleLeave}
                         onClick={() => {
                             dispatch(updateTool('Curve'))
                             setOpen('')
                         }}>
                        {caption === 'Curve' && open === '' &&
                            <CaptionOnHover text={'Connection Line'} short={"C"}/>
                        }
                        <HiArrowNarrowUp/>
                    </div>


                    <div>
                        {open === 'Shape' &&
                            <ChoseShapePopUp setShape={setShape} setOpen={() => handleOpenPopUp('Shape')}/>

                        }
                        {open === 'Drawing' &&
                            <DrawingPopUp
                                cancelStopPropagationRef={popUps}
                                selected={selected}
                                setSelected={setSelected}
                                close={() => handleOpenPopUp('Drawing')}/>

                        }

                    </div>


                </div>

                <div className={`${css.bottomSection} rad-shadow`}
                     ref={bottomRef}
                >
                    <div className={css.item}
                         onMouseEnter={() => handleEnter('Forward')}
                         onMouseLeave={handleLeave}
                         onClick={(e) => {
                             e.preventDefault()
                             dispatch(updateTool("Selection"))
                             dispatch(ActionCreators.redo())
                             setOpen('')
                         }}>
                        {caption === 'Forward' && open === '' &&
                            <CaptionOnHover text={'Forward'} short={"Cntrl + Shift + Z"}/>
                        }
                        <IoReturnUpForwardOutline/>

                    </div>
                    <div className={css.item}
                         onMouseEnter={() => handleEnter('Back')}
                         onMouseLeave={handleLeave}
                         onClick={(e) => {
                             e.preventDefault()
                             dispatch(updateTool("Selection"))
                             dispatch(ActionCreators.undo())
                             setOpen('')
                         }}>
                        {caption === 'Back' && open === '' &&
                            <CaptionOnHover text={'Back'} short={"Cntrl + Z"}/>
                        }
                        <IoReturnDownBack/>

                    </div>

                </div>
            </div>
        </>
    )
})


export default SideBar