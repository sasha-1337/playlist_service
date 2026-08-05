import selectionReducer, {
    selectAlbum,
    selectSong,
    selectSingle,
    toggleAlbumExpanded,
    clearSelection,
    isAlbumExpanded,
} from './selectionSlice';

describe('selectionSlice', () => {
    const initialState = {
        selectedAlbum: null,
        selectedSong: null,
        selectedSingle: null,
        activeId: null,
        activeSongId: null,
        expandedAlbums: [],
    };

    const album = { id: 'album-1', name: 'Test Album', creator: 'Artist' };
    const song = { _id: 'song-1', name: 'Test Song' };
    const single = { id: 'single-1', name: 'Test Single', creator: 'Artist' };

    it('returns initial state', () => {
        expect(selectionReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });

    it('selects album and clears song/single', () => {
        const state = selectionReducer(
            { ...initialState, selectedSong: song, selectedSingle: single },
            selectAlbum({ albumId: album.id, album })
        );
        expect(state.selectedAlbum).toEqual(album);
        expect(state.selectedSong).toBeNull();
        expect(state.selectedSingle).toBeNull();
        expect(state.activeId).toBe(album.id);
    });

    it('selects song with album context', () => {
        const state = selectionReducer(
            initialState,
            selectSong({ songId: song._id, song, album })
        );
        expect(state.selectedSong).toEqual(song);
        expect(state.selectedAlbum).toEqual(album);
        expect(state.activeSongId).toBe(song._id);
    });

    it('selects single and clears album/song', () => {
        const state = selectionReducer(
            { ...initialState, selectedAlbum: album, selectedSong: song },
            selectSingle({ singleId: single.id, single })
        );
        expect(state.selectedSingle).toEqual(single);
        expect(state.selectedAlbum).toBeNull();
        expect(state.selectedSong).toBeNull();
    });

    it('toggles album expanded state', () => {
        const expanded = selectionReducer(initialState, toggleAlbumExpanded('album-1'));
        expect(expanded.expandedAlbums).toEqual(['album-1']);
        expect(expanded.activeId).toBe('album-1');

        const collapsed = selectionReducer(expanded, toggleAlbumExpanded('album-1'));
        expect(collapsed.expandedAlbums).toEqual([]);
        expect(collapsed.activeId).toBeNull();
    });

    it('clears selection', () => {
        const state = {
            selectedAlbum: album,
            selectedSong: song,
            selectedSingle: single,
            activeId: 'album-1',
            activeSongId: 'song-1',
            expandedAlbums: ['album-1'],
        };
        expect(selectionReducer(state, clearSelection())).toEqual(initialState);
    });

    it('isAlbumExpanded helper works', () => {
        expect(isAlbumExpanded(['album-1'], 'album-1')).toBe(true);
        expect(isAlbumExpanded(['album-1'], 'album-2')).toBe(false);
    });
});
