import {useContext, useEffect, useState} from "react";
import {useAppDispatch, useAppSelector} from "../../../redux/hooks";
import {convertToRaw, EditorState} from "draft-js";
import {addText} from "../../../redux/Slices/textSlice";
import * as React from "react";


const TextCreationTool = ({isUsed, setOption}) => {

    const dispatch = useAppDispatch()
    const common = useAppSelector(state => state.present.common)


    useEffect(() => {
        window.addEventListener('mousedown', handleDown)
        return () => {
            window.removeEventListener('mousedown', handleDown)
        }
    }, [isUsed])

    function handleDown(e) {
        if (!isUsed) return

        dispatch(addText({
                x: (e.clientX - 50 + common.scrollX)/common.scale,
                y: (e.clientY - 10 + common.scrollY)/common.scale,
                h: 50,
                w: 200,
                style: {},
                editor: convertToRaw(EditorState.createEmpty().getCurrentContent())
            }
        ))
        setOption('Selection')
    }


    return (
        <></>
    )

}


export default TextCreationTool