# 🎵 Playlist Service — Full Stack Music Library Platform

<p align="left">
  <a href="README.en.md"><b>🇬🇧 English</b></a> | 
  <a href="README.md"><b>🇺🇦 Українська</b></a>
</p>

[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-2.12-764ABC?logo=redux&logoColor=white)](https://redux-toolkit.js.org/)
[![ASP.NET Core](https://img.shields.io/badge/ASP.NET_Core-10.0-512BD4?logo=dotnet&logoColor=white)](https://dotnet.microsoft.com/)
[![C#](https://img.shields.io/badge/C%23-13-239120?logo=c-sharp&logoColor=white)](https://docs.microsoft.com/dotnet/csharp/)
[![SQL Server](https://img.shields.io/badge/SQL_Server-LocalDB-CC292B?logo=microsoft-sql-server&logoColor=white)](https://www.microsoft.com/sql-server)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.1-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> **Сучасна повнофункціональна платформа для організації, прослуховування та дослідження музичної бібліотеки на базі мікросервісної архітектури: React 19 Frontend (Redux Toolkit), ASP.NET Core 10 Auth Microservice, Express.js / MongoDB Music API та інтеграції з Genius API і AI-пошуком.**

---

## 📌 Гілки репозиторію (Dual-Branch Architecture)

У цьому репозиторії реалізовано два незалежні підходи до архітектури автентифікації:

| Гілка (Branch) | Архітектура автентифікації | Опис |
|---|---|---|
| **`main`** *(цей бренч)* | **Мікросервісна автентифікація (.NET 10 + SQL Server)** | Власний захищений мікросервіс `PlaylistService.Auth` на **C# ASP.NET Core**, що працює з **SQL Server LocalDB**, реалізує патерн **Strategy**, JWT HS256 з Refresh Tokens, підтвердження дій одноразовими кодами через **Mailtrap SMTP**, та Google OAuth 2.0. |
| **`clerk-auth`** | **Хмарна автентифікація (Clerk SDK)** | Альтернативна реалізація на базі керованого хмарного сервісу **Clerk** (`@clerk/clerk-react`, `@clerk/express`), без необхідності локального розгортання SQL Server та .NET SDK. |

---

## 📋 Зміст

- [Огляд системи](#-огляд-системи)
- [Архітектура мікросервісів](#-архітектура-мікросервісів)
- [Ключовий функціонал](#-ключовий-функціонал)
- [Технологічний стек](#-технологічний-стек)
- [Структура проекту](#-структура-проекту)
- [Швидкий старт та інсталяція](#-швидкий-старт-та-інсталяція)
  - [Вимоги до оточення](#вимоги-до-оточення)
  - [Крок 1. Клонування репозиторію](#крок-1-клонування-репозиторію)
  - [Крок 2. Налаштування змінних оточення (.env)](#крок-2-налаштування-змінних-оточення-env)
  - [Крок 3. Встановлення залежностей](#крок-3-встановлення-залежностей)
  - [Крок 4. Застосування міграцій бази даних](#крок-4-застосування-міграцій-бази-даних)
  - [Крок 5. Одночасний запуск сервісів](#крок-5-одночасний-запуск-сервісів)
- [Детальна специфікація API](#-детальна-специфікація-api)
  - [PlaylistService.Auth API (.NET)](#1-playlistserviceauth-api-net-web-api)
  - [Music Service API (Express)](#2-music-service-api-nodejs--express)
- [Безпека та конфігурація](#-безпека-та-конфігурація)
- [Діагностика та вирішення проблем (Troubleshooting)](#-діагностика-та-вирішення-проблем-troubleshooting)
- [Автор](#-автор)

---

## 🎯 Огляд системи

**Playlist Service** — це інтерактивний додаток для меломанів та авторів музики, який дозволяє:

- Організовувати треки в **Альбоми** (Albums) та **Сингли** (Singles) з гнучкими метаданими.
- Завантажувати та інтерактивно обрізати обкладинки за допомогою вбудованого редактора.
- Відтворювати аудіо та відео через плеєр з інтеграцією популярних сервісів (YouTube, Spotify, SoundCloud).
- Насолоджуватися анімацією **вінілового програвача (Vinyl Player)**, що оживає під час прослуховування.
- Шукати тексти пісень і дані альбомів через інтеграцію з **Genius API**.
- Використовувати **семантичний AI-пошук** музики та порівнювати моделі машинного навчання.
- Безпечно реєструватися, підтверджувати email одноразовим кодом, керувати сесією та входити через **Google OAuth**.

---

## 🏗️ Архітектура мікросервісів

Система побудована за принципами чистої архітектури та розділення відповідальності (Separation of Concerns):

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Frontend Клієнт (React 19 SPA)                       │
│    - Redux Toolkit (auth, library, selection, ui)                       │
│    - Axios Interceptors (автоматична підстановка токена & авто-refresh) │
└────────────────────┬───────────────────────────────────┬────────────────┘
                     │                                   │
      Автентифікація, токени,            CRUD контенту, завантаження файлів,
        верифікація, акаунт                      Genius API проксі
                     │                                   │
                     ▼                                   ▼
┌─────────────────────────────────────────┐   ┌───────────────────────────┐
│          PlaylistService.Auth           │   │     Music Service API     │
│       (C# ASP.NET Core 10 Web API)      │   │   (Node.js / Express 5)   │
│  - JWT Bearer Issuer (HMAC-SHA256)      │   │  - JWT Auth Middleware    │
│  - Refresh Token Manager                │   │  - Multer Image Upload    │
│  - Strategy Pattern (Verification)      │   │  - Genius Search Proxy    │
│  - MailKit / MimeKit (Mailtrap SMTP)    │   │  - Data Normalization     │
└────────────────────┬────────────────────┘   └─────────────┬─────────────┘
                     │                                      │
                     ▼                                      ▼
           ┌───────────────────┐                  ┌───────────────────┐
           │    SQL Server     │                  │      MongoDB      │
           │  (LocalDB / MSSQL)│                  │  (Albums, Singles,│
           │ Users & Actions   │                  │      Songs)       │
           └───────────────────┘                  └───────────────────┘
```

### Реалізовані патерни проектування

- **Strategy Pattern (`IAuthStrategy`)**: Інкапсуляція дій, які потребують підтвердження кодом з email (`RegisterStrategy`, `ChangePasswordStrategy`, `RemoveAccountStrategy`).
- **Repository / Unit of Work**: Автоматично реалізований через Entity Framework Core `DbContext`.
- **DTO Pattern**: Сувора типізація та валідація даних запитів/відповідей у `PlaylistService.Auth/DTOs`.
- **Axios Interceptor Pattern**: Прозоре додавання заголовка `Authorization: Bearer <token>` і безшовне оновлення простроченого токена через чергу запитів при отриманні `401 Unauthorized`.
- **Flux / Redux Pattern**: Централізований передбачуваний стан у React за допомогою Redux Toolkit.

---

## ✨ Ключовий функціонал

### 🔐 Безпека та Автентифікація (`PlaylistService.Auth`)
- **JWT + Refresh Token**: Безпечна автентифікація з терміном дії токена 7 днів і збереженням сесії в SQL Server.
- **Підтвердження пошти (Email Verification)**: Відправка 6-значного перевірочного коду (час життя 15 хвилин) через тестовий SMTP-сервер **Mailtrap**.
- **Вхід через Google**: Валідація токенів Google OAuth 2.0 безпосередньо на бекенді через `Google.Apis.Auth`.
- **Хешування паролів**: Надійний стандарт PBKDF2 через `Microsoft.AspNetCore.Identity.PasswordHasher<User>`.
- **Безпечна зміна пароля та видалення акаунта**: Вимагають повторної перевірки прав та очищення пов'язаних медіа-файлів і записів у MongoDB.

### 🎼 Музична бібліотека
- **Альбоми та Сингли**: Повний набір CRUD-операцій, фільтрація за жанром, автором та датою.
- **Треклист альбомів**: Додавання, редагування та видалення треків із збереженням лірики та опису.
- **Мультимедійні посилання**: Підтримка YouTube, Spotify, SoundCloud для кожного окремого треку.
- **Редактор обкладинок**: Завантаження файлів з інтерактивним кропом (Croppie / React Image Crop) та автоматичним видаленням застарілих зображень із файлової системи сервера.

### 💽 Інтерактивний вініловий плеєр (Vinyl Player)
- Реалістична анімація вінілової платівки з обертанням, рухомим тонармом та зміною обкладинки по центру платівки в такт музиці.

### 🔍 Genius API & AI Search
- Мульти-пошук альбомів та треків у базі даних Genius.
- Імпорт офіційного трекліста, метаданих та обкладинки в один клік.
- Семантичний AI-пошук для знаходження музики за настроєм чи стилем.

---

## 🛠️ Технологічний стек

### Фронтенд (React 19 Client)
- **React 19.0** — ядро інтерфейсу.
- **Redux Toolkit 2.12 & React-Redux 9.3** — глобальний стейт-менеджмент (`auth`, `library`, `selection`, `ui`).
- **Axios 1.19** — HTTP-клієнт з інтерцепторами для тихого оновлення JWT.
- **React Bootstrap 2.10 & Styled Components 6.1** — адаптивна компонентна верстка та преміум темна тема.
- **React Image Crop 11.0 & Croppie 2.6** — обробка та масштабування обкладинок.
- **React Player 3.4** — універсальне відтворення медіа.
- **React Icons 5.4** — шрифтові іконки.
- **@react-oauth/google 0.13** — інтеграція кнопки Google Sign-In.

### Мікросервіс автентифікації (C# ASP.NET Core)
- **.NET 10 SDK** (`net10.0`) Web API.
- **Entity Framework Core 10** — робота з базою даних.
- **Microsoft SQL Server (LocalDB)** — реляційна база користувачів.
- **Microsoft.AspNetCore.Authentication.JwtBearer** — верифікація токенів.
- **MailKit 4.16 & MimeKit 4.16** — робота з поштовими повідомленнями.
- **Google.Apis.Auth 1.74** — серверна верифікація Google ID Tokens.
- **DotNetEnv 3.2** — завантаження конфігурації з `.env`.

### Музичний сервіс (Node.js / Express Backend)
- **Node.js 18+ & Express 5.1** — швидкий REST API.
- **Mongoose 8.19 & MongoDB** — документоорієнтована база даних музичного каталогу.
- **Multer 2.1** — завантаження зображень у сховище `uploads/`.
- **JsonWebToken 9.0** — валідація JWT токенів, згенерованих сервісом `PlaylistService.Auth`.
- **@xenova/transformers 2.17** — локальні моделі embeddings для AI-пошуку.

---

## 📁 Структура проекту

```
my-react-app/
├── 📂 src/                                 # Клієнтський додаток (React 19)
│   ├── App.js                              # Головний компонент із маршрутизацією
│   ├── index.js                            # Точка входу в DOM
│   ├── VinylPlayer.js                      # Інтерактивний програвач платівок
│   ├── 📂 components/                      # UI компоненти
│   │   ├── AuthContainer.js                # Модальні вікна входу / реєстрації
│   │   ├── GoogleAuthButton.js             # Кнопка авторизації Google
│   │   ├── GeniusSearch.js                 # Компонент пошуку через Genius API
│   │   ├── LibraryPanel.js                 # Каталог треків та альбомів
│   │   ├── TrackCard.js                    # Карточка окремого треку
│   │   ├── ImageHandler.js                 # Редактор кропу обкладинок
│   │   ├── ProtectedRoute.js               # Захист приватних маршрутів
│   │   └── SettingsModal.js                # Налаштування акаунта
│   ├── 📂 forms/                           # Форми введення
│   │   ├── LoginForm.js / RegisterForm.js
│   │   ├── VerifyEmailForm.js              # Введення 6-значного коду
│   │   ├── ChangePasswordForm.js
│   │   ├── DeleteAccountForm.js
│   │   └── AlbumForm.js / SingleForm.js / SongForm.js
│   ├── 📂 store/                           # Redux Toolkit архітектура
│   │   ├── index.js                        # Налаштування Redux Store
│   │   ├── ReduxProvider.js                # Обгортка провайдера
│   │   ├── 📂 slices/                      # Редюсери та екшени (auth, library, selection, ui)
│   │   └── 📂 selectors/                   # Мемоізовані селектори
│   ├── 📂 services/                        # Сервісний шар (AuthService.js)
│   ├── 📂 utils/                           # Клієнти API з інтерцепторами (apiClient.js)
│   └── 📂 styles/                          # Стилі та CSS модулі
│
├── 📂 backend/                             # Музичний бекенд (Node.js Express)
│   ├── server.js                           # Express додаток і всі CRUD ендпоінти
│   ├── models.js                           # Mongoose моделі (Album, Single)
│   ├── 📂 middleware/                      # JWT authMiddleware.js
│   ├── 📂 uploads/                         # Локальне сховище обкладинок
│   ├── package.json
│   └── .env.example                        # Шаблон конфігурації бекенду
│
├── 📂 PlaylistService.Auth/                # Сервіс автентифікації (.NET 10)
│   ├── Program.cs                          # Startup, конфігурація DI, CORS та JWT
│   ├── 📂 Controllers/                     # AuthController.cs (/api/auth/*)
│   ├── 📂 Data/                            # AuthDbContext.cs та міграції EF Core
│   ├── 📂 DTOs/                            # Data Transfer Objects
│   ├── 📂 Models/                          # Моделі User.cs та PendingAction.cs
│   ├── 📂 Strategy/                        # Патерн Strategy (IAuthStrategy, RegisterStrategy, ...)
│   ├── 📂 Services/                        # AuthService, TokenService, EmailService
│   ├── appsettings.json                    # Базові налаштування Kestrel
│   ├── .env.example                        # Шаблон налаштувань .NET
│   └── PlaylistService.Auth.csproj
│
├── .gitignore                              # Захист секретів від публікації
├── .env.example                            # Шаблон конфігурації фронтенду
├── package.json                            # Залежності фронтенду
└── README.md                               # Головна документація
```

---

## 🚀 Швидкий старт та інсталяція

### Вимоги до оточення

Перед початком переконайтеся, що на вашому комп'ютері встановлені:
- **Node.js** версії 18.x або новішої
- **npm** версії 9.x або новішої
- **.NET SDK 10** (або .NET 9 з відповідною підтримкою)
- **SQL Server LocalDB** (входить до складу Visual Studio Community або встановлюється окремо)
- **MongoDB** (локальний екземпляр на порту `27017` або безкоштовний кластер MongoDB Atlas)

---

### Крок 1. Клонування репозиторію

```bash
git clone https://github.com/sasha-1337/playlist_service.git
cd my-react-app
git checkout main
```

---

### Крок 2. Налаштування змінних оточення (.env)

Проект вимагає налаштування трьох незалежних `.env` файлів (для фронтенду, музичного бекенду та auth-сервісу). Усі шаблони вже підготовлені:

#### 1. Фронтенд (Коренева папка):
Створіть `.env` у корені проекту (`my-react-app/.env`):
```env
# URL для зв'язку з Express API
REACT_APP_API_BASE_URL=http://localhost:5000/api

# URL для зв'язку з ASP.NET Auth API
REACT_APP_AUTH_SERVICE_API_URL=https://localhost:7001/api/auth

# Google OAuth Client ID (з Google Cloud Console)
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

#### 2. Express Backend (`backend/.env`):
Створіть `backend/.env`:
```env
PORT=5000
SERVER_URL=http://localhost:5000
NODE_ENV=development

# Рядок підключення до MongoDB
MONGO_URI=mongodb://127.0.0.1:27017/playlist_service

# Секретний ключ JWT (МУСИТЬ бути ідентичним ключу в PlaylistService.Auth!)
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters_here

# Токен доступу Genius API для пошуку треків та слів пісень
GENIUS_ACCESS_TOKEN=your_genius_client_access_token_here

UPLOAD_DIR=uploads
```

#### 3. Сервіс автентифікації (`PlaylistService.Auth/.env`):
Створіть `PlaylistService.Auth/.env`:
```env
# Підключення до SQL Server LocalDB
ConnectionStrings__DefaultConnection=Server=(localdb)\mssqllocaldb;Database=PlaylistServiceAuthDb;Trusted_Connection=True;TrustServerCertificate=True;

# Секретний ключ для підпису JWT токенів
Jwt__SecretKey=your_super_secret_jwt_key_minimum_32_characters_here
Jwt__Issuer=PlaylistService
Jwt__Audience=PlaylistServiceClients

# Google OAuth
Google__ClientId=your_google_client_id.apps.googleusercontent.com

# Порти ASP.NET Core Kestrel
ASPNETCORE_ENVIRONMENT=Development
ASPNETCORE_URLS=https://localhost:7001;http://localhost:5001

# Дозволені джерела CORS
AllowedOrigins=http://localhost:3000,http://localhost:3001

# Налаштування Mailtrap (для надсилання тестових кодів на пошту)
EmailSettings__SmtpServer=sandbox.smtp.mailtrap.io
EmailSettings__Port=2525
EmailSettings__SenderName=Music Playlist Service
EmailSettings__SenderEmail=no-reply@playlistservice.com
EmailSettings__Username=your_mailtrap_username
EmailSettings__Password=your_mailtrap_password
```

> [!TIP]
> **Генерація безпечного ключа JWT у PowerShell:**
> ```powershell
> [System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
> ```
> Скопіюйте згенерований рядок одночасно у `Jwt__SecretKey` (.NET) та `JWT_SECRET` (Node.js).

---

### Крок 3. Встановлення залежностей

```bash
# 1. Залежності фронтенду
npm install

# 2. Залежності музичного сервісу Express
cd backend
npm install
cd ..

# 3. Залежності мікросервісу автентифікації
cd PlaylistService.Auth
dotnet restore
cd ..
```

---

### Крок 4. Застосування міграцій бази даних

Для створення таблиць `Users` та `PendingActions` у базі даних SQL Server:

```bash
cd PlaylistService.Auth
dotnet ef database update
cd ..
```

---

### Крок 5. Одночасний запуск сервісів

Для повноцінної роботи додатку відкрийте **3 термінали**:

#### Термінал 1: Мікросервіс автентифікації (.NET)
```bash
cd PlaylistService.Auth
dotnet run
```
> Доступний за адресою: **`https://localhost:7001`** (та `http://localhost:5001`)

#### Термінал 2: Музичний сервіс (Node.js / Express)
```bash
cd backend
npm start
```
> Доступний за адресою: **`http://localhost:5000`**

#### Термінал 3: Клієнтська частина (React 19)
```bash
npm start
```
> Додаток відкриється у браузері за адресою: **`http://localhost:3000`**

---

## 📡 Детальна специфікація API

### 1. PlaylistService.Auth API (.NET Web API)
**Базовий URL**: `https://localhost:7001/api/auth`

| Метод | Ендпоінт | Авторизація | Опис |
|---|---|---|---|
| `POST` | `/register` | Публічний | Перевіряє унікальність email, зберігає дію в `PendingActions` та надсилає 6-значний код підтвердження через Mailtrap |
| `POST` | `/verify-email` | Публічний | Перевіряє код, активує відповідну стратегію (`RegisterStrategy` / `ChangePasswordStrategy`), створює запис користувача і видає JWT + Refresh Token |
| `POST` | `/login` | Публічний | Звіряє пароль через `PasswordHasher<User>`, оновлює дату останнього входу та повертає пару токенів |
| `POST` | `/google-login-oauth` | Публічний | Приймає `idToken` від Google, валідує його через Google API та авторизує користувача |
| `POST` | `/refresh-token` | Публічний | Приймає пару токенів, перевіряє Refresh Token у базі даних і повертає оновлений Access Token |
| `POST` | `/change-password` | `Bearer Token` | Ініціює зміну пароля облікового запису |
| `POST` | `/logout` | `Bearer Token` | Відкликає активний Refresh Token у базі даних |
| `DELETE`| `/remove-account` | `Bearer Token` | Перевіряє діючий пароль і видаляє користувача із бази даних SQL Server |

---

### 2. Music Service API (Node.js / Express)
**Базовий URL**: `http://localhost:5000/api`

| Метод | Ендпоінт | Авторизація | Опис |
|---|---|---|---|
| `GET` | `/items` | `Bearer Token` | Отримує всі альбоми та сингли поточного авторизованого користувача |
| `GET` | `/albums` | `Bearer Token` | Отримує список альбомів |
| `POST` | `/albums` | `Bearer Token` | Створює новий альбом (підтримує multipart завантаження файлу обкладинки) |
| `PUT` | `/albums/:id` | `Bearer Token` | Оновлює метадані альбому або замінює обкладинку (старий файл видаляється) |
| `DELETE`| `/albums/:id` | `Bearer Token` | Видаляє альбом, його треки та файл обкладинки |
| `POST` | `/albums/:id/songs` | `Bearer Token` | Додає новий трек до вибраного альбому |
| `PUT` | `/albums/:albumId/songs/:songId` | `Bearer Token` | Оновлює конкретний трек у складі альбому |
| `DELETE`| `/albums/:albumId/songs/:songId` | `Bearer Token` | Видаляє трек з альбому |
| `GET` | `/singles` | `Bearer Token` | Отримує список синглів |
| `POST` | `/singles` | `Bearer Token` | Створює окремий сингл із завантаженням обкладинки |
| `PUT` | `/singles/:id` | `Bearer Token` | Оновлює сингл |
| `DELETE`| `/singles/:id` | `Bearer Token` | Видаляє сингл та його зображення |
| `GET` | `/genius/search?q={query}` | `Bearer Token` | Проксі-пошук альбомів та треків через Genius API |
| `GET` | `/genius/details?id={id}&type={type}` | `Bearer Token` | Отримання детальних даних (трекліст альбому, повні тексти пісень) |

---

## 🔒 Безпека та конфігурація

- **Приватність ключів**: Конфігураційні файли `.env`, сертифікати, та папки бінарних файлів (`bin/`, `obj/`, `uploads/`) надійно внесені до [.gitignore](file:///.gitignore).
- **Синхронізація секретів**: Переконайтеся, що `JWT_SECRET` у Node.js в точності співпадає з `Jwt__SecretKey` у C# .NET. У разі неспівпадіння бекенд на Express повертатиме помилку `403 Forbidden` через неможливість перевірити підпис токена.
- **Двофакторний захист критичних операцій**: Зміна пароля та реєстрація вимагають фізичного доступу до скриньки електронної пошти користувача.
- **Безпека CORS**: Усі бекенд-сервіси обмежують доступ лише дозволеними джерелами (`http://localhost:3000`).

---

## 🛠️ Діагностика та вирішення проблем (Troubleshooting)

### 1. Помилка `403 Forbidden` або `Invalid token` при зверненні до Express API
- **Причина**: Ключ `JWT_SECRET` у `backend/.env` відрізняється від `Jwt__SecretKey` у `PlaylistService.Auth/.env`.
- **Рішення**: Перевірте обидва файли `.env` та вкажіть однаковий секретний рядок. Перезапустіть обидва сервіси.

### 2. Помилка сертифіката SSL (`NET::ERR_CERT_AUTHORITY_INVALID`) у браузері
- **Причина**: Самопідписаний сертифікат розробника ASP.NET Core (`https://localhost:7001`).
- **Рішення**: Виконайте в терміналі команду довіри до сертифіката розробника:
  ```bash
  dotnet dev-certs https --trust
  ```

### 3. Листи з кодом не надходять на пошту
- **Причина**: Не вказано або вказано недійсні реквізити Mailtrap у `PlaylistService.Auth/.env`.
- **Рішення**: Створіть безкоштовний акаунт на [Mailtrap.io](https://mailtrap.io/), перейдіть у розділ *Email Testing -> Inboxes* та скопіюйте `Username` і `Password` у `PlaylistService.Auth/.env`.

### 4. Помилка з'єднання з базою даних SQL Server
- **Причина**: Служба LocalDB не запущена.
- **Рішення**: Запустіть екземпляр LocalDB у командному рядку:
  ```powershell
  sqllocaldb start mssqllocaldb
  ```

---

## 👨‍💻 Автор

**Sasha** — [GitHub Profile](https://github.com/sasha-1337)  
Репозиторій проекту: [https://github.com/sasha-1337/playlist_service](https://github.com/sasha-1337/playlist_service)
