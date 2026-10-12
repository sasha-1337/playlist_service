import uiReducer, {
    setFilter,
    openAlbumForm,
    closeAlbumForm,
    setDrawerOpen,
    toggleAISearch,
} from './uiSlice';

describe('uiSlice', () => {
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

    it('returns initial state', () => {
        expect(uiReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });

    it('sets filter', () => {
        const state = uiReducer(initialState, setFilter('albums'));
        expect(state.filter).toBe('albums');
    });

    it('opens and closes album form', () => {
        const opened = uiReducer(initialState, openAlbumForm('add'));
        expect(opened.albumForm).toBe('add');

        const closed = uiReducer(opened, closeAlbumForm());
        expect(closed.albumForm).toBeNull();
    });

    it('toggles drawer', () => {
        const state = uiReducer(initialState, setDrawerOpen(true));
        expect(state.drawerOpen).toBe(true);
    });

    it('toggleAISearch closes model comparison', () => {
        const state = uiReducer(
            { ...initialState, showModelComparison: true },
            toggleAISearch()
        );
        expect(state.showAISearch).toBe(true);
        expect(state.showModelComparison).toBe(false);
    });
});
