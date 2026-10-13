# 🔐 PlaylistService.Auth — Authentication Microservice (.NET 10)

<p align="left">
  <a href="README.en.md"><b>🇬🇧 English</b></a> | 
  <a href="README.md"><b>🇺🇦 Українська</b></a>
</p>

> **High-performance authentication and user identity microservice built on ASP.NET Core Web API, Entity Framework Core, and Microsoft SQL Server.**

---

## 📋 Table of Contents

- [Architecture Overview](#-architecture-overview)
- [Key Features](#-key-features)
- [Design Patterns](#-design-patterns)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
  - [1. Install Dependencies](#1-install-dependencies)
  - [2. Environment Configuration (.env)](#2-environment-configuration-env)
  - [3. Apply Database Migrations](#3-apply-database-migrations)
  - [4. Run the Service](#4-run-the-service)
- [API Endpoints Specification](#-api-endpoints-specification)
- [JWT & Refresh Tokens](#-jwt--refresh-tokens)
- [Security](#-security)

---

## 🏛️ Architecture Overview

`PlaylistService.Auth` serves as the centralized identity provider for the Playlist Service platform. It issues digitally signed **JWT tokens (HMAC-SHA256)** that clients (React Frontend) present to access the Express.js / MongoDB music catalog.

```
                      ┌──────────────────────┐
                      │    React Frontend    │
                      └───────┬──────┬───────┘
          Login / Register    │      │  Bearer JWT Token
         Refresh / Verify     │      │
                              ▼      ▼
    ┌───────────────────────────┐  ┌───────────────────────────┐
    │    PlaylistService.Auth   │  │   Express Music Service   │
    │   (ASP.NET Core Web API)  │  │  (Node.js / Express / DB) │
    └─────────────┬─────────────┘  └─────────────┬─────────────┘
                  │                              │
                  ▼                              ▼
          ┌───────────────┐              ┌───────────────┐
          │  SQL Server   │              │    MongoDB    │
          │   (Users &    │              │  (Albums &    │
          │PendingActions)│              │    Singles)   │
          └───────────────┘              └───────────────┘
```

---

## ✨ Key Features

- 🔑 **JWT Access Tokens**: 7-day expiration with custom claims (`sub`, `email`, `name`).
- 🔄 **Refresh Token Rotation**: Database-persisted refresh tokens with expiration tracking and revocation on logout.
- ✉️ **Two-Factor Email Verification**:
  - Generation of random 6-digit confirmation codes.
  - Temporary state persistence in `PendingActions` (15-minute expiration window).
  - Outgoing delivery via SMTP using MailKit & Mailtrap sandbox.
- 🧩 **Strategy Pattern**: Extensible code-confirmation handling (registration, password changes, account deletion).
- 🌐 **Google OAuth 2.0**: Direct server-side signature verification of Google ID tokens via `Google.Apis.Auth`.
- 🛡️ **Cryptographic Password Hashing**: PBKDF2 with salt via `Microsoft.AspNetCore.Identity.PasswordHasher<User>`.
- 📑 **Swagger / OpenAPI**: Interactive endpoint documentation (`/openapi/v1.json`).

---

## 🧩 Design Patterns

### Strategy Pattern for Confirmation Workflows

All operations requiring confirmation codes received via email implement the `IAuthStrategy` interface:

```csharp
public interface IAuthStrategy
{
    string ActionType { get; }
    Task<AuthResponseDto> ExecuteAsync(string email, string jsonData, int? userId);
}
```

| Strategy | `ActionType` | Action Executed Upon Code Validation |
|---|---|---|
| **`RegisterStrategy`** | `"Register"` | Creates user record in SQL Server, hashes password, flags `IsEmailConfirmed = true`, and returns JWT + Refresh Token pair. |
| **`ChangePasswordStrategy`** | `"ChangePassword"` | Updates user's password hash in SQL Server after successful email verification. |
| **`RemoveAccountStrategy`** | `"RemoveAccount"` | Permanently removes user account from SQL Server. |

---

## 🛠️ Tech Stack

- **Runtime**: .NET 10 (`net10.0`) Web API
- **ORM**: Entity Framework Core 10 (`Microsoft.EntityFrameworkCore.SqlServer`)
- **Database**: Microsoft SQL Server (LocalDB / Express / Docker)
- **Authentication**: `Microsoft.AspNetCore.Authentication.JwtBearer`
- **Email Delivery**: `MailKit` and `MimeKit`
- **Google OAuth**: `Google.Apis.Auth`
- **Environment Management**: `DotNetEnv` (loads `.env` files)

---

## 📁 Project Structure

```
PlaylistService.Auth/
├── Controllers/
│   └── AuthController.cs          # API Controller (/api/auth/*)
├── Data/
│   ├── AuthDbContext.cs           # EF Core Database Context
│   └── Migrations/                # SQL Server Schema Migrations
├── DTOs/                          # Data Transfer Objects
│   ├── AuthResponseDto.cs         # Unified Auth Response
│   ├── RegisterDto.cs             # Registration Payload
│   ├── VerifyEmailDto.cs          # Verification Code Payload
│   ├── LoginDto.cs                # Login Credentials Payload
│   ├── GoogleAuthRequestDto.cs    # Google ID Token Payload
│   ├── RefreshTokenDto.cs         # Token Refresh Payload
│   ├── ChangePasswordDto.cs       # Password Modification Payload
│   └── RemoveUserDto.cs           # Account Deletion Payload
├── Models/
│   ├── User.cs                    # User Database Entity
│   └── PendingAction.cs           # Temporary Code Entity (15-min TTL)
├── Strategy/                      # Strategy Pattern Implementation
│   ├── IAuthStrategy.cs           # Strategy Interface
│   ├── RegisterStrategy.cs        # Registration Logic
│   ├── ChangePasswordStrategy.cs  # Password Change Logic
│   └── RemoveAccountStrategy.cs   # Account Removal Logic
├── Services/                      # Service Layer
│   ├── IAuthService.cs / AuthService.cs
│   ├── ITokenService.cs / TokenService.cs
│   └── IEmailService.cs / EmailService.cs
├── EnvSettingModels/              # Strongly-typed configuration POCOs
│   ├── JwtSettings.cs
│   └── GoogleSettings.cs
├── appsettings.json               # Default settings
├── appsettings.Development.json   # Local developer settings
├── .env.example                   # Environment variables template
├── Program.cs                     # Entry point & DI composition root
├── README.md                      # Ukrainian Documentation
├── README.en.md                   # English Documentation
└── PlaylistService.Auth.csproj
```

---

## 🚀 Quick Start

### 1. Install Dependencies

Ensure [.NET SDK 10](https://dotnet.microsoft.com/download) is installed:

```bash
cd PlaylistService.Auth
dotnet restore
```

### 2. Environment Configuration (.env)

Create a `.env` file based on `.env.example`:

```bash
copy .env.example .env
```

Populate the configuration:

```env
# === Database Connection (SQL Server LocalDB) ===
ConnectionStrings__DefaultConnection=Server=(localdb)\mssqllocaldb;Database=PlaylistServiceAuthDb;Trusted_Connection=True;TrustServerCertificate=True;

# === JWT Settings ===
# Generate a unique 32+ byte key!
Jwt__SecretKey=your_super_secret_jwt_key_minimum_32_characters_here
Jwt__Issuer=PlaylistService
Jwt__Audience=PlaylistServiceClients

# === Google OAuth 2.0 ===
Google__ClientId=your_google_client_id.apps.googleusercontent.com
Google__ClientSecret=your_google_client_secret

# === Kestrel Ports ===
ASPNETCORE_ENVIRONMENT=Development
ASPNETCORE_URLS=https://localhost:7001;http://localhost:5001

# === CORS (Frontend URLs) ===
AllowedOrigins=http://localhost:3000,http://localhost:3001

# === Mailtrap / SMTP Settings ===
EmailSettings__SmtpServer=sandbox.smtp.mailtrap.io
EmailSettings__Port=2525
EmailSettings__SenderName=Music Playlist Service
EmailSettings__SenderEmail=no-reply@playlistservice.com
EmailSettings__Username=your_mailtrap_username
EmailSettings__Password=your_mailtrap_password
```

> [!TIP]
> **Generating a secure JWT Secret Key in PowerShell:**
> ```powershell
> [System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
> ```

### 3. Apply Database Migrations

Apply existing Entity Framework Core migrations to your SQL Server instance:

```bash
dotnet ef database update
```

*(Install CLI tool if missing: `dotnet tool install --global dotnet-ef`)*

### 4. Run the Service

```bash
dotnet run
```

The service will be listening on:
- **HTTPS**: `https://localhost:7001`
- **HTTP**: `http://localhost:5001`
- **Swagger UI**: `https://localhost:7001/swagger` (in Development mode)

---

## 📚 API Endpoints Specification

Base Route: `https://localhost:7001/api/auth`

### 1. Registration (Step 1: Code Dispatch)
- **Method**: `POST /api/auth/register`
- **Request Body**:
  ```json
  {
    "username": "johndoe",
    "email": "johndoe@example.com",
    "password": "StrongPassword123!",
    "confirmPassword": "StrongPassword123!"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Confirmation code sent to your email",
    "token": null,
    "user": null
  }
  ```

### 2. Verify Email (Step 2: Code Validation & Account Activation)
- **Method**: `POST /api/auth/verify-email`
- **Request Body**:
  ```json
  {
    "email": "johndoe@example.com",
    "code": "482910"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "User registered and verified successfully",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "d8e3b794-...",
    "user": {
      "id": 1,
      "email": "johndoe@example.com",
      "username": "johndoe",
      "createdAt": "2026-05-25T14:00:00Z"
    }
  }
  ```

### 3. Login
- **Method**: `POST /api/auth/login`
- **Request Body**:
  ```json
  {
    "email": "johndoe@example.com",
    "password": "StrongPassword123!"
  }
  ```
- **Response (200 OK)**: Returns `token`, `refreshToken`, and `user` object.

### 4. Google OAuth Sign-In
- **Method**: `POST /api/auth/google-login-oauth`
- **Request Body**:
  ```json
  {
    "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI..."
  }
  ```
- **Response (200 OK)**: Returns validated token pair and user profile.

### 5. Refresh Token
- **Method**: `POST /api/auth/refresh-token`
- **Request Body**:
  ```json
  {
    "accessToken": "eyJhbGciOiJIUzI1Ni...",
    "refreshToken": "d8e3b794-..."
  }
  ```
- **Response (200 OK)**: New token pair `{ token, refreshToken }`.

### 6. Change Password
- **Method**: `POST /api/auth/change-password`
- **Headers**: `Authorization: Bearer <access_token>`
- **Request Body**:
  ```json
  {
    "oldPassword": "CurrentPassword123!",
    "newPassword": "NewSecurePassword456!",
    "confirmPassword": "NewSecurePassword456!"
  }
  ```

### 7. Logout
- **Method**: `POST /api/auth/logout`
- **Headers**: `Authorization: Bearer <access_token>`
- **Response (200 OK)**: Revokes active Refresh Token in SQL Server.

### 8. Remove Account
- **Method**: `DELETE /api/auth/remove-account`
- **Headers**: `Authorization: Bearer <access_token>`
- **Request Body**:
  ```json
  {
    "password": "CurrentPassword123!"
  }
  ```

---

## 🔐 JWT & Refresh Tokens

- **Claims**:
  - `sub`: Unique user identifier (`UserId`).
  - `email`: User email address.
  - `name`: Username.
- **Signing Algorithm**: HMAC-SHA256 (`SecurityAlgorithms.HmacSha256`).
- **Express Service Synchronization**: The `Jwt__SecretKey` value in `PlaylistService.Auth` must match `JWT_SECRET` in Node.js for cross-service token authentication to succeed.

---

## 🔒 Security

> [!CAUTION]
> Never commit actual `.env` files, production JWT secrets, or database credentials to a public repository. Keep all sensitive files in `.gitignore`.
