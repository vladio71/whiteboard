import React, {useState} from "react";
import css from './EditColors/EditingColors.module.css'
import SelectFont from "./EditText/SelectFont";
import SelectSize from "./EditText/SelectSize";
import {addStyle} from "../../../redux/Slices/itemsSlice";
import FontColorPopUp from "components/layout/EditingPopUp/EditShape/FontColorPopUp";
import {checkPopUpPosition} from "../../../utils/utils";

const EditTextPopUp = ({text}) => {


    const [selectedPopUp, setSelectedPopUp] = useState('')


    const handlePopUp = (name) => {
        if (selectedPopUp === name)
            setSelectedPopUp('')
        else {
            setSelectedPopUp(name)
        }
    }

    return (
        <div className={css.container}
             style={{
                 top: checkPopUpPosition(text, '-4rem')
             }}
             onMouseDown={e => {
                 e.preventDefault()
             }}>
            <div className={css.contentBox}>
                <SelectFont id={text.id} setShow={setSelectedPopUp} show={selectedPopUp} add={addStyle}
                            category={"text"}/>
            </div>

            <div className={css.contentBox}>
                <FontColorPopUp
                    id={text.id}
                    addStyle={addStyle}
                    category={"text"}
                    selected={selectedPopUp}
                    handlePopUp={handlePopUp}/>
            </div>

            <div className={css.contentBox}>
                <SelectSize id={text.id} setShow={setSelectedPopUp} show={selectedPopUp} add={addStyle}
                            category={"text"}/>
            </div>

        </div>
    )
}


export default EditTextPopUp