import ContainerResizeComponent from "../DndResizeRotateContainer/ContainerResizeComponent";
import {renderSwitch} from "./renderShape";
import EditorComponent from "../Text/EditorComponent";
import {useAppDispatch} from "../../../redux/hooks";
import {removeShape, updateShape} from "../../../redux/Slices/shapesSlice"
import EditingPopUp from "../../layout/EditingPopUp/EditingPopUp";
import * as React from "react";
import RemoveObject from "../../layout/utils/RemoveObject";


const ShapeObject = ({item, isUsable}) => {

    const dispatch = useAppDispatch()


    function saveChanges(shape) {
        dispatch(updateShape(shape))
    }


    return (<>
            <RemoveObject key={item.id} removeFunc={removeShape} id={item.id}>
                <ContainerResizeComponent
                    id={item.id}
                    editorObject={item}
                    isUsable={isUsable}
                    renderProp={(object) => renderSwitch(object)}
                    renderEditor={(object)=> <EditorComponent object={object} id={item.id} style={{color: item.style?.color}}/>}
                    popUp={(object) => <EditingPopUp id={object.id} item={object}/>}
                    saveChanges={saveChanges}
                >
                    {/*<EditorComponent editable={true} id={item.id} style={{color: item.style?.color}}/>*/}
                </ContainerResizeComponent>

            </RemoveObject>

        </>
    )
}


export default ShapeObject