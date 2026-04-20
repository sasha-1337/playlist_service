import React from "react";
import styles from "../styles/ShowText.module.css";

function ShowText({ selectedSingle, selectedAlbum, selectedSong }) {

    const isSong = !!selectedSong;
    const isSingle = !!selectedSingle;
    const isAlbum = !!selectedAlbum && !selectedSong;

    let activeItem, creator, genre, description;

    if (isSong) {
        activeItem = selectedSong;
        creator = selectedAlbum?.creator || "Невідомий виконавець";
        genre = selectedAlbum?.genre || "Жанр не вказано";
        description = selectedSong?.description || "Опис відсутній";
    } else if (isSingle) {
        activeItem = selectedSingle;
        creator = selectedSingle?.creator || "Невідомий виконавець";
        genre = selectedSingle?.genre || "Жанр не вказано";
        description = selectedSingle?.description || "Опис відсутній";
    } else if (isAlbum) {
        activeItem = selectedAlbum;
        creator = selectedAlbum?.creator || "Невідомий виконавець";
        genre = selectedAlbum?.genre || "Жанр не вказано";
        description = selectedAlbum?.description || "Опис відсутній";
    } else {
        activeItem = null;
        creator = "Невідомий виконавець";
        genre = "Жанр не вказано";
        description = "Опис відсутній";
    }

    const name = activeItem?.name || "Без назви";
    const lyrics = activeItem?.lyrics || "";
    //const description = activeItem?.description || (isAlbum ? selectedAlbum?.description : "") || "Опис відсутній";

    // Універсальна функція для форматування тексту з переносами
    const formatText = (text) => {
        if (!text) return "Немає даних";
        return text.split("\n").map((line, index) => (
            <React.Fragment key={index}>
                {line}
                <br />
            </React.Fragment>
        ));
    };

    return (
        <div className={styles.commonContainer}>
            {/* Ліва частина — текст/тексти */}
            <div className={styles.lyricsContainer}>
                <div className={styles.lyrics}>
                    <div className={styles.scrollContent}>
                        <h3 style={{ marginBottom: "20px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {name}
                        </h3>

                        <div className={styles.textBlock}>
                            {lyrics
                                ? formatText(lyrics)
                                : formatText(
                                    isAlbum
                                        ? "Тут можуть відображатись пісні вашого альбому."
                                        : isSingle
                                            ? "Тут може бути текст вашого синглу."
                                            : isSong
                                                ? "Тут може бути текст вашої пісні."
                                                : "Оберіть елемент, щоб переглянути текст."
                                )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Права частина — опис і обкладинка */}
            <div className={styles.descriptionContainer}>
                <div className={styles.description}>
                    <div className={styles.scrollContent}>
                        <h3 style={{ marginBottom: "15px" }}>
                            {isAlbum
                                ? "Опис альбому"
                                : isSingle
                                    ? "Опис синглу"
                                    : isSong
                                        ? "Опис пісні"
                                        : "Опис"}
                        </h3>

                        <div className={styles.textBlock}>
                            <p><strong>Автор:</strong> {creator}</p>
                            <p><strong>Жанр:</strong> {genre}</p>

                            {/* Для пісні показуємо опис альбому */}
                            {isSong  && (
                                <>
                                    <p style={{ marginTop: "15px", fontWeight: "bold" }}>
                                        Опис альбому:
                                    </p>
                                    {formatText(description)}
                                </>
                            )}

                            {/* Для синглу і альбому показуємо їхній опис */}
                            {(isSingle || isAlbum) && (
                                <>
                                    <p style={{ marginTop: "15px" }}>
                                        {formatText(description)}
                                    </p>
                                </>
                            )}

                            {/* Якщо нічого не вибрано */}
                            {!activeItem && (
                                <p style={{ marginTop: "15px", opacity: 0.6 }}>
                                    Оберіть пісню, альбом або сингл для перегляду деталей
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ShowText;
//import React from "react";
//import styles from "./styles/ShowText.module.css";

//function ShowText({ selectedSingle, selectedAlbum, selectedSong }) {

//    // Визначаємо активний елемент
//    const activeItem = selectedSong || selectedSingle || selectedAlbum;
//    const isSong = !!selectedSong;
//    const isSingle = !!selectedSingle;
//    const isAlbum = !!selectedAlbum && !selectedSong;

//    // Витягуємо дані
//    const creator = activeItem?.creator || "Невідомий виконавець";
//    const name = activeItem?.name || "Без назви";
//    const genre = activeItem?.genre || "Жанр не вказано";
//    const lyrics = activeItem?.lyrics || "";
//    const description = activeItem?.description || "Опис відсутній";

//    // Виправлено обробку coverImage
//    /*let coverImage = null;*/
//    //if (activeItem?.coverImage) {
//    //    // Якщо це вже повний URL
//    //    if (activeItem.coverImage.startsWith('http')) {
//    //        coverImage = activeItem.coverImage;
//    //    } else {
//    //        // Якщо це лише назва файлу
//    //        coverImage = `http://localhost:5000/uploads/${activeItem.coverImage}`;
//    //    }
//    //}
//    // Універсальна функція для форматування тексту з переносами

//    const formatText = (text) => {
//        if (!text) return "Немає даних";
//        return text.split("\n").map((line, index) => (
//            <React.Fragment key={index}>
//                {line}
//                <br />
//            </React.Fragment>
//        ));
//    };

//    return (
//        <div className={styles.commonContainer}>
//            {/* Ліва частина — текст/тексти */}
//            <div className={styles.lyricsContainer}>
//                <div className={styles.lyrics}>
//                    <div className={styles.scrollContent}>
//                        <h3 style={{ marginBottom: "20px", display:"flex", alignItems: "center", justifyContent: "center" }}>{name}</h3>
//                        <div className={styles.textBlock}>
//                            {lyrics
//                                ? formatText(lyrics)
//                                : formatText(
//                                    isAlbum 
//                                    ? "Тут може бути текст вашого альбому."
//                                    : isSingle
//                                        ? "Тут може бути текст вашого синглу."
//                                        : isSong
//                                            ? "Тут може бути текст вашої пісні."
//                                            : "Оберіть елемент, щоб переглянути текст."
//                                )}
//                        </div>
//                    </div>
//                </div>
//            </div>

//            {/* Права частина — опис і обкладинка */}

//            <div className={styles.descriptionContainer}>
//                <div className={styles.description}>
//                    <div className={styles.scrollContent}>
//                        <h3 style={{ marginBottom: "15px" }}>
//                            {isAlbum
//                                ? "Опис альбому"
//                                : isSingle
//                                    ? "Опис синглу"
//                                    : isAlbum
//                                        ? "Опис пісні"
//                                        : "Опис"}
//                        </h3>

//                        <div className={styles.textBlock}>
//                            <p>Автор: {creator}</p>
//                            <p>Жанр: {genre}</p>
//                            {formatText(description)}
//                        </div>

//                        {/*{coverImage && (*/}
//                        {/*    <img*/}
//                        {/*        src={coverImage}*/}
//                        {/*        alt="cover"*/}
//                        {/*        style={{*/}
//                        {/*            marginTop: "20px",*/}
//                        {/*            width: "80%",*/}
//                        {/*            borderRadius: "10px",*/}
//                        {/*            boxShadow: "0 0 15px rgba(0,0,0,0.4)",*/}
//                        {/*        }}*/}
//                        {/*    />*/}
//                        {/*)}*/}
//                    </div>
//                </div>
//            </div>
//        </div>

//    );
//}

//export default ShowText;