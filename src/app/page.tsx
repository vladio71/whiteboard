"use client"

import * as React from "react";
import Droppable from "./Components/Layout/utils/Droppable";
import SideBar from "./Components/Layout/SideBar";
import CurvesCanvas from "./Components/BezierCurves/CurvesCanvas";
import Drawing from "./Components/Drawing/Drawing";
import Selection from "./Components/Selection/Selection";
import TextTool from "./Components/TextObject/TextTool";
import RenderResizeShape from "./Components/shape/RenderResizeShape";
import RemoveObject from "./Components/Layout/utils/RemoveObject";
import {useHome} from "./useHome";

function Home() {


    const {
        option,
        setOption,
        setShape,
        handleRemoveShape,
        handleAddShape,
        shapes,
    } = useHome()

    return (

        <div className={'back'} onClick={handleAddShape}>

            <div className={'background'}/>
            <Droppable>
                <>
                    {shapes.map(shape => {
                        return <RemoveObject key={shape.id} handleRemove={handleRemoveShape} id={shape.id}>
                            <RenderResizeShape item={shape} />
                        </RemoveObject>
                    })}
                    <Selection isUsed={option === "Selection"}/>
                    <Drawing isUsed={option === "Drawing"} isUsable={option}/>
                    <CurvesCanvas add={option === "Curve"} setShape={setOption} isUsable={option}/>
                    <TextTool isUsed={option === "Text"} setOption={setOption}/>
                </>
            </Droppable>
            <SideBar setShape={setShape} setOption={setOption} option={option}/>
        </div>
    )
}


export default Home