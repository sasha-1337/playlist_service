import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";
import { Album, Single } from "./models.js";

dotenv.config();

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

// --- Routes ---
// GET all albums & singles
app.get("/api/items", async (req, res) => {
   try {
       const albums = await Album.find();
       const singles = await Single.find();
       res.json({ albums, singles });
       console.log("Items fetched successfully");
   } catch (error) {
       console.error("Error fetching items:", error);
       res.status(500).json({ error: "Failed to fetch items" });
   }
});

// GET albums
app.get("/api/albums", async (req, res) => {
   try {
       const albums = await Album.find();
       res.json(albums);
       console.log("Albums fetched successfully");
   } catch (error) {
       console.error("Error fetching albums:", error);
       res.status(500).json({ error: "Failed to fetch albums" });
   }
});

app.get("/api/albums/:id/songs", async (req, res) => {
   try {
       const album = await Album.findById(req.params.id);
       if (!album) {
           return res.status(404).json({ error: "Album not found" });
       }
       res.json(album);
       console.log("Album songs fetched successfully");
   } catch (error) {
       console.error("Error fetching album songs:", error);
       res.status(500).json({ error: "Failed to fetch album songs" });
   }
});

// GET singles
app.get("/api/singles", async (req, res) => {
   try {
       const singles = await Single.find();
       res.json(singles);
       console.log("Singles fetched successfully");
   } catch (error) {
       console.error("Error fetching singles:", error);
       res.status(500).json({ error: "Failed to fetch singles" });
   }
});

// POST new album ${ UPLOAD_URL }
app.post("/api/albums", upload.single("coverImage"), async (req, res) => {
    try {
        const newAlbum = new Album(req.body);
        newAlbum.coverImage = req.file ? `${req.file.filename}` : null;

        await newAlbum.save();
        res.status(201).json(newAlbum);
        console.log("New album created: ", newAlbum.name);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Не вдалося створити альбом" });
    }
}); 

// POST new song to album
app.post("/api/albums/:id/songs", async (req, res) => {
    try {
        const album = await Album.findById(req.params.id);
        album.songs.push(req.body);
        await album.save();
        res.json(album);
        console.log("New song added to album: ", req.body.name);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Не вдалося створити пісню" });
    }
});

// POST new single
app.post("/api/singles", upload.single("coverImage"), async (req, res) => {
    try {
        const newSingle = new Single(req.body);
        newSingle.coverImage = req.file ? `${req.file.filename}` : null;

        await newSingle.save();
        res.json(newSingle);
        console.log("New single created: ", newSingle.name);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Не вдалося створити альбом" });
    }
});

// PUT update album
app.put("/api/albums/:id", upload.single("coverImage"), async (req, res) => {
    try {
        const { creator, name, genre, description } = req.body;
        const album = await Album.findById(req.params.id);

        if (!album) return res.status(404).json({ message: "Album not found" });

        if (req.file && album.coverImage) {
            const oldPath = path.join(upload_directory, album.coverImage);

            fs.unlink(oldPath, (err) => {
                if (err && err.code !== "ENOENT") {
                    console.error("❌ Помилка при видаленні старої обкладинки:", err);
                } else {
                    console.log("🗑️ Стара обкладинка видалена:", oldPath);
                }
            });
        }

        album.creator = creator || album.creator;
        album.name = name || album.name;
        album.genre = genre || album.genre;
        album.description = description || album.description;
        if (req.file) {
            album.coverImage = req.file ? `${req.file.filename}` : null;
        }

        await album.save();
        res.json(album);
        console.log("Album updated successfully: ", album.name);
    } catch (error) {
        console.error("Помилка при оновленні альбому:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// PUT update song in album
app.put("/api/albums/:albumId/songs/:songId", async (req, res) => {
    try {
        const album = await Album.findById(req.params.albumId);
        const song = album.songs.id(req.params.songId);
        Object.assign(song, req.body);
        await album.save();
        res.json(album);
        console.log("Song updated successfully: ", song.name);
    }
    catch (error) {
        console.error("Помилка при оновленні пісні:", error);
        res.status(500).json({ error: err.message });
    }
});

// PUT update single
app.put("/api/singles/:id", upload.single("coverImage"), async (req, res) => {
    try {
        const { creator, name, genre, lyrics, description } = req.body;
        const single = await Single.findById(req.params.id);

        if (!single) return res.status(404).json({ message: "Album not found" });

        if (req.file && single.coverImage) {
            const oldPath = path.join(upload_directory, single.coverImage);

            fs.unlink(oldPath, (err) => {
                if (err && err.code !== "ENOENT") {
                    console.error("❌ Помилка при видаленні старої обкладинки:", err);
                } else {
                    console.log("🗑️ Стара обкладинка видалена:", oldPath);
                }
            });
        }

        single.creator = creator || single.creator;
        single.name = name || single.name;
        single.genre = genre || single.genre;
        single.description = description || single.description;
        single.lyrics = lyrics || single.lyrics;

        if (req.file) {
            single.coverImage = req.file ? `${req.file.filename}` : null;
        }
        
        await single.save();
        res.json(single);
        console.log("Single updated successfully: ", single.name);
    } catch (error) {
        console.error("Помилка при оновленні синглу:", error);
        res.status(500).json({ error: err.message });
    }
});

// DELETE album
app.delete("/api/albums/:id", async (req, res) => {
    try {
        const album = await Album.findById(req.params.id);
        if (!album) return res.status(404).json({ message: "Album not found" });
        if (album.coverImage) {
            const filePath = path.join(upload_directory, album.coverImage);

            fs.unlink(filePath, (err) => {
                if (err && err.code !== "ENOENT") {
                    console.error("❌ Помилка при видаленні зображення:", err);
                } else {
                    console.log("🗑️ Зображення видалено:", filePath);
                }
            });
        }
        console.log("Album deleted successfully:", album.name);
        await Album.findByIdAndDelete(req.params.id);
        res.json({ message: "Album deleted" });
    } catch (error) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE song from album
app.delete("/api/albums/:albumId/songs/:songId", async (req, res) => {
    try {
        const { albumId, songId } = req.params;
        const album = await Album.findById(albumId);
        if (!album) return res.status(404).json({ error: "Album not found" });
        console.log("Song deleted successfully: ", songId);
        album.songs = album.songs.filter(song => song._id.toString() !== songId);
        await album.save();
        res.json(album);
    } catch (error) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE single
app.delete("/api/singles/:id", async (req, res) => {
    try {
        const single = await Single.findById(req.params.id);

        if (!single) return res.status(404).json({ message: "Album not found" });
        if (single.coverImage) {
            console.log("Deleting image:", upload_directory);
            const filePath = path.join(upload_directory, single.coverImage);

            fs.unlink(filePath, (err) => {
                if (err && err.code !== "ENOENT") {
                    console.error("❌ Помилка при видаленні зображення:", err);
                } else {
                    console.log("🗑️ Зображення видалено:", filePath);
                }
            });
        }
        console.log("Single deleted successfully:", single.name);
        await Single.findByIdAndDelete(req.params.id);
        res.json({ message: 'Сингл видалено' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Connect MongoDB
mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/musicdb")
    .then(() => console.log("✅ MongoDB connected"))
    .catch(err => console.error("❌ MongoDB error:", err));

// --- Start server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
