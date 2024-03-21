import {createAsyncThunk, createEntityAdapter, createSlice, PayloadAction} from '@reduxjs/toolkit'
import {addNewBoard, auth, getData, isDocumentIsEmpty, setAllData} from "../../firebase/firebase";
import {createSelector} from "reselect";
import {store} from "../store";
import {convertFromRaw, EditorState} from "draft-js";


export const fetchData = createAsyncThunk('data/fetchData', async (args, {getState}) => {
    const user = auth.currentUser;
    const response = await getData(user?.uid, args)
    return response

})


export const setWhiteboardData = createAsyncThunk<void>('data/setData', async (_, {getState}) => {
    const state = {...getState().present};
    const user = auth.currentUser;


    if (state.common.fetchStatus && state.common.boardName) {
        setAllData({
            ...state,
            items: {
                ...state.items,
                paths: []
            }
        }, user?.uid, state.common.boardId)
    } else if (new Date().getTime() - new Date(auth.currentUser?.metadata.creationTime).getTime() < 10000 && await isDocumentIsEmpty(user?.uid)) {
        addNewBoard(auth.currentUser?.uid).then((id) => {
            setAllData({
                ...state,
                items: {
                    ...state.items,
                    paths: []
                }
            }, user?.uid, id)
        })
    }
})
export const createNewBoard = createAsyncThunk<string>('data/createBoard', async (boardName, {getState}) => {
    const state = {...getState().present};
    const user = auth.currentUser;
    const response = await addNewBoard(user?.uid, {
        ...state,
        common: {
            ...state.common,
            boardName
        },
        items: {
            ...state.items,
            paths: []
        }
    })
    return response
})


const pathsAdapter = createEntityAdapter()
const itemsAdapter = createEntityAdapter()

const initialState = pathsAdapter.getInitialState({
    paths: pathsAdapter.getInitialState(),
    savedObject: {
        last: null,
        saved: null
    },
    status: false,
    brush: "Pen",
    drawingStyle: {
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
})


export const itemsSlice = createSlice({
    name: 'items',
    initialState,
    reducers: {
        addItem: itemsAdapter.addOne,
        setPath: (state, action) => {
            pathsAdapter.upsertOne(state.paths, action.payload)
        },
        setBrush: (state, action) => {
            state.brush = action.payload
        },
        removeItem: (state, action) => {
            const id = action.payload
            itemsAdapter.removeOne(state, id)
            pathsAdapter.removeOne(state.paths, id)
        },
        updateItem: itemsAdapter.updateOne,
        updateWithNoUndo: (state, action) => {
            itemsAdapter.updateOne(state, action.payload)
        },
        updateItems: itemsAdapter.updateMany,
        setItem: (state, action)=>{
            itemsAdapter.setOne(state, action.payload)
        },
        setAllItems: (state, action) => {
            const {items, removeIds} = action.payload
            itemsAdapter.setAll(state, items)
            const newPaths = items.filter(el => !el.curve).map((el) => {
                return state.paths.entities[el.id]
            })
            pathsAdapter.setAll(state.paths, newPaths)

        },
        addStyle: (state, action) => {
            const {id, style} = action.payload;
            const item = state.entities[id];
            item.style = {
                ...item.style,
                ...style
            }
        },
        setDrawingStyle: (state, action) => {
            if (action.payload.style?.color) {
                const idx = action.payload.id - 1
                state.drawingStyle.selectedId = idx
                state.drawingStyle.selected[idx].color = action.payload.style?.color
                if (action.payload.style?.thickness)
                    state.drawingStyle.selected[idx].thickness = action.payload.style.thickness

            }
        },
        changeShape: (state, action) => {
            const {id, shape} = action.payload;
            const item = state.entities[id];
            item.shape = shape
        },
        updateEditor: (state, action) => {
            const {id, editor} = action.payload;
            const item = state.entities[id];
            item.editor = editor
        },
        setObjectInfo: (state, action) => {
            state.savedObject.last = action.payload
        },
        saveObjectInfo: (state) => {
            state.savedObject.saved = state.savedObject.last
        },
        addLink: (state, action) => {
            const {id, link} = action.payload;
            const item = state.entities[id];
            console.log(item)
            if (item)
                item.link = link
        },
        updateTextEditor: (state, action) => {
            const {id, selectionState, editor} = action.payload
            const textObject = state.entities[id]
            // console.log("editor",EditorState.createWithContent(convertFromRaw(editor)))
            textObject.editor = editor
            if (selectionState)
                textObject.selectionState = selectionState
        },
        setEditStatus: (state, action) => {
            state.status = action.payload
        },
        setShapeIndices: (state, action) => {

            const {id, shapeIndexStart, shapeIndex} = action.payload
            const curve = state.entities[id]
            curve.shapeIndexStart = shapeIndexStart
            curve.shapeIndex = shapeIndex
        },

    },
    extraReducers: (builder => {
        builder
            .addCase(fetchData.fulfilled, (state, action) => {
                if (action.payload?.items)
                    return {
                        ...action.payload.items,
                        paths: pathsAdapter.getInitialState(),
                    }
            })
            .addCase('store/reset', () => initialState)
    })
})


export const {
    addItem,
    setPath,
    setBrush,
    removeItem,
    updateItem,
    updateWithNoUndo,
    setItem,
    updateItems,
    setAllItems,
    addStyle,
    addLink,
    changeShape,
    updateEditor,
    setObjectInfo,
    saveObjectInfo,
    setDrawingStyle,
    updateTextEditor,
    setEditStatus,
    setShapeIndices
} = itemsSlice.actions

export default itemsSlice.reducer


const globalizedItemSelectors = itemsAdapter.getSelectors((state) => state.present.items)
const globalizedPathsSelectors = itemsAdapter.getSelectors((state) => state.present.items.paths)

export const selectItems = (state) => globalizedItemSelectors.selectAll(state)
export const selectPaths = (state) => globalizedPathsSelectors.selectAll(state)

export function selectStyles(state, id, category = "shapes") {
    return globalizedItemSelectors.selectById(state, id).style
}

export function selectItem(state, id) {
    return globalizedItemSelectors.selectById(state, id)
}

export function selectPath(state, id) {
    return globalizedPathsSelectors.selectById(state, id)
}


export function selectDrawingStyle(state) {
    return state.present.items.drawingStyle.selected[state.present.items.drawingStyle.selectedId]
}

export function selectDrawings(state) {
    selectItems(state).filter(el => el?.drawing)
}


export function getUpdates(data) {
    if (Array.isArray(data)) {
        return data.map(el => {
            return getUpdateFormat(el)
        })
    } else {
        return getUpdateFormat(data)
    }

    function getUpdateFormat(item) {
        delete item.editor
        return {
            id: item.id,
            changes: {
                ...item
            }
        }
    }
}



