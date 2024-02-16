import {createSlice, PayloadAction} from '@reduxjs/toolkit'
import {getId, addLink, fetchData} from "./shapesSlice";

const initialState = {
    brush: "Pen",
    drawings: [],
    style: {
        selectedId: 0,
        selected: [{
            color: "black",
            thickness: 0.1
        }, {
            color: "black",
            thickness: 0.1
        }, {
            color: "black",
            thickness: 0.1
        },],
    }
}

export const drawingSlice = createSlice({
    name: 'drawing',
    initialState,
    reducers: {
        addDrawing: (state, action) => {
            const id = state.drawings.length > 0 ? Math.max(...state.drawings.map(el => el.id)) + 1 : 1
            state.drawings.push({...action.payload, id: id})
        },
        addDataUrl: (state, action) => {
            const id = getId(state.drawings, action.payload.id)
            state.drawings[id].dataUrl = action.payload.dataUrl
        },
        removeDrawing: (state, action: PayloadAction<number>) => {
            state.drawings = state.drawings.filter((el) => el.id !== action.payload)
        },
        updateDrawings: (state, action: PayloadAction<number>) => {

            state.drawings = [...action.payload]
        },
        updateDrawing: (state, action) => {
            const indx = getId(state.drawings, action.payload.id)
            state.drawings[indx].x = action.payload.x
            state.drawings[indx].y = action.payload.y
            state.drawings[indx].w = action.payload.w
            state.drawings[indx].h = action.payload.h
        },
        setBrush: (state, action: PayloadAction<string>) => {

            state.brush = action.payload
        },
        addStyle: (state, action) => {

            if (action.payload.style?.color) {
                const idx = action.payload.id - 1
                state.style.selectedId = idx
                state.style.selected[idx].color = action.payload.style?.color
                if (action.payload.style?.thickness)
                    state.style.selected[idx].thickness = action.payload.style.thickness

            }


        }

    },
    extraReducers: (builder => {
        builder
            .addCase(addLink, (state, action) => {
                // console.log(action.payload)
                if (action.payload.id[0] === "d") {
                    const id = getId(state.drawings, action.payload.id.slice(1) * 1)
                     if (Number.isInteger(id)) {
                        return {
                            ...state,
                            drawings: state.drawings.map((el, ID) => {
                                return ID === id ? {...el, link: action.payload.link} : el
                            })
                        }
                    }
                }
            })
            .addCase(fetchData.fulfilled, (state, action) => {
                if (action.payload?.drawing?.drawings)
                    state.drawings = action.payload.drawing.drawings
            })
            .addCase('store/reset', () => initialState)


    })


})


export const {addDrawing, removeDrawing, updateDrawings, updateDrawing, addStyle, setBrush, addDataUrl} = drawingSlice.actions

export function selectDrawingStyle(state) {
    return state.present.drawing.style.selected[state.present.drawing.style.selectedId]
}
export function selectDrawings(state) {
    return state.present.drawing.drawings
}

export default drawingSlice.reducer