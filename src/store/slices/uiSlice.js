import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    filter: 'all',
    drawerOpen: false,
    albumForm: null,
    songForm: null,
    singleForm: null,
    showAISearch: false,
    showModelComparison: false,
    showLoginForm: false,
    showRegisterForm: false,
};

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        setFilter: (state, action) => {
            state.filter = action.payload;
        },
        setDrawerOpen: (state, action) => {
            state.drawerOpen = action.payload;
        },
        openAlbumForm: (state, action) => {
            state.albumForm = action.payload;
        },
        closeAlbumForm: (state) => {
            state.albumForm = null;
        },
        openSongForm: (state, action) => {
            state.songForm = action.payload;
        },
        closeSongForm: (state) => {
            state.songForm = null;
        },
        openSingleForm: (state, action) => {
            state.singleForm = action.payload;
        },
        closeSingleForm: (state) => {
            state.singleForm = null;
        },
        setShowAISearch: (state, action) => {
            state.showAISearch = action.payload;
        },
        setShowModelComparison: (state, action) => {
            state.showModelComparison = action.payload;
        },
        toggleAISearch: (state) => {
            state.showAISearch = !state.showAISearch;
            if (state.showAISearch) state.showModelComparison = false;
        },
        toggleModelComparison: (state) => {
            state.showModelComparison = !state.showModelComparison;
            if (state.showModelComparison) state.showAISearch = false;
        },
        setShowLoginForm: (state, action) => {
            state.showLoginForm = action.payload;
        },
        setShowRegisterForm: (state, action) => {
            state.showRegisterForm = action.payload;
        },
    },
});

export const {
    setFilter,
    setDrawerOpen,
    openAlbumForm,
    closeAlbumForm,
    openSongForm,
    closeSongForm,
    openSingleForm,
    closeSingleForm,
    setShowAISearch,
    setShowModelComparison,
    toggleAISearch,
    toggleModelComparison,
    setShowLoginForm,
    setShowRegisterForm,
} = uiSlice.actions;

export default uiSlice.reducer;
