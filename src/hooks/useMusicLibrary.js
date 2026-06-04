import { useState, useCallback } from 'react';

const API_URL = process.env.REACT_APP_API_BASE_URL;

const buildFormData = (data, extraFields = {}) => {
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

export const useMusicLibrary = (token, onUnauthorized) => {
    const [albums, setAlbums] = useState([]);
    const [singles, setSingles] = useState([]);

    // Допоміжна функція для отримання ID
    const getItemId = (item) => item?._id ?? item?.id ?? null;

    // Оновлення AI (викликається після успішних CRUD операцій)
    // const rebuildAIEmbeddings = async () => {
    //     try {
    //         await fetch("http://localhost:5001/api/ai/rebuild", {
    //             method: "POST",
    //             headers: { "Content-Type": "application/json" },
    //             body: JSON.stringify({ force: false }),
    //         });
    //         console.log("✅ AI embeddings оновлено");
    //     } catch (err) {
    //         console.log("⚠️ AI сервіс недоступний");
    //     }
    // };

    // --- GET ДАНІ ---
    const fetchData = useCallback(async (userId) => {
        if (!token) return;

        try {
            const res = await fetch(`${API_URL}/items`, {
                method: "GET",
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.status === 401) {
                onUnauthorized();
                return;
            }

            const data = await res.json();
            setAlbums(data.albums.map(a => ({ ...a, id: a._id ?? a.id })));
            setSingles(data.singles.map(s => ({ ...s, id: s._id ?? s.id })));
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }, [token, onUnauthorized]);

    // --- ALBUMS ---
    const addAlbum = async (albumData, userId) => {
        console.log("Adding album with data:", albumData, "and userId:", userId);
        const formData = buildFormData(albumData, { userId });

        // if (albumData.coverImage?.file) {
        //     console.log("Appending cover image to form data:", albumData.coverImage);
        //     formData.append("coverImage", albumData.coverImage.file, albumData.coverImage.name);
        // }

        const response = await fetch(`${API_URL}/albums`, {
            method: "POST",
            body: formData,
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const newAlbum = await response.json();

        setAlbums(prev => [...prev, { ...newAlbum, id: newAlbum._id ?? newAlbum.id }]);
        //rebuildAIEmbeddings();
    };

    const editAlbum = async (updatedAlbum) => {
        const formData = buildFormData(updatedAlbum);

        // if (updatedAlbum.coverImage?.file) {
        //     formData.append("coverImage", updatedAlbum.coverImage.file, updatedAlbum.coverImage.name);
        // }

        const response = await fetch(`${API_URL}/albums/${getItemId(updatedAlbum)}`, {
            method: "PUT",
            body: formData,
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const savedAlbum = await response.json();

        setAlbums(prev => prev.map(a => getItemId(a) === getItemId(savedAlbum) ? { ...savedAlbum, id: savedAlbum._id ?? savedAlbum.id } : a));
        //rebuildAIEmbeddings();
    };

    const removeAlbum = async (albumId) => {
        const response = await fetch(`${API_URL}/albums/${albumId}`, {
            method: "DELETE",
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            setAlbums(prev => prev.filter(a => getItemId(a) !== albumId));
            //rebuildAIEmbeddings();
        }
    };

    // --- SINGLES ---
    const addSingle = async (singleData, userId) => {
        const formData = buildFormData(singleData, { userId });

        // if (singleData.coverImage?.file) {
        //     formData.append("coverImage", singleData.coverImage.file, singleData.coverImage.name);
        // }

        const response = await fetch(`${API_URL}/singles`, {
            method: "POST",
            body: formData,
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const newSingle = await response.json();

        setSingles(prev => [...prev, { ...newSingle, id: newSingle._id ?? newSingle.id }]);
        //rebuildAIEmbeddings();
    };

    const editSingle = async (updatedSingle) => {
        const formData = buildFormData(updatedSingle);

        // if (updatedSingle.coverImage?.file) {
        //     formData.append("coverImage", updatedSingle.coverImage.file, updatedSingle.coverImage.name);
        // }

        const response = await fetch(`${API_URL}/singles/${getItemId(updatedSingle)}`, {
            method: "PUT",
            body: formData,
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const savedSingle = await response.json();

        setSingles(prev => prev.map(s => getItemId(s) === getItemId(savedSingle) ? { ...savedSingle, id: savedSingle._id ?? savedSingle.id } : s));
        //rebuildAIEmbeddings();
    };

    const removeSingle = async (singleId) => {
        const response = await fetch(`${API_URL}/singles/${singleId}`, {
            method: "DELETE",
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            setSingles(prev => prev.filter(s => getItemId(s) !== singleId));
            //rebuildAIEmbeddings();
        }
    };

    // --- SONGS ---
    const addSong = async (albumId, songData) => {
        const response = await fetch(`${API_URL}/albums/${albumId}/songs`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(songData)
        });
        const updatedAlbum = await response.json();

        setAlbums(prev => prev.map(a => getItemId(a) === getItemId(updatedAlbum) ? { ...updatedAlbum, id: updatedAlbum._id ?? updatedAlbum.id } : a));
        //rebuildAIEmbeddings();
    };

    const editSong = async (albumId, updatedSong) => {
        const response = await fetch(`${API_URL}/albums/${albumId}/songs/${getItemId(updatedSong)}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updatedSong)
        });
        const updatedAlbum = await response.json();

        setAlbums(prev => prev.map(a => getItemId(a) === getItemId(updatedAlbum) ? { ...updatedAlbum, id: updatedAlbum._id ?? updatedAlbum.id } : a));
        //rebuildAIEmbeddings();
    };

    const removeSong = async (albumId, songId) => {
        const response = await fetch(`${API_URL}/albums/${albumId}/songs/${songId}`, {
            method: "DELETE",
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const updatedAlbum = await response.json();
            setAlbums(prev => prev.map(a => getItemId(a) === albumId ? { ...updatedAlbum, id: updatedAlbum._id ?? updatedAlbum.id } : a));
            //rebuildAIEmbeddings();
        }
    };

   

    return {
        albums,
        singles,
        fetchData,
        addAlbum,
        editAlbum,
        removeAlbum,
        addSingle,
        editSingle,
        removeSingle,
        addSong,
        editSong,
        removeSong
    };
};