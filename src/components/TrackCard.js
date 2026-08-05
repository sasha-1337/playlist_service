import React from 'react';
import ReactPlayer from 'react-player';
import styles from './TrackCard.module.css';

const TrackCard = ({ track }) => {
    // Шукаємо посилання на YouTube або Spotify в масиві медіа
    const youtubeMedia = track.media?.find(m => m.provider === 'youtube');
    const spotifyMedia = track.media?.find(m => m.provider === 'spotify');

    return (
        <div className={styles.trackCard}>
            <img
                src={track.coverImage || 'default-placeholder.jpg'}
                alt={`Cover for ${track.name}`}
                className={styles.image}
            />

            <div className={styles.infoContainer}>
                <h3 className={styles.title}>{track.name}</h3>
                <p className={styles.artist}>{track.creator}</p>
            </div>

            {/* Відеоплеєр YouTube */}
            {youtubeMedia && (
                <div className={styles.playerWrapper}>
                    <ReactPlayer
                        url={youtubeMedia.url}
                        width="100%"
                        height="200px"
                        controls={true}
                    />
                </div>
            )}

            {/* Віджет Spotify */}
            {!youtubeMedia && spotifyMedia && (
                <div className={styles.spotifyWrapper}>
                    <iframe
                        src={spotifyMedia.url.replace("http://googleusercontent.com/spotify.com/4", "http://googleusercontent.com/spotify.com/5")}
                        title={`Spotify audio player for ${track.name} by ${track.creator}`}
                        width="100%"
                        height="80"
                        frameBorder="0"
                        allowtransparency="true"
                        allow="encrypted-media"
                    ></iframe>
                </div>
            )}
        </div>
    );
};

export default TrackCard;