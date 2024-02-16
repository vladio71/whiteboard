import React, {useState} from 'react';
import css from "../../Board/Board.module.css";
import {IoIosCloseCircleOutline} from "react-icons/io";
import Link from "next/link";
import GlassBackground from "components/layout/EditingPopUp/GlassModal/GlassBackground";
import {createNewBoard} from "redux/Slices/shapesSlice";
import {useAppDispatch} from "redux/hooks";
import {useRouter} from "next/navigation";
import {LoadingAnimation} from "../../../../app/auth/AuthForm";

const GlassModalAddBoard = ({isModalActive, handleCloseModal}) => {

    const dispatch = useAppDispatch()
    const router = useRouter()
    const [boardName, setBoardName] = useState('')
    const [isLoading, setLoading] = useState(false)


    const handleCreateBoard = () => {
        setLoading(true)
        dispatch(createNewBoard(boardName)).then(res => {
            router.push(`/board/${res.payload}/${boardName}`)
        })
    }


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
                    {/*<Link href={`/board/new/${boardName}`}>*/}
                    {isLoading?
                        <button className={`${css.Modal_button} ${css.grey}`}
                                disabled={true}
                                // onClick={handleCreateBoard}
                        >
                            Create Board
                            <div style={{
                                position: "relative",
                                width: '1rem',
                                height: '1rem',
                                // right: '-1.5rem',
                                // top:"-.1rem",
                            }}>
                                <LoadingAnimation/>
                            </div>
                        </button>
                    :
                        <button className={css.Modal_button} onClick={handleCreateBoard}>
                            Create Board
                        </button>
                    }

                    {/*</Link>*/}
                </GlassBackground>
            }

        </div>
    );
};

export default GlassModalAddBoard;