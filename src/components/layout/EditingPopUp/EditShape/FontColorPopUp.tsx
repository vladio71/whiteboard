import React from 'react';
import ContainerPopUp from "components/layout/EditingPopUp/ContainerPopUp";
import ColorPicker from "components/layout/EditingPopUp/EditColors/ColorPicker";
import css from "components/layout/EditingPopUp/EditColors/EditingColors.module.css";
import {useAppSelector} from "redux/hooks";
import {selectStyles} from "redux/Slices/shapesSlice";

const FontColorPopUp = ({id, category = 'shapes', addStyle, selected, handlePopUp}) => {

    const style = useAppSelector((state) => selectStyles(state, id, category))


    return (
        <>
            <span onClick={() => handlePopUp('fontColor')}
                  style={{
                      color: `${style?.color}`
                  }}
                  className={css.fontColor}>A</span>
            {selected === "fontColor"&&
            <ContainerPopUp height={'180px'}>
                <ColorPicker id={id} name={'color'} category={category} addStyle={addStyle}/>
            </ContainerPopUp>
            }
        </>
    );
};

export default FontColorPopUp;