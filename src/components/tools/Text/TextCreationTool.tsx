import {useContext, useEffect, useState} from "react";
import {useAppDispatch, useAppSelector} from "redux/hooks";
import {convertToRaw, EditorState} from "draft-js";
import {addItem} from "redux/Slices/itemsSlice";
import {v4 as uuidv4} from 'uuid';
import * as React from "react";


const TextCreationTool = ({isUsed, setOption}) => {

    const dispatch = useAppDispatch()
    const common = useAppSelector(state => state.present.common)


    useEffect(() => {
        window.addEventListener('mouseup', handleUp)
        return () => {
            window.removeEventListener('mouseup', handleUp)
        }
    }, [isUsed])

    function handleUp(e) {
        if (!isUsed) return

        dispatch(addItem({
                id: uuidv4(),
                x: (e.clientX - 50 + common.scrollX) / common.scale,
                y: (e.clientY - 10 + common.scrollY) / common.scale,
                h: 50,
                w: 200,
                style: {},
                editor: convertToRaw(EditorState.createEmpty().getCurrentContent()),
                creationTime: Date.now()
            }
        ))
        setOption('Selection')
    }


    return (
        <></>
    )

}


export default TextCreationTool