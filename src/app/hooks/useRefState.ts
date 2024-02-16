import {useRef} from "react";


const useRefState = (value) => {

    const valueRef = useRef(value)
    const setValue = (data) => {
        valueRef.current = data
    }

    return [
        valueRef,
        setValue
    ]
}


export default useRefState