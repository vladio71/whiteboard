import css from "./EditColors/EditingColors.module.css";
import React from "react";


const ContainerPopUp=({width , height, colors, ...props})=>{

    const style = {
        overflow: colors?'visible': 'auto',
        width: width,
        height: height,
    }


    return(
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