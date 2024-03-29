import Colors, {ColorPicker} from "./ColorPicker";
import React, {useEffect, useState} from "react";
import {OpacityHandler, useDidMountEffect} from "./helpers";
import css from "./EditingColors.module.css";
import {useSelector} from "react-redux";
import ContainerPopUp from "../ContainerPopUp";
import {addStyle, selectStyles} from "../../../../redux/Slices/itemsSlice";
import {useAppDispatch, useAppSelector} from "../../../../redux/hooks";
import {PopUpWithColorPicker} from "./BackgroundPopUp";


const BorderPopUp = ({id}) => {


    const dispatch = useAppDispatch()

    const style = useAppSelector((state) => selectStyles(state, id))

    const [thickness, setThickness] = useState(style?.borderThickness ? style.borderThickness : .1)
    const [opacity, setOpacity] = useState(style?.borderOpacity ? style.borderOpacity : 1)

    useDidMountEffect(() => {
        dispatch(addStyle({id, style: {'borderOpacity': opacity}}))
    }, [opacity])
    useDidMountEffect(() => {
        dispatch(addStyle({id, style: {'borderThickness': thickness}}))
    }, [thickness])


    return (
        <PopUpWithColorPicker
            id={id}
            name={'borderColor'}
            top={'2.6rem'}
            addStyle={addStyle}>
            <LineType id={id} style={style?.line} addStyle={addStyle}/>
            <OpacityHandler id={id} value={thickness} setValue={setThickness} name={"Thickness"}/>
            <OpacityHandler id={id} value={opacity} setValue={setOpacity} name={"Opacity"}/>
        </PopUpWithColorPicker>
    )
}
export const LineType = ({
    id,
    addStyle,
    style = 0
}) => {

    const dispatch = useAppDispatch()
    const [type, setType] = useState(style || 0)

    function handleClick(type) {
        setType(type)
    }

    useEffect(() => {
        dispatch(addStyle({id, style: {"line": type}}))

    }, [type])

    const Dashed = {
        borderBottom: 'var(--text1) 3px Dashed'
    }
    const Solid = {
        borderBottom: 'var(--text1) 3px solid'
    }
    return (
        <div className={css.borderStyles}>
            <div className={css.spaceForBorder} onClick={() => handleClick(0)}>
                <div className={css.displayInlineBlock} style={Solid}/>
            </div>
            <div className={css.spaceForBorder} onClick={() => handleClick(1)}>
                <div className={css.displayInlineBlock} style={Dashed}/>
            </div>
            <div className={css.spaceForBorder} onClick={() => handleClick(2)}>
                <div className={`${css.dashedWithSoul} ${css.displayInlineBlock}`}/>
            </div>
        </div>
    )
}


export default BorderPopUp