import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import {addLink, fetchData, getId, setWhiteboardData} from "./shapesSlice";
import {ActionCreators} from 'redux-undo';
import {auth, getData} from "@/firebase/firebase";

const initialState = {
    scrollX: 0,
    scrollY: 0,
    h: 0,
    w: 0,
    scale: 1,
    fetchStatus: false,
    isFetchingNow: false,
    uploadStatus: false,
    isAuthLoading: false,
    boardId: null,
    boardName: null,
    isRefreshed: false,
    cardUrl: null,
    theme: "light"
}


export const CommonSlice = createSlice({
    name: 'common',
    initialState,
    reducers: {
        updateScroll: (state, action) => {
            state.scrollX = action.payload.x
            state.scrollY = action.payload.y
        },
        updateHeight: (state, action) => {
            state.h = action.payload.h
            state.w = action.payload.w
        },
        updateScale: (state, action) => {
            console.dir(action.payload)
            state.scale = action.payload
        },
        updateTheme: (state, action) => {
            state.theme = action.payload
        },
        setBoardId: (state, action) => {
            state.boardId = action.payload
        },
        setAuthStatus: (state, action) => {
            state.isAuthLoading = action.payload
        },
        setBoardName: (state, action) => {
            state.boardName = action.payload
        },
        setRefreshFlag: (state, action) => {
            state.isRefreshed = action.payload
        },
        setFetchStatus: (state, action) => {
            state.fetchStatus = action.payload
        },
        setUploadStatus: (state, action) => {
            state.uploadStatus = action.payload
        },


    },
    extraReducers: (builder => {
        builder
            .addCase(fetchData.fulfilled, (state, action) => {

                if (action.payload?.common) {
                    const common = action.payload.common
                    if (common?.boardName) {
                        state.boardName = common.boardName
                        if (common?.cardUrl)
                            state.cardUrl = common.cardUrl
                    }
                }
                state.fetchStatus = true
                state.isFetchingNow = false
            })
            .addCase(fetchData.pending, (state, action) => {
                state.isFetchingNow = true
            })
            .addCase('store/reset', () => {
                return initialState
            })
            .addCase(setWhiteboardData.fulfilled, (state) => {
                state.uploadStatus = true
            })

    })


})


export function selectCommon(state) {
    return state.present.common
}


export const {
    updateScroll,
    updateHeight,
    updateScale,
    setBoardId,
    setAuthStatus,
    setBoardName,
    setRefreshFlag,
    setFetchStatus,
    updateTheme
} = CommonSlice.actions


export default CommonSlice.reducer