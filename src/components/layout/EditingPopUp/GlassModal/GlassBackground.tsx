import React, {useState} from 'react';
import css from "../../Board/Board.module.css";
import {IoIosCloseCircleOutline} from "react-icons/io";

const GlassBackground = ({handleCloseModal, width='400px', height="250px", children}) => {

    return (
        <div className={css.Modal}
             style={{
                 height: height,
                 width: width
             }}
        >
            <button className={css.Modal_close} onClick={handleCloseModal}>
                <IoIosCloseCircleOutline/>
            </button>
            {children}
        </div>
    );
};

export default GlassBackground;