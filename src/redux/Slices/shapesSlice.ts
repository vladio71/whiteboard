import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import {removeDrawing, updateDrawings} from './drawingSlice';
import {removeText, updateTexts} from './textSlice';
import {auth, getData, setAllData} from "../../firebase/firebase";
import {createSelector} from '@reduxjs/toolkit';

export interface shapeSlice {
    shapes: [object],
    paths: [object]
    savedObject: {
        last: object | null,
        saved: object | null
    }
}


export const fetchData = createAsyncThunk('data/fetchData', async (args, {getState}) => {
    const user = auth.currentUser;
    const response = await getData(user?.uid, args)
    return response
})


// export const selectRawTranscript = createSelector(
//     (state) => state.data.someRawValue,
//     (rawValue) => rawValue.map(entry => entry.data)
// );

export const setWhiteboardData = createAsyncThunk('data/setData', async (args, {getState}) => {
    const state = {...getState().present};
    const user = auth.currentUser;
    delete state.auth;


    if (state.common.fetchStatus && state.common.boardId)
    setAllData({
        ...state,
        shape: {
            ...state.shape,
            paths: []
        }
    }, user?.uid, state.common.boardId)
})

const initialState: shapeSlice = {
    shapes: [],
    paths: [],
    savedObject: {
        last: null,
        saved: null
    }
}

export const shapeSlice = createSlice({
    name: 'shape',
    initialState,
    reducers: {
        addShape: (state, action) => {
            const id = state.shapes.length > 0 ? Math.max(...state.shapes.map(el => el.id)) + 1 : 1

            state.shapes.push({...action.payload, id: id,})
        },
        changeShape: (state, action) => {
            const indx = getId(state.shapes, action.payload.id)
            state.shapes[indx].shape = action.payload.shape

        },
        removeShape: (state, action) => {

            state.shapes = state.shapes.filter(el => el.id !== action.payload)
            state.paths = state.paths.filter(el => el.id !== action.payload)

        },
        updateShapes: (state, action) => {

            state.shapes = action.payload.map((el, id) => {
                return {...el, editor: state.shapes[id].editor}
            })

            state.paths = state.paths.filter(path => {
                return Number.isInteger(path.id) ?
                    action.payload.find(shape => path.id === shape.id)
                    : true
            })

            // const ids = action.payload.map(el => el.id)
            // state.paths = state.paths.filter(el => ids.includes(el.id))
        },
        updateShape: (state, action) => {

            const indx = getId(state.shapes, action.payload.id)
            state.shapes[indx].x = action.payload.x
            state.shapes[indx].y = action.payload.y
            state.shapes[indx].w = action.payload.w
            state.shapes[indx].h = action.payload.h

        },
        addStyle: (state, action) => {
            const indx = getId(state.shapes, action.payload.id)
            state.shapes[indx].style = {
                ...state.shapes[indx].style,
                ...action.payload.style
            }
        },
        updateEditor: (state, action) => {
            const indx = getId(state.shapes, action.payload.id)
            state.shapes[indx].editor = action.payload.editor
            // state.shapes[indx].editorState = action.payload.edState
        },
        setPath: (state, action) => {
            const pathId = getId(state.paths, action.payload.id)
            // if (state.shapes.find(Shape => Shape.id === action.payload.id)) {
            if (pathId !== -1) {
                state.paths[pathId] = {...action.payload}
            } else {
                state.paths.push(action.payload)
            }
            // }


        },
        setObjectInfo: (state, action) => {
            state.savedObject.last = action.payload
        },
        saveObjectInfo: (state) => {
            state.savedObject.saved = state.savedObject.last
        },
        addLink: (state, action) => {
            const id = getId(state.shapes, action.payload.id)
            if (id >= 0) {
                state.shapes[id].link = action.payload.link
            }
        }


    },
    extraReducers: (builder => {
        builder
            .addCase(removeDrawing, (state, action) => {
                return {
                    ...state,
                    paths: state.paths.filter(el => el.id !== "d" + action.payload)
                }

            })
            .addCase(removeText, (state, action) => {
                return {
                    ...state,
                    paths: state.paths.filter(el => el.id !== "t" + action.payload)
                }

            })
            .addCase(updateTexts, (state, action) => {
                state.paths = state.paths.filter(path => {
                    return path.id[0] === 't' ?
                        action.payload.find(text => path.id.slice(1) * 1 === text.id)
                        : true
                })
            })
            .addCase(updateDrawings, (state, action) => {
                state.paths = state.paths.filter(path => {
                    return path.id[0] === 'd' ?
                        action.payload.find(drawing => path.id.slice(1) * 1 === drawing.id)
                        : true
                })
            })
            .addCase(fetchData.fulfilled, (state, action) => {
                if (action.payload?.shape?.shapes)
                    state.shapes = action.payload.shape.shapes
            })
            .addCase('store/reset', () => initialState)


    })
})


export const {
    addShape,
    removeShape,
    updateShapes,
    addStyle,
    updateEditor,
    changeShape,
    setPath,
    updateShape,
    setObjectInfo,
    saveObjectInfo,
    addLink
} = shapeSlice.actions

export function selectStyles(state, id, category = "shapes") {
    if (category === "drawing") return state.present[category]?.style
    if (category === "text") return state.present[category].texts.find(el => el.id === id)?.style
    const indx = state.present[category.slice(0, -1)][category].findIndex(el => el.id === id)
    return state.present[category.slice(0, -1)][category][indx]?.style
}

export function selectShape(state, id) {
    const indx = state.present.shape.shapes.findIndex(el => el.id === id)
    return state.present.shape.shapes[indx]
}
export function selectShapes(state) {
     return state.present.shape.shapes
}
export function selectPaths(state) {
     return state.present.shape.paths
}



export function getId(collection, id) {
    return collection.findIndex(el => el.id === id)
}


export default shapeSlice.reducer