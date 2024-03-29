import {createContext, Dispatch, useContext, useEffect, useRef} from "react";
import css from '../../../css/ContainerResize.module.css'
import * as React from "react";
import {useResizeLogic} from "../Shape/useResizeLogic";
import {GrRotateRight} from "react-icons/gr";
import SelectedFrame from "../Selection/SelectedFrame";
import {useContainerResize} from "./useContainerResize";
import {useAppDispatch, useAppSelector} from "../../../redux/hooks";
import {Editable} from "types/types";
import {updateUnderneathElementId} from "../../../redux/Slices/commonSlice";

export const ObjectContext = createContext<Editable | null>(null);


const ContainerResizeComponent =
    ({
        editorObject,
        renderProp,
        renderEditor,
        saveChanges,
        children,
        popUp,
    }: {
        editorObject: Editable,
        saveChanges: Function
        renderProp?: (obj) => React.ReactNode,
        renderEditor?: (obj) => React.ReactNode,
        popUp?: (obj) => React.ReactNode,
        setOption?: Dispatch<string>,
        children?: React.ReactNode,
    }) => {


        const dispatch = useAppDispatch()

        const container = useRef()
        const child = useRef()
        const overlay = useRef()
        const editCurveStatus = useAppSelector(state => state.present.items.status)
        const common = useAppSelector(state => state.present.common)
        const isUsable = common.tool


        const {
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
        } = useContainerResize(editorObject, child, container, saveChanges)


        useEffect(() => {

            if (isUsable === "Selection") {
                if (down) {
                    window.addEventListener('mousemove', handleMouseMove)
                    window.addEventListener('mouseup', handleMouseUp)
                }

            }
            return () => {
                window.removeEventListener('mousemove', handleMouseMove)
                window.removeEventListener('mouseup', handleMouseUp)
            }
        }, [down, toggle, isUsable])

        function handleEnterCurve(e) {
            overlay.current.style.background = "rgba(128, 128, 128, 0.1)"
        }



        function handleLeaveCurve(e: MouseEvent) {
            if (overlay.current.contains(e.relatedTarget)) return
            overlay.current.style.background = "transparent"
        }

        const linkStyle = {
            backgroundImage: `url(https://s2.googleusercontent.com/s2/favicons?domain_url=${editorObject?.link})`,
            width: '20px',
            height: '20px',
            zIndex: 10,
        }

        const controlStyle = {
            background: 'var(--text1)'
        }

        function handleEditMode() {
            let currentTime = new Date();
            let elapsedTime = currentTime - timerRef.current;
            if (elapsedTime < 140)
                setEditMode(true)
        }

        const PositionStyle = {
            position: "absolute",
            width: `${object.w + 200}px`,
            height: `${object.h + 200}px`,
            transform: `translate(${(object.x) * common.scale - 100}px,${(object.y) * common.scale - 100}px) rotate(${object.angle * Math.PI / 180}rad)`,
            transformOrigin: "center",
            pointerEvents: "none"
        }

        const PopUpStyle = {
            position: "absolute",
            // width: `${object.w + 200}px`,
            // height: `${object.h + 200}px`,
            transform: `translate(${(object.x+ object.w/2) * common.scale }px,${(object.y) * common.scale - 25}px)`,
            transformOrigin: "center",

        }
        return (

            <div ref={container}
                 // style={TextStyle}
            >



                <div style={{...PopUpStyle,zIndex: 100}}>
                    <div onMouseDown={e => e.stopPropagation()}>
                        {popUp && editMode && !down &&
                            popUp({
                                ...object,
                                center,
                                category: 'object',
                                down,
                                editMode
                            })
                        }
                    </div>
                </div>
                <div
                    style={PositionStyle}
                >
                    {renderProp &&
                        renderProp({
                            ...object,
                            center,
                            category: 'object',
                            down,
                            editMode
                        })
                    }
                </div>
                <div
                    style={TextStyle}
                     ref={overlay}
                     onMouseDown={handleMouseDown}
                     onClick={handleEditMode}
                >

                    <div className={css.hoverContainer}
                         onMouseOver={editCurveStatus ? handleEnterCurve : undefined}
                         onMouseOut={handleLeaveCurve}
                         style={overlayStyle}
                    />
                    {editorObject?.link &&
                        <a href={editorObject.link} target={'_blank'}>
                            <div className={css.link} style={linkStyle}/>
                        </a>
                    }
                    {editMode &&
                        <>
                            <div onMouseDown={(e) => e.stopPropagation()}>
                                <div className={`${css.curveControl} ${css.top}`} onClick={addCurve}/>
                                <div className={`${css.curveControl} ${css.right}`} onClick={addCurve}/>
                                <div className={`${css.curveControl} ${css.left}`} onClick={addCurve}/>
                                <div className={`${css.curveControl} ${css.bottom}`} onClick={addCurve}/>
                            </div>
                            <div className={'lt'} style={controlStyle}
                                 onMouseOver={() => handleMouseOver("lt")}
                                 onMouseLeave={handleClearDir}
                            />
                            <div className={'rt'} style={controlStyle}
                                 onMouseOver={() => handleMouseOver("rt")}
                                 onMouseLeave={handleClearDir}
                            />
                            <div className={'bl'} style={controlStyle}
                                 onMouseOver={() => handleMouseOver("bl")}
                                 onMouseLeave={handleClearDir}
                            />
                            <div className={'br'} style={controlStyle}
                                 onMouseOver={() => handleMouseOver("br")}
                                 onMouseLeave={handleClearDir}
                            />
                            <div className={'left'}
                                 onMouseOver={() => handleMouseOver("left")}
                                 onMouseLeave={handleClearDir}
                            />
                            <div className={'right'}
                                 onMouseOver={() => handleMouseOver("right")}
                                 onMouseLeave={handleClearDir}
                            />
                            <div className={'rotate'}
                                 onMouseOver={() => handleMouseOver("rotate")}
                                 onMouseLeave={handleClearDir}
                            >
                                <GrRotateRight/>
                            </div>
                            {object?.shape !== "Circle" &&
                                <>
                                    <div className={'top'}
                                         onMouseOver={() => handleMouseOver("top")}
                                         onMouseLeave={handleClearDir}
                                    />
                                    <div className={'bottom'}
                                         onMouseOver={() => handleMouseOver("bottom")}
                                         onMouseLeave={handleClearDir}
                                    />
                                </>
                            }
                        </>
                    }
                    <SelectedFrame isSelected={editorObject?.selected || false} object={object}>
                        <div ref={child}>
                            {/*<div onMouseDown={e => e.stopPropagation()}>*/}
                            {/*    {popUp && editMode && !down &&*/}
                            {/*        popUp({*/}
                            {/*            ...object,*/}
                            {/*            center,*/}
                            {/*            category: 'object',*/}
                            {/*            down,*/}
                            {/*            editMode*/}
                            {/*        })*/}
                            {/*    }*/}
                            {/*</div>*/}

                            {renderEditor &&
                                renderEditor({
                                    ...object,
                                    center,
                                    category: 'object',
                                    down,
                                    editMode
                                })
                            }
                            {children}
                        </div>
                    </SelectedFrame>
                </div>


                {/*<div style={PositionStyle}>*/}
                {/*    {renderProp &&*/}
                {/*        renderProp({*/}
                {/*            ...object,*/}
                {/*            center,*/}
                {/*            category: 'object',*/}
                {/*            down,*/}
                {/*            editMode*/}
                {/*        })*/}
                {/*    }*/}
                {/*</div>*/}

            </div>

        )

    }

export default ContainerResizeComponent