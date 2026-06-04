import React, { useState, useEffect, useCallback } from 'react';
import "./styles/App.css";

import AlbumForm from './forms/AlbumForm';
import SongForm from './forms/SongForm';
import SingleForm from './forms/SingleForm';

import ShowText from './components/ShowText';
import DraggableButton from './components/DraggableButton';
import AuthContainer from './components/AuthContainer';
import ProtectedRoute from './components/ProtectedRoute';

import AISearch from './ai-components/AISearch';
import ModelComparison from './ai-components/ModelComparison';

import { RiDeleteBack2Line } from "react-icons/ri";
import { MdOutlinePlaylistAdd, MdOutlineSavedSearch, MdMenu, MdClose } from "react-icons/md";
import { TbEdit } from "react-icons/tb";
import styled, { css } from 'styled-components';
import { useAuth } from './context/AuthContext';

import { useMusicLibrary } from './hooks/useMusicLibrary';
import GeniusSearch from './components/GeniusSearch';

const App = () => {
    const { isAuthenticated, currentUser, userToken, logout } = useAuth();

    const {
        albums, singles, fetchData,
        addAlbum, editAlbum, removeAlbum,
        addSingle, editSingle, removeSingle,
        addSong, editSong, removeSong
    } = useMusicLibrary(userToken, logout);

    const [albumFormState, setAlbumFormState] = useState(null);
    const [selectedAlbum, setSelectedAlbum] = useState(null);
    const [expandedAlbums, setExpandedAlbums] = useState(new Set());

    const [songFormState, setSongFormState] = useState(null);
    const [selectedSong, setSelectedSong] = useState(null);

    const [singleFormState, setSingleFormState] = useState(null);
    const [selectedSingle, setSelectedSingle] = useState(null);

    const [activeId, setActiveId] = useState(null);
    const [activeSongId, setActiveSongId] = useState(null);

    const [filters, setFilter] = useState('all');

    const [showAISearch, setShowAISearch] = useState(false);
    const [showModelComparison, setShowModelComparison] = useState(false);

    const [drawerOpen, setDrawerOpen] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 768) setDrawerOpen(false);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        document.body.style.overflow = drawerOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [drawerOpen]);

    const closeDrawerOnMobile = useCallback(() => {
        if (window.innerWidth <= 768) setDrawerOpen(false);
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            fetchData(currentUser.id);
        }
    }, [fetchData, isAuthenticated, currentUser]);

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
                coverImage: album.coverImage,
            })),
            ...singles.map(single => ({
                ...single,
                type: 'single',
                __id: getItemId(single),
                coverImage: single.coverImage,
                __createdAtTs: getCreatedAtTs(single)
            }))
        ].sort((a, b) => b.__createdAtTs - a.__createdAtTs);

        switch (filters) {
            case 'albums': return allItems.filter(item => item.type === 'album');
            case 'singles': return allItems.filter(item => item.type === 'single');
            default: return allItems;
        }
    };

    const handleAddAlbum = async (data) => await addAlbum(data, currentUser.id);
    const handleAddSingle = async (data) => await addSingle(data, currentUser.id);
    const handleAddSong = async (data) => await addSong(selectedAlbum.id, data);
    const handleEditSong = async (data) => await editSong(selectedAlbum.id, data);

    const handleRemoveAlbum = async (album) => {
        if (!window.confirm(`Delete album: ${album.creator} - ${album.name}?`)) return;
        await removeAlbum(album.id);
    };

    const handleRemoveSong = async (album, song) => {
        if (!window.confirm(`Delete song "${song.name}" from ${album.creator} - ${album.name}?`)) return;
        await removeSong(album.id, song._id);
    };

    const handleRemoveSingle = async (single) => {
        if (!window.confirm(`Delete single ${single.creator} - ${single.name}?`)) return;
        await removeSingle(single.id);
    };

    const toggleAlbum = (albumId) => {
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
    };

    const handleAlbumClick = (albumId, album) => {
        setActiveId(activeId === albumId ? null : albumId);
        setSelectedAlbum(album);
        setSelectedSong(null);
        setSelectedSingle(null);
        closeDrawerOnMobile();
    };

    const handleSongClick = (songId, song, album) => {
        setActiveSongId(activeSongId === songId ? null : songId);
        setSelectedSong(song);
        setSelectedAlbum(album);
        setSelectedSingle(null);
        closeDrawerOnMobile();
    };

    const handleSingleClick = (singleId, single) => {
        setActiveId(activeId === singleId ? null : singleId);
        setSelectedSingle(single);
        setSelectedSong(null);
        setSelectedAlbum(null);
        closeDrawerOnMobile();
    };

    const handleAISelectItem = (result) => {
        const { type, data } = result;

        if (type === 'single') {
            setSelectedSingle(data);
            setSelectedSong(null);
            setSelectedAlbum(null);
            setActiveId(data._id || data.id);
        } else if (type === 'song') {
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
            const album = albums.find(a =>
                (a.id === data._id || a._id === data._id) ||
                (a.id === data.id || a._id === data.id)
            );
            if (album) {
                setSelectedAlbum(album);
                setSelectedSong(null);
                setSelectedSingle(null);
                setExpandedAlbums(new Set([album.id]));
                setActiveId(album.id);
            }
        }

        setTimeout(() => {
            const element = document.querySelector(`[data-id="${data._id || data.id}"]`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 100);
    };

    // ── Panel content ──
    const panelContent = (
        <>
            <div className="button-group">
                <GeniusSearch/>
                <button onClick={() => setAlbumFormState("add")} className="add-button">
                    Add Album
                </button>
                <button className="add-button" onClick={() => setSingleFormState("add")}>
                    Add Single
                </button>
                <select value={filters} className="select" onChange={(e) => setFilter(e.target.value)}>
                    <option value="all">All</option>
                    <option value="albums">Albums</option>
                    <option value="singles">Singles</option>
                </select>
            </div>

            <div className="content-container">
                <div className="content-scrollbar">
                    {getAllItems().map((item) => {
                        if (item.type === 'single') {
                            return (
                                <div key={item.id} className="single-container" data-id={item.id}>
                                    <Header
                                        className="single-header"
                                        $active={activeId === item.id}
                                        onClick={(e) => { e.stopPropagation(); handleSingleClick(item.id, item); }}
                                    >
                                        {item.coverImage &&
                                            <div className="background-image"
                                                style={{ backgroundImage: `url(${item.coverImage})` }} />}
                                        <div className="overlay" />
                                        <div className="content">
                                            <div className="single-info">
                                                <div className="single-name">{item.creator} - {item.name}</div>
                                            </div>
                                            <div className="action-buttons">
                                                <button className="action-button"
                                                    onClick={(e) => { e.stopPropagation(); setSingleFormState("edit"); setSelectedSingle(item); }}>
                                                    <TbEdit className="edit-icon" />
                                                </button>
                                                <button className="action-button"
                                                    onClick={(e) => { e.stopPropagation(); handleRemoveSingle(item); }}>
                                                    <RiDeleteBack2Line className="remove-icon" />
                                                </button>
                                            </div>
                                        </div>
                                    </Header>
                                </div>
                            );
                        }

                        if (item.type === 'album') {
                            return (
                                <div key={item.id} className="album-container" data-id={item.id}>
                                    <Header
                                        className="album-header"
                                        $active={activeId === item.id}
                                        onClick={() => { toggleAlbum(item.id); handleAlbumClick(item.id, item); }}
                                    >
                                        {item.coverImage &&
                                            <div className="background-image"
                                                style={{ backgroundImage: `url(${item.coverImage})` }} />}
                                        <div className="overlay" />
                                        <div className="content">
                                            <div className="album-info">
                                                <div className="album-name">{item.creator} - {item.name}</div>
                                                <div className="album-description">{item.description}</div>
                                            </div>
                                            <div className="action-buttons">
                                                <button className="action-button"
                                                    onClick={(e) => { e.stopPropagation(); setAlbumFormState("edit"); setSelectedAlbum(item); }}>
                                                    <TbEdit className="edit-icon" />
                                                </button>
                                                <button className="action-button"
                                                    onClick={(e) => { e.stopPropagation(); handleAddSongClick(item); }}>
                                                    <MdOutlinePlaylistAdd className="add-icon" />
                                                </button>
                                                <button className="action-button"
                                                    onClick={(e) => { e.stopPropagation(); handleRemoveAlbum(item); }}>
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
                                                    data-id={song._id}
                                                >
                                                    {item.coverImage &&
                                                        <div className="background-image"
                                                            style={{ backgroundImage: `url(${item.coverImage})` }} />}
                                                    <div className="overlay" />
                                                    <div className="content">
                                                        <div className="song-name">{song.name}</div>
                                                        <div className="action-buttons"
                                                            style={{ flexDirection: "row", gap: "5px", right: "10px" }}>
                                                            <button className="action-button" style={{ height: "35px" }}
                                                                onClick={(e) => { e.stopPropagation(); setSelectedSong(song); setSongFormState("edit"); setSelectedAlbum(item); }}>
                                                                <TbEdit className="edit-icon" />
                                                            </button>
                                                            <button className="action-button" style={{ height: "35px" }}
                                                                onClick={(e) => { e.stopPropagation(); handleRemoveSong(item, song); }}>
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
                        return null;
                    })}
                </div>
            </div>
        </>
    );

    return (
        <div className="app-shell">

            <div className="app-background" />

            <header className="app-header">
                <div className="app-logo">Playlist Manager</div>
                <AuthContainer />
            </header>
            <main className="app-main">
                <ProtectedRoute>
                    {/* ── Floating AI кнопки ── 
                    <DraggableButton>
                        <button className={`test-models-search-btn ${showModelComparison ? 'active' : ''}`}>
                            <span className="clickable-area"
                                onClick={(e) => { setShowModelComparison(!showModelComparison); setShowAISearch(false); e.stopPropagation(); }}>
                                Test Models
                            </span>
                        </button>
                    </DraggableButton>
                    <DraggableButton>
                        <button className="ai-search-btn">
                            <span className="ai-search-text clickable-area"
                                onClick={(e) => { setShowAISearch(!showAISearch); setShowModelComparison(false); e.stopPropagation(); }}>
                                АІ Search
                            </span>
                            <MdOutlineSavedSearch className="ai-search-icon clickable-area"
                                onClick={(e) => { setShowAISearch(!showAISearch); setShowModelComparison(false); e.stopPropagation(); }} />
                        </button>
                    </DraggableButton>  */}

                    {/* ── DESKTOP ── */}
                    <div className="app-content">
                        <div className="container desktop-only">
                            {panelContent}
                        </div>

                        {/* ── MOBILE ── */}
                        <button
                            className="drawer-toggle"
                            onClick={() => setDrawerOpen(true)}
                            aria-label="Відкрити меню"
                        >
                            <MdMenu size={28} />
                        </button>

                        {/* ── MOBILE: overlay + drawer ── */}
                        <div
                            className={`drawer-overlay ${drawerOpen ? 'drawer-overlay--visible' : ''}`}
                            onClick={() => setDrawerOpen(false)}
                        />
                        <div className={`drawer ${drawerOpen ? 'drawer--open' : ''}`}>
                            <div className="drawer-header">
                                <span className="drawer-title">Library</span>
                                <button
                                    className="drawer-close"
                                    onClick={() => setDrawerOpen(false)}
                                    aria-label="Закрити"
                                >
                                    <MdClose size={24} />
                                </button>
                            </div>
                            <div className="drawer-body">
                                {panelContent}
                            </div>
                        </div>

                        {/* ── ShowText ── */}
                        <div className="showtext-container">
                            <ShowText
                                selectedSingle={selectedSingle}
                                selectedAlbum={selectedAlbum}
                                selectedSong={selectedSong}
                            />
                        </div>

                    </div>{/* ── /app-content ── */}

                    {/* ── Forms ── */}
                    {singleFormState && (
                        <SingleForm
                            onClose={() => { setSingleFormState(null); setSelectedSingle(null); }}
                            onSave={handleAddSingle}
                            editSingle={editSingle}
                            selectedSingle={singleFormState === "edit" ? selectedSingle : null}
                        />
                    )}
                    {albumFormState && (
                        <AlbumForm
                            onClose={() => { setAlbumFormState(null); setSelectedAlbum(null); }}
                            onSave={handleAddAlbum}
                            editAlbum={editAlbum}
                            selectedAlbum={albumFormState === "edit" ? selectedAlbum : null}
                        />
                    )}
                    {songFormState && (
                        <SongForm
                            onClose={() => { setSongFormState(null); setSelectedSong(null); }}
                            onSave={handleAddSong}
                            editSong={handleEditSong}
                            selectedSong={songFormState === "edit" ? selectedSong : null}
                        />
                    )}
                    {showAISearch && (
                        <AISearch onClose={() => setShowAISearch(false)} onSelectItem={handleAISelectItem} />
                    )}
                    {showModelComparison && (
                        <ModelComparison onClose={() => setShowModelComparison(false)} />
                    )}
                </ProtectedRoute>
            </main>

            {/* ── Footer ── */}
            <footer className="app-footer" />
        </div>
    );
};

// --- Styled Components ---
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