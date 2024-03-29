import {clearTimeout, setTimeout} from "timers";
import {useAppSelector} from "../redux/hooks";
import {selectCommon} from "../redux/Slices/commonSlice";

export function debounce(cb: Function, delay: number) {
    let timer = null
    return (...args) => {
        clearTimeout(timer)

        timer = setTimeout(() => {
            cb(args)
        }, delay)

    }

}

export function throttle(cb: Function, delay: number) {
    let timer = false
    return (...args) => {
        if (timer) return
        timer = true
        cb(...args)

        setTimeout(() => {
            timer = false
        }, delay)
    }
}




export function ThrottledDebounce(fn, threshold) {
    threshold = threshold || 10;
    var last, deferTimer;

    var db = debounce(fn, 0)
    return function () {
        var now = +new Date, args = arguments;
        if (!last || (last && now < last + threshold)) {
            clearTimeout(deferTimer);
            db.apply(this, args);
            deferTimer = setTimeout(function () {
                last = now;
                fn.apply(this, args);
            }, threshold);
        } else {
            last = now;
            fn.apply(this, args);
        }
    }
}



export function preventTools(e) {
    e.stopPropagation()
}


export function checkPopUpPosition(obj, topPosition,) {
    const common = useAppSelector(selectCommon)
    return obj?.y > 160 + common.scrollY ? topPosition : obj?.h + 100
}

export function getDistance(p1, p2) {
    return Math.sqrt(Math.pow((p1.x - p2.x), 2) + Math.pow((p1.y - p2.y), 2))
}