import mongoose from "mongoose";

const SongSchema = new mongoose.Schema({
    name: String,
    lyrics: String,
    description: String,
    type: { type: String, default: "song" },
    createdAt: { type: Date, default: Date.now },
});

const AlbumSchema = new mongoose.Schema({
    creator: String,
    name: String,
    genre: String,
    description: String,
    coverImage: String,
    type: { type: String, default: "album" },
    songs: [SongSchema],
    createdAt: { type: Date, default: Date.now },
});

const SingleSchema = new mongoose.Schema({
    creator: String,
    name: String,
    genre: String,
    description: String,
    lyrics: String,
    coverImage: String,
    type: { type: String, default: "single" },
    createdAt: { type: Date, default: Date.now },
});

export const Album = mongoose.models.Album || mongoose.model("Album", AlbumSchema);
export const Single = mongoose.models.Single || mongoose.model("Single", SingleSchema);
export const SongSchemaExport = SongSchema;