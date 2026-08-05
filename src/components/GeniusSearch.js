import React, { useState, useEffect, useRef } from 'react';
import styles from '../styles/GeniusSearch.module.css';
import { useCurrentUser, useAppDispatch } from '../store/hooks';
import { fetchLibrary } from '../store/slices/librarySlice';
import { apiClient } from '../utils/apiClient';

const GeniusSearch = () => {
    const currentUser = useCurrentUser();
    const dispatch = useAppDispatch();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = async (text) => {
        setQuery(text);
        if (text.trim().length < 2) {
            setResults([]);
            return;
        }

        setLoading(true);
        try {
            const { data } = await apiClient.get(`/genius/search?q=${encodeURIComponent(text)}`);

            if (data && data.results) {
                setResults(data.results);
                setIsOpen(true);
            }
        } catch (error) {
            console.error('Помилка пошуку:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectTrack = async (track) => {
        setLoading(true);
        try {
            const { data: details } = await apiClient.get(`/genius/details?id=${track.id}&type=${track.type}`);

            let endpoint = '';
            let payload = {};

            if (track.type === 'album') {
                endpoint = '/albums';
                payload = {
                    name: details.name,
                    creator: details.artist?.name || 'Unknown',
                    coverImage: details.cover_art_url,
                    songs: details.tracks.map((t) => ({
                        name: t.song?.title,
                        media: t.song?.media?.map((m) => ({ provider: m.provider, url: m.url })) || [],
                    })),
                };
            } else {
                endpoint = '/singles';
                payload = {
                    name: details.title,
                    creator: details.primary_artist?.name,
                    coverImage: details.song_art_image_url,
                    media: details.media?.map((m) => ({ provider: m.provider, url: m.url })) || [],
                };
            }

            await apiClient.post(endpoint, payload);

            if (currentUser?.id) {
                dispatch(fetchLibrary({ userId: currentUser.id }));
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.searchContainer} ref={dropdownRef}>
            <input
                type="text"
                placeholder="Пошук пісень та альбомів..."
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                className={styles.searchInput}
            />
            {loading && <div className={styles.loader}>Обробка...</div>}

            {isOpen && results.length > 0 && (
                <ul className={styles.dropdown}>
                    {results.map((item) => (
                        <li
                            key={`${item.type}-${item.id}`}
                            onClick={() => handleSelectTrack(item)}
                            className={styles.dropdownItem}
                        >
                            <img src={item.cover || 'default-cover.jpg'} alt="cover" className={styles.thumb} />
                            <div className={styles.trackInfo}>
                                <span className={styles.trackTitle}>
                                    {item.type === 'album' ? '💿' : '🎵'} {item.title}
                                </span>
                                <span className={styles.trackArtist}>{item.artist}</span>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default GeniusSearch;
