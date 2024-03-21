import Colors, {ColorPicker} from "./ColorPicker";
import React, {useEffect, useState} from "react";
import {OpacityHandler, useDidMountEffect} from "./helpers";
import ContainerPopUp from "../ContainerPopUp";
import {selectStyles} from "../../../../redux/Slices/itemsSlice";
import {useAppDispatch, useAppSelector} from "../../../../redux/hooks";
import {AiOutlinePlus} from "react-icons/ai";


const BackgroundPopUp = ({
    id,
    category = 'shapes',
    addStyle
}) => {

    const dispatch = useAppDispatch()
    const style = useAppSelector((state) => selectStyles(state, id, category))


    const [opacity, setOpacity] = useState(style?.opacity ? style.opacity : 1)


    useDidMountEffect(() => {
        dispatch(addStyle({id, style: {'opacity': opacity}}))
    }, [opacity])


    return (
        <PopUpWithColorPicker
            name={'background'}
            id={id}
            addStyle={addStyle}
            category={category}>
            <OpacityHandler id={id} value={opacity} setValue={setOpacity} name={"Opacity"}/>
        </PopUpWithColorPicker>
    )
}

export const PopUpWithColorPicker = ({
    top,
    left,
    id,
    category,
    name,
    addStyle,
    height,
    children
}) => {

    const [isColorPickerOpen, setIsColorPickerOpen] = useState(false)

    return (
        <div style={{
            display: 'flex',
            position: 'relative',
            left: left || '-2rem',
            top: top || '1.1rem',
            gap: '.4rem',
            width: 'fit-content',
        }}>
            <ContainerPopUp
                colors={true}
                isBottomPositioned={false}
                position={'relative'}
                height={height}>
                {children}
                <Colors id={id} name={name} category={category} addStyle={addStyle}>
                    <div onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
                         style={{fontSize: '1.2rem', position: 'relative', width: '100%', marginLeft: '.3rem'}}>
                        <AiOutlinePlus/>
                    </div>
                </Colors>
            </ContainerPopUp>
            <ColorPicker name={name} id={id} isOpen={isColorPickerOpen} addStyle={addStyle}/>
        </div>
    )
}


export default BackgroundPopUp