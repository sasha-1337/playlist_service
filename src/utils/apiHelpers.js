export const getItemId = (item) => item?._id ?? item?.id ?? null;

export const buildFormData = (data, extraFields = {}) => {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
        if (key === 'coverImage') {
            if (value?.file) {
                formData.append("coverImage", value.file, value.name);
            }
        } else {
            formData.append(key, value ?? "");
        }
    });

    Object.entries(extraFields).forEach(([key, value]) => {
        formData.append(key, value ?? "");
    });

    return formData;
};

export const normalizeAlbum = (album) => ({ ...album, id: album._id ?? album.id });

export const normalizeSingle = (single) => ({ ...single, id: single._id ?? single.id });
