import React, { useState } from 'react';
import styles from '../styles/ShowText.module.css';
import { useAppSelector } from '../store/hooks';

function ShowText() {
    const selectedSingle = useAppSelector((state) => state.selection.selectedSingle);
    const selectedAlbum = useAppSelector((state) => state.selection.selectedAlbum);
    const selectedSong = useAppSelector((state) => state.selection.selectedSong);

    const [activeTab, setActiveTab] = useState('lyrics');

    const isSong = !!selectedSong;
    const isSingle = !!selectedSingle;
    const isAlbum = !!selectedAlbum && !selectedSong;

    let activeItem, creator, genre, description;

    if (isSong) {
        activeItem = selectedSong;
        creator = selectedAlbum?.creator || 'Невідомий виконавець';
        genre = selectedAlbum?.genre || 'Жанр не вказано';
        description = selectedSong?.description || 'Опис відсутній';
    } else if (isSingle) {
        activeItem = selectedSingle;
        creator = selectedSingle?.creator || 'Невідомий виконавець';
        genre = selectedSingle?.genre || 'Жанр не вказано';
        description = selectedSingle?.description || 'Опис відсутній';
    } else if (isAlbum) {
        activeItem = selectedAlbum;
        creator = selectedAlbum?.creator || 'Невідомий виконавець';
        genre = selectedAlbum?.genre || 'Жанр не вказано';
        description = selectedAlbum?.description || 'Опис відсутній';
    } else {
        activeItem = null;
        creator = 'Невідомий виконавець';
        genre = 'Жанр не вказано';
        description = 'Опис відсутній';
    }

    const name = activeItem?.name || 'Без назви';
    const lyrics = activeItem?.lyrics || '';

    const formatText = (text) => {
        if (!text) return 'Немає даних';
        return text.split('\n').map((line, index) => (
            <React.Fragment key={index}>
                {line}
                <br />
            </React.Fragment>
        ));
    };

    const lyricsPlaceholder = isAlbum
        ? 'Тут можуть відображатись пісні вашого альбому.'
        : isSingle
          ? 'Тут може бути текст вашого синглу.'
          : isSong
            ? 'Тут може бути текст вашої пісні.'
            : 'Оберіть елемент, щоб переглянути текст.';

    const descTitle = isAlbum
        ? 'Опис альбому'
        : isSingle
          ? 'Опис синглу'
          : isSong
            ? 'Опис пісні'
            : 'Опис';

    const lyricsContent = (
        <>
            <h3 style={{ marginBottom: '20px', textAlign: 'center' }}>{name}</h3>
            <div className={styles.textBlock}>
                {lyrics ? formatText(lyrics) : formatText(lyricsPlaceholder)}
            </div>
        </>
    );

    const descContent = (
        <>
            <h3 style={{ marginBottom: '15px' }}>{descTitle}</h3>
            <div className={styles.textBlock}>
                <p>
                    <strong>Автор:</strong> {creator}
                </p>
                <p>
                    <strong>Жанр:</strong> {genre}
                </p>

                {isSong && (
                    <>
                        <p style={{ marginTop: '15px', fontWeight: 'bold' }}>Опис альбому:</p>
                        {formatText(description)}
                    </>
                )}

                {(isSingle || isAlbum) && (
                    <p style={{ marginTop: '15px' }}>{formatText(description)}</p>
                )}

                {!activeItem && (
                    <p style={{ marginTop: '15px', opacity: 0.6 }}>
                        Оберіть пісню, альбом або сингл для перегляду деталей
                    </p>
                )}
            </div>
        </>
    );

    return (
        <div className={styles.commonContainer}>
            <div className={styles.lyricsContainer}>
                <div className={styles.lyrics}>
                    <div className={styles.scrollContent}>{lyricsContent}</div>
                </div>
            </div>

            <div className={styles.descriptionContainer}>
                <div className={styles.description}>
                    <div className={styles.scrollContent}>{descContent}</div>
                </div>
            </div>

            <div className={styles.tabBar}>
                <button
                    className={`${styles.tabButton} ${activeTab === 'lyrics' ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab('lyrics')}
                >
                    🎵 Текст
                </button>
                <button
                    className={`${styles.tabButton} ${activeTab === 'info' ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab('info')}
                >
                    ℹ️ Інфо
                </button>
            </div>

            <div
                className={`${styles.tabPanel} ${styles.lyricsPanel} ${activeTab === 'lyrics' ? styles.tabPanelActive : ''}`}
            >
                <div className={styles.scrollContent}>{lyricsContent}</div>
            </div>

            <div
                className={`${styles.tabPanel} ${styles.infoPanel} ${activeTab === 'info' ? styles.tabPanelActive : ''}`}
            >
                <div className={styles.scrollContent}>{descContent}</div>
            </div>
        </div>
    );
}

export default ShowText;
