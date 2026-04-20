import React, { useState, useEffect } from 'react';
import "./styles/App.css";

import AlbumForm from './forms/AlbumForm';
import SongForm from './forms/SongForm';
import SingleForm from './forms/SingleForm';

import ShowText from './components/ShowText';
import DraggableButton from './components/DraggableButton';

import AISearch from './ai-components/AISearch';
import ModelComparison from './ai-components/ModelComparison';

import { RiDeleteBack2Line } from "react-icons/ri";
import { MdOutlinePlaylistAdd } from "react-icons/md";
import { TbEdit } from "react-icons/tb";
import { MdOutlineSavedSearch } from "react-icons/md";
import styled, { css } from 'styled-components';


const App = () => {
    const [albums, setAlbums] = useState([]);
    const [albumFormState, setAlbumFormState] = useState(null);
    const [selectedAlbum, setSelectedAlbum] = useState(null);
    const [expandedAlbums, setExpandedAlbums] = useState(new Set());

    const [songFormState, setSongFormState] = useState(null);
    const [selectedSong, setSelectedSong] = useState(null);

    const [singles, setSingles] = useState([]);
    const [selectedSingle, setSelectedSingle] = useState(null);
    const [singleFormState, setSingleFormState] = useState(null);

    const [activeId, setActiveId] = useState(null);
    const [activeSongId, setActiveSongId] = useState(null);

    const [filters, setFilter] = useState('all');

    const [showAISearch, setShowAISearch] = useState(false);
    const [showModelComparison, setShowModelComparison] = useState(false);

    const API_URL = "http://localhost:5000/api";

    useEffect(() => {

        fetchData();
    }, []);

    const fetchData = async () => {
        const res = await fetch(`${API_URL}/items`);
        const data = await res.json();

        const normAlbums = data.albums.map(a => ({ ...a, id: a._id ?? a.id }));
        const normSingles = data.singles.map(s => ({ ...s, id: s._id ?? s.id }));

        setAlbums(normAlbums);
        setSingles(normSingles);
    };
    const getItemId = (item) => item._id ?? item.id ?? null;


    const getCreatedAtTs = (item) => {
        if (!item) return 0;
        if (item.createdAt instanceof Date) return item.createdAt.getTime();
        const v = Date.parse?.(item.createdAt) || Number(item.createdAt);
        return Number.isFinite(v) ? v : 0;
    };

    const getAllItems = () => {
        const allItems = [
            ...albums.map(album => ({
                ...album,
                songs: Array.isArray(album.songs) ? album.songs : [],
                type: 'album',
                __id: getItemId(album),
                __createdAtTs: getCreatedAtTs(album),
                coverImage: album.coverImage ? `${API_URL}/uploads/${album.coverImage}` : null
            })),
            ...singles.map(single => ({
                ...single,
                type: 'single',
                __id: getItemId(single),
                coverImage: single.coverImage ? `${API_URL}/uploads/${single.coverImage}` : null,
                __createdAtTs: getCreatedAtTs(single)
            }))
        ].sort((a, b) => b.__createdAtTs - a.__createdAtTs);

        switch (filters) {
            case 'albums':
                return allItems.filter(item => item.type === 'album');
            case 'singles':
                return allItems.filter(item => item.type === 'single');
            default:
                return allItems;
        }
    };

    const addAlbum = async (albumData) => {
        const formData = new FormData();
        formData.append("creator", albumData.creator);
        formData.append("name", albumData.name);
        formData.append("genre", albumData.genre);
        formData.append("description", albumData.description || "");

        if (albumData.coverImage?.file) {
            console.log(albumData.coverImage.file);
            formData.append("coverImage", albumData.coverImage.file, albumData.coverImage.name);
        }

        const response = await fetch(`${API_URL}/albums`, {
            method: "POST",
            body: formData
        });
        const newAlbum = await response.json();
        setAlbums(prev => [...prev, newAlbum]);
        await fetchData();
        
        await rebuildAIEmbeddings();
    };

    const addSingle = async (singleData) => {
        const formData = new FormData();
        formData.append("creator", singleData.creator);
        formData.append("name", singleData.name);
        formData.append("genre", singleData.genre);
        formData.append("lyrics", singleData.lyrics);
        formData.append("description", singleData.description || "");

        if (singleData.coverImage?.file) {
            console.log(singleData.coverImage.file);
            formData.append("coverImage", singleData.coverImage.file, singleData.coverImage.name);
        }

        const response = await fetch(`${API_URL}/singles`, {
            method: "POST",
            body: formData
        });
        const newSingle = await response.json();
        setSingles(prev => [...prev, newSingle]);
        await fetchData();
        
        await rebuildAIEmbeddings();
    };

    const addSong = async (songData) => {
        const response = await fetch(`${API_URL}/albums/${selectedAlbum.id}/songs`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(songData)
        });
        const updatedAlbum = await response.json();
        setAlbums(prev =>
            prev.map(a => a._id === updatedAlbum._id ? updatedAlbum : a)
        );
        await fetchData();
        
        await rebuildAIEmbeddings();
    };

    const editAlbum = async (updatedAlbum) => {
        const formData = new FormData();
        formData.append("creator", updatedAlbum.creator);
        formData.append("name", updatedAlbum.name);
        formData.append("genre", updatedAlbum.genre);
        formData.append("description", updatedAlbum.description || "");

        if (updatedAlbum.coverImage?.file) {
            formData.append("coverImage", updatedAlbum.coverImage.file, updatedAlbum.coverImage.name);
        }

        const response = await fetch(`${API_URL}/albums/${getItemId(updatedAlbum)}`, {
            method: "PUT",
            body: formData
        });
        const savedAlbum = await response.json();
        setAlbums(albums => albums.map(album => getItemId(album) === getItemId(savedAlbum) ? savedAlbum : album));
        await fetchData();
        
        await rebuildAIEmbeddings();
    }

    const editSong = async (updatedSong) => {
        const response = await fetch(`${API_URL}/albums/${getItemId(selectedAlbum)}/songs/${getItemId(updatedSong)}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedSong)
        });
        const savedAlbum = await response.json();
        setAlbums(albums => albums.map(album => getItemId(album) === getItemId(savedAlbum) ? savedAlbum : album));
        await fetchData();
        
        await rebuildAIEmbeddings();
    }

    const editSingle = async (updatedSingle) => {
        const formData = new FormData();
        formData.append("creator", updatedSingle.creator);
        formData.append("name", updatedSingle.name);
        formData.append("genre", updatedSingle.genre);
        formData.append("lyrics", updatedSingle.lyrics);
        formData.append("description", updatedSingle.description || "");

        if (updatedSingle.coverImage?.file) {
            formData.append("coverImage", updatedSingle.coverImage.file, updatedSingle.coverImage.name);
        }
        const response = await fetch(`${API_URL}/singles/${getItemId(updatedSingle)}`, {
            method: "PUT",
            body: formData
        });
        const savedSingle = await response.json();
        setSingles(prev => prev.map(s => getItemId(s) === getItemId(savedSingle) ? savedSingle : s));
        await fetchData();
        
        await rebuildAIEmbeddings();
    }

    const removeAlbum = async (albumId) => {
        const response = await fetch(`${API_URL}/albums/${albumId}`,
            {
                method: "DELETE"
            });
        if (!response.ok) {
            console.error("Failed to delete album");
            return;
        }
        setAlbums(albums.filter(album => getItemId(album) !== albumId));
        const newExpanded = new Set(expandedAlbums);
        newExpanded.delete(albumId);
        setExpandedAlbums(newExpanded);
        await fetchData();
        
        await rebuildAIEmbeddings();
    };

    const removeSong = async (albumId, songId) => {
        const songName = albums.find(album => album.id === albumId)?.songs.find(song => song._id === songId)?.name || "пісню";

        if (!window.confirm(`Видалити пісню "${songName}"?`)) return;

        const response = await fetch(`${API_URL}/albums/${albumId}/songs/${songId}`, { method: "DELETE" });
        console.log(albumId, songId);
        if (!response.ok) {
            console.error("Failed to delete song");
            return;
        }
        const newAlbum = await response.json();
        setAlbums(albums => albums.map(album =>
            album.id === albumId
                ? newAlbum
                : album));
        await fetchData();
        
        await rebuildAIEmbeddings();

    };

    const removeSingle = async (singleId) => {
        if (!window.confirm('Видалити сингл?')) return;
        const response = await fetch(`${API_URL}/singles/${singleId}`, { method: "DELETE" });
        if (!response.ok) {
            console.error("Failed to delete single");
            return;
        }
        setSingles(singles => singles.filter(single => single._id !== singleId && single.id !== singleId));
        await fetchData();
        
        await rebuildAIEmbeddings();
    }

    const toggleAlbum = (albumId) => {
        
        /// Інший спосіб реалізації ///
        //const newExpanded = new Set(expandedAlbums);
        //if (expandedAlbums.has(albumId)) {
        //    newExpanded.delete(albumId);
        //    setExpandedAlbums(newExpanded);
        //    setActiveId(null);
        //} else {
        //    newExpanded.add(albumId);
        //    setExpandedAlbums(newExpanded);
        //    setActiveId(albumId);
        //}
        
        if (expandedAlbums.has(albumId)) {
            setExpandedAlbums(new Set());
            setActiveId(null);
            setSelectedSong(null);
        } else {
            const newExpanded = new Set([albumId]);
            setExpandedAlbums(newExpanded);
            setActiveId(albumId);
            setSelectedSong(null);
            setSelectedSingle(null);
        } 
    };

    const handleAddSongClick = (album) => {
        setSelectedAlbum(album);
        setSongFormState("add");
    }

    const handleAlbumClick = (albumId, album) => {
        setActiveId(activeId === albumId ? null : albumId);
        setSelectedAlbum(album);
        setSelectedSong(null);
        setSelectedSingle(null);
    };

    const handleSongClick = (songId, song, album) => {
        setActiveSongId(activeSongId === songId ? null : songId);
        setSelectedSong(song);
        setSelectedAlbum(album); 
        setSelectedSingle(null); 
    };

    const handleSingleClick = (singleId, single) => {
        setActiveId(activeId === singleId ? null : singleId);
        setSelectedSingle(single);
        setSelectedSong(null);
        setSelectedAlbum(null);
    }
    // НОВА ФУНКЦІЯ для оновлення AI embeddings
    const rebuildAIEmbeddings = async (updatedData) => {
        try {
            await fetch("http://localhost:5001/api/ai/rebuild", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ force: false }),
            });
            console.log("✅ AI embeddings оновлено");
        } catch (err) {
            console.log("⚠️ AI сервіс недоступний");
        }
    };
    // НОВА ФУНКЦІЯ для обробки вибору елемента з AI пошуку
    const handleAISelectItem = (result) => {
        const { type, data } = result;

        if (type === 'single') {
            setSelectedSingle(data);
            setSelectedSong(null);
            setSelectedAlbum(null);
            setActiveId(data._id || data.id);
        } else if (type === 'song') {
            // Знаходимо альбом пісні
            const album = albums.find(a => a.id === data.albumId || a._id === data.albumId);
            if (album) {
                setSelectedAlbum(album);
                setSelectedSong(data);
                setSelectedSingle(null);
                setExpandedAlbums(new Set([album.id]));
                setActiveId(album.id);
                setActiveSongId(data._id);
            }
        } else if (type === 'album') {
            const album = albums.find(a => (a.id === data._id || a._id === data._id) ||
                (a.id === data.id || a._id === data.id));
            if (album) {
                setSelectedAlbum(album);
                setSelectedSong(null);
                setSelectedSingle(null);
                setExpandedAlbums(new Set([album.id]));
                setActiveId(album.id);
            }
        }

        // Прокручуємо до елемента
        setTimeout(() => {
            const element = document.querySelector(`[data-id="${data._id || data.id}"]`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 100);
    };

    return (
        <div className="main-content">
            <DraggableButton>
                <button className={`test-models-search-btn ${showModelComparison ? 'active' : ''}`}>
                    <span
                        className="clickable-area"
                        onClick={(e) => {
                            setShowModelComparison(!showModelComparison);
                            setShowAISearch(false);
                            e.stopPropagation(); // щоб не перетягувалося
                        }}
                    >
                        Тест Моделей
                    </span>
                </button>
            </DraggableButton>
            <DraggableButton>
                <button className="ai-search-btn">
                    <span
                        className="ai-search-text clickable-area"
                        onClick={(e) => {
                            setShowAISearch(!showAISearch);
                            setShowModelComparison(false);
                            e.stopPropagation(); // щоб не спрацював drag
                        }}
                    >
                        АІ Пошук
                    </span>
                    <MdOutlineSavedSearch
                        className="ai-search-icon clickable-area"
                        onClick={(e) => {
                            setShowAISearch(!showAISearch);
                            setShowModelComparison(false);
                            e.stopPropagation();
                        }}
                    />
                </button>
            </DraggableButton>
            <div className="container">
                <div className="button-group">
                    <button
                        onClick={() => setAlbumFormState("add")}
                        className="add-button"
                    >
                        Додати Альбом
                    </button>
                    <button
                        className="add-button"
                        onClick={() => setSingleFormState("add")}
                    >
                        Додати Сингл
                    </button>
                    <select
                        value={filters}
                        className="select"
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        <option className="all" value="all">Усі</option>
                        <option value="albums">Альбоми</option>
                        <option value="singles">Сингли</option>
                    </select>
                </div>

                <div className="content-container">
                    <div className="content-scrollbar">
                        {getAllItems().map((item) => {

                            if (item.type === 'single') {
                                return (
                                    <div key={item.id}
                                        className="single-container"
                                    >
                                        <Header className="single-header"
                                            $active={activeId === item.id}
                                            onClick={(e) => { e.stopPropagation(); handleSingleClick(item.id, item); }}>
                                            {item.coverImage &&
                                                <div className="background-image"
                                                    style={{ backgroundImage: `url(${item.coverImage})` }} />}
                                            <div className="overlay" />
                                            <div className="content">
                                                <div className="single-info">
                                                    <div className="single-name"> {item.creator} - {item.name} </div>
                                                    <div className="single-lyrics"> {/*{item.lyrics}*/} </div>
                                                </div>
                                                <div className="action-buttons">
                                                    <button
                                                        className="action-button"
                                                        onClick={(e) => { e.stopPropagation(); setSingleFormState("edit"); setSelectedSingle(item); }}
                                                    >
                                                        <TbEdit className="edit-icon" />
                                                    </button>
                                                    <button
                                                        className="action-button"
                                                        onClick={(e) => { e.stopPropagation(); removeSingle(item.id) }}
                                                    >
                                                        <RiDeleteBack2Line className="remove-icon" />
                                                    </button>
                                                </div>

                                            </div>
                                        </Header>
                                    </div>
                                );
                            } if (item.type === 'album') {
                                return (
                                    <div key={item.id} className="album-container">
                                        <Header className="album-header"
                                            $active={activeId === item.id}
                                            onClick={() => { toggleAlbum(item.id); handleAlbumClick(item.id, item); }}
                                        >
                                            {item.coverImage &&
                                                <div className="background-image"
                                                    style={{ backgroundImage: `url(${item.coverImage})` }} />}
                                            <div className="overlay" />
                                            <div className="content">
                                                <div className="album-info">
                                                    <div className="album-name"> {item.creator} - {item.name} </div>
                                                    <div className="album-description">{item.description}</div>
                                                </div>
                                                <div className="action-buttons">
                                                    <button
                                                        className="action-button"
                                                        onClick={(e) => {
                                                            e.stopPropagation(); setAlbumFormState("edit"); setSelectedAlbum(item);
                                                        }}
                                                    >
                                                        <TbEdit className="edit-icon" />
                                                    </button>
                                                    <button
                                                        className="action-button"
                                                        onClick={(e) => { e.stopPropagation(); handleAddSongClick(item); }}
                                                    >
                                                        <MdOutlinePlaylistAdd className="add-icon" />
                                                    </button>
                                                    <button
                                                        className="action-button"
                                                        onClick={(e) => { e.stopPropagation(); removeAlbum(item.id) }}
                                                    >
                                                        <RiDeleteBack2Line className="remove-icon" />
                                                    </button>
                                                </div>
                                            </div>
                                        </Header>

                                        {expandedAlbums.has(item.id) && (
                                            <div className="song-list">
                                                {item.songs.map((song) => (
                                                    <Song
                                                        key={song._id}
                                                        className="song"
                                                        $active={activeSongId === song._id}
                                                        onClick={() => handleSongClick(song._id, song, item)}
                                                    >
                                                        {item.coverImage &&
                                                            <div className="background-image"
                                                                style={{ backgroundImage: `url(${item.coverImage})` }} />}
                                                        <div className="overlay" />
                                                        <div className="content">
                                                            <div>
                                                                <div className="song-name"> {song.name} </div>
                                                                {/*<div className="song-lyrics">{song.lyrics}</div>*/}
                                                            </div>
                                                            <div className="action-buttons" style={{ flexDirection: "row", gap: "5px", right: "10px" }}>
                                                                <button
                                                                    className="action-button"
                                                                    style={{ height: "35px" }}
                                                                    onClick={(e) => { e.stopPropagation(); setSelectedSong(song); setSongFormState("edit"); setSelectedAlbum(item); }}
                                                                >
                                                                    <TbEdit className="edit-icon" />
                                                                </button>
                                                                <button
                                                                    className="action-button"
                                                                    style={{ height: "35px" }}
                                                                    onClick={(e) => { e.stopPropagation(); removeSong(item.id, song._id); }}
                                                                >
                                                                    <RiDeleteBack2Line className="remove-icon" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </Song>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            }
                        })}
                    </div>
                </div>



            </div>
                <div className="showtext-container">
                    <ShowText
                        selectedSingle={selectedSingle}
                        selectedAlbum={selectedAlbum}
                        selectedSong={selectedSong}
                    />
                </div>

                {singleFormState && (
                    <SingleForm
                        onClose={() => { setSingleFormState(null); setSelectedSingle(null); }}
                        onSave={addSingle}
                        editSingle={editSingle}
                        selectedSingle={singleFormState === "edit" ? selectedSingle : null}
                    />
                )}

                {albumFormState && (
                    <AlbumForm
                        onClose={() => { setAlbumFormState(null); setSelectedAlbum(null); }}
                        onSave={addAlbum}
                        editAlbum={editAlbum}
                        selectedAlbum={albumFormState === "edit" ? selectedAlbum : null}
                    />
                )}

                {songFormState && (
                    <SongForm
                        onClose={() => { setSongFormState(null); setSelectedSong(null); }}
                        onSave={addSong}
                        editSong={editSong}
                        selectedSong={songFormState === "edit" ? selectedSong : null}
                    />
            )}
            {showAISearch && <AISearch onClose={() => setShowAISearch(false)} onSelectItem={handleAISelectItem} />}
            {showModelComparison && <ModelComparison onClose={() => setShowModelComparison(false)} />}
        </div>
    );
};

const activeStyleHeader = css`
    box-shadow: 0 0 40px rgba(255, 255, 255, 0.7) inset;
    border: 8px solid rgba(255, 255, 255, 1);
    color: rgba(255, 255, 255, 1);
`;

const activeBtnStyle = css`
    opacity: 1;
    transform: translateX(0);
`;

const activeStyleSong = css`
    border: 5px solid rgba(255,255,255,1);
    color: rgba(255,255,255,1);
`;

const activeFontStyle = css`
    color: rgba(255,255,255, 1);
`;


const Header = styled.div`
    &.single-header, &.album-header {
        ${({ $active }) => $active && activeStyleHeader}
    }
    &.single-header .action-button,
    &.album-header .action-button {
        ${({ $active }) => $active && activeBtnStyle}
    }
    .album-name, .single-name {
         ${({ $active }) => $active && activeFontStyle}
    }
`;

const Song = styled.div`
    &.song {
        ${({ $active }) => $active && activeStyleSong}
    }
    &.song .action-button {
        ${({ $active }) => $active && activeBtnStyle}
    }
    .song-name {
         ${({ $active }) => $active && activeFontStyle}
    }
`;

export default App;