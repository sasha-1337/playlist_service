import React, { useState, useEffect } from "react";
import styles from '../styles/SongForm.module.css'

function SongForm({ onClose, onSave, editSong, selectedSong }) {
    const [songName, setName] = useState(selectedSong?.name || '');
    const [songDescription, setDescription] = useState(selectedSong?.description || '');
    const [songLyrics, setLyrics] = useState(selectedSong?.lyrics || '');

    useEffect(() => { 
        if (selectedSong) {
            setName(selectedSong.name);
            setLyrics(selectedSong.lyrics);
            setDescription(selectedSong.description);
        }
    }, [selectedSong]);

    const handleSave = (e) => {
        e.preventDefault();
        if (!songName.trim()) {
            alert("Введіть назву пісні");
            return;
        }

        const newSong = {
            id: selectedSong ? selectedSong._id : Date.now(),
            name: songName,
            lyrics: songLyrics,
            description: songDescription
        };

        if (selectedSong) {
            editSong(newSong);
        } else {
            onSave(newSong);
        }
        onClose();
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        switch (name) {
            case "name":
                setName(value);
                break;
            case "lyrics":
                setLyrics(value);
                break;
            case "description":
                setDescription(value);
                break;
            default:
                break;
        }
    }

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <form onSubmit={handleSave} className={styles.form}>
                    <h3>Додати Пісню</h3>
                    <input
                        name="name"
                        type="text"
                        placeholder="Назва пісні"
                        value={songName}
                        onChange={handleChange}
                        className={styles.input}
                        required
                    />
                    <textarea
                        name="lyrics"
                        placeholder="Текст пісні"
                        value={songLyrics}
                        onChange={handleChange}
                        className={`${styles.input} ${styles.textarea}`}
                        required
                    />
                    <textarea
                        name="description"
                        placeholder="Опис пісні"
                        value={songDescription}
                        onChange={handleChange}
                        className={`${styles.input} ${styles.textarea}`}
                    />
                    <div className={styles.buttonGroup}>
                        <button type="button" onClick={onClose} className={styles.button}>
                            Скасувати
                        </button>
                        <button type="submit" className={`${styles.button} ${styles.saveButton}`}>
                            {selectedSong !== null ? "Оновити" : "Зберегти"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default SongForm;
