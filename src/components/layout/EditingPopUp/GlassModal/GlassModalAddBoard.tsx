import React, {useState} from 'react';
import css from "../../Board/Board.module.css";
import {IoIosCloseCircleOutline} from "react-icons/io";
import Link from "next/link";
import GlassBackground from "components/layout/EditingPopUp/GlassModal/GlassBackground";

const GlassModalAddBoard = ({isModalActive, handleCloseModal}) => {

    const [boardName, setBoardName] = useState('')


    return (
        <div>
            {isModalActive &&
            <GlassBackground handleCloseModal={handleCloseModal}>
                <div>
                    Board Name

                </div>
                <input
                    placeholder={"..."}
                    value={boardName}
                    onChange={(e) => setBoardName(e.target.value)}
                />
                <Link href={`/board/new/${boardName}`}>
                    <button className={css.Modal_button}>
                        Create Board
                    </button>
                </Link>
            </GlassBackground>
            }

        </div>
    );
};

export default GlassModalAddBoard;