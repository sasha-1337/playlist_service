# 🎵 Playlist Service - Full Stack Music Library Management

> **A complete full-stack application for managing, organizing, and discovering music with AI-powered search capabilities.**
---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Running the Application](#-running-the-application)
- [API Documentation](#-api-documentation)
- [Development](#-development)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

**Playlist Service** is an enterprise-grade music library management system that allows users to:

- Create and organize **Albums** and **Singles** with metadata
- Add, edit, and manage **Songs** within collections
- Upload and process **album covers** with advanced image cropping
- Integrate **multiple music providers** (YouTube, Spotify, SoundCloud)
- Authenticate securely with **Google OAuth** and local credentials
- Search music using **AI-powered search** with model comparison
- Manage user accounts with **JWT-based authentication**

The system follows **clean architecture** principles with a microservices-inspired design, featuring separate services for authentication, music data, and AI operations.

---

## ✨ Features

### 🎼 Music Library Management
- ✅ **CRUD Operations** for Albums, Singles, and Songs
- ✅ **Nested Structure** - Albums contain Songs, each with metadata
- ✅ **Media Links** - Attach YouTube, Spotify, SoundCloud links to songs
- ✅ **Cover Images** - Upload and crop album artwork with advanced image processing
- ✅ **Rich Metadata** - Genre, description, lyrics, creation dates

### 🔐 Authentication & Security
- ✅ **Google OAuth 2.0** - Seamless third-party authentication
- ✅ **JWT Tokens** - Secure, stateless authentication
- ✅ **Refresh Tokens** - Extended session management
- ✅ **Email Verification** - Confirm user identity before activation
- ✅ **Password Hashing** - ASP.NET Identity password security
- ✅ **Protected Routes** - Role-based access control

### 🤖 AI & Search Capabilities
- ✅ **AI-Powered Search** - Semantic music search with machine learning
- ✅ **Model Comparison** - Compare multiple AI models for search accuracy
- ✅ **Genius API Integration** - Fetch lyrics and song information
- ✅ **Smart Filtering** - Filter by genre, creator, date, and more

### 🖼️ Image Processing
- ✅ **Image Upload** - Drag-and-drop file upload with validation
- ✅ **Advanced Cropping** - Interactive crop tool with preview
- ✅ **Format Conversion** - Automatic image optimization
- ✅ **Local & CDN Storage** - Flexible storage options

### 📱 User Experience
- ✅ **Responsive Design** - Works on desktop, tablet, and mobile
- ✅ **Draggable Components** - Interactive UI elements
- ✅ **Real-time Updates** - Instant feedback on changes
- ✅ **Dark/Light Theme** - Styled Components for theming
- ✅ **Mobile Navigation** - Adaptive menu for small screens

---

## 🏗️ Architecture

### Microservices Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React 19)                       │
│          Single Page Application with Hooks & Context        │
└────────────────────┬────────────────────────────────────────┘
					 │
		┌────────────┼────────────┬──────────────┐
		│            │            │              │
		▼            ▼            ▼              ▼
	┌─────────┐ ┌────────┐ ┌──────────┐ ┌─────────┐
	│  Auth   │ │ Music  │ │   AI     │ │ Upload  │
	│Service  │ │Service │ │ Service  │ │ Service │
	│(.NET 10)│ │(Node)  │ │(Python)  │ │(Node)   │
	└────┬────┘ └───┬────┘ └────┬─────┘ └────┬────┘
		 │          │           │            │
		 ▼          ▼           ▼            ▼
	┌──────────────────────────────────────────┐
	│      Databases & External Services       │
	│  - SQL Server (Auth)                     │
	│  - MongoDB (Music Data)                  │
	│  - Google OAuth                          │
	│  - Genius API                            │
	│  - File Storage (uploads/)               │
	└──────────────────────────────────────────┘
```

### Design Patterns Used

| Pattern | Usage | File |
|---------|-------|------|
| **Layered Architecture** | Clear separation of concerns | Controllers → Services → Data |
| **Dependency Injection** | Automatic dependency management | `Program.cs` (DI Container) |
| **Strategy Pattern** | Dynamic operation handling | `RegisterStrategy`, `ChangePasswordStrategy` |
| **DTO Pattern** | Data validation & API contracts | `DTOs/` folder |
| **Repository Pattern** | Data access abstraction | Entity Framework Core |
| **Custom Hooks** | State logic reusability | `useMusicLibrary`, `useAuth` |
| **Context API** | Global state management | `AuthContext` |
| **Component Composition** | Reusable UI components | Forms, Components folders |

---

## 🛠️ Tech Stack

### Frontend
- **React 19.0** - Modern UI library with hooks
- **React Bootstrap 2.10** - Responsive UI components
- **Styled Components 6.1** - CSS-in-JS styling
- **React Image Crop 11.0** - Advanced image cropping
- **Croppie 2.6** - Alternative image manipulation
- **React Icons 5.4** - Comprehensive icon library
- **React Player 3.4** - Media playback
- **React Draggable 4.5** - Drag-and-drop components
- **React OAuth/Google 0.13** - Google authentication
- **lodash.debounce** - Performance optimization

### Backend Services

#### Authentication Service (ASP.NET Core .NET 10)
- **Entity Framework Core** - ORM for database operations
- **JWT Bearer Authentication** - Token-based auth
- **Microsoft.AspNetCore.Identity** - Password hashing
- **Google.Apis.Auth** - Google OAuth integration
- **DotNetEnv** - Environment variable management
- **SQL Server** - Primary database

#### Music Service (Node.js/Express)
- **Express.js** - Web framework
- **Mongoose** - MongoDB object modeling
- **Multer** - File upload handling
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment configuration
- **MongoDB** - NoSQL database

#### AI Service (Python)
- **FastAPI** or similar - API framework
- **TensorFlow/PyTorch** - ML model inference
- **scikit-learn** - Machine learning algorithms
- **Requests** - HTTP client for external APIs

### Developer Tools
- **Visual Studio 2026** - .NET IDE
- **Visual Studio Code** - Multi-purpose editor
- **npm** - JavaScript package manager
- **Git** - Version control
- **Docker** *(optional)* - Containerization

---

## 📁 Project Structure

```
my-react-app/
├── 📂 src/                          # Frontend (React)
│   ├── App.js                       # Main application component
│   ├── index.js                     # Entry point
│   ├── 📂 components/               # Reusable UI components
│   │   ├── ImageHandler.js          # Image upload & crop
│   │   ├── AuthContainer.js         # Authentication wrapper
│   │   ├── ProtectedRoute.js        # Route protection
│   │   ├── GeniusSearch.js          # Genius API search
│   │   └── ...
│   ├── 📂 forms/                    # Form components
│   │   ├── AlbumForm.js             # Album create/edit
│   │   ├── SongForm.js              # Song create/edit
│   │   ├── SingleForm.js            # Single create/edit
│   │   ├── ChangePasswordForm.js    # Password change
│   │   └── ...
│   ├── 📂 ai-components/            # AI-related components
│   │   ├── AISearch.js              # AI-powered search
│   │   └── ModelComparison.js       # AI model comparison
│   ├── 📂 context/                  # Global state (Context API)
│   │   ├── AuthContext.js           # Authentication state
│   │   └── ...
│   ├── 📂 hooks/                    # Custom React hooks
│   │   ├── useMusicLibrary.js       # Music data management
│   │   ├── useAuth.js               # Authentication hook
│   │   └── ...
│   ├── 📂 styles/                   # CSS & styled components
│   │   ├── App.css
│   │   ├── ImageHandler.css
│   │   └── ...
│   └── 📂 utils/                    # Helper functions
│       └── ...
│
├── 📂 backend/                      # Node.js Express Server
│   ├── server.js                    # Express app setup
│   ├── models.js                    # MongoDB schemas
│   ├── 📂 middleware/
│   │   ├── authMiddleware.js        # JWT verification
│   │   └── ...
│   ├── 📂 routes/                   # API endpoints
│   │   └── ...
│   ├── 📂 controllers/              # Business logic
│   │   └── ...
│   ├── 📂 ai-service/
│   │   ├── ai_search.py             # AI search implementation
│   │   └── requirements.txt         # Python dependencies
│   ├── uploads/                     # Cover image storage
│   ├── .env.example                 # Environment template
│   └── package.json
│
├── 📂 PlaylistService.Auth/         # ASP.NET Core Auth Service
│   ├── Program.cs                   # Configuration & startup
│   ├── 📂 Controllers/
│   │   └── AuthController.cs        # Auth endpoints
│   ├── 📂 Services/
│   │   ├── AuthService.cs           # Auth business logic
│   │   ├── TokenService.cs          # JWT generation
│   │   ├── EmailService.cs          # Email verification
│   │   └── IAuthService.cs          # Service interface
│   ├── 📂 Strategy/
│   │   ├── IAuthStrategy.cs         # Strategy interface
│   │   ├── RegisterStrategy.cs      # Registration logic
│   │   ├── ChangePasswordStrategy.cs
│   │   └── RemoveAccountStrategy.cs
│   ├── 📂 Models/
│   │   ├── User.cs                  # User entity
│   │   ├── JwtSettings.cs           # JWT configuration
│   │   └── GoogleSettings.cs        # Google OAuth config
│   ├── 📂 DTOs/                     # Data transfer objects
│   │   ├── RegisterDto.cs
│   │   ├── LoginDto.cs
│   │   ├── ChangePasswordDto.cs
│   │   └── ...
│   ├── 📂 Data/
│   │   ├── AuthDbContext.cs         # EF Core context
│   │   └── 📂 Migrations/           # Database migrations
│   ├── 📂 Properties/
│   │   └── launchSettings.json      # Debug settings
│   ├── appsettings.json             # Configuration
│   ├── appsettings.Development.json # Dev-specific config
│   ├── .env.example                 # Environment template
│   ├── README.md                    # Service documentation
│   └── PlaylistService.Auth.csproj  # Project file
│
├── 📂 public/                       # Static files
│   ├── index.html
│   ├── favicon.ico
│   └── ...
│
├── package.json                     # Frontend dependencies
├── .gitignore                       # Git exclusions
├── .env.example                     # Root environment template
└── README.md                        # This file
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 16+ (for frontend & backend services)
- **npm** 8+ (JavaScript package manager)
- **.NET SDK 10** (for ASP.NET Core auth service)
- **SQL Server** (LocalDB or full install)
- **MongoDB** (local or cloud Atlas)
- **Git** (version control)
- **Python 3.9+** *(optional, for AI service)*

### System Requirements

- **RAM**: 4GB minimum, 8GB recommended
- **Disk Space**: 2GB for dependencies
- **OS**: Windows 10+, macOS, or Linux

---

## 💾 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/sasha-1337/playlist_service.git
cd my-react-app
```

### 2. Install Frontend Dependencies

```bash
npm install
```

### 3. Install Backend Service Dependencies

```bash
cd backend
npm install
cd ..
```

### 4. Set Up Authentication Service

```bash
cd PlaylistService.Auth
dotnet restore
```

### 5. *(Optional)* Set Up Python AI Service

```bash
cd backend/ai-service
pip install -r requirements.txt
cd ../..
```

---

## ⚙️ Configuration

### Frontend Configuration

Create a `.env` file in the root directory:

```env
# === BACKEND URLS ===
REACT_APP_API_URL=http://localhost:5000
REACT_APP_AUTH_SERVICE_URL=http://localhost:5001
REACT_APP_AI_SERVICE_URL=http://localhost:8000

# === GOOGLE OAUTH ===
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com

# === GENIUS API ===
REACT_APP_GENIUS_ACCESS_TOKEN=your-genius-token

# === DEVELOPMENT ===
REACT_APP_DEBUG=true
```

### Backend (Node.js) Configuration

Create `backend/.env`:

```env
# === DATABASE ===
MONGODB_URI=mongodb://localhost:27017/playlist_service
# Or MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/playlist_service

# === SERVER ===
PORT=5000
SERVER_URL=http://localhost:5000
NODE_ENV=development

# === CORS ===
CORS_ORIGIN=http://localhost:3000,http://localhost:3001

# === AUTH SERVICE ===
AUTH_SERVICE_URL=http://localhost:5001
JWT_SECRET=your-jwt-secret-key

# === GENIUS API ===
GENIUS_ACCESS_TOKEN=your-genius-api-token

# === FILE UPLOADS ===
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880
```

### Authentication Service (.NET) Configuration

Create `PlaylistService.Auth/.env`:

```env
# === DATABASE ===
ConnectionStrings__DefaultConnection=Server=(localdb)\mssqllocaldb;Database=PlaylistServiceAuthDb;Trusted_Connection=true;

# === JWT ===
Jwt__SecretKey=your-super-secret-key-minimum-32-characters-long!!!
Jwt__Issuer=PlaylistService
Jwt__Audience=PlaylistServiceClients

# === GOOGLE OAUTH ===
Google__ClientId=your-google-client-id.apps.googleusercontent.com
Google__ClientSecret=your-google-client-secret

# === SERVER ===
ASPNETCORE_ENVIRONMENT=Development
ASPNETCORE_URLS=https://localhost:7001;http://localhost:5001

# === CORS ===
AllowedOrigins=http://localhost:3000,http://localhost:3001
```

### Database Setup

#### MongoDB (Music Service)

```bash
# Option 1: Local MongoDB
# Start MongoDB server on localhost:27017

# Option 2: MongoDB Atlas (Cloud)
# Update MONGODB_URI in backend/.env with your connection string
```

#### SQL Server (Auth Service)

```bash
# Create migrations (from PlaylistService.Auth directory)
cd PlaylistService.Auth
dotnet ef migrations add InitialCreate
dotnet ef database update
cd ..
```

---

## ▶️ Running the Application

### Development Mode

#### Terminal 1: Frontend (React)

```bash
npm start
```

Runs on: `http://localhost:3000`

#### Terminal 2: Backend Service (Node.js)

```bash
cd backend
npm start
```

Runs on: `http://localhost:5000`

#### Terminal 3: Authentication Service (.NET)

```bash
cd PlaylistService.Auth
dotnet run
```

Runs on: `https://localhost:7001`

#### Terminal 4: *(Optional)* AI Service (Python)

```bash
cd backend/ai-service
python main.py
```

Runs on: `http://localhost:8000`

### Production Build

```bash
# Frontend
npm run build

# Backend
# Prepare Node service for production deployment

# Auth Service
dotnet publish -c Release

# AI Service
# Containerize with Docker for production
```

---

## 📡 API Documentation

### Authentication Service (ASP.NET Core)

**Base URL**: `https://localhost:7001/api/auth`

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "john_doe",
  "password": "SecurePassword123",
  "confirmPassword": "SecurePassword123"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

#### Google OAuth Login
```http
POST /api/auth/google-login-oauth
Content-Type: application/json

{
  "credential": "google-id-token"
}
```

#### Verify Email
```http
POST /api/auth/verify-email
Content-Type: application/json

{
  "email": "user@example.com",
  "code": "123456"
}
```

#### Change Password
```http
POST /api/auth/change-password
Authorization: Bearer {jwt-token}
Content-Type: application/json

{
  "oldPassword": "OldPassword123",
  "newPassword": "NewPassword123",
  "confirmPassword": "NewPassword123"
}
```

### Music Service (Node.js)

**Base URL**: `http://localhost:5000/api`

#### Get All Albums
```http
GET /api/albums
Authorization: Bearer {jwt-token}
```

#### Create Album
```http
POST /api/albums
Authorization: Bearer {jwt-token}
Content-Type: application/json

{
  "name": "Album Name",
  "creator": "Artist Name",
  "genre": "Genre",
  "description": "Album description",
  "coverImage": "image-url"
}
```

#### Get Album by ID
```http
GET /api/albums/:id
Authorization: Bearer {jwt-token}
```

#### Update Album
```http
PUT /api/albums/:id
Authorization: Bearer {jwt-token}
Content-Type: application/json

{
  "name": "Updated Name",
  ...
}
```

#### Delete Album
```http
DELETE /api/albums/:id
Authorization: Bearer {jwt-token}
```

#### Add Song to Album
```http
POST /api/albums/:id/songs
Authorization: Bearer {jwt-token}
Content-Type: application/json

{
  "name": "Song Name",
  "lyrics": "Song lyrics",
  "description": "Song description",
  "media": [
	{
	  "provider": "youtube",
	  "url": "https://youtube.com/..."
	}
  ]
}
```

#### Upload Cover Image
```http
POST /api/upload
Authorization: Bearer {jwt-token}
Content-Type: multipart/form-data

file: [binary image data]
```

### AI Search Service (Python)

**Base URL**: `http://localhost:8000/api`

#### AI Search
```http
POST /api/search/ai
Authorization: Bearer {jwt-token}
Content-Type: application/json

{
  "query": "upbeat rock songs",
  "model": "semantic-search",
  "limit": 10
}
```

#### Compare Models
```http
POST /api/search/compare
Authorization: Bearer {jwt-token}
Content-Type: application/json

{
  "query": "sad piano music",
  "models": ["model1", "model2", "model3"]
}
```

---

## 🔧 Development

### Code Style & Conventions

- **JavaScript/React**: ES6+, camelCase naming, Functional Components with Hooks
- **C# (.NET)**: PascalCase, async/await, SOLID principles
- **Python**: PEP 8, snake_case, type hints (optional)

### Running Tests

```bash
# Frontend tests
npm test

# Backend tests
cd backend
npm test
cd ..

# .NET tests
cd PlaylistService.Auth
dotnet test
cd ..
```

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Commit with conventional commits
git commit -m "feat: add album filtering"

# Push to remote
git push origin feature/your-feature-name

# Create Pull Request on GitHub
```

### Environment & Debug

**Frontend Debug Mode:**
```javascript
// Set REACT_APP_DEBUG=true in .env
if (process.env.REACT_APP_DEBUG) {
  console.log('Debug mode enabled');
}
```

**Backend Debug Mode:**
```bash
# Node.js
node --inspect server.js

# .NET
dotnet run --configuration Debug
```

---

## 🐛 Troubleshooting

### Frontend Issues

**Port 3000 already in use:**
```bash
npm start -- --port 3001
```

**CORS errors:**
- Ensure `AllowedOrigins` includes your frontend URL in `.env`
- Check that backend services are running

**Authentication token expired:**
- Use refresh token endpoint
- Log in again to get new token

### Backend Issues

**MongoDB connection failed:**
- Ensure MongoDB is running: `mongod`
- Check `MONGODB_URI` in `.env`

**JWT secret key error in .NET:**
- Generate new key: 
```powershell
[System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```
- Update `Jwt__SecretKey` in `.env`

**Port already in use:**
```bash
# Find process using port
netstat -ano | findstr :5000

# Kill process (replace PID)
taskkill /PID <PID> /F
```

### General Issues

**Dependencies not installed:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Database migrations failed:**
```bash
# Rollback migration
cd PlaylistService.Auth
dotnet ef migrations remove
# Fix issues and try again
```

---

## 👨‍💻 Author

**Sasha** - [GitHub Profile](https://github.com/sasha-1337)

---

## 🙏 Acknowledgments

- React documentation and community
- ASP.NET Core best practices
- MongoDB documentation
- Google OAuth developers
- Genius API team
- All open-source libraries used in this project

---

## 📊 Project Stats

- **Frontend**: React 19 with 10+ custom components
- **Backend**: 3 microservices (Node.js, .NET, Python)
- **Database**: MongoDB + SQL Server
- **API Endpoints**: 50+ endpoints
- **Features**: 20+ major features

---

**Last Updated**: 2025  
**Version**: 0.1.0  
**Status**: Active Development

---
