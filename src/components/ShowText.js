import React from 'react';
import styles from '../styles/ShowText.module.css';
import { useAppSelector } from '../store/hooks';

function ShowText() {
    const selectedSingle = useAppSelector((state) => state.selection.selectedSingle);
    const selectedAlbum = useAppSelector((state) => state.selection.selectedAlbum);
    const selectedSong = useAppSelector((state) => state.selection.selectedSong);

    const isSong = !!selectedSong;
    const isSingle = !!selectedSingle;
    const isAlbum = !!selectedAlbum && !selectedSong;

    let activeItem, creator, genre, description, coverImage, typeLabel;

    if (isSong) {
        activeItem = selectedSong;
        creator = selectedAlbum?.creator || 'Unknown Artist';
        genre = selectedAlbum?.genre || 'Unknown Genre';
        description = selectedSong?.description || 'No description available.';
        coverImage = selectedAlbum?.coverImage;
        typeLabel = 'Song';
    } else if (isSingle) {
        activeItem = selectedSingle;
        creator = selectedSingle?.creator || 'Unknown Artist';
        genre = selectedSingle?.genre || 'Unknown Genre';
        description = selectedSingle?.description || 'No description available.';
        coverImage = selectedSingle?.coverImage;
        typeLabel = 'Single';
    } else if (isAlbum) {
        activeItem = selectedAlbum;
        creator = selectedAlbum?.creator || 'Unknown Artist';
        genre = selectedAlbum?.genre || 'Unknown Genre';
        description = selectedAlbum?.description || 'No description available.';
        coverImage = selectedAlbum?.coverImage;
        typeLabel = 'Album';
    } else {
        return (
            <div className={styles.commonContainer}>
                <div className={styles.emptyState}>
                    <div className={styles.vinylRecord}>
                        <div className={styles.vinylCenter}></div>
                    </div>
                    <h2>Nothing Selected</h2>
                    <p>Select a track, album, or single to view its details.</p>
                </div>
            </div>
        );
    }

    const name = activeItem?.name || 'Untitled';
    const lyrics = activeItem?.lyrics || '';

    const formatText = (text) => {
        if (!text) return 'No data';
        return text.split('\n').map((line, index) => (
            <React.Fragment key={index}>
                {line}
                <br />
            </React.Fragment>
        ));
    };

    return (
        <div className={styles.commonContainer}>
            
            {/* Hero Section */}
            <div className={styles.hero}>
                {coverImage && (
                    <div 
                        className={styles.heroBackground} 
                        style={{ backgroundImage: `url(${coverImage})` }} 
                    />
                )}
                <div className={styles.heroContent}>
                    {coverImage ? (
                        <img src={coverImage} alt="Cover" className={styles.heroCover} />
                    ) : (
                        <div className={styles.heroCover} style={{ background: '#333' }} />
                    )}
                    <div className={styles.heroText}>
                        <div className={styles.heroType}>{typeLabel}</div>
                        <h1 className={styles.heroTitle}>{name}</h1>
                        <div className={styles.heroSubtitle}>{creator}</div>
                        
                        <div className={styles.badges}>
                            <span className={styles.badge}>{genre}</span>
                            {activeItem.year && <span className={styles.badge}>{activeItem.year}</span>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className={styles.contentGrid}>
                
                {/* Lyrics / Description Card */}
                <div className={styles.glassCard}>
                    <h2 className={styles.cardTitle}>{isAlbum ? 'Album Notes' : 'Lyrics'}</h2>
                    <div className={styles.scrollContent}>
                        <div className={styles.textBlock}>
                            {lyrics ? formatText(lyrics) : (
                                <span style={{ opacity: 0.5 }}>
                                    {isAlbum ? 'No album notes provided.' : 'No lyrics available for this track.'}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Details Card */}
                <div className={styles.glassCard}>
                    <h2 className={styles.cardTitle}>Details</h2>
                    <div className={styles.scrollContent}>
                        <div className={styles.textBlock}>
                            {formatText(description)}
                        </div>
                        {isAlbum && selectedAlbum?.songs && (
                            <div style={{ marginTop: '20px' }}>
                                <h3 style={{ fontSize: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px', marginBottom: '12px' }}>Tracklist</h3>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                    {selectedAlbum.songs.map((song, i) => (
                                        <li key={song._id} style={{ padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>
                                            <span style={{ opacity: 0.5, marginRight: '8px', display: 'inline-block', width: '20px' }}>{i + 1}</span>
                                            {song.name}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}

export default ShowText;
