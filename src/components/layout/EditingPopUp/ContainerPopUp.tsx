import css from "./EditColors/EditingColors.module.css";
import React from "react";


const ContainerPopUp = ({
    width,
    height,
    colors, position,
    isBottomPositioned = true,
    ...props
}) => {

    let style = {
        overflow: colors ? 'visible' : 'auto',
        width: width,
        height: height,
        position: position || 'absolute',
        zIndex: 200,
    }
    if (isBottomPositioned)
        style = {...style, bottom: 0, transform: 'translate(-20%, 100%)'}


    return (
        <div onClick={(e) => {
            e.stopPropagation()
            e.preventDefault()
        }
            // ${css.moveX}
        } className={`${css.popUpContainer}  rad-shadow`} style={style}>
            {props.children}
        </div>
    )
}

export default ContainerPopUp