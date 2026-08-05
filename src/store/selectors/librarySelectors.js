import { createSelector } from '@reduxjs/toolkit';
import { getItemId } from '../../utils/apiHelpers';

const getCreatedAtTs = (item) => {
    if (!item) return 0;
    if (item.createdAt instanceof Date) return item.createdAt.getTime();
    const v = Date.parse?.(item.createdAt) || Number(item.createdAt);
    return Number.isFinite(v) ? v : 0;
};

const selectAlbums = (state) => state.library.albums;
const selectSingles = (state) => state.library.singles;
const selectFilter = (state) => state.ui.filter;

export const selectFilteredItems = createSelector(
    [selectAlbums, selectSingles, selectFilter],
    (albums, singles, filter) => {
        const allItems = [
            ...albums.map((album) => ({
                ...album,
                songs: Array.isArray(album.songs) ? album.songs : [],
                type: 'album',
                __id: getItemId(album),
                __createdAtTs: getCreatedAtTs(album),
                coverImage: album.coverImage,
            })),
            ...singles.map((single) => ({
                ...single,
                type: 'single',
                __id: getItemId(single),
                coverImage: single.coverImage,
                __createdAtTs: getCreatedAtTs(single),
            })),
        ].sort((a, b) => b.__createdAtTs - a.__createdAtTs);

        switch (filter) {
            case 'albums':
                return allItems.filter((item) => item.type === 'album');
            case 'singles':
                return allItems.filter((item) => item.type === 'single');
            default:
                return allItems;
        }
    }
);

export const selectLibraryStatus = (state) => state.library.status;
