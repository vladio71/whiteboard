import * as React from "react";

 const RemoveObject = ({handleRemove, id, children}: {
    handleRemove: Function,
    id: number | string
    children: React.ReactNode
}) => {
    return (
        <div tabIndex={1} onKeyDown={(e) => handleRemove(e, id)}>
            {children}
        </div>
    )
}

export default RemoveObject