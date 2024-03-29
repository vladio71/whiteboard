import { createSlice} from '@reduxjs/toolkit'
import { fetchData, setWhiteboardData} from "./itemsSlice";

const initialState = {
    scrollX: 0,
    scrollY: 0,
    h: 0,
    w: 0,
    scale: 1,
    fetchStatus: false,
    isFetching: false,
    uploadStatus: false,
    isAuthLoading: false,
    boardId: null,
    boardName: null,
    isRefreshed: false,
    cardUrl: null,
    theme: "light",
    zoomId: 4,
    tool: "Move",
    startPoint: {x:0, y: 0},
    shapeId: -1,
    underneathElementId: null

}


export const CommonSlice = createSlice({
    name: 'common',
    initialState,
    reducers: {
        updateScroll: (state, action) => {
            state.scrollX = action.payload.x
            state.scrollY = action.payload.y
        },
        updateZoom: (state, action) => {
            state.zoomId = action.payload
        },
        updateTool: (state, action) => {
            state.tool = action.payload
        },
        updateShapeId: (state, action) => {
            state.shapeId = action.payload
        },
        updateStartPoint: (state, action) => {
            state.startPoint = action.payload
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
        setItemsIdsOrder: (state, action) => {
            state.itemsIdsOrder = [...action.payload]
        },
        updateUnderneathElementId: (state, action) => {
            state.underneathElementId = action.payload
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
                state.isFetching = false
            })
            .addCase(fetchData.pending, (state, action) => {
                state.isFetching = true
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
    updateZoom,
    updateTool,
    updateShapeId,
    updateStartPoint,
    setRefreshFlag,
    setFetchStatus,
    updateTheme,
    updateUnderneathElementId
} = CommonSlice.actions


export default CommonSlice.reducer