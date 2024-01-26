import React, {useRef, useEffect, useContext, } from 'react';
import {convertFromRaw, convertToRaw, Editor, EditorState} from 'draft-js';
import 'draft-js/dist/Draft.css';
import {useAppDispatch, useAppSelector} from "../../../redux/hooks";
import {updateEditor} from '../../../redux/Slices/shapesSlice'
import {selectTextEditor, updateTextEditor} from "../../../redux/Slices/textSlice";
import {ObjectContext} from "../DndResizeRotateContainer/ContainerResizeComponent";
import useClickOutside from "../../../app/hooks/useClickOutside";


function EditorComponent({id, style, object, category = 'shape'}) {
    const editor = useRef()
    const dispatch = useAppDispatch()
    const element = useAppSelector(state => selectTextEditor(state, id, category))
    const common = useAppSelector(state => state.present.common)
    const state = element ? EditorState.createWithContent(convertFromRaw(element.editor)) : EditorState.createEmpty()
    const shapeStyle = element?.style
    const containerRef = useRef<React.ReactNode>(null)
    const edStateRef = useRef(state)
    const insideRef = useRef(false)


    useEffect(() => {
        function handleScroll(e) {
            e.preventDefault()
        }

        document.addEventListener("scroll", handleScroll);
        return () => {
            document.removeEventListener("scroll", handleScroll);
        };

    }, [])


    useClickOutside(containerRef, (e)=>{
        insideRef.current = false
    })


    const styles = {
        root: {
            fontFamily: shapeStyle?.fontFamily ? shapeStyle?.fontFamily : '\'Helvetica\', sans-serif',
            overflow: 'clip',
            position: 'absolute',
            left: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            alignItems: 'center',
            height: '100%',
            maxHeight: object?.h ? object.h - 20 : '200px',
            width: object?.w ? 'calc(100% - 20px)' : category === "shape" ? '60%' : '100%',
        },
        editor: {
            cursor: 'text',
            display: 'inline-block',
            boxSizing: 'border-box',
            background: 'transparent',
            position: 'fixed',
            overflow: 'hidden',
            width: '100%',
            maxHeight: object?.h ? object.h - 20 : '200px',
            height: 'fit-content',
            textAlign: 'center',
            padding: 10,
            fontSize: shapeStyle?.fontSize ? shapeStyle.fontSize * common.scale + 'px' : `${14 * common.scale}px`,
            userSelect: object?.down ? 'none' : 'auto',


        },
        button: {
            marginTop: 10,
            textAlign: 'center',
        },
    };


    useEffect(() => {
        handleFocus()
    }, [focus])


    function updateState(editorState) {
        edStateRef.current = editorState
        if (category === 'shape') {
            dispatch(updateEditor({
                id: id,
                editor: convertToRaw(editorState.getCurrentContent())
            }))
        } else {
            dispatch(updateTextEditor({id: id, editor: convertToRaw(editorState.getCurrentContent())}))
        }
        insideRef.current = false
    }


    function handleFocus() {
        if (!editor.current) return
        if (focus) {
            editor.current.focus()
        } else {
            editor.current.blur()
        }
    }

    function handleAddFocus() {
        if (editor.current)
            editor.current.focus()
    }


    function preventEditorPropagation(e) {

        if (editor.current && document.activeElement.getAttribute("contenteditable") == null && e.key != "Backspace") {
            e.stopPropagation()
            editor.current.focus()
            insideRef.current = true
        } else if (document.activeElement.getAttribute("contenteditable") != null ) {
            e.stopPropagation()
        }

        // console.log(document.activeElement.getAttribute("contenteditable") != null)
        //
        // e.stopPropagation()

    }


    return (
        <div style={{...styles.root, ...style}}
             tabIndex={0}
            // data-no-dnd={object?.editMode}
             ref={containerRef}
             onKeyDown={preventEditorPropagation}>

            <div style={{...styles.editor}}
                 onClick={object.editMode ? handleAddFocus : null}
                // data-no-dnd={object?.editMode}

            >
                <div>
                    <Editor textAlignment={"center"} ref={editor}
                            editorState={
                                insideRef.current ?
                                    EditorState.forceSelection(edStateRef.current, EditorState.moveSelectionToEnd(edStateRef.current).getSelection()) :
                                    EditorState.acceptSelection(edStateRef.current, edStateRef.current.getSelection())
                            }

                            placeholder={"Type something"}
                            onChange={updateState}/>

                </div>
            </div>
        </div>
    )
}


export default EditorComponent