import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    selectedAlbum: null,
    selectedSong: null,
    selectedSingle: null,
    activeId: null,
    activeSongId: null,
    expandedAlbums: [],
};

const selectionSlice = createSlice({
    name: 'selection',
    initialState,
    reducers: {
        selectAlbum: (state, action) => {
            const { albumId, album } = action.payload;
            state.activeId = state.activeId === albumId ? null : albumId;
            state.selectedAlbum = album;
            state.selectedSong = null;
            state.selectedSingle = null;
        },
        selectSong: (state, action) => {
            const { songId, song, album } = action.payload;
            state.activeSongId = state.activeSongId === songId ? null : songId;
            state.selectedSong = song;
            state.selectedAlbum = album;
            state.selectedSingle = null;
        },
        selectSingle: (state, action) => {
            const { singleId, single } = action.payload;
            state.activeId = state.activeId === singleId ? null : singleId;
            state.selectedSingle = single;
            state.selectedSong = null;
            state.selectedAlbum = null;
        },
        toggleAlbumExpanded: (state, action) => {
            const albumId = action.payload;
            const isExpanded = state.expandedAlbums.includes(albumId);

            if (isExpanded) {
                state.expandedAlbums = [];
                state.activeId = null;
                state.selectedSong = null;
            } else {
                state.expandedAlbums = [albumId];
                state.activeId = albumId;
                state.selectedSong = null;
                state.selectedSingle = null;
            }
        },
        setSelectedAlbum: (state, action) => {
            state.selectedAlbum = action.payload;
        },
        setSelectedSong: (state, action) => {
            state.selectedSong = action.payload;
        },
        setSelectedSingle: (state, action) => {
            state.selectedSingle = action.payload;
        },
        clearSelection: () => initialState,
        selectFromAIResult: (state, action) => {
            const { type, data, albums } = action.payload;

            if (type === 'single') {
                state.selectedSingle = data;
                state.selectedSong = null;
                state.selectedAlbum = null;
                state.activeId = data._id || data.id;
                state.activeSongId = null;
                state.expandedAlbums = [];
            } else if (type === 'song') {
                const album = albums.find(
                    (a) => a.id === data.albumId || a._id === data.albumId
                );
                if (album) {
                    state.selectedAlbum = album;
                    state.selectedSong = data;
                    state.selectedSingle = null;
                    state.expandedAlbums = [album.id];
                    state.activeId = album.id;
                    state.activeSongId = data._id;
                }
            } else if (type === 'album') {
                const album = albums.find(
                    (a) =>
                        a.id === data._id ||
                        a._id === data._id ||
                        a.id === data.id ||
                        a._id === data.id
                );
                if (album) {
                    state.selectedAlbum = album;
                    state.selectedSong = null;
                    state.selectedSingle = null;
                    state.expandedAlbums = [album.id];
                    state.activeId = album.id;
                    state.activeSongId = null;
                }
            }
        },
    },
});

export const {
    selectAlbum,
    selectSong,
    selectSingle,
    toggleAlbumExpanded,
    setSelectedAlbum,
    setSelectedSong,
    setSelectedSingle,
    clearSelection,
    selectFromAIResult,
} = selectionSlice.actions;

export const isAlbumExpanded = (expandedAlbums, albumId) =>
    expandedAlbums.includes(albumId);

export default selectionSlice.reducer;
