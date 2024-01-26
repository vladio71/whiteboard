import React, {useState} from 'react';
import css from "../../Board/Board.module.css";
import {IoIosCloseCircleOutline} from "react-icons/io";
import GlassBackground from "components/layout/EditingPopUp/GlassModal/GlassBackground";
import {FaFileImage} from "react-icons/fa";

const pica = require('pica')();


const GlassModalEditBoard = ({isModalActive, handleCloseModal, saveChanges, children}) => {

    const [boardName, setBoardName] = useState('')
    const [image, setImage] = useState(null)
    const [alal, setTemp] = useState(null)


    function imageToUri(url, callback) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const canvasFixed = document.createElement('canvas');
        const ctxFixed = canvas.getContext('2d');

        var base_image = new Image();
        base_image.src = url;
        base_image.onload = function () {
            canvas.width = base_image.width;
            canvas.height = base_image.height;

            const aspectRatioW = base_image.width / base_image.height
            const aspectRatioH = base_image.height / base_image.width

            if (base_image.width < base_image.height) {
                canvasFixed.width = 150
                canvasFixed.height = 150 * aspectRatioH
            } else {
                canvasFixed.width = 150 * aspectRatioW
                canvasFixed.height = 150
            }

            ctx.drawImage(base_image, 0, 0);

            pica.resize(canvas, canvasFixed)
                .then(result => {
                    setImage(result.toDataURL('image/png'))
                    canvas.remove();
                    canvasFixed.remove()
                });
        }
    }


    const onImageChange = (event) => {
        if (event.target.files && event.target.files[0]) {
            imageToUri(URL.createObjectURL(event.target.files[0]), function (uri) {
            })
        } else {
            setImage(null)
        }
    }

    return (
        <div>
            {isModalActive &&
            <GlassBackground
                height={'480px'}
                handleCloseModal={handleCloseModal}>
                <div>
                    Board Name
                </div>
                <input
                    placeholder={"new name"}
                    value={boardName}
                    onChange={(e) => setBoardName(e.target.value)}
                />
                <div>
                    New Image
                </div>
                <label>
                    <input type="file"
                           style={{
                               display: 'none'
                           }}
                           onChange={onImageChange}/>
                    {image ?
                        <img width={150} height={150} alt="preview image"
                             src={image}/> :
                        <FaFileImage style={{
                            height: '150px',
                            fontSize: '4rem'
                        }}/>

                    }
                    {/*{alal &&*/}
                    {/*<img alt="preview image"*/}
                    {/*     width={150} height={150}*/}
                    {/*     src={alal}/>*/}
                    {/*}*/}
                </label>
                <button className={css.Modal_button} onClick={() => saveChanges({
                    name: boardName,
                    url: image
                })}>
                    Save Changes
                </button>

            </GlassBackground>
            }
        </div>
    );
};

export default GlassModalEditBoard;