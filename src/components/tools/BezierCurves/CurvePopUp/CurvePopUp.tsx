import React, {useState} from "react";
import css from "../../../layout/EditingPopUp/EditColors/EditingColors.module.css";
import {ColoredCircle} from "../../../layout/EditingPopUp/EditColors/helpers";
import BackgroundPopUp from "../../../layout/EditingPopUp/EditColors/BackgroundPopUp";
import {addStyle} from "../../../../redux/Slices/curvesSlice"
import {MdOutlineTextIncrease, MdOutlineTimeline} from "react-icons/md";
import TypePopUp from "./TypePopUp";
import {checkPopUpPosition} from "../../../../app/utils/utils";

const CurvePopUp = ({curve}) => {

    const [selectedPopUp, setSelectedPopUp] = useState('')


    const handlePopUp = (name) => {
        if (selectedPopUp === name)
            setSelectedPopUp('')
        else {
            setSelectedPopUp(name)
        }
    }


    return (
        <div className={`${css.container} rad-shadow`}
             style={{top: checkPopUpPosition(curve.borders, '-4rem')}}
             onMouseDown={e => {
                 e.stopPropagation()
             }}>

            <div className={css.contentBox}>
                <div id={'color'} onClick={() => handlePopUp('color')}>
                    <ColoredCircle color={'white'}/>
                    {selectedPopUp === 'color' &&
                    <BackgroundPopUp id={curve.id} category={'curves'} addStyle={addStyle}/>
                    }
                </div>
            </div>
            <div className={css.contentBox}>
                <div id={'type'} onClick={() => handlePopUp('type')}>
                    <MdOutlineTimeline/>
                    <span className={css.caption}>
                        Type
                    </span>
                    {selectedPopUp === 'type' &&
                    <div>
                        <TypePopUp id={curve.id}/>
                    </div>
                    }
                </div>
            </div>
            <div className={`${css.contentBox} ${css.end}`}>
                <div id={'text'} onClick={() => handlePopUp('text')}>
                    <MdOutlineTextIncrease/>
                    {selectedPopUp === 'text' &&
                    <div></div>
                    }
                </div>
            </div>


        </div>
    )

}


export default CurvePopUp