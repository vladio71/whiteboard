import React, {useEffect} from "react";


const useClickOutside = (
    ref: React.ElementRef<any>,
    callback: (e: MouseEvent) => void,
    secondRef: React.ElementRef<any> = null,
) => {

    useEffect(() => {
        function handleClickOutside(e) {
            if (ref.current && !ref.current.contains(e.target) && (secondRef===null || !secondRef.current.contains(e.target))) {
                callback(e)
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [ref])
}


export default useClickOutside