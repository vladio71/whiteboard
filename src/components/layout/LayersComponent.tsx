import React, {memo, useEffect, useMemo, useRef, useState} from 'react';
import {useAppDispatch, useAppSelector} from "redux/hooks";
import ObjectWithModal from './ObjectContextMenu/ObjectWithModal';
import {getUpdates, selectItems, setAllItems, updateItems} from "redux/Slices/itemsSlice";
// import {selectCurves} from "redux/Slices/curvesSlice";
import useRefState from "../../hooks/useRefState";
import {setItemsIdsOrder} from "../../redux/Slices/commonSlice";

const LayersComponent = ({isUsable}: {
    isUsable: string
}) => {


    const dispatch = useAppDispatch()
    // const drawings: object[] = useAppSelector(selectDrawings)
    // const curves: object[] = useAppSelector(selectCurves)
    const objects: any = useAppSelector(selectItems)
    // const shapesEntities: any = useAppSelector(selectShapes)
    // const shapes = useMemo(() => Object.values(shapesEntities), [shapesEntities])
    // const texts: object[] = useAppSelector(selectTexts)


    // const [update, setUpdate] = useState(false)
    // const [objects, setObjects] = useRefState([])

    //
    // useEffect(() => {
    //     updateCollection((el) => {
    //         return !!el?.curve
    //     }, curves)
    // }, [curves])

    // useEffect(() => {
    //     updateCollection((el) => {
    //         return !!el?.drawing
    //     }, drawings)
    // }, [drawings])

    // useEffect(() => {
    //     updateCollection((el) => {
    //         return !!el?.shape
    //     }, shapes)
    // }, [shapes])
    //
    // useEffect(() => {
    //     updateCollection((el) => {
    //         return !(!!el?.shape || !!el?.drawing || !!el?.curve)
    //     }, texts)
    // }, [texts])


    // function updateCollection(checkFunction: Function, collection: object[]) {
    //     let len = objects.current.filter(el => checkFunction(el)).length
    //
    //     if (len < collection.length) {
    //         if (collection === curves) {
    //             setObjects([...collection.slice(len), ...objects.current])
    //
    //         } else {
    //             setObjects([...objects.current, ...collection.slice(len)])
    //         }
    //     } else if (len === collection.length) {
    //         setObjects(objects.current.map(el => {
    //             if (checkFunction(el)) {
    //                 let item = collection.find(item => item.id === el.id)
    //                 if (item) return item
    //             }
    //             return el
    //         }))
    //     } else {
    //         setObjects(objects.current.filter(el => {
    //             if (checkFunction(el) && !collection.find(o => o.id === el.id))
    //                 return false
    //             return true
    //         }))
    //     }
    //     setUpdate(!update)
    // }

    // useEffect(() => {
    //     dispatch(setItemsIdsOrder(objects.current.map(item => item.id)))
    // }, [objects.current])


    function handleBringToTop(id: number) {
        let temp = [...objects]
        temp.push(objects[id])
        temp.splice(id, 1)
        dispatch(setAllItems({items: temp}))
    }

    function handleBringToBottom(id: number) {
        let temp = [...objects]
        temp.unshift(objects[id])
        temp.splice(id + 1, 1)
        dispatch(setAllItems({items: temp}))
    }


    return (
        <>

            {objects &&
                objects.map((el, id) => {
                    // let key = el?.shape ? el.id : el?.curve ? "c" + el.id : el?.drawing ? "d" + el.id : "t" + el.id
                    return <ObjectWithModal

                        key={el.id}
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