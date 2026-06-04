import React, { useState, useEffect } from 'react';
import ImageHandler from "../components/ImageHandler";
import styles from '../styles/AlbumForm.module.css';

const AlbumForm = ({ onClose, onSave, editAlbum, selectedAlbum }) => {
    const [albumCreator, setAlbumCreator] = useState(selectedAlbum?.creator || '');
    const [albumName, setAlbumName] = useState(selectedAlbum?.name || '');
    const [albumGenre, setAlbumGenre] = useState(selectedAlbum?.genre || '');
    const [albumDescription, setAlbumDescription] = useState(selectedAlbum?.description || '');
    const [albumCoverImage, setAlbumCoverImage] = useState(selectedAlbum?.coverImage || []);
    const [isImageFormOpen, setImageFormOpen] = useState(false);

    useEffect(() => {
        if (selectedAlbum) {
            setAlbumCreator(selectedAlbum.creator);
            setAlbumName(selectedAlbum.name);
            setAlbumGenre(selectedAlbum.genre);
            setAlbumDescription(selectedAlbum.description);
            setAlbumCoverImage(selectedAlbum.coverImage);
        }
    }, [selectedAlbum]);

    const addImage = (image) => {
        setAlbumCoverImage(image);
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!albumName.trim()) {
            alert("Введіть назву альбому");
            return;
        }

        const newAlbum = {
            id: selectedAlbum ? selectedAlbum?.id : Date.now(),
            creator: albumCreator,
            name: albumName,
            genre: albumGenre,
            description: albumDescription,
            //songs: selectedAlbum ? selectedAlbum.songs : [],
            coverImage: albumCoverImage
        };

        if (selectedAlbum) {
            editAlbum(newAlbum);
        } else {
            onSave(newAlbum);
        }
        onClose();
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        switch (name) {
            case "creator":
                setAlbumCreator(value);
                break;
            case "name":
                setAlbumName(value);
                break;
            case "genre":
                setAlbumGenre(value);
                break;
            case "description":
                setAlbumDescription(value);
                break;
            case "cover-image":
                setAlbumCoverImage(value);
                break;
            default:
                break;
        }
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <h2>Додати новий альбом</h2>
                    <input
                        type="text"
                        name="creator"
                        placeholder="Автор альбому"
                        className={styles.input}
                        value={albumCreator}
                        onChange={handleChange}
                    />
                    <input
                        type="text"
                        name="name"
                        placeholder="Назва альбому"
                        className={styles.input}
                        value={albumName}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="text"
                        name="genre"
                        placeholder="Жанр альбому"
                        className={styles.input}
                        value={albumGenre}
                        onChange={handleChange}
                    />
                    <textarea
                        name="description"
                        placeholder="Опис альбому"
                        className={`${styles.input} ${styles.textarea}`}
                        value={albumDescription}
                        onChange={handleChange}
                    />
                    {albumCoverImage && (

                        <img
                            alt="Crop"
                            style={{ maxWidth: "100%", border: "2px solid black" }}
                            src={albumCoverImage}
                        />
                    )}
                    <div
                        name="cover-image"
                        className={styles.button}
                        onClick={() => setImageFormOpen(true)}
                    >
                        Додати обкладинку
                    </div>
                    <div className={styles.buttonGroup}>
                        <button type="button" onClick={onClose} className={styles.button}>
                            Скасувати
                        </button>
                        <button type="submit" className={styles.saveButton}>
                            {selectedAlbum !== null ? "Оновити" : "Зберегти"}
                        </button>
                    </div>
                </form>
            </div>
            {isImageFormOpen && (
                <ImageHandler
                    onClose={() => setImageFormOpen(false)}
                    onSave={addImage}
                />
            )}
        </div>

    );
};

export default AlbumForm;