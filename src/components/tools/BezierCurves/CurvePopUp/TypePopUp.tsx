import {useAppDispatch, useAppSelector} from "../../../../redux/hooks";
import React, {useEffect, useState} from "react";
import ContainerPopUp from "../../../layout/EditingPopUp/ContainerPopUp";
import {OpacityHandler} from "../../../layout/EditingPopUp/EditColors/helpers";
import {addStyle} from "../../../../redux/Slices/itemsSlice"
import {selectStyles} from "../../../../redux/Slices/itemsSlice";
import {LineType} from "../../../layout/EditingPopUp/EditColors/BorderPopUp";

const TypePopUp = ({id}) => {

    const dispatch = useAppDispatch()
    const style = useAppSelector(state => selectStyles(state, id, "curves"))

    const [thickness, setThickness] = useState(style?.thickness ? style.thickness : .1)


    useEffect(() => {
        dispatch(addStyle({id, style: {'thickness': thickness}}))
    }, [thickness])


    return (
        <ContainerPopUp colors={true}>
            <OpacityHandler id={id} value={thickness} setValue={setThickness} name={"Thickness"}/>
            <LineType id={id} style={style?.line} addStyle={addStyle}/>
        </ContainerPopUp>
    )
}


export default TypePopUp