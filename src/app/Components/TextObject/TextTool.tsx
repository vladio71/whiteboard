import {useContext, useEffect, useState} from "react";
import {useAppDispatch, useAppSelector} from "../../redux/hooks";
import MyEditor from "./MyEditor";
import {convertToRaw, EditorState} from "draft-js";
import {addText, updateTextObject, removeText} from "../../redux/textSlice";
import ContainerResizeComponent, {ObjectContext} from "../DndResizeRotateContainer/ContainerResizeComponent";
import RemoveObject from "../Layout/utils/RemoveObject";
import EditTextPopUp from "../EditingPopUp/EditTextPopUp";
import * as React from "react";


const TextTool = ({isUsed, setOption}) => {

    const dispatch = useAppDispatch()

    const texts = useAppSelector(state => state.present.text.texts)


    useEffect(() => {

        window.addEventListener('mousedown', handleDown)
        return () => {
            window.removeEventListener('mousedown', handleDown)
        }
    }, [isUsed])

    function handleDown(e) {
        if (!isUsed) return

        dispatch(addText({
                x: e.clientX - 50,
                y: e.clientY - 10,
                h: 50,
                w: 200,
                editor: convertToRaw(EditorState.createEmpty().getCurrentContent())
            }
        ))
        setOption('Selection')
    }

    function saveChanges(object) {
        dispatch(updateTextObject(object))
    }

    function handleRemove(e, id) {
        if (e.key === "Backspace" || e.key === "Delete") {
            dispatch(removeText(id))
        }

    }

    return (

        <>
            {texts &&

            texts.map(text => {
                return (
                    <RemoveObject key={text.id} handleRemove={handleRemove} id={text.id}>
                        <ContainerResizeComponent id={text.id}
                                                  editorObject={text}
                                                  saveChanges={saveChanges}
                        >

                            <PopUp text={text}/>
                            <MyEditor id={text.id} category={'object'}/>
                        </ContainerResizeComponent>
                    </RemoveObject>
                )
            })
            }
        </>
    )

}

const PopUp = ({text}) => {
    const obj = useContext(ObjectContext)

    return (
        <>
            {obj?.editMode && !obj?.down &&
            <EditTextPopUp id={text.id}/>
            }
        </>
    )
}


export default TextTool