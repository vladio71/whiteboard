import {MdOutlineRectangle} from "react-icons/md";
import {BsPen} from "react-icons/bs";
import * as React from "react";
import {useEffect, useRef, useState} from "react";
import css from '../../css/layout.module.css'
import {HiArrowNarrowUp} from "react-icons/hi";
import {LuMousePointer2} from "react-icons/lu";
import ChoseShapePopUp from "./SideBarPopUps/ChoseShapePopUp";
import DrawingPopUp from "./SideBarPopUps/DrawingPopUp";
import CaptionOnHover from "./utils/CaptionOnHover";
import {updateDrawings, addDrawing, selectDrawings} from "../../redux/Slices/drawingSlice";
import {selectCurves, updateCurves} from "../../redux/Slices/curvesSlice";
import {addText, selectTexts, updateTexts} from "../../redux/Slices/textSlice";
import {addCurve} from "../../redux/Slices/curvesSlice";
import {updateShapes, saveObjectInfo, addShape, selectShapes} from "../../redux/Slices/shapesSlice";
import {useAppDispatch, useAppSelector} from "../../redux/hooks";
import {BiText} from "react-icons/bi";
import {ActionCreators} from 'redux-undo';
import {IoReturnDownBack, IoReturnUpForwardOutline} from "react-icons/io5";
import {Point} from "../../app/page";
import {preventTools} from "app/utils/utils";
import {selectCommon} from "redux/Slices/commonSlice";
import {moveCurve} from "../tools/BezierCurves/utils";


const SideBar = ({setShape, setOption, option}) => {

    const dispatch = useAppDispatch()

    const [open, setOpen] = useState('')
    const popUps = useRef(null)
    const [toggle, setToggle] = useState(false)
    const [mousePosition, setMousePosition] = useState<Point>({x: 0, y: 0})
    const [caption, setCaption] = useState('')
    const drawings = useAppSelector(selectDrawings)
    const curves = useAppSelector(selectCurves)
    const shapes = useAppSelector(selectShapes)
    const texts = useAppSelector(selectTexts)
    const common = useAppSelector(selectCommon)
    const savedObject = useAppSelector(state => state.present.shape.savedObject.saved)
    const toolbarRef = useRef(null)
    const bottomRef = useRef(null)
    const mousePositionRef = useRef<Point>(null)


    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown)
        return () => {
            window.removeEventListener('keydown', handleKeyDown)
        }
    }, [open, toggle, drawings, curves, shapes, mousePositionRef.current, option])


    useEffect(() => {
        function saveMousePosition(e) {
            mousePositionRef.current = {
                x: e.clientX,
                y: e.clientY
            }
        }


        window.addEventListener('mousemove', saveMousePosition)

        if (toolbarRef.current) {
            toolbarRef.current.addEventListener('mouseup', preventTools)
            toolbarRef.current.addEventListener('mousedown', preventTools)
        }


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

        dispatch(addCurve({
            ...newCurve,
            curve: path
        }))

    }


    function handleKeyDown(e) {
        if (e.key.toUpperCase() === 'Z' && e.ctrlKey && e.shiftKey) {
            dispatch(ActionCreators.redo())
        } else if (e.key.toUpperCase() === 'Z' && e.ctrlKey) {
            dispatch(ActionCreators.undo())

        }

        if (e.key === "Backspace" || e.key === "Delete") {
            dispatch(updateDrawings(drawings.filter(el => !el.selected)))
            dispatch(updateCurves(curves.filter(el => !el.selected)))
            dispatch(updateShapes(shapes.filter(el => !el.selected)))
            dispatch(updateTexts(texts.filter(el => !el.selected)))
            setToggle(!toggle)

        }

        if (e.key.toUpperCase() === 'C' && e.ctrlKey) {
            dispatch(saveObjectInfo())
        }

        if (e.key.toUpperCase() === 'V' && e.ctrlKey) {
            if (!savedObject) return

            // const temp = (savedObject.object?.borders|| savedObject.object)
            const temp = (savedObject.object)

            console.log((mousePositionRef.current.x + common.scrollX) / common.scale - temp.w / 2)
            console.log((mousePositionRef.current.x + common.scrollX) / common.scale)
            console.log(temp)
            const object = {
                ...temp,
                x: (mousePositionRef.current.x + common.scrollX) / common.scale - (temp?.borders?.w || temp.w) / 2,
                y: (mousePositionRef.current.y + common.scrollY) / common.scale - (temp?.borders?.h || temp.h) / 2,
                copy: true
            }

            if (savedObject.type === 'shape') {
                dispatch(addShape(object))
            }
            if (savedObject.type === 'text') {
                dispatch(addText(object))
            }
            if (savedObject.type === 'drawing') {
                dispatch(addDrawing(object))
            }
            if (savedObject.type === 'curve') {
                handleCurveCopy(object)
            }
        }

        if (e.key.toUpperCase() === 'A' && e.altKey) {
            setOpen('')
            setOption("Selection")
            dispatch(updateDrawings(drawings.map(el => {
                return {...el, selected: true}
            })))
            dispatch(updateCurves(curves.map(el => {
                return {...el, selected: true}
            })))
            dispatch(updateShapes(shapes.map(el => {
                return {...el, selected: true}
            })))

            dispatch(updateTexts(texts.map(el => {
                return {...el, selected: true}
            })))


            setToggle(!toggle)
        }

        if (e.key.toUpperCase() === 'V') {
            setOpen('')
            if (option === 'Selection') {
                setOption('Move')
            } else {
                setOption('Selection')
            }
        }
        if (e.key.toUpperCase() === 'T') {
            setOpen('')
            setOption("Text")
        }
        if (e.key.toUpperCase() === 'D') {
            if (open !== 'Drawing') {
                setOpen('Drawing')
            } else {
                setOpen('')
            }
            setOption("Drawing")
        }
        if (e.key.toUpperCase() === 'S') {
            if (open !== 'Shape') {
                setOpen('Shape')
            } else {
                setOpen('')
            }
            setOption("Shape")
        }
        if (e.key.toUpperCase() === 'C' && !e.ctrlKey) {
            setOpen('')
            setOption("Curve")
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
                 ref={toolbarRef}
                 onKeyDown={handleKeyDown}>
                <div className={option === 'Selection' ? `${css.item} ${css.selectedTool}` : css.item}
                     onMouseEnter={() => handleEnter('Selection')}
                     onMouseLeave={handleLeave}
                     onClick={() => {
                         if (option === 'Selection') {
                             setOption('Move')
                         } else {
                             setOption('Selection')
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
                         setOption('Drawing')
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
                         setOption('Text')
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
                         setOption("Shape")
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
                         setOption('Curve')
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
                        <DrawingPopUp cancelStopPropagationRef={popUps} close={() => handleOpenPopUp('Drawing')}/>

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
                         setOption("Selection")
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
                         setOption("Selection")
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
    )
}


export default SideBar