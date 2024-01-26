import React, {useEffect, useState} from 'react';
import {useAppSelector} from "redux/hooks";
import ObjectWithModal from './ObjectContextMenu/ObjectWithModal';
import {selectDrawings} from "redux/Slices/drawingSlice";
import {selectShapes} from "redux/Slices/shapesSlice";
import {selectCurves} from "redux/Slices/curvesSlice";
import {selectTexts} from "redux/Slices/textSlice";

const LayersComponent = ({isUsable}: {
    isUsable: string
}) => {


    const drawings: object[] = useAppSelector(selectDrawings)
    const curves: object[] = useAppSelector(selectCurves)
    const shapes: object[] = useAppSelector(selectShapes)
    const texts: object[] = useAppSelector(selectTexts )


    const [objects, setObjects] = useState<object[]>([])



    useEffect(() => {
        updateCollection((el) => {
            return !!el?.curve
        }, curves)
    }, [curves])

    useEffect(() => {
        updateCollection((el) => {
            return !!el?.dataUrl
        }, drawings)
    }, [drawings])

    useEffect(() => {
        updateCollection((el) => {
            return !!el?.shape
        }, shapes)
    }, [shapes])

    useEffect(() => {
        updateCollection((el) => {
            return !(!!el?.shape || !!el?.dataUrl || !!el?.curve)
        }, texts)
    }, [texts])



    function updateCollection(checkFunction: Function, collection: object[]) {
        let len = objects.filter(el => checkFunction(el)).length
        if (len < collection.length) {
            setObjects(prevState => {
                if (collection === curves) {
                    return [...collection.slice(len), ...prevState]

                } else {
                    return [...prevState, ...collection.slice(len)]
                }
            })
        } else if (len === collection.length) {
            setObjects(prevState => prevState.map(el => {
                if (checkFunction(el)) {
                    let item = collection.find(item => item.id === el.id)
                    if (item) return item
                }
                return el
            }))
        } else {
            setObjects(prevState => prevState.filter(el => {
                if (checkFunction(el) && !collection.find(o => o.id === el.id))
                    return false
                return true
            }))
        }
    }


    console.log(objects)

    function handleBringToTop(id: number) {
        setObjects(prev => {
            let temp = [...prev]
            temp.push(prev[id])
            temp.splice(id, 1)
            return temp
        })
    }

    function handleBringToBottom(id: number) {
        setObjects(prev => {
            let temp = [...prev]
            temp.unshift(prev[id])
            temp.splice(id + 1, 1)
            return temp
        })
    }


    return (
        <>

            {objects &&
            objects.map((el, id) => {
                let key = el?.shape ? el.id : el?.curve ? "c" + el.id : el?.dataUrl ? "d" + el.id : "t" + el.id
                console.log(key)
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