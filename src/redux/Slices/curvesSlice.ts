import {createSlice} from '@reduxjs/toolkit'
import {addLink, fetchData, getId} from "./shapesSlice";


const initialState = {
    curves: [],
    status: false
}


export const curveSlice = createSlice({
    name: 'curve',
    initialState,
    reducers: {
        addCurve: (state, action) => {
            const id = state.curves.length > 0 ? Math.max(...state.curves.map(el => el.id)) + 1 : 1
            state.curves.push({...action.payload, id: id, style: {thickness: 0.1}})
        },
        removeCurve: (state, action) => {

            state.curves = state.curves.filter(el => el.id !== action.payload)
        },
        updateCurve: (state, action) => {
            const curve = action.payload
            const idx = getId(state.curves, curve.id)

            if (idx !== -1) {
                state.curves[idx].curve = curve.curve
                state.curves[idx].angle = curve.angle
                state.curves[idx].points = curve.points
                // state.curves[idx].shapeIndexStart = curve.shapeIndexStart
                state.curves[idx].borders = curve.borders
                state.curves[idx].new = false

            }
        },
        updateCurves: (state, action) => {
            state.curves = [...action.payload]
        },
        setEditStatus: (state, action) => {
            state.status = action.payload
        },
        setShapeIndices: (state, action) => {
            const idx = getId(state.curves, action.payload.id)
            if (idx !== -1) {
                state.curves[idx].shapeIndexStart = action.payload.shapeIndexStart
                state.curves[idx].shapeIndex = action.payload.shapeIndex
            }

        },
        addStyle: (state, action) => {
            const indx = getId(state.curves, action.payload.id)
            state.curves[indx].style = {
                ...state.curves[indx].style,
                ...action.payload.style
            }
        },


    },
    extraReducers: (builder => {
        builder
            .addCase(fetchData.fulfilled, (state, action) => {
                if (action.payload?.curve?.curves)
                    state.curves = action.payload.curve.curves.map(curve => {
                        return {
                            ...curve,
                            copy: true
                        }
                    })
            })
            .addCase('store/reset', () => initialState)


    })
})

export function selectCurves(state) {
    return state.present.curve.curves
}

export const {
    addCurve,
    removeCurve,
    updateCurve,
    addStyle,
    updateBorders,
    updateCurves,
    setEditStatus,
    setShapeIndices
} = curveSlice.actions

export function maybeSelectSth(state, id) {

}


export default curveSlice.reducer