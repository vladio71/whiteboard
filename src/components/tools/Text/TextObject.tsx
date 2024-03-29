import {useAppDispatch} from "../../../redux/hooks";
import RemoveObject from "../../layout/utils/RemoveObject";
import ContainerResizeComponent from "../DndResizeRotateContainer/ContainerResizeComponent";
import EditorComponent from "./EditorComponent";
import {useEffect} from "react";
import EditTextPopUp from "../../layout/EditingPopUp/EditTextPopUp";
import * as React from "react";
import {setRectPath} from "../Shape/shapes/Rectangle";
import {getUpdates, removeItem, updateItem} from "../../../redux/Slices/itemsSlice";

const TextObject = ({text}) => {


    const dispatch = useAppDispatch()


    function saveChanges(object) {
        delete  object.style
        dispatch(updateItem(getUpdates(object)))
    }


    return (
        <RemoveObject key={text.id} removeFunc={removeItem} id={text.id}>


            <ContainerResizeComponent
                id={text.id}
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
        setRectPath(dispatch, object, object.id)
    }, [object.center.x, object.center.y, object.angle, object.style, object.down])

}


export default TextObject