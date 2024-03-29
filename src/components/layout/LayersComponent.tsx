import React from 'react';
import {useAppDispatch, useAppSelector} from "redux/hooks";
import ObjectWithModal from './ObjectContextMenu/ObjectWithModal';
import { selectItems, setAllItems, updateItems} from "redux/Slices/itemsSlice";

const LayersComponent = () => {


    const dispatch = useAppDispatch()
    const objects: any = useAppSelector(selectItems)

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
                    return <ObjectWithModal
                        key={el.id}
                        handleBottom={() => handleBringToBottom(id)}
                        handleTop={() => handleBringToTop(id)}
                        el={el}/>
                })
            }

        </>
    );
};


export default LayersComponent;