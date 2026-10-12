# 🎵 Playlist Manager

<p align="center">
  <img src="https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/Redux_Toolkit-2.12-764ABC?logo=redux&logoColor=white" alt="Redux Toolkit" />
  <img src="https://img.shields.io/badge/Clerk-Authentication-6C47FF?logo=clerk&logoColor=white" alt="Clerk Auth" />
  <img src="https://img.shields.io/badge/Express-5.1-000000?logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/MongoDB-Mongoose_8.19-47A248?logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License" />
</p>

A state-of-the-art, full-stack music playlist and album library management application built with **React 19**, **Redux Toolkit**, **Node.js/Express**, and **MongoDB**, featuring seamless cloud authentication powered by **Clerk** and a modern glassmorphic dark interface.

---

## 🌿 Repository Branches & Architecture

This repository is maintained in two distinct branches showcasing evolution from a custom authentication microservice to enterprise-grade cloud authentication:

| Branch | Authentication Strategy | Backend Stack | Notes |
| :--- | :--- | :--- | :--- |
| **`clerk-auth`** *(Current)* | **Clerk Cloud Auth** (RS256 JWT, Passkeys, Social, Session Tokens) | Express 5.x + `@clerk/express` + MongoDB | Cloud-native, zero-maintenance auth with JWKS verification and responsive UI. |
| **`main`** / `legacy-auth` | **Custom Microservice** (`PlaylistService.Auth` in ASP.NET Core) | .NET 8 + SQL Server + Custom JWT + Mailtrap | Legacy architecture with custom password hashing, refresh tokens, and email verification. |

---

## ✨ Features

- 🔐 **Clerk Cloud Authentication:**
  - One-click modal sign-in & sign-up (Email, Social, Google, Passkeys).
  - Interactive profile management with `<UserButton />`.
  - Automatic session token acquisition, client-side retry, and token refresh.
  - Asymmetric RS256 token verification on Express backend with automatic JWKS caching.
- 💿 **Comprehensive Music Library:**
  - Create, view, edit, and delete **Albums** and **Singles**.
  - Dynamic song management within albums (add tracks, edit metadata, lyrics).
  - Image upload support for album and single cover artwork via **Multer**.
- 🔍 **Genius API Integration:**
  - Real-time search across songs and albums with cover artwork thumbnails.
  - Quick import of track metadata and lyrics.
- 🎨 **Glassmorphism Dark UI & UX:**
  - Modern aesthetic with backdrop blur filters, glowing borders, and smooth transitions.
  - Ergonomic 400px desktop library sidebar and adaptive track viewer.
  - Fully responsive mobile drawer navigation with zero layout overlap.
  - Safe-area inset support for modern mobile browsers.
- 🤖 **AI Assistant & Semantic Search:**
  - Integrated natural language song and album discovery service.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 19 (`react`, `react-dom`)
- **State Management:** Redux Toolkit (`@reduxjs/toolkit`, `react-redux`)
- **Authentication:** Clerk React SDK (`@clerk/react`)
- **Styling:** Vanilla CSS & CSS Modules, Styled Components, Bootstrap 5 utilities
- **Icons:** `react-icons` (Material Icons, FontAwesome)
- **HTTP Client:** Axios with custom request/response interceptors

### Backend
- **Runtime:** Node.js (ES Modules)
- **Framework:** Express 5.x
- **Authentication:** `@clerk/express`, `jsonwebtoken`, Node `crypto`
- **Database:** MongoDB via Mongoose 8.x
- **File Uploads:** Multer with local disk storage
- **CORS:** Configured with credentials support for local & production environments
- **Testing:** Jest, Supertest

---

## 📁 Project Structure

```
my-react-app/
├── backend/
│   ├── middleware/
│   │   └── authMiddleware.js      # Clerk session verification (SDK + JWKS RS256)
│   ├── models.js                  # Mongoose models (Album, Single, Song)
│   ├── server.js                  # Express API server & route handlers
│   ├── server.test.js             # Automated API controller test suite
│   ├── package.json
│   └── .env.example               # Backend environment template
├── src/
│   ├── ai-components/             # AI Search & Model comparison widgets
│   ├── components/
│   │   ├── AuthContainer.js       # Clerk UI integration & Redux session sync
│   │   ├── GeniusSearch.js        # Live Genius API search
│   │   ├── LibraryPanel.js        # Albums and singles collection sidebar
│   │   ├── ProtectedRoute.js      # Clerk auth gate wrapper
│   │   └── ShowText.js            # Glassmorphic track viewer & vinyl player
│   ├── forms/                     # Album, Single, and Song modal forms
│   ├── store/
│   │   ├── index.js               # Redux store configuration
│   │   ├── hooks.js               # Typed Redux hooks
│   │   └── slices/                # authSlice, librarySlice, selectionSlice, uiSlice
│   ├── styles/                    # Component & global CSS stylesheets
│   ├── utils/
│   │   └── apiClient.js           # Axios client with Clerk Bearer token interceptor
│   ├── App.js                     # Root layout, header, drawer, and footer
│   └── index.js                   # Application entrypoint with ClerkProvider
├── .env.example                   # Frontend environment template
├── .gitignore                     # Git ignore rules (protects all .env & secrets)
└── README.md
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18.x or higher)
- **MongoDB** running locally on port `27017` or a MongoDB Atlas connection string
- A free **Clerk** account at [clerk.com](https://clerk.com)

### 2. Clone the Repository

```bash
git clone https://github.com/sasha-1337/playlist_service.git
cd playlist_service
git checkout clerk-auth
```

### 3. Setup Environment Variables

#### Frontend (`.env` in project root)
Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Configure your Clerk Publishable Key:
```env
REACT_APP_API_BASE_URL=http://localhost:5000/api
REACT_APP_API_PORT=5000
REACT_APP_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key_here
REACT_APP_AI_API_URL=http://localhost:5001/api/ai
```

#### Backend (`backend/.env`)
Copy `backend/.env.example` to `backend/.env`:

```bash
cd backend
cp .env.example .env
```

Configure your backend secrets:
```env
SERVER_URL=http://localhost:5000/api
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/musicdb

CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key_here
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key_here

GENIUS_ACCESS_TOKEN=your_genius_access_token_here
```

### 4. Install Dependencies

```bash
# Install frontend dependencies (in root)
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 5. Run the Application

#### Start Backend Server
```bash
cd backend
npm start
# Server starts on http://localhost:5000
```

#### Start Frontend Client
```bash
# In a separate terminal in project root
npm start
# Client starts on http://localhost:3000
```

---

## 🔒 Security & Environment Protection

- 🛡️ **Zero Hardcoded Secrets:** All credentials, private tokens, and connection strings are strictly managed via environment variables.
- 🚫 **Strict Git Ignore:** All `.env`, `.env.local`, `.env.*`, certificates, upload caches, and legacy `.NET` build artifacts (`PlaylistService.Auth/`, `bin/`, `obj/`) are excluded from version control.
- 🔑 **Cryptographic Token Verification:** Backend verifies incoming tokens using Clerk's public JSON Web Key Sets (JWKS) via asymmetric RS256 algorithm. Expired or forged tokens are rejected immediately.

---

## 🧪 Testing

Both frontend slices and backend API endpoints are covered with automated test suites:

```bash
# Run backend API controller tests
cd backend
npm test

# Run frontend Redux slice tests
cd ..
npm test -- src/store/slices --watchAll=false
```

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
