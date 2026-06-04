import mongoose from "mongoose";

const MediaSchema = new mongoose.Schema({
    provider: String, // 'youtube', 'spotify', 'soundcloud'
    url: String       // повне посилання
});

const SongSchema = new mongoose.Schema({
    name: String,
    lyrics: String,
    description: String,
    type: { type: String, default: "song" },
    createdAt: { type: Date, default: Date.now },
    media: [MediaSchema]
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
    userId: String
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
    media: [MediaSchema],
    userId: String
});

export const Album = mongoose.models.Album || mongoose.model("Album", AlbumSchema);
export const Single = mongoose.models.Single || mongoose.model("Single", SingleSchema);
export const SongSchemaExport = SongSchema;
export const MediaSchemaExport = MediaSchema;