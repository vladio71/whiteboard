import React, {memo, useEffect, useRef, useState} from 'react';
import {useAppSelector} from "redux/hooks";
import ObjectWithModal from './ObjectContextMenu/ObjectWithModal';
import {selectDrawings} from "redux/Slices/drawingSlice";
import {selectShapes} from "redux/Slices/shapesSlice";
import {selectCurves} from "redux/Slices/curvesSlice";
import {selectTexts} from "redux/Slices/textSlice";
import useRefState from "../../app/hooks/useRefState";

const LayersComponent = ({isUsable}: {
    isUsable: string
}) => {


    const drawings: object[] = useAppSelector(selectDrawings)
    const curves: object[] = useAppSelector(selectCurves)
    const shapes: object[] = useAppSelector(selectShapes)
    const texts: object[] = useAppSelector(selectTexts)


    const [update, setUpdate] = useState(false)
    const [objects, setObjects] = useRefState([])


    useEffect(() => {
        updateCollection((el) => {
            return !!el?.curve
        }, curves)
    }, [curves])

    useEffect(() => {
        updateCollection((el) => {
            return !!el?.drawing
        }, drawings)
    }, [drawings])

    useEffect(() => {
        updateCollection((el) => {
            return !!el?.shape
        }, shapes)
    }, [shapes])

    useEffect(() => {
        updateCollection((el) => {
            return !(!!el?.shape || !!el?.drawing || !!el?.curve)
        }, texts)
    }, [texts])



    function updateCollection(checkFunction: Function, collection: object[]) {
        let len = objects.current.filter(el => checkFunction(el)).length
        if (len < collection.length) {
            if (collection === curves) {
                setObjects([...collection.slice(len), ...objects.current])

            } else {
                setObjects([...objects.current, ...collection.slice(len)])
            }
        } else if (len === collection.length) {
            setObjects(objects.current.map(el => {
                if (checkFunction(el)) {
                    let item = collection.find(item => item.id === el.id)
                    if (item) return item
                }
                return el
            }))
        } else {
            setObjects(objects.current.filter(el => {
                if (checkFunction(el) && !collection.find(o => o.id === el.id))
                    return false
                return true
            }))
        }
        setUpdate(!update)
    }


    function handleBringToTop(id: number) {
            let temp = [...objects.current]
            temp.push(objects.current[id])
            temp.splice(id, 1)
            setObjects(temp)
    }

    function handleBringToBottom(id: number) {
            let temp = [...objects.current]
            temp.unshift(objects.current[id])
            temp.splice(id + 1, 1)
            setObjects(temp)
    }



    return (
        <>

            {objects.current &&
                objects.current.map((el, id) => {
                    let key = el?.shape ? el.id : el?.curve ? "c" + el.id : el?.drawing ? "d" + el.id : "t" + el.id
                    // console.log(key)
                    return <ObjectWithModal

                        key={key}
                        isUsable={isUsable}
                        handleBottom={() => handleBringToBottom(id)}
                        handleTop={() => handleBringToTop(id)}
                        el={el}/>
                })
            }

        </>
    );
};


export default LayersComponent;