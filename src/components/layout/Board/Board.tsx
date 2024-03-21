"use client"
import React, {useRef, useState} from 'react';
import css from './Board.module.css'
import {BsThreeDots} from "react-icons/bs";
import Link from 'next/link'
import ContainerPopUp from "../EditingPopUp/ContainerPopUp";
import commCss from "css/common.module.css"
import GlassModalEditBoard from "components/layout/EditingPopUp/GlassModal/GlassModalEditBoard";
import useClickOutside from "../../../hooks/useClickOutside";


const Board = ({id, common, handleDeletion, handleUpdate}) => {
    const [tags, setTags] = useState([])
    const [isEditContextActive, setIsEditContextActive] = useState(false)
    const [isEditMenuActive, setIsEditMenuActive] = useState(false)
    const contextMenu = useRef(null)
    const contextMenuButton = useRef(null)


    useClickOutside(
        contextMenu,
        (e) => {
            setIsEditContextActive(false)
        },
        contextMenuButton
    )


    function handleOpenEditContextMenu(e) {
        e.preventDefault()
        setIsEditContextActive(!isEditContextActive)
    }

    function handleToggleEditMenu(e) {
        e.preventDefault()
        setIsEditMenuActive(!isEditMenuActive)
        setIsEditContextActive(!isEditContextActive)


    }

    function handleCloseEditMenu(e) {
        e.preventDefault()
        setIsEditMenuActive(false)
    }

    function saveChanges(data) {
        handleUpdate(id, data)
        setIsEditMenuActive(false)

    }

    return (
        <>
            <div>
                <GlassModalEditBoard
                    saveChanges={saveChanges}
                    isModalActive={isEditMenuActive}
                    handleCloseModal={handleCloseEditMenu}
                />
            </div>

            <Link href={`/board/${id}`}
                  style={{
                      display: "inline-block",
                      height: "fit-content",
                      position: "relative"
                  }}>
                {isEditContextActive &&
                    <div className={css.contextMenu}
                         ref={contextMenu}
                    >
                        <ContainerPopUp height={'110px'} width={'130px'}>
                            <div className={commCss.modal}>
                                <div onClick={handleToggleEditMenu}>
                                    Edit
                                </div>
                                <div
                                    onClick={() => handleDeletion(id)}
                                    style={{
                                        color: 'red'
                                    }}>
                                    Delete
                                </div>
                            </div>
                        </ContainerPopUp>
                    </div>
                }
                <div className={`${css.board} rad-shadow`}>
                    <div className={css.editBoard}
                         ref={contextMenuButton}
                         onClick={handleOpenEditContextMenu}>
                        <BsThreeDots/>
                    </div>
                    <img
                        src={common?.cardUrl ?
                            common.cardUrl :
                            "https://c1.wallpaperflare.com/preview/750/773/216/idea-light-bulb-enlightenment-incidence.jpg"}
                    />
                    <div className={css.heading}>
                        {common?.boardName ?
                            common?.boardName :
                            "Untitled"
                        }
                    </div>
                </div>
            </Link>
        </>
    )
}



export default Board;