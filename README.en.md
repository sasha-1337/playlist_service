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

> **A cutting-edge, full-stack music library platform engineered for managing, playing, and discovering music. Built with a robust microservices architecture: React 19 Frontend (Redux Toolkit), ASP.NET Core 10 Auth Microservice, Express.js / MongoDB Music API, Genius API integration, and AI-powered semantic search.**

---

## 📌 Repository Branches (Dual-Branch Architecture)

This repository demonstrates two distinct authentication architectural designs:

| Branch | Authentication Strategy | Architecture & Details |
|---|---|---|
| **`main`** *(This branch)* | **Microservice Authentication (.NET 10 + SQL Server)** | Dedicated secure microservice `PlaylistService.Auth` built with **C# ASP.NET Core** and **SQL Server LocalDB**, featuring the **Strategy Pattern**, HMAC-SHA256 JWT with Refresh Tokens, one-time email confirmation codes via **Mailtrap SMTP**, and Google OAuth 2.0. |
| **`clerk-auth`** | **Cloud Authentication (Clerk SDK)** | Modern alternative utilizing managed **Clerk** authentication (`@clerk/clerk-react`, `@clerk/express`), requiring zero local SQL Server or .NET runtime setup. |

---

## 📋 Table of Contents

- [System Overview](#-system-overview)
- [Microservices Architecture](#-microservices-architecture)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Quick Start & Installation](#-quick-start--installation)
  - [Prerequisites](#prerequisites)
  - [Step 1. Clone the Repository](#step-1-clone-the-repository)
  - [Step 2. Configure Environment Variables (.env)](#step-2-configure-environment-variables-env)
  - [Step 3. Install Dependencies](#step-3-install-dependencies)
  - [Step 4. Apply Database Migrations](#step-4-apply-database-migrations)
  - [Step 5. Launch Services Simultaneously](#step-5-launch-services-simultaneously)
- [Detailed API Specification](#-detailed-api-specification)
  - [PlaylistService.Auth API (.NET)](#1-playlistserviceauth-api-net-web-api)
  - [Music Service API (Express)](#2-music-service-api-nodejs--express)
- [Security & Configuration](#-security--configuration)
- [Troubleshooting](#-troubleshooting)
- [Author](#-author)

---

## 🎯 System Overview

**Playlist Service** is an interactive, enterprise-grade application for music enthusiasts and artists that empowers users to:

- Organize tracks into **Albums** and **Singles** with rich customizable metadata.
- Upload and interactively crop album artwork using an integrated image processing editor.
- Stream media through a built-in player supporting links from YouTube, Spotify, and SoundCloud.
- Enjoy a realistic animated **Vinyl Player** visualizer that rotates smoothly and positions the tonearm during playback.
- Look up song lyrics and album tracklists using official **Genius API** integration.
- Run **semantic AI search** across collections and compare multiple machine learning models.
- Securely register, verify accounts via email confirmation codes, manage sessions, and sign in via **Google OAuth**.

---

## 🏗️ Microservices Architecture

The system adheres to clean architecture principles and strict separation of concerns:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     Frontend Client (React 19 SPA)                      │
│    - Redux Toolkit (auth, library, selection, ui)                       │
│    - Axios Interceptors (automatic token injection & silent refresh)    │
└────────────────────┬───────────────────────────────────┬────────────────┘
                     │                                   │
       Authentication, Tokens,           Content CRUD, File Uploads,
        Verification, Account                 Genius API Proxy
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

### Design Patterns Implemented

- **Strategy Pattern (`IAuthStrategy`)**: Encapsulates workflows requiring one-time email confirmation codes (`RegisterStrategy`, `ChangePasswordStrategy`, `RemoveAccountStrategy`).
- **Repository / Unit of Work**: Out-of-the-box abstraction via Entity Framework Core `DbContext`.
- **DTO Pattern**: Strict request/response typing and input validation in `PlaylistService.Auth/DTOs`.
- **Axios Interceptor Pattern**: Seamless injection of `Authorization: Bearer <token>` and transparent renewal of expired access tokens on `401 Unauthorized` responses without user disruption.
- **Flux / Redux Pattern**: Predictable centralized global state managed with Redux Toolkit slices and memoized selectors.

---

## ✨ Key Features

### 🔐 Security & Identity (`PlaylistService.Auth`)
- **JWT + Refresh Tokens**: Stateless authentication with 7-day access tokens and database-backed refresh token rotation.
- **Email Verification**: One-time 6-digit codes with a 15-minute expiration (`PendingAction`) sent via **Mailtrap** SMTP sandbox.
- **Google OAuth 2.0**: Backend Google ID token signature verification via `Google.Apis.Auth`.
- **Password Hashing**: Cryptographic PBKDF2 hashing with salt using `Microsoft.AspNetCore.Identity.PasswordHasher<User>`.
- **Account Management**: Secure password updates and account deletion with automatic cleanup of user data and uploaded artwork.

### 🎼 Music Library Management
- **Albums & Singles**: Full CRUD operations with instant filtering by genre, artist, and creation date.
- **Tracklist Management**: Add, update, and remove songs while storing lyrics and descriptions.
- **Multi-Provider Media**: Attach YouTube, Spotify, and SoundCloud streaming URLs to individual songs.
- **Artwork Editor**: Crop and optimize image uploads (Croppie / React Image Crop) with automatic cleanup of replaced files from the server.

### 💽 Interactive Vinyl Player
- High-fidelity vinyl animation featuring realistic turntable rotation, tonearm tracking, and custom album art centered on the spinning vinyl.

### 🔍 Genius API & AI Search
- Dual search querying both tracks and albums directly from Genius.
- One-click import for official tracklists, album metadata, and artwork.
- In-process semantic AI search with Hugging Face transformers.

---

## 🛠️ Tech Stack

### Frontend (React 19 Client)
- **React 19.0** — modern user interface library.
- **Redux Toolkit 2.12 & React-Redux 9.3** — state management (`auth`, `library`, `selection`, `ui`).
- **Axios 1.19** — HTTP client with request/response interceptors.
- **React Bootstrap 2.10 & Styled Components 6.1** — responsive layout and polished dark glassmorphic styling.
- **React Image Crop 11.0 & Croppie 2.6** — interactive image cropping.
- **React Player 3.4** — multi-source media player.
- **React Icons 5.4** — icon library.
- **@react-oauth/google 0.13** — Google Sign-In SDK.

### Authentication Microservice (C# ASP.NET Core)
- **.NET 10 SDK** (`net10.0`) Web API.
- **Entity Framework Core 10** — Code-First ORM.
- **Microsoft SQL Server (LocalDB)** — relational user database.
- **Microsoft.AspNetCore.Authentication.JwtBearer** — token validation middleware.
- **MailKit 4.16 & MimeKit 4.16** — SMTP email handling.
- **Google.Apis.Auth 1.74** — Google ID token verification.
- **DotNetEnv 3.2** — environment configuration loader.

### Music Service (Node.js / Express Backend)
- **Node.js 18+ & Express 5.1** — high-throughput REST API.
- **Mongoose 8.19 & MongoDB** — document storage for music catalogs.
- **Multer 2.1** — multipart file uploads for artwork.
- **JsonWebToken 9.0** — token verification against `PlaylistService.Auth`.
- **@xenova/transformers 2.17** — local embedding inference for semantic search.

---

## 📁 Project Structure

```
my-react-app/
├── 📂 src/                                 # Frontend Application (React 19)
│   ├── App.js                              # Root application routing & layout
│   ├── index.js                            # DOM entry point
│   ├── VinylPlayer.js                      # Vinyl turntable visualizer
│   ├── 📂 components/                      # Reusable UI components
│   │   ├── AuthContainer.js                # Login / Registration modal container
│   │   ├── GoogleAuthButton.js             # Google OAuth button
│   │   ├── GeniusSearch.js                 # Genius API search bar & drawer
│   │   ├── LibraryPanel.js                 # Sidebar catalogue & filtering
│   │   ├── TrackCard.js                    # Track display component
│   │   ├── ImageHandler.js                 # Crop & upload editor
│   │   ├── ProtectedRoute.js               # Route authentication guard
│   │   └── SettingsModal.js                # Profile & account settings
│   ├── 📂 forms/                           # Input form components
│   │   ├── LoginForm.js / RegisterForm.js
│   │   ├── VerifyEmailForm.js              # 6-digit confirmation code form
│   │   ├── ChangePasswordForm.js
│   │   ├── DeleteAccountForm.js
│   │   └── AlbumForm.js / SingleForm.js / SongForm.js
│   ├── 📂 store/                           # Redux Toolkit state layer
│   │   ├── index.js                        # Store configuration
│   │   ├── ReduxProvider.js                # Provider wrapper
│   │   ├── 📂 slices/                      # Reducers (auth, library, selection, ui)
│   │   └── 📂 selectors/                   # Memoized state selectors
│   ├── 📂 services/                        # Service layer (AuthService.js)
│   ├── 📂 utils/                           # Axios instances & interceptors (apiClient.js)
│   └── 📂 styles/                          # CSS stylesheets & modules
│
├── 📂 backend/                             # Music Backend (Node.js Express)
│   ├── server.js                           # Express application & CRUD endpoints
│   ├── models.js                           # Mongoose schemas (Album, Single)
│   ├── 📂 middleware/                      # JWT authMiddleware.js
│   ├── 📂 uploads/                         # Stored artwork files
│   ├── package.json
│   └── .env.example                        # Backend environment template
│
├── 📂 PlaylistService.Auth/                # Authentication Microservice (.NET 10)
│   ├── Program.cs                          # Startup, DI container, CORS & JWT config
│   ├── 📂 Controllers/                     # AuthController.cs (/api/auth/*)
│   ├── 📂 Data/                            # AuthDbContext.cs & EF Core Migrations
│   ├── 📂 DTOs/                            # Data Transfer Objects
│   ├── 📂 Models/                          # User.cs & PendingAction.cs models
│   ├── 📂 Strategy/                        # Strategy Pattern (IAuthStrategy, RegisterStrategy, ...)
│   ├── 📂 Services/                        # AuthService, TokenService, EmailService
│   ├── appsettings.json                    # Kestrel base settings
│   ├── .env.example                        # .NET environment template
│   └── PlaylistService.Auth.csproj
│
├── .gitignore                              # Git exclusion rules
├── .env.example                            # Root frontend environment template
├── package.json                            # Frontend dependencies
├── README.md                               # Ukrainian Documentation
├── README.en.md                            # English Documentation
└── LICENSE                                 # MIT License
```

---

## 🚀 Quick Start & Installation

### Prerequisites

Ensure the following tools are installed on your workstation:
- **Node.js** 18.x or higher
- **npm** 9.x or higher
- **.NET SDK 10** (or .NET 9)
- **SQL Server LocalDB** (included with Visual Studio Community or available standalone)
- **MongoDB** (local server running on port `27017` or a cloud instance on MongoDB Atlas)

---

### Step 1. Clone the Repository

```bash
git clone https://github.com/sasha-1337/playlist_service.git
cd my-react-app
git checkout main
```

---

### Step 2. Configure Environment Variables (.env)

The application requires three separate `.env` files (for Frontend, Music API, and Auth Service). Pre-configured sanitized templates are provided:

#### 1. Frontend Root (`my-react-app/.env`):
Create `.env` in the project root:
```env
# Express API Endpoint
REACT_APP_API_BASE_URL=http://localhost:5000/api

# ASP.NET Core Auth Microservice Endpoint
REACT_APP_AUTH_SERVICE_API_URL=https://localhost:7001/api/auth

# Google OAuth Client ID (from Google Cloud Console)
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

#### 2. Express Backend (`backend/.env`):
Create `backend/.env`:
```env
PORT=5000
SERVER_URL=http://localhost:5000
NODE_ENV=development

# MongoDB Connection String
MONGO_URI=mongodb://127.0.0.1:27017/playlist_service

# JWT Secret Key (MUST match Jwt__SecretKey in PlaylistService.Auth/.env!)
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters_here

# Genius Client Access Token for lyrics and metadata search
GENIUS_ACCESS_TOKEN=your_genius_client_access_token_here

UPLOAD_DIR=uploads
```

#### 3. Authentication Microservice (`PlaylistService.Auth/.env`):
Create `PlaylistService.Auth/.env`:
```env
# SQL Server LocalDB Connection String
ConnectionStrings__DefaultConnection=Server=(localdb)\mssqllocaldb;Database=PlaylistServiceAuthDb;Trusted_Connection=True;TrustServerCertificate=True;

# JWT Signing Secret Key
Jwt__SecretKey=your_super_secret_jwt_key_minimum_32_characters_here
Jwt__Issuer=PlaylistService
Jwt__Audience=PlaylistServiceClients

# Google OAuth Client ID
Google__ClientId=your_google_client_id.apps.googleusercontent.com

# ASP.NET Core Kestrel Ports
ASPNETCORE_ENVIRONMENT=Development
ASPNETCORE_URLS=https://localhost:7001;http://localhost:5001

# Allowed CORS Origins
AllowedOrigins=http://localhost:3000,http://localhost:3001

# Mailtrap SMTP Credentials (for test verification code delivery)
EmailSettings__SmtpServer=sandbox.smtp.mailtrap.io
EmailSettings__Port=2525
EmailSettings__SenderName=Music Playlist Service
EmailSettings__SenderEmail=no-reply@playlistservice.com
EmailSettings__Username=your_mailtrap_username
EmailSettings__Password=your_mailtrap_password
```

> [!TIP]
> **Generating a secure 32-byte JWT Secret Key in PowerShell:**
> ```powershell
> [System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
> ```
> Copy this generated string into both `Jwt__SecretKey` (.NET) and `JWT_SECRET` (Node.js).

---

### Step 3. Install Dependencies

```bash
# 1. Install frontend dependencies
npm install

# 2. Install Express backend dependencies
cd backend
npm install
cd ..

# 3. Restore .NET packages for Auth Service
cd PlaylistService.Auth
dotnet restore
cd ..
```

---

### Step 4. Apply Database Migrations

Apply existing Entity Framework Core migrations to create the `Users` and `PendingActions` tables in SQL Server:

```bash
cd PlaylistService.Auth
dotnet ef database update
cd ..
```

---

### Step 5. Launch Services Simultaneously

Run each service in a separate terminal:

#### Terminal 1: Auth Microservice (.NET)
```bash
cd PlaylistService.Auth
dotnet run
```
> Running on: **`https://localhost:7001`** (and `http://localhost:5001`)

#### Terminal 2: Music Service (Node.js / Express)
```bash
cd backend
npm start
```
> Running on: **`http://localhost:5000`**

#### Terminal 3: Client Application (React 19)
```bash
npm start
```
> Open in browser at: **`http://localhost:3000`**

---

## 📡 Detailed API Specification

### 1. PlaylistService.Auth API (.NET Web API)
**Base URL**: `https://localhost:7001/api/auth`

| Method | Endpoint | Authorization | Description |
|---|---|---|---|
| `POST` | `/register` | Public | Validates email uniqueness, persists action to `PendingActions`, and dispatches a 6-digit confirmation code via Mailtrap |
| `POST` | `/verify-email` | Public | Validates code, executes registered strategy (`RegisterStrategy`), activates user account, and issues JWT + Refresh Token |
| `POST` | `/login` | Public | Validates credentials against `PasswordHasher<User>`, updates login timestamp, and returns token pair |
| `POST` | `/google-login-oauth` | Public | Validates Google `idToken` via Google API client and issues tokens |
| `POST` | `/refresh-token` | Public | Validates Refresh Token against SQL Server database and returns fresh Access Token |
| `POST` | `/change-password` | `Bearer Token` | Initiates password change confirmation flow |
| `POST` | `/logout` | `Bearer Token` | Invalidates active Refresh Token in the database |
| `DELETE`| `/remove-account` | `Bearer Token` | Verifies current password and deletes user account from SQL Server |

---

### 2. Music Service API (Node.js / Express)
**Base URL**: `http://localhost:5000/api`

| Method | Endpoint | Authorization | Description |
|---|---|---|---|
| `GET` | `/items` | `Bearer Token` | Fetches all albums and singles belonging to the authenticated user |
| `GET` | `/albums` | `Bearer Token` | Retrieves album collection |
| `POST` | `/albums` | `Bearer Token` | Creates new album (supports multipart image upload) |
| `PUT` | `/albums/:id` | `Bearer Token` | Updates album metadata or artwork (removes old file) |
| `DELETE`| `/albums/:id` | `Bearer Token` | Deletes album, songs, and artwork file |
| `POST` | `/albums/:id/songs` | `Bearer Token` | Adds a song to the selected album |
| `PUT` | `/albums/:albumId/songs/:songId` | `Bearer Token` | Updates a specific song in an album |
| `DELETE`| `/albums/:albumId/songs/:songId` | `Bearer Token` | Removes a song from an album |
| `GET` | `/singles` | `Bearer Token` | Retrieves single tracks collection |
| `POST` | `/singles` | `Bearer Token` | Creates single with artwork upload |
| `PUT` | `/singles/:id` | `Bearer Token` | Updates single metadata or artwork |
| `DELETE`| `/singles/:id` | `Bearer Token` | Deletes single and associated artwork file |
| `GET` | `/genius/search?q={query}` | `Bearer Token` | Multi-search proxy for tracks and albums via Genius API |
| `GET` | `/genius/details?id={id}&type={type}` | `Bearer Token` | Retrieves detailed metadata and song lyrics |

---

## 🔒 Security & Configuration

- **Secret Key Protection**: All `.env` files, certificates, and build directories (`bin/`, `obj/`, `uploads/`) are safely excluded in [.gitignore](file:///.gitignore).
- **JWT Key Alignment**: Ensure `JWT_SECRET` in Node.js matches `Jwt__SecretKey` in .NET. Any mismatch triggers `403 Forbidden` from Express because the token signature cannot be verified.
- **Two-Factor Critical Actions**: Account registration and password changes mandate access to the user's email inbox.
- **CORS Protection**: Backends strictly enforce origin whitelisting (`http://localhost:3000`).

---

## 🛠️ Troubleshooting

### 1. `403 Forbidden` or `Invalid token` when querying Express API
- **Cause**: The `JWT_SECRET` in `backend/.env` differs from `Jwt__SecretKey` in `PlaylistService.Auth/.env`.
- **Solution**: Align the secret key strings in both `.env` files and restart both servers.

### 2. SSL Certificate Error (`NET::ERR_CERT_AUTHORITY_INVALID`) in Browser
- **Cause**: Self-signed ASP.NET Core developer certificate (`https://localhost:7001`).
- **Solution**: Trust the dev certificate in your terminal:
  ```bash
  dotnet dev-certs https --trust
  ```

### 3. Email verification codes are not received
- **Cause**: Missing or incorrect Mailtrap credentials in `PlaylistService.Auth/.env`.
- **Solution**: Sign up at [Mailtrap.io](https://mailtrap.io/), open *Email Testing -> Inboxes*, and copy your `Username` and `Password`.

### 4. SQL Server connection failure
- **Cause**: LocalDB instance is not started.
- **Solution**: Start the LocalDB instance:
  ```powershell
  sqllocaldb start mssqllocaldb
  ```

---

## 👨‍💻 Author

**Sasha** — [GitHub Profile](https://github.com/sasha-1337)  
Repository: [https://github.com/sasha-1337/playlist_service](https://github.com/sasha-1337/playlist_service)
