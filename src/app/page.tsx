'use client'
import React, {createContext, Dispatch, useEffect, useRef, useState} from "react";
import {useAppDispatch, useAppSelector} from "../redux/hooks";
import {selectCommon, setBoardId, setBoardName, setFetchStatus, setRefreshFlag} from "../redux/Slices/commonSlice";
import {useParams} from "next/navigation";
import {fetchData} from "../redux/Slices/itemsSlice";
import {auth} from "@/firebase/firebase";
import {useHome} from "../hooks/useHome";
import {useScreenMove} from "../hooks/useScreenMove";
import LayersComponent from "../components/layout/LayersComponent";
import CurvesCreationTool from "../components/tools/BezierCurves/CurvesCreationTool";
import SelectionTool from "../components/tools/Selection/SelectionTool";
import DrawingTool from "../components/tools/Drawing/DrawingTool";
import TextCreationTool from "../components/tools/Text/TextCreationTool";
import SignInBar from "../components/layout/SignInBar/SignInBar";
import ZoomBar from "../components/layout/ZoomBar/ZoomBar";
import SideBar from "../components/layout/SideBar";
import css from 'css/common.module.css'
import LoaderPlaceHolder from "../components/layout/utils/LoaderPlaceHolder";


export interface Point {
    x: number,
    y: number
}

interface Context {
    setOption: Dispatch<string>,
    option: string,
    setStart: Dispatch<Point>,
    setShapeId: Dispatch<number>,
    start: Point,
    shapeId: number,
    zoomId: number,
    setZoomId: Dispatch<number>,

}


export const LevelContext = createContext<Context | null>(null);


export default function Home() {

    const dispatch = useAppDispatch()
    const common = useAppSelector(selectCommon)
    const [start, setStart] = useState<Point>({x: 0, y: 0})
    const workerRef = useRef(null);
    const mountRef = useRef(true);
    const [shapeId, setShapeId] = useState<number>(-1)
    const state = useAppSelector(state => state.present);
    const params = useParams()

    useEffect(() => {


        if (params.id) {
            if (!state.common.isRefreshed && mountRef.current) {
                dispatch(fetchData(params.id))
            }
            dispatch(setBoardId(params.id))
        }else {
            dispatch(setFetchStatus(true))
        }
        dispatch(setRefreshFlag(true))

        if (params?.boardName) {
            dispatch(setBoardName(params?.boardName))
        }
        return () => {
            mountRef.current = false
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
                    items: {
                        ...state.items,
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
                {(!isReady || common.isFetching) &&
                    <div className={css.boardLoader}>
                        Loading...
                        <LoaderPlaceHolder/>
                    </div>
                }
                <div style={{
                    visibility: `${isReady && !common.isFetching ? 'unset' : 'hidden'}`
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
                        <SignInBar/>
                        <ZoomBar common={common}/>
                        <SideBar setShape={setShape} setOption={setOption} option={option}/>

                    </LevelContext.Provider>

                </div>

            </div>
        </>
    );
};





