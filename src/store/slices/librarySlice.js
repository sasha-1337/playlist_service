import { apiClient } from '../../utils/apiClient';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    buildFormData,
    getItemId,
    normalizeAlbum,
    normalizeSingle,
} from '../../utils/apiHelpers';

export const fetchLibrary = createAsyncThunk(
    'library/fetchLibrary',
    async ({ userId }, { rejectWithValue }) => {
        try {
            const { data } = await apiClient.get('/items');
            return {
                albums: data.albums.map(normalizeAlbum),
                singles: data.singles.map(normalizeSingle),
            };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const addAlbum = createAsyncThunk(
    'library/addAlbum',
    async ({ albumData, userId }, { rejectWithValue }) => {
        try {
            const formData = buildFormData(albumData, { userId });
            const { data } = await apiClient.post('/albums', formData);
            return normalizeAlbum(data);
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const editAlbum = createAsyncThunk(
    'library/editAlbum',
    async ({ updatedAlbum }, { rejectWithValue }) => {
        try {
            const formData = buildFormData(updatedAlbum);
            const { data } = await apiClient.put(`/albums/${getItemId(updatedAlbum)}`, formData);
            return normalizeAlbum(data);
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const removeAlbum = createAsyncThunk(
    'library/removeAlbum',
    async ({ albumId }, { rejectWithValue }) => {
        try {
            await apiClient.delete(`/albums/${albumId}`);
            return albumId;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const addSingle = createAsyncThunk(
    'library/addSingle',
    async ({ singleData, userId }, { rejectWithValue }) => {
        try {
            const formData = buildFormData(singleData, { userId });
            const { data } = await apiClient.post('/singles', formData);
            return normalizeSingle(data);
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const editSingle = createAsyncThunk(
    'library/editSingle',
    async ({ updatedSingle }, { rejectWithValue }) => {
        try {
            const formData = buildFormData(updatedSingle);
            const { data } = await apiClient.put(`/singles/${getItemId(updatedSingle)}`, formData);
            return normalizeSingle(data);
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const removeSingle = createAsyncThunk(
    'library/removeSingle',
    async ({ singleId }, { rejectWithValue }) => {
        try {
            await apiClient.delete(`/singles/${singleId}`);
            return singleId;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const addSong = createAsyncThunk(
    'library/addSong',
    async ({ albumId, songData }, { rejectWithValue }) => {
        try {
            const { data } = await apiClient.post(`/albums/${albumId}/songs`, songData);
            return normalizeAlbum(data);
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const editSong = createAsyncThunk(
    'library/editSong',
    async ({ albumId, updatedSong }, { rejectWithValue }) => {
        try {
            const { data } = await apiClient.put(`/albums/${albumId}/songs/${getItemId(updatedSong)}`, updatedSong);
            return normalizeAlbum(data);
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const removeSong = createAsyncThunk(
    'library/removeSong',
    async ({ albumId, songId }, { rejectWithValue }) => {
        try {
            const { data } = await apiClient.delete(`/albums/${albumId}/songs/${songId}`);
            return normalizeAlbum(data);
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

const initialState = {
    albums: [],
    singles: [],
    status: 'idle',
    error: null,
};

const librarySlice = createSlice({
    name: 'library',
    initialState,
    reducers: {
        clearLibrary: () => initialState,
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchLibrary.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchLibrary.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.albums = action.payload.albums;
                state.singles = action.payload.singles;
            })
            .addCase(fetchLibrary.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            .addCase(addAlbum.fulfilled, (state, action) => {
                state.albums.push(action.payload);
            })
            .addCase(editAlbum.fulfilled, (state, action) => {
                const id = getItemId(action.payload);
                const index = state.albums.findIndex((a) => getItemId(a) === id);
                if (index !== -1) state.albums[index] = action.payload;
            })
            .addCase(removeAlbum.fulfilled, (state, action) => {
                state.albums = state.albums.filter((a) => getItemId(a) !== action.payload);
            })
            .addCase(addSingle.fulfilled, (state, action) => {
                state.singles.push(action.payload);
            })
            .addCase(editSingle.fulfilled, (state, action) => {
                const id = getItemId(action.payload);
                const index = state.singles.findIndex((s) => getItemId(s) === id);
                if (index !== -1) state.singles[index] = action.payload;
            })
            .addCase(removeSingle.fulfilled, (state, action) => {
                state.singles = state.singles.filter((s) => getItemId(s) !== action.payload);
            })
            .addCase(addSong.fulfilled, (state, action) => {
                const id = getItemId(action.payload);
                const index = state.albums.findIndex((a) => getItemId(a) === id);
                if (index !== -1) state.albums[index] = action.payload;
            })
            .addCase(editSong.fulfilled, (state, action) => {
                const id = getItemId(action.payload);
                const index = state.albums.findIndex((a) => getItemId(a) === id);
                if (index !== -1) state.albums[index] = action.payload;
            })
            .addCase(removeSong.fulfilled, (state, action) => {
                const id = getItemId(action.payload);
                const index = state.albums.findIndex((a) => getItemId(a) === id);
                if (index !== -1) state.albums[index] = action.payload;
            });
    },
});

export const { clearLibrary } = librarySlice.actions;
export default librarySlice.reducer;
