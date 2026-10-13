# 🎵 Playlist Manager

<p align="left">
  <a href="README.md"><b>🇬🇧 English</b></a> | 
  <a href="README.uk.md"><b>🇺🇦 Українська</b></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/Redux_Toolkit-2.12-764ABC?logo=redux&logoColor=white" alt="Redux Toolkit" />
  <img src="https://img.shields.io/badge/Clerk-Authentication-6C47FF?logo=clerk&logoColor=white" alt="Clerk Auth" />
  <img src="https://img.shields.io/badge/Express-5.1-000000?logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/MongoDB-Mongoose_8.19-47A248?logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License" />
</p>

Сучасний повнофункціональний веб-додаток для організації та прослуховування музичних плейлистів і альбомів, розроблений на базі **React 19**, **Redux Toolkit**, **Node.js/Express** та **MongoDB**, із інтегрованою безшовною хмарною автентифікацією **Clerk** та стильною темною темою в стилі Glassmorphism.

---

## 🌿 Гілки репозиторію та архітектура

У репозиторії реалізовано дві незалежні гілки, які демонструють еволюцію від власного мікросервісу автентифікації до сучасного хмарного рішення:

| Гілка (Branch) | Стратегія автентифікації | Стек бекенду | Опис |
| :--- | :--- | :--- | :--- |
| **`clerk-auth`** *(Поточна)* | **Хмарна автентифікація Clerk** (RS256 JWT, Passkeys, Social, Session Tokens) | Express 5.x + `@clerk/express` + MongoDB | Сучасна cloud-native автентифікація з автоматичною перевіркою JWKS і адаптивним інтерфейсом без потреби підтримки власної бази користувачів. |
| **`main`** / `legacy-auth` | **Власний мікросервіс** (`PlaylistService.Auth` на ASP.NET Core) | .NET 10 + SQL Server + Custom JWT + Mailtrap | Класична мікросервісна архітектура з власним хешуванням паролів, рефреш-токенами та підтвердженням дій кодами через пошту. |

---

## ✨ Ключові можливості

- 🔐 **Хмарна автентифікація Clerk:**
  - Модальне вікно входу та реєстрації в 1 клік (Email, Google, Social, Passkeys).
  - Інтерактивне управління профілем через віджет `<UserButton />`.
  - Автоматичне отримання токенів сесії, повторні запити на клієнті та тихе оновлення сесії.
  - Асиметрична верифікація токенів RS256 на Express бекенді з автоматичним кешуванням публічних ключів JWKS.
- 💿 **Музична бібліотека:**
  - Створення, перегляд, редагування та видалення **Альбомів** та **Синглів**.
  - Динамічне управління треками в альбомах (додавання, зміна метаданих, лірика).
  - Завантаження обкладинок через **Multer** з локальним збереженням та автоматичним видаленням застарілих файлів.
- 🔍 **Інтеграція з Genius API:**
  - Пошук пісень та альбомів у реальному часі з мініатюрами обкладинок.
  - Швидкий імпорт метаданих, треклістів та слів пісень.
- 🎨 **Glassmorphism темний інтерфейс:**
  - Сучасна естетика з ефектами розмиття фону (`backdrop-filter`), м'яким неоновим світінням та плавними переходами.
  - Зручна бічна панель бібліотеки (400px) та адаптивний плеєр.
  - Мобільне навігаційне меню без накладання елементів інтерфейсу.
  - Підтримка безпечних зон (`safe-area-inset`) для мобільних пристроїв.
- 🤖 **Семантичний AI-пошук:**
  - Вбудований сервіс пошуку музики за описом та настроєм.

---

## 🛠️ Технологічний стек

### Frontend
- **Фреймворк:** React 19 (`react`, `react-dom`)
- **Стейт-менеджмент:** Redux Toolkit (`@reduxjs/toolkit`, `react-redux`)
- **Автентифікація:** Clerk React SDK (`@clerk/react`)
- **Стилізація:** Vanilla CSS, CSS Modules, Styled Components, Bootstrap 5 utilities
- **Іконки:** `react-icons`
- **HTTP-клієнт:** Axios з кастомними інтерцепторами для підстановки Bearer токенів

### Backend
- **Середовище:** Node.js (ES Modules)
- **Фреймворк:** Express 5.x
- **Автентифікація:** `@clerk/express`, `jsonwebtoken`
- **База даних:** MongoDB через Mongoose 8.x
- **Завантаження файлів:** Multer з локальним збереженням
- **Тестування:** Jest, Supertest

---

## 📁 Структура проекту

```
my-react-app/
├── backend/
│   ├── middleware/
│   │   └── authMiddleware.js      # Верифікація сесій Clerk (SDK + JWKS RS256)
│   ├── models.js                  # Mongoose моделі (Album, Single, Song)
│   ├── server.js                  # Express API сервер та обробники маршрутів
│   ├── server.test.js             # Автоматизовані тести контролерів API
│   ├── package.json
│   └── .env.example               # Шаблон змінних оточення бекенду
├── src/
│   ├── ai-components/             # Компоненти AI-пошуку
│   ├── components/
│   │   ├── AuthContainer.js       # Інтеграція інтерфейсу Clerk та синхронізація з Redux
│   │   ├── GeniusSearch.js        # Пошук через Genius API
│   │   ├── LibraryPanel.js        # Бічна панель альбомів та синглів
│   │   ├── ProtectedRoute.js      # Захист приватних маршрутів
│   │   └── ShowText.js            # Відображення деталей треку та вініловий плеєр
│   ├── forms/                     # Форми створення альбомів, синглів, треків
│   ├── store/
│   │   ├── index.js               # Налаштування Redux store
│   │   ├── hooks.js               # Типізовані хуки Redux
│   │   └── slices/                # authSlice, librarySlice, selectionSlice, uiSlice
│   ├── styles/                    # Стилі CSS та модулі
│   ├── utils/
│   │   └── apiClient.js           # Axios клієнт із інтерцептором токена Clerk
│   ├── App.js                     # Головний макет, шапка, навігація та футер
│   └── index.js                   # Точка входу з ClerkProvider
├── .env.example                   # Шаблон змінних оточення фронтенду
├── .gitignore                     # Правила виключення файлів з Git
├── README.md                      # Документація англійською
├── README.uk.md                   # Документація українською
└── package.json
```

---

## 🚀 Швидкий старт та інсталяція

### 1. Вимоги до оточення
- **Node.js** (v18.x або новішої версії)
- **MongoDB** (локально на порту `27017` або рядок підключення MongoDB Atlas)
- Безкоштовний акаунт на [clerk.com](https://clerk.com)

### 2. Клонування репозиторію

```bash
git clone https://github.com/sasha-1337/playlist_service.git
cd playlist_service
git checkout clerk-auth
```

### 3. Налаштування змінних оточення

#### Фронтенд (`.env` у корені проекту)
Скопіюйте `.env.example` у `.env`:

```bash
cp .env.example .env
```

Вкажіть ваш Clerk Publishable Key:
```env
REACT_APP_API_BASE_URL=http://localhost:5000/api
REACT_APP_API_PORT=5000
REACT_APP_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key_here
REACT_APP_AI_API_URL=http://localhost:5001/api/ai
```

#### Бекенд (`backend/.env`)
Скопіюйте `backend/.env.example` у `backend/.env`:

```bash
cd backend
cp .env.example .env
```

Вкажіть ключі бекенду:
```env
SERVER_URL=http://localhost:5000/api
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/musicdb

CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key_here
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key_here

GENIUS_ACCESS_TOKEN=your_genius_access_token_here
```

### 4. Встановлення залежностей

```bash
# Встановлення залежностей фронтенду (у корені)
npm install

# Встановлення залежностей бекенду
cd backend
npm install
cd ..
```

### 5. Запуск додатку

#### Запуск сервера бекенду
```bash
cd backend
npm start
# Сервер запуститься на http://localhost:5000
```

#### Запуск клієнта фронтенду
```bash
# В окремому терміналі в корені проекту
npm start
# Клієнт запуститься на http://localhost:3000
```

---

## 🔒 Безпека та захист секретів

- 🛡️ **Жодних захардкоджених ключів:** Усі секрети, ключі доступу та паролі баз даних керуються виключно через змінні середовища.
- 🚫 **Суворий `.gitignore`:** Усі файли `.env`, сертифікати, завантажені файли та артефакти .NET виключені з контролю версій.
- 🔑 **Криптографічна верифікація токенів:** Бекенд перевіряє токени за допомогою публічних наборів ключів Clerk (JWKS) за асиметричним алгоритмом RS256. Прострочені або підроблені токени блокуються автоматично.

---

## 🧪 Тестування

```bash
# Запуск тестів контролерів API бекенду
cd backend
npm test

# Запуск тестів Redux-слайсів фронтенду
cd ..
npm test -- src/store/slices --watchAll=false
```

---

## 📄 Ліцензія

Цей проект розповсюджується під ліцензією MIT — детальніше дивіться у файлі [LICENSE](LICENSE).
