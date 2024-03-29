import * as React from "react";
import {useAppDispatch} from "../../../redux/hooks";
import {setTimeout} from "timers";

const RemoveObject = ({removeFunc, id, children}: {
    removeFunc: Function,
    id: number | string
    children: React.ReactNode
}) => {

    const dispatch = useAppDispatch()

    function handleRemove(e) {
        if (e.key === "Backspace" || e.key === "Delete") {
            setTimeout(() => {
                dispatch(removeFunc(id))
            }, 100)
        }

    }

    return (
        <div tabIndex={1} onKeyDown={handleRemove}>
            {children}
        </div>
    )
}

export default RemoveObject