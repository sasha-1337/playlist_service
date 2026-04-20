import React, { useState, useEffect } from 'react';
import styles from '../styles/SingleForm.module.css';
import ImageHandler from "../components/ImageHandler";

function SingleForm({ onClose, onSave, editSingle, selectedSingle }) {
    const [isImageFormOpen, setImageFormOpen] = useState(false);
    const [singleCreator, setSingleCreator] = useState(selectedSingle?.creator || '');
    const [singleName, setSingleName] = useState(selectedSingle?.name || '');
    const [singleGenre, setSingleGenre] = useState(selectedSingle?.genre || '');
    const [singleLyrics, setSingleLyrics] = useState(selectedSingle?.lyrics || '');
    const [singleDescription, setSingleDescription] = useState(selectedSingle?.description || '');
    const [singleCoverImage, setSingleCoverImage] = useState(selectedSingle?.coverImage || '');

    useEffect(() => {
        if (selectedSingle) {
            setSingleCreator(selectedSingle.creator);
            setSingleName(selectedSingle.name);
            setSingleGenre(selectedSingle.genre);
            setSingleLyrics(selectedSingle.lyrics);
            setSingleDescription(selectedSingle.description);
            setSingleCoverImage(selectedSingle.coverImage);
        }
    }, [selectedSingle]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        switch (name) {
            case "creator":
                setSingleCreator(value);
                break;
            case "name":
                setSingleName(value);
                break;
            case "genre":
                setSingleGenre(value);
                break;
            case "lyrics":
                setSingleLyrics(value);
                break;
            case "description":
                setSingleDescription(value);
                break;
            case "cover-image":
                setSingleCoverImage(value);
                break;
            default:
                break;
        }
    };

    const handleSave = (e) => {
        e.preventDefault();
        if (!singleName.trim()) {
            alert("Введіть назву синглу");
            return;
        }

        const newSingle = {
            id: selectedSingle?.id || Date.now(),
            creator: singleCreator,
            name: singleName,
            genre: singleGenre,
            lyrics: singleLyrics,
            description: singleDescription,
            coverImage: singleCoverImage
        };

        if (selectedSingle) {
            editSingle(newSingle);
        } else {
            onSave(newSingle);
        }

        onClose();
    };

    const addImage = (image) => {
        setSingleCoverImage(image);
    }


    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <form onSubmit={handleSave} className={styles.form}>
                    <h3>Додати Сингл</h3>
                    <input
                        name="creator"
                        type="text"
                        placeholder="Автор синглу"
                        value={singleCreator}
                        onChange={handleChange}
                        className={styles.input}
                    />
                    <input
                        name="name"
                        type="text"
                        placeholder="Назва синглу"
                        value={singleName}
                        onChange={handleChange}
                        className={styles.input}
                    />
                    <input
                        name="genre"
                        type="text"
                        placeholder="Жанр синглу"
                        value={singleGenre}
                        onChange={handleChange}
                        className={styles.input}
                    />
                    <textarea
                        name="lyrics"
                        placeholder="Текст синглу"
                        value={singleLyrics}
                        onChange={handleChange}
                        className={`${styles.input} ${styles.textarea}`}
                    />
                    <textarea
                        name="description"
                        placeholder="Додаткова інформація"
                        value={singleDescription}
                        onChange={handleChange}
                        className={`${styles.input} ${styles.textarea}`}
                    />
                    {singleCoverImage && (
                        <img
                            alt="Crop"
                            style={{ maxWidth: "100%", border: "2px solid black" }}
                            src={singleCoverImage}
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
                            {selectedSingle !== null ? "Оновити" : "Зберегти"}
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
}

export default SingleForm;