'use client'
import React from "react";
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




export default function Home() {

    const {
        setShape,
        handleAddShape,
        userView,
        isReady,
        fieldRef,
        backImage,
    } = useHome()

    useScreenMove(userView)


    const visibilityStyle = {
        visibility: `${isReady ? 'unset' : 'hidden'}`
    }

    return (
        <>
            <div>
                {!isReady &&
                    <div className={css.boardLoader}>
                        Loading...
                        <LoaderPlaceHolder/>
                    </div>
                }
                <div
                    className={'back'}
                    style={visibilityStyle!}
                    ref={userView}
                    onClick={handleAddShape}
                >
                    <div ref={backImage} className={'back-image'}/>
                    <div ref={fieldRef} className={'background'}>
                        <LayersComponent/>
                    </div>
                    <CurvesCreationTool/>
                    <SelectionTool/>
                    <DrawingTool/>
                    <TextCreationTool/>
                    <SignInBar/>
                    <ZoomBar/>
                    <SideBar setShape={setShape}/>
                </div>

            </div>
        </>
    );
};



