"use client"
import React, {useEffect, useRef, useState} from 'react';
import {useAppDispatch, useAppSelector} from "redux/hooks";
import {setBoardId, setBoardName, selectCommon, setRefreshFlag} from "redux/Slices/commonSlice"
import {Point} from "app/page";
import {fetchData} from "redux/Slices/shapesSlice";
import {useHome} from "app/hooks/useHome";
import {useScreenMove} from "app/hooks/useScreenMove";
import {LevelContext} from "app/page";
import LayersComponent from "components/layout/LayersComponent";
import CurvesCreationTool from "components/tools/BezierCurves/CurvesCreationTool";
import SelectionTool from "components/tools/Selection/SelectionTool";
import DrawingTool from "components/tools/Drawing/DrawingTool";
import TextCreationTool from "components/tools/Text/TextCreationTool";
import SideBar from "components/layout/SideBar";
import ZoomBar from "components/layout/ZoomBar/ZoomBar";
import {useParams} from "next/navigation";
import LoaderPlaceHolder from "components/layout/utils/LoaderPlaceHolder";
import css from 'css/common.module.css'
import {auth} from "@/firebase/firebase";


const Board = () => {

    const dispatch = useAppDispatch()
    const common = useAppSelector(selectCommon)
    const [start, setStart] = useState<Point>({x: 0, y: 0})
    const workerRef = useRef(null);
    const [shapeId, setShapeId] = useState<number>(-1)
    const state = useAppSelector(state => state.present);


    const params = useParams()


    useEffect(() => {


        if (params.id !== "new" && params.id) {
            if (!state.common.isRefreshed)
                dispatch(fetchData(params.id))
            dispatch(setBoardId(params.id))
        }
        dispatch(setRefreshFlag(true))

        console.log(params?.boardName)
        if (params?.boardName) {
            dispatch(setBoardName(params?.boardName))
        }
        return () => {
        }
    }, [])


    useEffect(() => {
        workerRef.current = new Worker(new URL("./worker.ts", import.meta.url));
    }, []);



    useEffect(() => {

        function saveDataBeforeUnload() {
            workerRef.current?.postMessage({
                userId: auth?.currentUser?.uid,
                boardId: params.id,
                data: {
                    ...state,
                    shape: {
                        ...state.shape,
                        paths: []
                    }
                }
            });
        }

        window.addEventListener("visibilitychange", saveDataBeforeUnload)
        return () => {
            window.removeEventListener("visibilitychange", saveDataBeforeUnload)
        }
    }, [state])


    const {
        option,
        setOption,
        setShape,
        handleAddShape,
        userView,
        isReady,
        fieldRef,
        backImage,
        zoomId,
        setZoomId,
        moveDown
    } = useHome(params.id)


    useScreenMove(userView, option, setOption)


    return (
        <>
            <div>
                {(!isReady || !common.fetchStatus) &&
                    <div className={css.boardLoader}>
                        Loading...
                        <LoaderPlaceHolder/>
                    </div>
                }
                <div style={{
                    visibility: `${isReady && common.fetchStatus ? 'unset' : 'hidden'}`
                }} className={'back'} ref={userView} onClick={handleAddShape}>
                    <LevelContext.Provider value={{
                        setOption,
                        option,
                        start,
                        setStart,
                        shapeId,
                        setShapeId,
                        zoomId,
                        setZoomId
                    }}>
                        <div ref={backImage} className={'back-image'}/>
                        <div ref={fieldRef} className={'background'}>
                            <LayersComponent isUsable={option}/>
                        </div>
                        <CurvesCreationTool add={option === "Curve"} setShape={setOption} isUsable={option}/>
                        <SelectionTool isUsed={option === "Selection"}/>
                        <DrawingTool isUsed={option === "Drawing"} isUsable={option}/>
                        <TextCreationTool isUsed={option === "Text"} setOption={setOption}/>
                        <ZoomBar common={common}/>
                        <SideBar setShape={setShape} setOption={setOption} option={option}/>


                    </LevelContext.Provider>

                </div>

            </div>
        </>
    );
};

export default Board;