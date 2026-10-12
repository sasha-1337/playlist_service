import { jest } from '@jest/globals';
import request from 'supertest';

// 1. Мокаємо authMiddleware за допомогою асинхронного ESM мокера
jest.unstable_mockModule('./middleware/authMiddleware.js', () => ({
    authenticateToken: (req, res, next) => {
        req.user = { sub: 'mockUserId123' }; // Імітуємо залогіненого користувача
        next();
    }
}));

// Конструюємо базовий мок об'єкта альбому
const mockAlbumInstance = {
    _id: 'album123',
    name: 'Test Album',
    userId: 'mockUserId123',
    songs: {
        id: jest.fn().mockReturnValue({ _id: 'song123', name: 'Test Song' }),
        push: jest.fn(),
        filter: jest.fn().mockReturnValue([])
    },
    save: jest.fn().mockResolvedValue(true)
};

// 2. Мокаємо моделі Mongoose за допомогою асинхронного ESM мокера
jest.unstable_mockModule('./models.js', () => {
    // Створюємо імітацію класу-конструктора (new Album)
    const MockAlbumConstructor = jest.fn().mockImplementation(() => mockAlbumInstance);

    // Додаємо статичні методи на сам конструктор
    MockAlbumConstructor.find = jest.fn();
    MockAlbumConstructor.findById = jest.fn().mockResolvedValue(mockAlbumInstance);
    MockAlbumConstructor.findByIdAndDelete = jest.fn();
    MockAlbumConstructor.deleteMany = jest.fn();

    const MockSingleConstructor = jest.fn();
    MockSingleConstructor.find = jest.fn();
    MockSingleConstructor.findById = jest.fn();
    MockSingleConstructor.findByIdAndDelete = jest.fn();
    MockSingleConstructor.deleteMany = jest.fn();

    return {
        Album: MockAlbumConstructor,
        Single: MockSingleConstructor
    };
});

// 3. Мокаємо файлову систему 'fs', щоб уникнути require() помилок
jest.unstable_mockModule('fs', () => ({
    default: {
        unlink: jest.fn((path, cb) => cb(null))
    },
    unlink: jest.fn((path, cb) => cb(null))
}));

// В ESM імпорти модулів, що тестуються, мають відбуватися ПІСЛЯ оголошення mockModule
const { Album, Single } = await import('./models.js');
const fs = await import('fs');
const app = (await import('./server.js')).default;

describe('API Controllers Tests', () => {

    beforeEach(() => {
        jest.clearAllMocks(); // Очищаємо історію викликів перед кожним тестом
    });

    // ==========================================
    // ТЕСТИ ДЛЯ АЛЬБОМІВ (ALBUMS)
    // ==========================================
    describe('Albums API', () => {

        it('GET /api/albums - повинен повертати список альбомів користувача', async () => {
            const mockAlbums = [{ name: 'Album 1' }, { name: 'Album 2' }];
            Album.find.mockResolvedValue(mockAlbums);

            const res = await request(app).get('/api/albums');

            expect(res.status).toBe(200);
            expect(res.body).toEqual(mockAlbums);
            expect(Album.find).toHaveBeenCalledWith({ userId: 'mockUserId123' });
        });

        it('POST /api/albums - повинен створювати новий альбом', async () => {
            const res = await request(app)
                .post('/api/albums')
                .send({ name: 'New Album', genre: 'Rock' });

            expect(res.status).toBe(201);
            expect(res.body.name).toBe('Test Album');
        });

        it('PUT /api/albums/:id - повинен оновлювати альбом (власником)', async () => {
            const res = await request(app)
                .put('/api/albums/album123')
                .send({ name: 'Updated Name' });

            expect(res.status).toBe(200);
            expect(Album.findById).toHaveBeenCalledWith('album123');
        });

        it('DELETE /api/albums/:id - повинен видаляти альбом', async () => {
            const res = await request(app).delete('/api/albums/album123');

            expect(res.status).toBe(200);
            expect(res.body.message).toBe('Album deleted');
            expect(Album.findByIdAndDelete).toHaveBeenCalledWith('album123');
        });
    });

    // ==========================================
    // ТЕСТИ ДЛЯ ПІСЕНЬ (SONGS IN ALBUMS)
    // ==========================================
    describe('Songs API', () => {

        it('GET /api/albums/:id/songs - повинен повертати альбом з піснями', async () => {
            const res = await request(app).get('/api/albums/album123/songs');

            expect(res.status).toBe(200);
            expect(res.body._id).toBe('album123');
        });

        it('POST /api/albums/:id/songs - повинен додавати пісню в альбом', async () => {
            const res = await request(app)
                .post('/api/albums/album123/songs')
                .send({ name: 'New Track', duration: '3:30' });

            expect(res.status).toBe(200);
            expect(mockAlbumInstance.songs.push).toHaveBeenCalled();
            expect(mockAlbumInstance.save).toHaveBeenCalled();
        });
    });

    // ==========================================
    // ТЕСТИ ДЛЯ СИНГЛІВ (SINGLES)
    // ==========================================
    describe('Singles API', () => {

        it('GET /api/singles - повинен повертати список синглів', async () => {
            const mockSingles = [{ name: 'Single 1' }];
            Single.find.mockResolvedValue(mockSingles);

            const res = await request(app).get('/api/singles');

            expect(res.status).toBe(200);
            expect(res.body).toEqual(mockSingles);
            expect(Single.find).toHaveBeenCalledWith({ userId: 'mockUserId123' });
        });

        it('DELETE /api/singles/:id - повинен повертати 403, якщо видаляє чужий сингл', async () => {
            Single.findById.mockResolvedValue({
                _id: 'single999',
                name: 'Not My Single',
                userId: 'differentUser456'
            });

            const res = await request(app).delete('/api/singles/single999');

            expect(res.status).toBe(403);
            expect(res.body.error).toBe('Access denied');
            expect(Single.findByIdAndDelete).not.toHaveBeenCalled();
        });
    });

    // ==========================================
    // ТЕСТ ЗАГАЛЬНОГО ОЧИЩЕННЯ (ITEMS)
    // ==========================================
    describe('Global Items API', () => {

        it('DELETE /api/items - повинен видаляти всі записи користувача', async () => {
            Album.find.mockResolvedValue([]);
            Single.find.mockResolvedValue([]);
            Album.deleteMany.mockResolvedValue({ deletedCount: 1 });
            Single.deleteMany.mockResolvedValue({ deletedCount: 1 });

            const res = await request(app).delete('/api/items');

            expect(res.status).toBe(200);
            expect(Album.deleteMany).toHaveBeenCalledWith({ userId: 'mockUserId123' });
            expect(Single.deleteMany).toHaveBeenCalledWith({ userId: 'mockUserId123' });
        });
    });

    afterAll(async () => {
        const mongoose = (await import('mongoose')).default;
        await mongoose.disconnect();
    });
});