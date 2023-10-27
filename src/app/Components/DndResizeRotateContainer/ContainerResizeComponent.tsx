import {createContext, useCallback, useEffect, useMemo, useRef, useState} from "react";
import {useAppDispatch, useAppSelector} from "../../redux/hooks";
import MyEditor from "../TextObject/MyEditor";
import * as React from "react";
import {CSS} from "@dnd-kit/utilities";
import {updateTextObject} from "../../redux/textSlice";
import {useResizeLogic} from "../shape/useResizeLogic";
import {GrRotateRight} from "react-icons/gr";
import Selected from "../Selection/Selected";
import {useContainerResize} from "./useContainerResize";

export const ObjectContext = createContext<Editable | null>(null);

interface Editable {
    x: number,
    y: number,
    w: number,
    h: number,
    category?: string,
    editMode?: boolean,
    down?: boolean

}

const ContainerResizeComponent = ({editorObject, renderProp, saveChanges, children, isUsable = "Selection"}: {
    isUsable: string,
    editorObject: Editable,
    renderProp?: (obj) => React.ReactNode,
    children?: React.ReactNode,
    saveChanges: Function
}) => {


    const container = useRef()
    const child = useRef()

    const {
        handleClearDir,
        handleMouseOver,
        handleMouseDown,
        handleMouseMove,
        handleMouseUp,
        toggle,
        object,
        center,
        editMode,
        down,
        TextStyle
    } = useContainerResize(editorObject, isUsable, child, container, saveChanges)

    useResizeLogic(() => {
    }, handleMouseUp, handleMouseMove, down, toggle)


    return (

        <ObjectContext.Provider
            value={{
                ...object,
                center,
                category: 'object',
                down,
                editMode
            }}>
            <div ref={container}>
                <div style={TextStyle}
                     onMouseDown={handleMouseDown}>
                    {editMode &&
                    <>
                        <div className={'lt'}
                             onMouseOver={() => handleMouseOver("lt")}
                             onMouseLeave={handleClearDir}
                        />
                        <div className={'rt'}
                             onMouseOver={() => handleMouseOver("rt")}
                             onMouseLeave={handleClearDir}
                        />
                        <div className={'bl'}
                             onMouseOver={() => handleMouseOver("bl")}
                             onMouseLeave={handleClearDir}
                        />
                        <div className={'br'}
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
                    <Selected isSelected={editorObject?.selected || false} object={object}>
                        <div ref={child}>
                            {children}
                        </div>
                    </Selected>
                </div>

                <div>
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

            </div>

        </ObjectContext.Provider>


    )

}

export default ContainerResizeComponent