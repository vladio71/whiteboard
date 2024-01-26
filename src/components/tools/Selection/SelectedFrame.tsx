import {useAppSelector} from "../../../redux/hooks";


const SelectedFrame = ({isSelected, object, children}) => {

    const common = useAppSelector(state => state.present.common)

    const style = getStyle(object, common.scale)

    return (
        <>
            {isSelected &&
                <div style={style}/>
            }
            {children}
        </>
    )


}

export default SelectedFrame


export function getStyle(item, scale = 1) {
    return {
        position: "absolute",
        border: '1px solid #3f42ff',
        left: -10,
        top: -10,
        width: (item.w) * scale + 38,
        height: (item.h) * scale + 38,
        zIndex: -100,

    }
}