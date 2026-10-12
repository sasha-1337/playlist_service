import React, { useCallback } from 'react';
import styled, { css } from 'styled-components';
import { RiDeleteBack2Line } from 'react-icons/ri';
import { MdOutlinePlaylistAdd } from 'react-icons/md';
import { TbEdit } from 'react-icons/tb';

import GeniusSearch from './GeniusSearch';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { selectFilteredItems } from '../store/selectors/librarySelectors';
import {
    removeAlbum,
    removeSingle,
    removeSong,
} from '../store/slices/librarySlice';
import {
    selectAlbum,
    selectSong,
    selectSingle,
    toggleAlbumExpanded,
    setSelectedAlbum,
    setSelectedSingle,
    setSelectedSong,
    isAlbumExpanded,
} from '../store/slices/selectionSlice';
import {
    setFilter,
    openAlbumForm,
    openSongForm,
    openSingleForm,
    setDrawerOpen,
} from '../store/slices/uiSlice';

const activeStyleHeader = css`
    box-shadow: 0 0 25px rgba(255, 255, 255, 0.35) inset, 0 4px 18px rgba(255, 255, 255, 0.2);
    border: 2px solid rgba(255, 255, 255, 1) !important;
    color: rgba(255, 255, 255, 1);
`;

const activeBtnStyle = css`
    opacity: 1;
    transform: translateX(0);
`;

const activeStyleSong = css`
    border: 2px solid rgba(255, 255, 255, 1) !important;
    box-shadow: 0 0 15px rgba(255, 255, 255, 0.2);
    color: rgba(255, 255, 255, 1);
`;

const activeFontStyle = css`
    color: rgba(255, 255, 255, 1);
`;

const Header = styled.div`
    &.single-header,
    &.album-header {
        ${({ $active }) => $active && activeStyleHeader}
    }
    &.single-header .action-button,
    &.album-header .action-button {
        ${({ $active }) => $active && activeBtnStyle}
    }
    .album-name,
    .single-name {
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

const LibraryPanel = () => {
    const dispatch = useAppDispatch();

    const items = useAppSelector(selectFilteredItems);
    const filter = useAppSelector((state) => state.ui.filter);
    const activeId = useAppSelector((state) => state.selection.activeId);
    const activeSongId = useAppSelector((state) => state.selection.activeSongId);
    const expandedAlbums = useAppSelector((state) => state.selection.expandedAlbums);

    const closeDrawerOnMobile = useCallback(() => {
        if (window.innerWidth <= 768) {
            dispatch(setDrawerOpen(false));
        }
    }, [dispatch]);

    const handleRemoveAlbum = async (album) => {
        if (!window.confirm(`Delete album: ${album.creator} - ${album.name}?`)) return;
        await dispatch(removeAlbum({ albumId: album.id }));
    };

    const handleRemoveSong = async (album, song) => {
        if (!window.confirm(`Delete song "${song.name}" from ${album.creator} - ${album.name}?`)) return;
        await dispatch(removeSong({ albumId: album.id, songId: song._id }));
    };

    const handleRemoveSingle = async (single) => {
        if (!window.confirm(`Delete single ${single.creator} - ${single.name}?`)) return;
        await dispatch(removeSingle({ singleId: single.id }));
    };

    const handleAlbumHeaderClick = (albumId, album) => {
        dispatch(toggleAlbumExpanded(albumId));
        dispatch(selectAlbum({ albumId, album }));
        closeDrawerOnMobile();
    };

    const handleSongClick = (songId, song, album) => {
        dispatch(selectSong({ songId, song, album }));
        closeDrawerOnMobile();
    };

    const handleSingleClick = (singleId, single) => {
        dispatch(selectSingle({ singleId, single }));
        closeDrawerOnMobile();
    };

    return (
        <>
            <div className="library-controls">
                <div className="search-section">
                    <GeniusSearch />
                </div>
                
                <div className="library-actions">
                    <div className="filter-pills">
                        <button 
                            className={`filter-pill ${filter === 'all' ? 'active' : ''}`}
                            onClick={() => dispatch(setFilter('all'))}
                        >
                            All
                        </button>
                        <button 
                            className={`filter-pill ${filter === 'albums' ? 'active' : ''}`}
                            onClick={() => dispatch(setFilter('albums'))}
                        >
                            Albums
                        </button>
                        <button 
                            className={`filter-pill ${filter === 'singles' ? 'active' : ''}`}
                            onClick={() => dispatch(setFilter('singles'))}
                        >
                            Singles
                        </button>
                    </div>

                    <div className="add-buttons">
                        <button
                            onClick={() => dispatch(openAlbumForm('add'))}
                            className="icon-add-button"
                            title="Add Album"
                        >
                            + Album
                        </button>
                        <button
                            onClick={() => dispatch(openSingleForm('add'))}
                            className="icon-add-button"
                            title="Add Single"
                        >
                            + Single
                        </button>
                    </div>
                </div>
            </div>

            <div className="content-container">
                <div className="content-scrollbar">
                    {items.map((item) => {
                        if (item.type === 'single') {
                            return (
                                <div key={item.id} className="single-container" data-id={item.id}>
                                    <Header
                                        className="single-header"
                                        $active={activeId === item.id}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleSingleClick(item.id, item);
                                        }}
                                    >
                                        {item.coverImage && (
                                            <div
                                                className="background-image"
                                                style={{ backgroundImage: `url(${item.coverImage})` }}
                                            />
                                        )}
                                        <div className="overlay" />
                                        <div className="content">
                                            <div className="single-info">
                                                <div className="single-name">
                                                    {item.creator} - {item.name}
                                                </div>
                                            </div>
                                            <div className="action-buttons">
                                                <button
                                                    className="action-button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        dispatch(setSelectedSingle(item));
                                                        dispatch(openSingleForm('edit'));
                                                    }}
                                                >
                                                    <TbEdit className="edit-icon" />
                                                </button>
                                                <button
                                                    className="action-button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRemoveSingle(item);
                                                    }}
                                                >
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
                                        onClick={() => handleAlbumHeaderClick(item.id, item)}
                                    >
                                        {item.coverImage && (
                                            <div
                                                className="background-image"
                                                style={{ backgroundImage: `url(${item.coverImage})` }}
                                            />
                                        )}
                                        <div className="overlay" />
                                        <div className="content">
                                            <div className="album-info">
                                                <div className="album-name">
                                                    {item.creator} - {item.name}
                                                </div>
                                                <div className="album-description">{item.description}</div>
                                            </div>
                                            <div className="action-buttons">
                                                <button
                                                    className="action-button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        dispatch(setSelectedAlbum(item));
                                                        dispatch(openAlbumForm('edit'));
                                                    }}
                                                >
                                                    <TbEdit className="edit-icon" />
                                                </button>
                                                <button
                                                    className="action-button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        dispatch(setSelectedAlbum(item));
                                                        dispatch(openSongForm('add'));
                                                    }}
                                                >
                                                    <MdOutlinePlaylistAdd className="add-icon" />
                                                </button>
                                                <button
                                                    className="action-button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRemoveAlbum(item);
                                                    }}
                                                >
                                                    <RiDeleteBack2Line className="remove-icon" />
                                                </button>
                                            </div>
                                        </div>
                                    </Header>

                                    {isAlbumExpanded(expandedAlbums, item.id) && (
                                        <div className="song-list">
                                            {item.songs.map((song) => (
                                                <Song
                                                    key={song._id}
                                                    className="song"
                                                    $active={activeSongId === song._id}
                                                    onClick={() => handleSongClick(song._id, song, item)}
                                                    data-id={song._id}
                                                >
                                                    {item.coverImage && (
                                                        <div
                                                            className="background-image"
                                                            style={{
                                                                backgroundImage: `url(${item.coverImage})`,
                                                            }}
                                                        />
                                                    )}
                                                    <div className="overlay" />
                                                    <div className="content">
                                                        <div className="song-name">{song.name}</div>
                                                        <div
                                                            className="action-buttons"
                                                            style={{
                                                                flexDirection: 'row',
                                                                gap: '5px',
                                                                right: '10px',
                                                            }}
                                                        >
                                                            <button
                                                                className="action-button"
                                                                style={{ height: '35px' }}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    dispatch(setSelectedSong(song));
                                                                    dispatch(setSelectedAlbum(item));
                                                                    dispatch(openSongForm('edit'));
                                                                }}
                                                            >
                                                                <TbEdit className="edit-icon" />
                                                            </button>
                                                            <button
                                                                className="action-button"
                                                                style={{ height: '35px' }}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleRemoveSong(item, song);
                                                                }}
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

                        return null;
                    })}
                </div>
            </div>
        </>
    );
};

export default LibraryPanel;
