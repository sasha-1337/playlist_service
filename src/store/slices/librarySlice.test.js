import libraryReducer, {
    clearLibrary,
    fetchLibrary,
    addAlbum,
    removeAlbum,
} from './librarySlice';

describe('librarySlice', () => {
    const initialState = {
        albums: [],
        singles: [],
        status: 'idle',
        error: null,
    };

    it('returns initial state', () => {
        expect(libraryReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });

    it('clears library state', () => {
        const state = {
            albums: [{ id: '1', name: 'Test' }],
            singles: [{ id: '2', name: 'Single' }],
            status: 'succeeded',
            error: null,
        };
        expect(libraryReducer(state, clearLibrary())).toEqual(initialState);
    });

    it('handles fetchLibrary.fulfilled', () => {
        const payload = {
            albums: [{ id: 'a1', name: 'Album 1' }],
            singles: [{ id: 's1', name: 'Single 1' }],
        };
        const state = libraryReducer(initialState, fetchLibrary.fulfilled(payload));
        expect(state.albums).toEqual(payload.albums);
        expect(state.singles).toEqual(payload.singles);
        expect(state.status).toBe('succeeded');
    });

    it('handles addAlbum.fulfilled', () => {
        const newAlbum = { id: 'new', name: 'New Album' };
        const state = libraryReducer(initialState, addAlbum.fulfilled(newAlbum));
        expect(state.albums).toHaveLength(1);
        expect(state.albums[0]).toEqual(newAlbum);
    });

    it('handles removeAlbum.fulfilled', () => {
        const state = {
            ...initialState,
            albums: [
                { id: 'a1', name: 'Album 1' },
                { id: 'a2', name: 'Album 2' },
            ],
        };
        const next = libraryReducer(state, removeAlbum.fulfilled('a1'));
        expect(next.albums).toHaveLength(1);
        expect(next.albums[0].id).toBe('a2');
    });
});
