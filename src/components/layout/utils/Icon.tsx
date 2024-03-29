const Icon = ({icon, st}) => {

    const style = {
        backgroundImage: `url("/${icon}")`,
        backgroundSize: 'cover',
        width: '20px',
        height: '20px',
        margin: '2px auto'
    }


    return (

        <>
            <i style={{...style, ...st}}/>
        </>

    )
}

export default Icon