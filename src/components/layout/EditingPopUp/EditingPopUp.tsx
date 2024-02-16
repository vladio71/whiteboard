import React, {useState} from "react";
import css from './EditColors/EditingColors.module.css'
import {ColoredCircle} from "./EditColors/helpers";
import BorderPopUp from "./EditColors/BorderPopUp";
import BackgroundPopUp from "./EditColors/BackgroundPopUp";
import SelectFont from "./EditText/SelectFont";
import SelectSize from "./EditText/SelectSize";
import TextEditPopUp from "./EditText/TextEditPopUp";
import SelectShape from "./EditShape/SelectShape";
import {addStyle} from "../../../redux/Slices/shapesSlice";
import FontColorPopUp from "components/layout/EditingPopUp/EditShape/FontColorPopUp";
import {checkPopUpPosition} from "../../../app/utils/utils";


const EditingPopUp = ({id, item}) => {


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
             style={{
                 top: checkPopUpPosition(item, '-4rem')
             }}
             onMouseDown={e => {
                 e.preventDefault()
             }}>
            <div className={css.contentBox}>
                <SelectShape id={id} close={() => handlePopUp('show')} show={selectedPopUp}/>

            </div>
            <div className={css.contentBox}>
                <SelectFont id={id} setShow={setSelectedPopUp} show={selectedPopUp}/>
            </div>
            <div className={css.contentBox}>
                <SelectSize id={id} setShow={setSelectedPopUp} show={selectedPopUp}/>
            </div>
            <div className={css.contentBox}>


                    <FontColorPopUp
                        id={id}
                        addStyle={addStyle}
                        selected={selectedPopUp}
                        handlePopUp={handlePopUp}/>

                {/*<span onClick={() => handlePopUp('fontColor')} className={css.fontColor}>A</span>*/}
                {/*{selectedPopUp === 'fontColor' &&*/}
                {/* }*/}
                <span onClick={() => handlePopUp('textEdit')} className={css.textEdit}>B</span>
                {selectedPopUp === 'textEdit' &&
                    <TextEditPopUp id={id} close={() => handlePopUp('textEdit')}/>
                }


            </div>

            <div className={`${css.contentBox} ${css.end}`}>
                <div onClick={() => handlePopUp('border')} className={css.borderedCircle}>
                    {selectedPopUp === 'border' &&
                        <BorderPopUp id={id}/>
                    }
                </div>

                <div id={'color'} onClick={() => handlePopUp('color')} className={css.borderedCircle}>
                    <ColoredCircle color={'white'}/>
                    {selectedPopUp === 'color' &&
                        <BackgroundPopUp id={id} addStyle={addStyle}/>
                    }
                </div>

            </div>


        </div>
    )
}


export default EditingPopUp