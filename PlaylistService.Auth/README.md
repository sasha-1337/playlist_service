# 🔐 PlaylistService.Auth — Сервіс Автентифікації (.NET 10)

<p align="left">
  <a href="README.en.md"><b>🇬🇧 English</b></a> | 
  <a href="README.md"><b>🇺🇦 Українська</b></a>
</p>

> **Високопродуктивний мікросервіс автентифікації та управління користувачами на базі ASP.NET Core Web API, Entity Framework Core та SQL Server.**

---

## 📋 Зміст

- [Огляд архітектури](#-огляд-архітектури)
- [Ключові можливості](#-ключові-можливості)
- [Патерни проектування](#-патерни-проектування)
- [Технологічний стек](#-технологічний-стек)
- [Структура проекту](#-структура-проекту)
- [Швидкий старт](#-швидкий-старт)
  - [1. Встановлення залежностей](#1-встановлення-залежностей)
  - [2. Змінні середовища (.env)](#2-змінні-середовища-env)
  - [3. Міграції бази даних](#3-міграції-бази-даних)
  - [4. Запуск сервісу](#4-запуск-сервісу)
- [Специфікація API Endpoints](#-специфікація-api-endpoints)
- [JWT та Refresh Tokens](#-jwt-та-refresh-tokens)
- [Безпека](#-безпека)

---

## 🏛️ Огляд архітектури

`PlaylistService.Auth` забезпечує централізовану автентифікацію для екосистеми Playlist Service. Сервіс генерує підписані токени **JWT (HMAC-SHA256)**, які використовуються клієнтом (React Frontend) для доступу до музичного сервісу (Express.js/MongoDB).

```
                      ┌──────────────────────┐
                      │   React Frontend     │
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

## ✨ Ключові можливості

- 🔑 **JWT Access Tokens**: Термін дії 7 днів, містять claims (`sub`, `email`, `name`).
- 🔄 **Refresh Token Rotation**: Довготривалі токени, збережені у базі даних SQL Server, із можливістю відклику при виході.
- ✉️ **Двоетапна перевірка пошти (Email Verification)**:
  - Генерація 6-значного одноразового коду підтвердження.
  - Тимчасове збереження в таблиці `PendingActions` (час життя 15 хвилин).
  - Відправка через SMTP (MailKit / Mailtrap sandbox).
- 🧩 **Strategy Pattern**: Гнучка обробка підтвердження дій через код (реєстрація, зміна пароля, видалення облікового запису).
- 🌐 **Google OAuth 2.0**: Валідація токенів Google безпосередньо через `GoogleJsonWebSignature` SDK.
- 🛡️ **Хешування паролів**: Надійний алгоритм PBKDF2 через `PasswordHasher<User>` від `Microsoft.AspNetCore.Identity`.
- 📑 **Swagger / OpenAPI**: Автоматична інтерактивна документація ендпоінтів (`/openapi/v1.json`).

---

## 🧩 Патерни проектування

### Strategy Pattern для операцій підтвердження

Усі операції, які вимагають коду з електронної пошти, реалізовано через інтерфейс `IAuthStrategy`:

```csharp
public interface IAuthStrategy
{
    string ActionType { get; }
    Task<AuthResponseDto> ExecuteAsync(string email, string jsonData, int? userId);
}
```

| Стратегія | `ActionType` | Опис дії після введення коду |
|-----------|--------------|------------------------------|
| **`RegisterStrategy`** | `"Register"` | Створює користувача в БД, хешує пароль, активує `IsEmailConfirmed = true` та видає токени. |
| **`ChangePasswordStrategy`** | `"ChangePassword"` | Оновлює пароль користувача на новий хеш після успішної перевірки пошти. |
| **`RemoveAccountStrategy`** | `"RemoveAccount"` | Безповоротно видаляє обліковий запис із SQL Server. |

---

## 🛠️ Технологічний стек

- **Платформа**: .NET 10 (`net10.0`) Web API
- **ORM**: Entity Framework Core 10 (`Microsoft.EntityFrameworkCore.SqlServer`)
- **База даних**: Microsoft SQL Server (LocalDB / Express / Docker)
- **Автентифікація**: `Microsoft.AspNetCore.Authentication.JwtBearer`
- **Email клієнт**: `MailKit` та `MimeKit`
- **Google OAuth**: `Google.Apis.Auth`
- **Конфігурація**: `DotNetEnv` (підтримка `.env` файлів)

---

## 📁 Структура проекту

```
PlaylistService.Auth/
├── Controllers/
│   └── AuthController.cs          # Контролер API (/api/auth/*)
├── Data/
│   ├── AuthDbContext.cs           # EF Core контекст бази даних
│   └── Migrations/                # Міграції SQL Server
├── DTOs/                          # Об'єкти передачі даних
│   ├── AuthResponseDto.cs         # Стандартизована відповідь авторизації
│   ├── RegisterDto.cs             # Запит на реєстрацію
│   ├── VerifyEmailDto.cs          # Запит на підтвердження коду
│   ├── LoginDto.cs                # Запит на вхід
│   ├── GoogleAuthRequestDto.cs    # Запит Google OAuth
│   ├── RefreshTokenDto.cs         # Запит оновлення пари токенів
│   ├── ChangePasswordDto.cs       # Запит зміни пароля
│   └── RemoveUserDto.cs           # Запит видалення акаунта
├── Models/
│   ├── User.cs                    # Модель сутності користувача
│   └── PendingAction.cs           # Модель тимчасової дії з кодом
├── Strategy/                      # Реалізація Strategy Pattern
│   ├── IAuthStrategy.cs           # Базовий інтерфейс
│   ├── RegisterStrategy.cs        # Стратегія реєстрації
│   ├── ChangePasswordStrategy.cs  # Стратегія зміни пароля
│   └── RemoveAccountStrategy.cs   # Стратегія видалення акаунта
├── Services/                      # Бізнес-логіка
│   ├── IAuthService.cs / AuthService.cs
│   ├── ITokenService.cs / TokenService.cs
│   └── IEmailService.cs / EmailService.cs
├── EnvSettingModels/              # Strongly-typed конфігурації
│   ├── JwtSettings.cs
│   └── GoogleSettings.cs
├── appsettings.json               # Базові налаштування
├── appsettings.Development.json   # Локальні dev-налаштування
├── .env.example                   # Шаблон змінних середовища
├── Program.cs                     # Точка входу та налаштування DI
└── PlaylistService.Auth.csproj
```

---

## 🚀 Швидкий старт

### 1. Встановлення залежностей

Переконайтеся, що встановлено [.NET SDK 10](https://dotnet.microsoft.com/download):

```bash
cd PlaylistService.Auth
dotnet restore
```

### 2. Змінні середовища (.env)

Створіть файл `.env` на основі шаблону `.env.example`:

```bash
copy .env.example .env
```

Заповніть конфігурацію:

```env
# === База даних (SQL Server LocalDB) ===
ConnectionStrings__DefaultConnection=Server=(localdb)\mssqllocaldb;Database=PlaylistServiceAuthDb;Trusted_Connection=True;TrustServerCertificate=True;

# === JWT налаштування ===
# Згенеруйте унікальний 32+ байтний ключ!
Jwt__SecretKey=your_super_secret_jwt_key_minimum_32_characters_here
Jwt__Issuer=PlaylistService
Jwt__Audience=PlaylistServiceClients

# === Google OAuth 2.0 ===
Google__ClientId=your_google_client_id.apps.googleusercontent.com
Google__ClientSecret=your_google_client_secret

# === Kestrel порти ===
ASPNETCORE_ENVIRONMENT=Development
ASPNETCORE_URLS=https://localhost:7001;http://localhost:5001

# === CORS (URL фронтенду) ===
AllowedOrigins=http://localhost:3000,http://localhost:3001

# === Mailtrap / SMTP ===
EmailSettings__SmtpServer=sandbox.smtp.mailtrap.io
EmailSettings__Port=2525
EmailSettings__SenderName=Music Playlist Service
EmailSettings__SenderEmail=no-reply@playlistservice.com
EmailSettings__Username=your_mailtrap_username
EmailSettings__Password=your_mailtrap_password
```

> [!TIP]
> **Генерація безпечного JWT Secret Key (PowerShell):**
> ```powershell
> [System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
> ```

### 3. Міграції бази даних

Застосуйте існуючі міграції Entity Framework Core:

```bash
dotnet ef database update
```

*(Якщо CLI-інструмент ще не встановлено: `dotnet tool install --global dotnet-ef`)*

### 4. Запуск сервісу

```bash
dotnet run
```

Сервіс запуститься на:
- **HTTPS**: `https://localhost:7001`
- **HTTP**: `http://localhost:5001`
- **Swagger UI**: `https://localhost:7001/swagger` (у Development режимі)

---

## 📚 Специфікація API Endpoints

Базовий маршрут: `https://localhost:7001/api/auth`

### 1. Реєстрація (Крок 1: відправка коду)
- **Метод**: `POST /api/auth/register`
- **Тіло запиту**:
  ```json
  {
    "username": "johndoe",
    "email": "johndoe@example.com",
    "password": "StrongPassword123!",
    "confirmPassword": "StrongPassword123!"
  }
  ```
- **Відповідь (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Confirmation code sent to your email",
    "token": null,
    "user": null
  }
  ```

### 2. Підтвердження Email (Крок 2: верифікація та активація)
- **Метод**: `POST /api/auth/verify-email`
- **Тіло запиту**:
  ```json
  {
    "email": "johndoe@example.com",
    "code": "482910"
  }
  ```
- **Відповідь (200 OK)**:
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

### 3. Авторизація (Логін)
- **Метод**: `POST /api/auth/login`
- **Тіло запиту**:
  ```json
  {
    "email": "johndoe@example.com",
    "password": "StrongPassword123!"
  }
  ```
- **Відповідь (200 OK)**: Повертає `token`, `refreshToken` та об'єкт `user`.

### 4. Вхід через Google OAuth
- **Метод**: `POST /api/auth/google-login-oauth`
- **Тіло запиту**:
  ```json
  {
    "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI..."
  }
  ```
- **Відповідь (200 OK)**: Повертає валідну пару токенів та дані користувача.

### 5. Оновлення токенів (Refresh Token)
- **Метод**: `POST /api/auth/refresh-token`
- **Тіло запиту**:
  ```json
  {
    "accessToken": "eyJhbGciOiJIUzI1Ni...",
    "refreshToken": "d8e3b794-..."
  }
  ```
- **Відповідь (200 OK)**: Нова пара токенів `{ token, refreshToken }`.

### 6. Зміна пароля
- **Метод**: `POST /api/auth/change-password`
- **Заголовки**: `Authorization: Bearer <access_token>`
- **Тіло запиту**:
  ```json
  {
    "oldPassword": "CurrentPassword123!",
    "newPassword": "NewSecurePassword456!",
    "confirmPassword": "NewSecurePassword456!"
  }
  ```

### 7. Вихід із системи (Logout)
- **Метод**: `POST /api/auth/logout`
- **Заголовки**: `Authorization: Bearer <access_token>`
- **Відповідь (200 OK)**: Анулює збережений Refresh Token у базі даних.

### 8. Видалення облікового запису
- **Метод**: `DELETE /api/auth/remove-account`
- **Заголовки**: `Authorization: Bearer <access_token>`
- **Тіло запиту**:
  ```json
  {
    "password": "CurrentPassword123!"
  }
  ```

---

## 🔐 JWT та Refresh Tokens

- **Claims**:
  - `sub`: Унікальний ідентифікатор користувача (`UserId`).
  - `email`: Адреса електронної пошти.
  - `name`: Ім'я користувача (`Username`).
- **Алгоритм підпису**: HMAC-SHA256 (`SecurityAlgorithms.HmacSha256`).
- **Синхронізація з Express Music Service**: Значення `Jwt__SecretKey` у `PlaylistService.Auth` повинно бути ідентичним значенню `JWT_SECRET` у сервісі Node.js для успішної валідації запитів.

---

## 🔒 Безпека

> [!CAUTION]
> Ніколи не комітьте реальні `.env` файли, секретні ключі JWT або паролі бази даних до публічного репозиторію. Усі конфіденційні файли мають знаходитися у `.gitignore`.
