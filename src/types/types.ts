import {Dispatch} from "react";

export interface Point {
    x: number,
    y: number
}

export interface Context {
    setStart: Dispatch<Point>,
    setShapeId: Dispatch<number>,
    start: Point,
    shapeId: number,
}

export interface Editable {
    id: string
    x: number,
    y: number,
    w: number,
    h: number,
    category?: string,
    editMode?: boolean,
    down?: boolean,
    link?: URL | string
}