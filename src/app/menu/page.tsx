"use client"

import * as React from "react";
import {createContext, Dispatch, useEffect, useRef, useState} from "react";
import Board from "components/layout/Board/Board";
import {useAppDispatch, useAppSelector} from "redux/hooks";
import {useRouter} from 'next/navigation';
import {deleteBoard, auth, getUserBoards, updateBoard} from "@/firebase/firebase";
import {SignOut} from "@/firebase/auth";
import css from "components/layout/Board/Board.module.css";
import {FaPlus} from "react-icons/fa/index";
import GlassModalAddBoard from "components/layout/EditingPopUp/GlassModal/GlassModalAddBoard";
import {ActionCreators} from "redux-undo";
import LoaderPlaceHolder from "components/layout/utils/LoaderPlaceHolder";
import {setWhiteboardData} from "redux/Slices/itemsSlice";

// export interface Point {
//     x: number,
//     y: number
// }
//
// interface Context {
//     setOption: Dispatch<string>,
//     option: string,
//     setStart: Dispatch<Point>,
//     setShapeId: Dispatch<number>,
//     start: Point,
//     shapeId: number,
//     zoomId: number,
//     setZoomId: Dispatch<number>,
//
// }

const useOnMountRequest = (func) => {

    const isWorking = useRef(false)

    useEffect(() => {
        if (!isWorking.current) {
            isWorking.current = true;
            (async () => {
                func()
            })().then(() => isWorking.current = false)
        }
    }, [])

    return isWorking
}




function Home() {


    const [boards, setBoards] = useState([])
    const [isModalActive, setIsModalActive] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const dispatch = useAppDispatch()
    const uploadStatus = useAppSelector(state => state.present.common.uploadStatus)


    useEffect(() => {
        const delayRequest = auth?.currentUser ? 0 : 500
        setTimeout(handleUpdateBoards, delayRequest)

    }, [])

    useOnMountRequest(handleDataFlow)

    useEffect(() => {
        handleUpdateBoards()
    }, [uploadStatus])


    function handleDataFlow() {
        if (auth?.currentUser) {
            dispatch(setWhiteboardData())
            dispatch(ActionCreators.clearHistory())
            dispatch({type: 'store/reset'})
        }
    };

    function handleUpdateBoards() {
        setIsLoading(true)
        getUserBoards(setBoards).then(() => {
            setIsLoading(false)
        })
    }


    const handleOpenModal = () => {
        setIsModalActive(true)
    }
    const handleCloseModal = () => {
        setIsModalActive(false)
    }

    const handleDeletion = (id) => {
        deleteBoard(id).then(() => {
            setBoards(prev => {
                return [
                    ...prev.filter(el => el.id !== id)
                ]
            })
        })
    }

    const handleUpdate = (id, data) => {
        updateBoard(id, data).then(() => {
            getUserBoards(setBoards)
        })

    }
    const handleSignOut = () => {
        router.push("/auth")
        SignOut()
    }


    return (

        <div className={css.Wrapper}>
            <div className={css.mainMenu}>
                <div className={css.mainMenu_header}>
                <span>
                    WhiteBoard
                </span>
                    <button onClick={handleSignOut} className={css.signOutBtn}>
                        Sign Out
                    </button>
                </div>

                <div className={css.mainMenu_content}>
                    <GlassModalAddBoard
                        handleCloseModal={handleCloseModal}
                        isModalActive={isModalActive}
                    />
                    <div className={css.board}>
                        <div className={css.newBoard} onClick={handleOpenModal}>
                            <div className={css.newBoard_Icon}>
                                <FaPlus style={{
                                    fontSize: '1.5rem'
                                }}/>
                            </div>
                            <div>
                                New Board
                            </div>
                        </div>
                        {/*</Link>*/}
                    </div>
                    {isLoading &&
                        <div className={css.loaderPlaceholder}>
                            <LoaderPlaceHolder/>
                        </div>
                    }


                    {boards.map(board => {
                        return <Board
                            key={board.id}
                            id={board.id}
                            common={board.common}
                            handleDeletion={handleDeletion}
                            handleUpdate={handleUpdate}
                        />
                    })}
                </div>

            </div>
        </div>
    );
}


export default Home