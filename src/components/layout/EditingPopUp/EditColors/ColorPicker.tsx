import css from "./EditingColors.module.css";
import {ChromePicker} from 'react-color'
import {ColoredCircle} from "./helpers";
import React, { useEffect, useRef, useState} from "react";
import {useAppDispatch, useAppSelector} from "../../../../redux/hooks";
import {selectStyles} from "../../../../redux/Slices/shapesSlice";


const Colors = ({id, name, category = 'shapes', addStyle, children}) => {


    const dispatch = useAppDispatch()
    const [selected, setSelected] = useState(0)
    const [colors, setColors] = useState(['transparent', 'white', 'red', 'orange', 'black', 'green', 'yellow', 'blue'])
    const colorsState = useAppSelector(state => selectStyles(state, id, category)?.colors)


    useEffect(() => {
        if (colorsState)
            setColors(colorsState)
    }, [colorsState])




    function handleSelect(idx, el) {
        setSelected(idx)
        dispatch(addStyle({
            id,
            style: {
                [name]: el
            }
        }))
    }

    return (
        <>

            <div className={css.colorBox}>
                {colors.map((el, id) => {
                    return <div key={id} onClick={() => handleSelect(id, el)}>
                        <ColoredCircle selected={id === selected} color={el}/>
                    </div>
                })}
                {children}
            </div>

        </>
    )
}

export const ColorPicker = ({id, name, addStyle, isOpen}) => {

    const [color, setColor] = useState({background: '#fff'})
    const colorPicker = useRef(null)
    const dispatch = useAppDispatch()



    const handleChangeComplete = (color) => {
        setColor(color.rgb)
        // if (adding) return
        dispatch(addStyle({
            id,
            style: {
                [name]: `rgba(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, ${color.rgb.a})`
            }
        }))
    };

    const handleChange = (color) => {
        setColor(color.rgb)
            dispatch(addStyle({
                id,
                style: {
                    [name]: `rgba(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, ${color.rgb.a})`
                }
            }))
        // }
    };

    return (
        <>
            {isOpen &&
                <div
                    style={{userSelect: 'none'}}
                    className={css.colorPicker}
                    onClick={e => {
                        e.stopPropagation()
                    }}
                >
                    <div ref={colorPicker}>
                        <ChromePicker color={color} onChange={handleChange}
                                      onChangeComplete={handleChangeComplete}/>
                    </div>
                </div>
            }
        </>
    )
}


export default Colors