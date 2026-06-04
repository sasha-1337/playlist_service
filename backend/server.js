import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";
import { authenticateToken } from "./middleware/authMiddleware.js";
import { Album, Single } from "./models.js";

dotenv.config();

const SERVER_URL = process.env.SERVER_URL || "http://localhost:5000";
const UPLOAD_DIR = process.env.UPLOAD_DIR || "uploads";
const GENIUS_TOKEN = process.env.GENIUS_ACCESS_TOKEN;

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/uploads', express.static('uploads'));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/"); 
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    },
});

const upload = multer({ storage });
const upload_directory = path.resolve() + "/uploads/";

function deleteCoverImage(item) {

    if (item.coverImage) {
        const isLocal = item.coverImage.includes("/api/uploads/");

        if (isLocal) {
            const filePath = path.join(upload_directory, item.coverImage);

            fs.unlink(filePath, (err) => {
                if (err && err.code !== "ENOENT") {
                    console.error("❌ Помилка при видаленні зображення:", err);
                } else {
                    console.log("🗑️ Зображення видалено:", filePath);
                }
            });
        }
    }
    else {
        return;
    }
}

const parseJSONField = (field, fieldName = "unknown") => {
    if (field === undefined || field === null) return field;
    if (typeof field === 'string') {
        // Якщо рядок порожній, повертаємо порожній масив
        if (field.trim() === "") return [];
        try {
            return JSON.parse(field);
        } catch (e) {
            console.error(`⚠️ [Parser] Помилка парсингу JSON для поля '${fieldName}':`, e.message);
            return [];
        }
    }
    return field; // Якщо це вже об'єкт/масив
};


// --- Routes ---
// GET all albums & singles (for current user)
app.get("/api/items", authenticateToken, async (req, res) => {
    try {
        const userId = req.user.sub;

        if (!userId) {
            console.warn("⚠️ [Auth] User ID not found in token.");
            return res.status(401).json({ error: "Unauthorized" });
        }

        const albums = await Album.find({ userId });
        const singles = await Single.find({ userId });

        if (albums.some(album => album.userId !== userId)
            || singles.some(single => single.userId !== userId)) {
            console.warn(`🔒 [Auth] Attempted unauthorized access to the items.`);
            return res.status(403).json({ error: "Access denied" });
        }

        res.json({ albums, singles });
        console.log(`✅ [Items] Items fetched successfully for user ${userId}`);
    } catch (error) {
        console.error("❌ [Items] Error fetching items:", error);
       res.status(500).json({ error: "Failed to fetch items" });
   }
});

// GET albums (for current user)
app.get("/api/albums", authenticateToken, async (req, res) => {
   try {
       const userId = req.user.sub;
       if (!userId) {
           console.warn("⚠️ [Auth] User ID not found in token.");
           return res.status(401).json({ error: "Unauthorized" });
       }

       const albums = await Album.find({ userId });

       res.json(albums);
       console.log(`✅ [Albums] Albums ${albums.length} fetched successfully for user ${userId}`);
   } catch (error) {
       console.error("❌ [Albums] Error fetching albums:", error);
       res.status(500).json({ error: "Failed to fetch albums" });
   }
});

// GET songs in album
app.get("/api/albums/:id/songs", authenticateToken, async (req, res) => {
   try {
       const userId = req.user.sub;
       if (!userId) {
           console.warn("⚠️ [Auth] User ID not found in token.");
           return res.status(401).json({ error: "Unauthorized" });
       }

       const album = await Album.findById(req.params.id);

       if (!album) {
           console.warn(`⚠️ [Songs] Album ${req.params.id} not found.`);
           return res.status(404).json({ error: "Album not found" });
       }

       if (album.userId !== userId) {
           console.warn(`🔒 [Auth] Attempted unauthorized access to the album ${album.name}.`);
           return res.status(403).json({ error: "Access denied" });
       }

       res.json(album);
       console.log(`✅ [Songs] Songs ${album.songs.length} fetched successfully for user ${userId}`);
   } catch (error) {
       console.error("❌ [Songs] Error fetching album songs:", error);
       res.status(500).json({ error: "Failed to fetch album songs" });
   }
});

// GET singles (for current user)
app.get("/api/singles", authenticateToken, async (req, res) => {
   try {
       const userId = req.user.sub;

       if (!userId) {
           console.warn("⚠️ [Auth] User ID not found in token.");
           return res.status(401).json({ error: "Unauthorized" });
       }

       const singles = await Single.find({ userId });
       res.json(singles);
       console.log(`✅ [Singles] Singles ${singles.length} fetched successfully for user ${userId}`);
   } catch (error) {
       console.error("❌ [Singles] Error fetching singles:", error);
       res.status(500).json({ error: "Failed to fetch singles" });
   }
});

// POST new album ${ UPLOAD_URL }
app.post("/api/albums", authenticateToken, upload.single("coverImage"), async (req, res) => {
    try {
        const userId = req.user.sub;

        if (!userId) {
            console.warn("⚠️ [Auth] User ID not found in token.");
            return res.status(401).json({ error: "Unauthorized" });
        }

        const newAlbum = new Album({ ...req.body, userId: userId });

        if (req.file) {
            newAlbum.coverImage = `${SERVER_URL}/${UPLOAD_DIR}/${req.file.filename}`;
        } else if (req.body.coverImage) {
            newAlbum.coverImage = req.body.coverImage;
        } else {
            newAlbum.coverImage = null;
        }

        await newAlbum.save();
        res.status(201).json(newAlbum);
        console.log("✅ [Albums] New album created successfully: ", newAlbum.name, " for user: ", userId);
    } catch (err) {
        console.error("❌ [Albums] Failed to create new album: ", err);
        res.status(500).json({ error: "Failed to create album" });
    }
}); 

// POST new song to album
app.post("/api/albums/:id/songs", authenticateToken, async (req, res) => {
    try {
        const userId = req.user.sub;
        if (!userId) {
            console.warn("⚠️ [Auth] User ID not found in token.");
            return res.status(401).json({ error: "Unauthorized" });
        }

        const album = await Album.findById(req.params.id);
        if (album.userId !== userId) {
            console.warn(`🔒 [Auth] Attempted unauthorized access to the album ${album.name}.`);
            return res.status(403).json({ error: "Access denied" });
        }
        album.songs.push(req.body);
        await album.save();
        res.json(album);
        console.log(`✅ [Songs] New song ${req.body.name} added to album: ${album.name} for user: ${userId}`);
    } catch (err) {
        console.error("❌ [Songs] Failed to add a song:", err);
        res.status(500).json({ error: "Failed to create song" });
    }
});

// POST new single
app.post("/api/singles", authenticateToken, upload.single("coverImage"), async (req, res) => {
    try {
        const userId = req.user.sub;
        if (!userId) {
            console.warn("⚠️ [Auth] User ID not found in token.");
            return res.status(401).json({ error: "Unauthorized" });
        }

        const newSingle = new Single({ ...req.body, userId: userId });

        if (req.file) {
            newSingle.coverImage = `${SERVER_URL}/${UPLOAD_DIR}/${req.file.filename}`;
        } else if (req.body.coverImage) {
            newSingle.coverImage = req.body.coverImage;
        } else {
            newSingle.coverImage = null;
        }
        
        await newSingle.save();
        res.json(newSingle);
        console.log("✅ [Singles] New single created: ", newSingle.name, " for user: ", userId);
    } catch (err) {
        console.error("❌ [Singles] Failed to create a single:", err);
        res.status(500).json({ error: "Failed to create single" });
    }
});

// PUT update album
app.put("/api/albums/:id", authenticateToken, upload.single("coverImage"), async (req, res) => {
    try {
        const userId = req.user.sub;

        if (!userId) {
            console.warn("⚠️ [Auth] User ID not found in token.");
            return res.status(401).json({ error: "Unauthorized" });
        }

        const album = await Album.findById(req.params.id);

        if (!album) return res.status(404).json({ message: "Album not found" });
        if (album.userId !== userId) {
            console.warn(`🔒 [Auth] Attempted unauthorized access to the album ${album.name}.`);
            return res.status(403).json({ error: "Access denied" });
        }

        if (req.file && album.coverImage) {
            const oldPath = path.join(upload_directory, album.coverImage);

            fs.unlink(oldPath, (err) => {
                if (err && err.code !== "ENOENT") {
                    console.error("❌ Failed to delete cover image:", err);
                } else {
                    console.log("🗑️ Old cover image was deleted:", oldPath, " for user: ", userId);
                }
            });
        }

        const { creator, name, genre, description } = req.body;
        album.creator = creator || album.creator;
        album.name = name || album.name;
        album.genre = genre || album.genre;
        album.description = description || album.description;
        if (req.file) {
            album.coverImage = `${SERVER_URL}/${UPLOAD_DIR}/${req.file.filename}`;
        } else if (req.body.coverImage) {
            album.coverImage = req.body.coverImage;
        }

        await album.save();
        res.json(album);
        console.log("🔄 [Albums] Album updated successfully: ", album.name, " for user: ", userId);
    } catch (error) {
        console.error("❌ [Albums] Failed to update album:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// PUT update song in album
app.put("/api/albums/:albumId/songs/:songId", authenticateToken, async (req, res) => {
    try {
        const userId = req.user.sub;
        if (!userId) {
            console.warn("⚠️ [Auth] User ID not found in token.");
            return res.status(401).json({ error: "Unauthorized" });
        }

        const album = await Album.findById(req.params.albumId);
        if (!album) return res.status(404).json({ error: "Album not found" });
        if (album.userId !== userId) {
            console.warn(`🔒 [Auth] Attempted unauthorized access to the album ${album.name}.`);
            return res.status(403).json({ error: "Access denied" });
        }

        const song = album.songs.id(req.params.songId);
        if (!song) return res.status(404).json({ error: "Song not found" });

        Object.assign(song, req.body);
        await album.save();
        res.json(album);
        console.log("🔄 [Songs] Song updated successfully: ", song.name, " for user: ", userId);
    }
    catch (error) {
        console.error("❌ [Songs] Failed to update a song:", error);
        res.status(500).json({ error: error.message });
    }
});

// PUT update single
app.put("/api/singles/:id", authenticateToken, upload.single("coverImage"), async (req, res) => {
    try {
        const userId = req.user.sub;
        if (!userId) {
            console.warn("⚠️ [Auth] User ID not found in token.");
            return res.status(401).json({ error: "Unauthorized" });
        }

        const single = await Single.findById(req.params.id);
        if (!single) return res.status(404).json({ message: "Single not found" });
        if (single.userId !== userId) {
            console.warn(`🔒 [Auth] Attempted unauthorized access to the album ${single.name}.`);
            return res.status(403).json({ error: "Access denied" });
        }

        if (req.file && single.coverImage) {
            const oldPath = path.join(upload_directory, single.coverImage);

            fs.unlink(oldPath, (err) => {
                if (err && err.code !== "ENOENT") {
                    console.error("❌ Failed to delete old cover image:", err, " for user: ", userId);
                } else {
                    console.log("🗑️ Old cover image was deleted:", oldPath, " for user: ", userId);
                }
            });
        }

        const { creator, name, genre, lyrics, description } = req.body;

        single.creator = creator || single.creator;
        single.name = name || single.name;
        single.genre = genre || single.genre;
        single.description = description || single.description;
        single.lyrics = lyrics || single.lyrics;

        if (req.file) {
            single.coverImage = `${SERVER_URL}/${UPLOAD_DIR}/${req.file.filename}`;
        } else if (req.body.coverImage) {
            single.coverImage = req.body.coverImage;
        }
        
        await single.save();
        res.json(single);
        console.log("🔄 [Singles] Single updated successfully: ", single.name, " for user: ", userId);
    } catch (error) {
        console.error("❌ [Singles] Failed to update a single:", error);
        res.status(500).json({ error: error.message });
    }
});

// DELETE all items
app.delete("/api/items", authenticateToken, async (req, res) => {
    try {
        const userId = req.user.sub;
        if (!userId) {
            console.warn("⚠️ [Auth] User ID not found in token.");
            return res.status(401).json({ error: "Unauthorized" });
        }

        const albums = await Album.find({ userId });
        const singles = await Single.find({ userId });
        if (albums.some(album => album.userId !== userId)
            || singles.some(single => single.userId !== userId)) {
            console.warn(`🔒 [Auth] Attempted unauthorized access to the items.`);
            return res.status(403).json({ error: "Access denied" });
        }

        albums.forEach(album => deleteCoverImage(album));
        singles.forEach(single => deleteCoverImage(single));

        await Album.deleteMany({ userId });
        await Single.deleteMany({ userId });

        console.log(`🗑️ [Items] Items deleted successfully for user ${userId}`);
        res.json({ message: "All items deleted successfully" });
    } catch (error) {
        console.error("❌ [Items] Error deleting items:", error);
        res.status(500).json({ error: "Failed to delete items" });
    }
});

// DELETE album
app.delete("/api/albums/:id", authenticateToken, async (req, res) => {
    try {
        const userId = req.user.sub;
        if (!userId) {
            console.warn("⚠️ [Auth] User ID not found in token.");
            return res.status(401).json({ error: "Unauthorized" });
        }

        const album = await Album.findById(req.params.id);
        if (!album) return res.status(404).json({ message: "Album not found" });
        if (album.userId !== userId) {
            console.warn(`🔒 [Auth] Attempted unauthorized access to the album ${album.name}.`);
            return res.status(403).json({ error: "Access denied" });
        }

        const albumName = album.name;
        deleteCoverImage(album);
        await Album.findByIdAndDelete(req.params.id);
        res.json({ message: "Album deleted" });
        console.log("🗑️ [Albums] Album deleted successfully:", albumName, " for user: ", userId);
    } catch (error) {
        console.error("❌ [Albums] Failed to delete album:", error);
        res.status(500).json({ error: error.message });
    }
});

// DELETE song in album
app.delete("/api/albums/:albumId/songs/:songId", authenticateToken, async (req, res) => {
    try {
        const userId = req.user.sub;
        if (!userId) {
            console.warn("⚠️ [Auth] User ID not found in token.");
            return res.status(401).json({ error: "Unauthorized" });
        }

        const { albumId, songId } = req.params;

        const album = await Album.findById(albumId);
        if (!album) return res.status(404).json({ error: "Album not found" });
        if (album.userId !== userId) {
            console.warn(`🔒 [Auth] Attempted unauthorized access to the album ${album.name}.`);
            return res.status(403).json({ error: "Access denied" });
        }

        const song = album.songs.id(songId);
        album.songs = album.songs.filter(song => song._id.toString() !== songId);
        await album.save();
        res.json(album);
        console.log("🗑️ [Songs] Song deleted successfully: ", song.name, " for user: ", userId);
    } catch (error) {
        console.error("❌ [Songs] Failed to delete a song:", error);
        res.status(500).json({ error: error.message });
    }
});

// DELETE single
app.delete("/api/singles/:id", authenticateToken, async (req, res) => {
    try {
        const userId = req.user.sub;
        if (!userId) {
            console.warn("⚠️ [Auth] User ID not found in token.");
            return res.status(401).json({ error: "Unauthorized" });
        }

        const single = await Single.findById(req.params.id);
        if (!single) return res.status(404).json({ message: "Single not found" });
        if (single.userId !== userId) {
            console.warn(`🔒 [Auth] Attempted unauthorized access to the album ${single.name}.`);
            return res.status(403).json({ error: "Access denied" });
        }

        const singleName = single.name;
        deleteCoverImage(single);
        await Single.findByIdAndDelete(req.params.id);
        res.json({ message: 'Single deleted' });
        console.log("🗑️ [Singles] Single deleted successfully: ", singleName, " for user: ", userId);
    } catch (error) {
        console.error("❌ [Singles] Failed to delete a single:", error);
        res.status(500).json({ error: error.message });
    }
});

// 1. GET Search (Multi-Search: Songs & Albums)
app.get("/api/genius/search", authenticateToken, async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.status(400).json({ error: "Query is required" });

        console.log(`📥 [Genius] Мульти-пошук: "${q}"`);

        // Використовуємо веб-API Genius, яке повертає і пісні, і альбоми
        const geniusResponse = await fetch(`https://genius.com/api/search/multi?per_page=5&q=${encodeURIComponent(q)}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' // Уникаємо блокування
            }
        });

        if (!geniusResponse.ok) return res.status(geniusResponse.status).json({ error: "Genius API Error" });

        const data = await geniusResponse.json();
        let combinedResults = [];

        // Витягуємо лише пісні та альбоми з результатів
        if (data.response && data.response.sections) {
            data.response.sections.forEach(section => {
                if (section.type === 'song' || section.type === 'album') {
                    section.hits.forEach(hit => {
                        combinedResults.push({
                            id: hit.result.id,
                            type: section.type, // 'song' або 'album'
                            // У альбому ключі трохи відрізняються від пісень, тому робимо перевірку:
                            title: hit.result.name || hit.result.title,
                            artist: hit.result.artist?.name || hit.result.primary_artist?.name,
                            cover: hit.result.cover_art_thumbnail_url || hit.result.song_art_image_thumbnail_url || hit.result.cover_art_url
                        });
                    });
                }
            });
        }

        res.json({ results: combinedResults });
    } catch (error) {
        console.error("❌ [Genius Search]", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// 2. GET Details (Парсинг деталей альбому або пісні)
app.get("/api/genius/details", authenticateToken, async (req, res) => {
    try {
        const { id, type } = req.query;
        const GENIUS_TOKEN = process.env.GENIUS_ACCESS_TOKEN;

        if (!GENIUS_TOKEN) return res.status(500).json({ error: "No Token" });

        let resultData = {};

        if (type === 'song') {
            const resData = await fetch(`https://api.genius.com/songs/${id}`, {
                headers: { 'Authorization': `Bearer ${GENIUS_TOKEN}` }
            });
            const data = await resData.json();
            resultData = data.response.song;
        } else if (type === 'album') {
            // Отримуємо базові дані альбому
            const resAlbum = await fetch(`https://api.genius.com/albums/${id}`, {
                headers: { 'Authorization': `Bearer ${GENIUS_TOKEN}` }
            });
            const albumData = await resAlbum.json();
            resultData = albumData.response.album;

            // Отримуємо трекліст цього альбому!
            const resTracks = await fetch(`https://api.genius.com/albums/${id}/tracks`, {
                headers: { 'Authorization': `Bearer ${GENIUS_TOKEN}` }
            });
            const tracksData = await resTracks.json();
            resultData.tracks = tracksData.response.tracks || [];
        }

        res.json(resultData);
    } catch (error) {
        console.error("❌ [Genius Details]", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// app.get("/api/genius/search", authenticateToken, async (req, res) => {
//     try {
//         const { q } = req.query;
//         if (!q) {
//             return res.status(400).json({ error: "Query parameter 'q' is required" });
//         }

//         console.log(`📥 [Genius Proxy] Пошуковий запит від користувача: "${q}"`);

//         if (!GENIUS_TOKEN) {
//             console.error("❌ [Genius Proxy] GENIUS_ACCESS_TOKEN не знайдено в .env");
//             return res.status(500).json({ error: "Genius API token is missing on server" });
//         }

//         const geniusResponse = await fetch(`https://api.genius.com/search?q=${encodeURIComponent(q)}`, {
//             headers: {
//                 'Authorization': `Bearer ${GENIUS_TOKEN}`
//             }
//         });

//         if (!geniusResponse.ok) {
//             console.error(`❌ [Genius Proxy] Genius API повернув помилку: ${geniusResponse.status}`);
//             return res.status(geniusResponse.status).json({ error: "Error from Genius API" });
//         }

//         const data = await geniusResponse.json();

//         res.json(data.response || { hits: [] });
//         console.log(`✅ [Genius Proxy] Знайдено варіантів для "${q}"`);
//     } catch (error) {
//         console.error("❌ [Genius Proxy] Помилка проксі-пошуку:", error);
//         res.status(500).json({ error: "Internal server error during Genius search" });
//     }
// });

// Connect MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB connected"))
    .catch(err => console.error("❌ MongoDB error:", err));

// --- Start server ---
const PORT = process.env.PORT;
if (process.env.NODE_ENV === "test") {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
        console.log(`📝 Environment: ${process.env.NODE_ENV}`);
    });
}

export default app;
