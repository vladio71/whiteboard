import {useAppDispatch} from "../../../redux/hooks";
import {removeText, updateTextObject} from "../../../redux/Slices/textSlice";
import RemoveObject from "../../layout/utils/RemoveObject";
import ContainerResizeComponent from "../DndResizeRotateContainer/ContainerResizeComponent";
import EditorComponent from "./EditorComponent";
import {useEffect} from "react";
import EditTextPopUp from "../../layout/EditingPopUp/EditTextPopUp";
import * as React from "react";
import {setRectPath} from "../Shape/shapes/Rectangle";

const TextObject = ({text, isUsable}) => {


    const dispatch = useAppDispatch()


    function saveChanges(object) {
        dispatch(updateTextObject(object))
    }


    return (
        <RemoveObject key={text.id} removeFunc={removeText} id={text.id}>
            <ContainerResizeComponent
                id={text.id}
                isUsable={isUsable}
                editorObject={text}
                saveChanges={saveChanges}
                popUp={(object) =>
                    <EditTextPopUp text={object}/>}
                renderProp={(object) =>
                    <UpdateTextPath object={object}/>}
                renderEditor={(object) =>
                    <EditorComponent object={object} category={'object'}
                                     id={text.id}
                                     style={{color: text.style?.color}}/>}

            />
        </RemoveObject>
    )
}

const UpdateTextPath = ({object}) => {
    const dispatch = useAppDispatch()

    useEffect(() => {
        setRectPath(dispatch, object, "t" + object.id)
    }, [object.center.x, object.center.y, object.angle, object.style, object.down])

}


export default TextObject