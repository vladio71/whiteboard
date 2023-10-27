import {createSlice, PayloadAction} from '@reduxjs/toolkit'
import {getId} from "./shapesSlice";


export const TextSlice = createSlice({
    name: 'text',
    initialState: {
        texts: [],


    },
    reducers: {
        addText: (state, action) => {
            const id = state.texts.length > 0 ? Math.max(...state.texts.map(el => el.id)) + 1 : 1
            state.texts.push({...action.payload, id: id, style: {}})
        },
        updateTextEditor: (state, action) => {
            const indx = getId(state.texts , action.payload.id)
            state.texts[indx].editor = action.payload.editor
        },
        updateTexts: (state, action) => {
            state.texts = [...action.payload]

        },
        updateTextObject: (state, action) => {
            const indx = getId(state.texts , action.payload.id)
            state.texts[indx].x = action.payload.x
            state.texts[indx].y = action.payload.y
            state.texts[indx].w = action.payload.w
            state.texts[indx].h = action.payload.h
        },
        removeText: (state, action) => {
             state.texts = state.texts.filter(t=> t.id !== action.payload)
        },
        addStyle: (state, action) => {
            const indx = getId(state.texts, action.payload.id)
            state.texts[indx].style = {
                ...state.texts[indx].style,
                ...action.payload.style
            }
        },

    }


})


export const {addText,updateTextEditor,updateTexts,updateTextObject,removeText, addStyle} = TextSlice.actions

export function selectTextEditor(state, id, category) {
    if (category === "shape") {
      return state.present.shape.shapes.find(el => el.id === id)
    }else {
        return state.present.text.texts.find(el=>el.id===id)
    }
}


export default TextSlice.reducer