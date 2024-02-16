import React, {useEffect, useRef} from "react";
import {preventTools} from "../utils/utils";


const usePreventOutsideMouseEvents = () => {

    const ref = useRef(null)

    useEffect(() => {
        if (ref.current) {
            ref.current.addEventListener('mouseup', preventTools)
            ref.current.addEventListener('mousedown', preventTools)
        }
        return () => {
            if (ref.current) {
                ref.current.removeEventListener('mouseup', preventTools)
                ref.current.removeEventListener('mousedown', preventTools)
            }
        }
    }, [ref.current])

    return ref
}


export default usePreventOutsideMouseEvents