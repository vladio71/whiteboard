import ContainerPopUp from "../ContainerPopUp";
import React, {useEffect, useRef, useState} from "react";
import css from './editText.module.css'
import {selectItem, updateEditor, updateTextEditor} from '../../../../redux/Slices/itemsSlice'
import {convertFromRaw, convertToRaw, Editor, EditorState, RichUtils, SelectionState} from 'draft-js';
import {useAppDispatch, useAppSelector} from "../../../../redux/hooks";
import useRefState from "../../../../hooks/useRefState";


const TextEditPopUp = ({id, close}) => {


    const dispatch = useAppDispatch()
    // const item = EditorState.createWithContent(convertFromRaw(useAppSelector(state => selectShape(state, id))))
    const item = useAppSelector(state => selectItem(state, id))
    const [state, setState] = useRefState(null)
    const edst = useRef(null)
    const sec = useRef(null)


    useEffect(() => {
        if (item?.editor && item?.selectionState) {
            const edState = EditorState.createWithContent(convertFromRaw(item.editor))
            const selectionState = edState.getSelection()
            const updatedSelection = selectionState.merge({
                focusOffset: item.selectionState.focusOffset,
                anchorOffset: item.selectionState.anchorOffset,
                isBackward: item.selectionState.isBackward
            });

            setState(EditorState.acceptSelection(edState, updatedSelection))

        }


    }, [item?.editor, item?.selectionState])


    function boldSelection(e) {
        // var selection = state.getSelection();

        if (state.current) {
            const newEditorState = RichUtils.toggleInlineStyle(state.current, 'BOLD');
            dispatch(updateTextEditor({id: id,  editor: convertToRaw(newEditorState.getCurrentContent())}))
        }
        close()

    }

    function italicSelection() {
        if (state.current) {
            const newEditorState = RichUtils.toggleInlineStyle(state.current, 'ITALIC');
            dispatch(updateTextEditor({id: id, editor: convertToRaw(newEditorState.getCurrentContent())}))
        }
        close()
    }

    function underlineSelection() {
        if (state.current) {
            const newEditorState = RichUtils.toggleInlineStyle(state.current, 'UNDERLINE');
            dispatch(updateTextEditor({id: id, editor: convertToRaw(newEditorState.getCurrentContent())}))
        }
        close()
    }

    function strikeSelection() {
        if (state.current) {
            const newEditorState = RichUtils.toggleInlineStyle(state.current, 'STRIKETHROUGH');
            dispatch(updateTextEditor({id: id, editor: convertToRaw(newEditorState.getCurrentContent())}))
        }
        close()
    }


    return (

        <ContainerPopUp height={'2rem'}>
            <div className={css.textDecoration}>
                <b onClick={boldSelection}>B</b>
                <i onClick={italicSelection}>I</i>
                <u onClick={underlineSelection}>U</u>
                <s onClick={strikeSelection}>S</s>
            </div>
            {edst.current &&
                <Editor textAlignment={"center"}
                        editorState={
                            edst.current as EditorState
                        }
                        placeholder={"Type something"}
                        onChange={()=>{}}/>

            }
            {sec.current &&
                <Editor textAlignment={"center"}
                        editorState={
                            sec.current as EditorState
                        }
                        placeholder={"Type something"}
                        onChange={()=>{}}/>

            }

        </ContainerPopUp>
    )
}

export default TextEditPopUp