import React, { useEffect } from 'react';
import './styles/App.css';

import AlbumForm from './forms/AlbumForm';
import SongForm from './forms/SongForm';
import SingleForm from './forms/SingleForm';

import ShowText from './components/ShowText';
import AuthContainer from './components/AuthContainer';
import ProtectedRoute from './components/ProtectedRoute';
import LibraryPanel from './components/LibraryPanel';

import AISearch from './ai-components/AISearch';
import ModelComparison from './ai-components/ModelComparison';

import { MdMenu, MdClose } from 'react-icons/md';
import { useAppDispatch, useAppSelector, useIsAuthenticated, useCurrentUser } from './store/hooks';
import {
    fetchLibrary,
    addAlbum,
    editAlbum,
    addSingle,
    editSingle,
    addSong,
    editSong,
    clearLibrary,
} from './store/slices/librarySlice';
import {
    clearSelection,
    selectFromAIResult,
    setSelectedAlbum,
    setSelectedSingle,
    setSelectedSong,
} from './store/slices/selectionSlice';
import { initAuth } from './store/slices/authSlice';
import {
    setDrawerOpen,
    closeAlbumForm,
    closeSongForm,
    closeSingleForm,
    setShowAISearch,
    setShowModelComparison,
} from './store/slices/uiSlice';

const App = () => {
    const isAuthenticated = useIsAuthenticated();
    const currentUser = useCurrentUser();
    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(initAuth());
    }, [dispatch]);

    const albums = useAppSelector((state) => state.library.albums);
    const selectedAlbum = useAppSelector((state) => state.selection.selectedAlbum);
    const selectedSong = useAppSelector((state) => state.selection.selectedSong);
    const selectedSingle = useAppSelector((state) => state.selection.selectedSingle);

    const drawerOpen = useAppSelector((state) => state.ui.drawerOpen);
    const albumForm = useAppSelector((state) => state.ui.albumForm);
    const songForm = useAppSelector((state) => state.ui.songForm);
    const singleForm = useAppSelector((state) => state.ui.singleForm);
    const showAISearch = useAppSelector((state) => state.ui.showAISearch);
    const showModelComparison = useAppSelector((state) => state.ui.showModelComparison);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 768) dispatch(setDrawerOpen(false));
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [dispatch]);

    useEffect(() => {
        document.body.style.overflow = drawerOpen ? 'hidden' : '';
        return () => {
            document.body.style.overflow = '';
        };
    }, [drawerOpen]);

    useEffect(() => {
        if (isAuthenticated && currentUser?.id) {
            console.log("isAuthenticated", isAuthenticated);
            dispatch(fetchLibrary({ userId: currentUser.id }));
        } else if (!isAuthenticated) {
            console.log("is NOT Authenticated", isAuthenticated);
            dispatch(clearLibrary());
            dispatch(clearSelection());
        }
    }, [dispatch, isAuthenticated, currentUser?.id]);

    const handleAddAlbum = async (data) => {
        await dispatch(addAlbum({ albumData: data, userId: currentUser.id }));
    };

    const handleAddSingle = async (data) => {
        await dispatch(addSingle({ singleData: data, userId: currentUser.id }));
    };

    const handleAddSong = async (data) => {
        await dispatch(addSong({ albumId: selectedAlbum.id, songData: data }));
    };

    const handleEditSong = async (data) => {
        await dispatch(editSong({ albumId: selectedAlbum.id, updatedSong: data }));
    };

    const handleEditAlbum = async (data) => {
        await dispatch(editAlbum({ updatedAlbum: data }));
    };

    const handleEditSingle = async (data) => {
        await dispatch(editSingle({ updatedSingle: data }));
    };

    const handleAISelectItem = (result) => {
        dispatch(selectFromAIResult({ ...result, albums }));

        setTimeout(() => {
            const { data } = result;
            const element = document.querySelector(`[data-id="${data._id || data.id}"]`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 100);
    };

    const handleCloseAlbumForm = () => {
        dispatch(closeAlbumForm());
        dispatch(setSelectedAlbum(null));
    };

    const handleCloseSongForm = () => {
        dispatch(closeSongForm());
        dispatch(setSelectedSong(null));
    };

    const handleCloseSingleForm = () => {
        dispatch(closeSingleForm());
        dispatch(setSelectedSingle(null));
    };

    return (
        <div className="app-shell">
            <div className="app-background" />

            <header className="app-header">
                <div className="app-logo">Playlist Manager</div>
                <AuthContainer />
            </header>

            <main className="app-main">
                <ProtectedRoute>
                    <div className="app-content">
                        <div className="container desktop-only">
                            <LibraryPanel />
                        </div>

                        <button
                            className="drawer-toggle"
                            onClick={() => dispatch(setDrawerOpen(true))}
                            aria-label="Відкрити меню"
                        >
                            <MdMenu size={28} />
                        </button>

                        <div
                            className={`drawer-overlay ${drawerOpen ? 'drawer-overlay--visible' : ''}`}
                            onClick={() => dispatch(setDrawerOpen(false))}
                        />
                        <div className={`drawer ${drawerOpen ? 'drawer--open' : ''}`}>
                            <div className="drawer-header">
                                <span className="drawer-title">Library</span>
                                <button
                                    className="drawer-close"
                                    onClick={() => dispatch(setDrawerOpen(false))}
                                    aria-label="Закрити"
                                >
                                    <MdClose size={24} />
                                </button>
                            </div>
                            <div className="drawer-body">
                                <LibraryPanel />
                            </div>
                        </div>

                        <div className="showtext-container">
                            <ShowText />
                        </div>
                    </div>

                    {singleForm && (
                        <SingleForm
                            onClose={handleCloseSingleForm}
                            onSave={handleAddSingle}
                            editSingle={handleEditSingle}
                            selectedSingle={singleForm === 'edit' ? selectedSingle : null}
                        />
                    )}
                    {albumForm && (
                        <AlbumForm
                            onClose={handleCloseAlbumForm}
                            onSave={handleAddAlbum}
                            editAlbum={handleEditAlbum}
                            selectedAlbum={albumForm === 'edit' ? selectedAlbum : null}
                        />
                    )}
                    {songForm && (
                        <SongForm
                            onClose={handleCloseSongForm}
                            onSave={handleAddSong}
                            editSong={handleEditSong}
                            selectedSong={songForm === 'edit' ? selectedSong : null}
                        />
                    )}
                    {showAISearch && (
                        <AISearch
                            onClose={() => dispatch(setShowAISearch(false))}
                            onSelectItem={handleAISelectItem}
                        />
                    )}
                    {showModelComparison && (
                        <ModelComparison
                            onClose={() => dispatch(setShowModelComparison(false))}
                        />
                    )}
                </ProtectedRoute>
            </main>

            <footer className="app-footer" />
        </div>
    );
};

export default App;
