import React, { useState, useEffect } from 'react';
import styles from './styles/Vinyl.module.css';

function VinylPlayer({ selectedSingle, selectedAlbum }) {
    const [singleCoverImage] = useState(selectedSingle?.coverImage || '');
    const [albumCoverImage] = useState(selectedAlbum?.coverImage || "");

    return (
        <div className={styles.vinylContainer}>
            {/*{selectedAlbum && (*/}
                <div>
                <div className={styles.vinylRecord}>
                    {/*<div className={styles.vinylImage}*/}
                    {/*    style={{ backgroundImage: `url(${})` }} />}*/}
                        <img src="C:\Users\User\Desktop\images\kagura.jpg" alt="Vinyl" className={styles.vinylImage} />
                    </div>
                    {/*<div className={styles.trackInfo}>*/}
                    {/*    <h4>Назва треку</h4>*/}
                    {/*    <p>Виконавець</p>*/}
                    {/*</div>*/}
                </div>
            {/*)};*/}
        </div>
    );
};

export default VinylPlayer;