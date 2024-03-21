import {createContext, useEffect, useRef, useState} from "react";
import css from "../../../css/layout.module.css";
import * as React from "react";
import ContainerPopUp from "../EditingPopUp/ContainerPopUp";
import {OpacityHandler} from "../EditingPopUp/EditColors/helpers";
import Colors, {ColorPicker} from "../EditingPopUp/EditColors/ColorPicker";
import { setDrawingStyle} from "../../../redux/Slices/itemsSlice"
import {useAppDispatch} from "../../../redux/hooks";
import {PopUpWithColorPicker} from "../EditingPopUp/EditColors/BackgroundPopUp";
// import Colors from "../EditingPopUp/EditColors/ColorPicker";


const ColorCircle = ({id, open, color, isSelected, setOpen}) => {


    const dispatch = useAppDispatch()

    const [thickness, setThickness] = useState(color.thickness)


    useEffect(() => {
        if (isSelected === id && thickness !== undefined)
            dispatch(setDrawingStyle({
                id,
                style: {
                    color: color.color,
                    thickness: thickness
                }
            }))

    }, [isSelected, thickness])


    const style = {
        width: `calc(1.3rem*${thickness})`,
        height: `calc(1.3rem*${thickness})`,
        background: `${color.color}`,
        margin: `calc(50% - 1.3rem*${thickness}/2) auto 0`,
    }


    return (
        <>

            <div className={css.colorBorder}
                 onClick={() => setOpen(id)}
                 style={{outline: `${isSelected === id ? '1px solid blue' : ''}`}}>
                <div className={css.colorCircle} style={style}/>
                {id === open && open === isSelected &&
                    <div className={css.alinedPopUp}>
                        <PopUpWithColorPicker
                            id={id}
                            left={'0rem'}
                            name={'color'}
                            top={'3rem'}
                            height={'245px'}
                            addStyle={setDrawingStyle}
                            category={'drawing'}>
                            <OpacityHandler id={id} value={thickness} setValue={setThickness} name={"Thickness"}/>
                        </PopUpWithColorPicker>
                    </div>
                }

            </div>

        </>
    )
}

const ColorPopUp = ({id, thickness, setThickness}) => {
    return (
        <PopUpWithColorPicker
            id={id}
            left={'0rem'}
            top={'3rem'}
            height={'250px'}
            addStyle={addStyle}
            category={'drawing'}>
            <OpacityHandler id={id} value={thickness} setValue={setThickness} name={"Thickness"}/>
        </PopUpWithColorPicker>
    )
}



export default ColorCircle