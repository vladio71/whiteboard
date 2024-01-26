import {useEffect, useRef, useState} from "react";
import {useAppSelector} from "../../../../redux/hooks";
import {retry} from "@reduxjs/toolkit/query";
import {selectCommon} from "redux/Slices/commonSlice";


export function useCanvas(draw, shape = false) {

    const ref = useRef(null)
    const common = useAppSelector(selectCommon)


    useEffect(() => {
        const canvas = ref.current
        const ctx = canvas.getContext("2d")
        const isHaveBorders = shape?.minX
        if (shape?.shape) {
            canvas.width = common.w
            canvas.height = common.h
        } else if (isHaveBorders) {
            canvas.width = (shape.maxX - shape.minX) * common.scale + 400
            canvas.height = (shape.maxY - shape.minY) * common.scale + 400
        } else {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight

        }
        draw(ctx)
    }, [draw])

    return ref


}