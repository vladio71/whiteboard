import css from "../../../css/layout.module.css";
import ContainerPopUp from "../EditingPopUp/ContainerPopUp";
import Icon from "../utils/Icon";
import * as React from "react";
import {MdOutlineRectangle} from "react-icons/md";
import {CgShapeRhombus} from "react-icons/cg";
import {BiRectangle} from "react-icons/bi";
import {IoEllipseOutline} from "react-icons/io5";
import {BsTriangle} from "react-icons/bs";


const ChoseShapePopUp = ({setShape, setOpen}) => {


    return (
        <div className={css.popUpPosition}>
            <ContainerPopUp height={'8rem'} width={'8rem'} colors={true} isBottomPositioned={false}>
                <div className={css.popUp}
                    style={{
                        margin: '.7rem'
                    }}
                >
                    <div className={css.item} onClick={() => {
                        setShape("Rectangle")
                        setOpen(false)
                    }}>
                        <MdOutlineRectangle/>
                    </div>
                    <div className={css.item} onClick={() => {
                        setShape("Rhombus")
                        setOpen(false)
                    }}>
                        <CgShapeRhombus/>
                    </div>
                    <div className={css.item} onClick={() => {
                        setShape("Parallelogram")
                        setOpen(false)
                    }}>
                        <div className={'skewX'}>
                            <BiRectangle/>
                        </div>
                    </div>
                    <div className={css.item} onClick={() => {
                        setShape("Ellipse")
                        setOpen(false)
                    }}>


                        <div style={{
                            transform: 'scale(1.2)'
                        }}>
                            <div className={'skew'}>
                                <IoEllipseOutline/>
                            </div>
                        </div>

                    </div>
                    <div className={css.item} onClick={() => {
                        setShape("Circle")
                        setOpen(false)
                    }}>
                        <IoEllipseOutline/>
                    </div>
                    <div className={css.item} onClick={() => {
                        setShape("Triangle")
                        setOpen(false)
                    }}>
                        <BsTriangle/>

                    </div>
                    <div className={css.item} onClick={() => {
                        setShape("RoundRect")
                        setOpen(false)
                    }}>
                        <BiRectangle/>
                    </div>
                </div>
            </ContainerPopUp>
        </div>
    )
}

export default ChoseShapePopUp