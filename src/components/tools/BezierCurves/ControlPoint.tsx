import React from "react";
import css from '../../../css/curves.module.css'
import {useAppSelector} from "../../../redux/hooks";
import {selectCommon} from "redux/Slices/commonSlice";


const ControlPoint = ({point,ref,handleMouseDown, additional}) => {


    const common = useAppSelector(selectCommon)

    if(point?.delta){
        point = point.point
    }

    let style = {
        left: (point.x )*common.scale-5,
        top: (point.y)*common.scale-5,
        zIndex: 20

    }

    return (
        <>
            <span style={style}
                 ref={ref}
                 tabIndex={2}
                 className={additional?css.additionalCircle:css.editingCircle}
                 onMouseDown={handleMouseDown}
            />
        </>
    )
}

export default ControlPoint