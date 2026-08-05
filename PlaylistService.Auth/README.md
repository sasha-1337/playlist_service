# PlaylistService.Auth - Authentication Service

Сервіс автентифікації на C# ASP.NET Core для Playlist Service.

## 🚀 Налаштування

### 1. Встановлення залежностей

```bash
cd PlaylistService.Auth
dotnet restore
```

### 2. Налаштування змінних середовища

1. Скопіюйте `.env.example` в `.env`:
```bash
copy .env.example .env
```

2. Оновіть значення в `.env`:
```env
# === DATABASE ===
ConnectionStrings__DefaultConnection=Server=(localdb)\\mssqllocaldb;Database=PlaylistServiceAuthDb;Trusted_Connection=true;

# === JWT SECRETS (Генеруйте свій secret key!) ===
# Генератор: [System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
Jwt__SecretKey=your-super-secret-key-minimum-32-characters-required-here!!!
Jwt__Issuer=PlaylistService
Jwt__Audience=PlaylistServiceClients

# === ASPNETCORE ===
ASPNETCORE_ENVIRONMENT=Development
ASPNETCORE_URLS=https://localhost:7001;http://localhost:5001

# === CORS (Додайте URL вашого фронтенду) ===
AllowedOrigins=http://localhost:3000,http://localhost:3001
```

### 📋 Структура конфігурації

| Файл | Вміст | Коммітити? |
|------|-------|-----------|
| **appsettings.json** | Логування, порти, некритичні налаштування | ✅ ДА |
| **.env** | Чутливі дані (БД, ключі, токени) | ❌ НІ |
| **.env.example** | Приклад для розробників | ✅ ДА |

**Ієрархія конфігурації:**
1. `appsettings.json` (базові налаштування)
2. `appsettings.Development.json` (розробка)
3. `.env` (override критичних параметрів)

### 3. Створення бази даних

```bash
dotnet ef migrations add InitialCreate
dotnet ef database update
```

### 4. Запуск проекту

```bash
dotnet run
```

Сервіс буде доступний на: `https://localhost:7001`

---

## 📚 API Endpoints

### POST `/api/auth/register`

Реєстрація нового користувача.

**Запит:**
```json
{
  "email": "user@example.com",
  "username": "john_doe",
  "password": "SecurePassword123",
  "confirmPassword": "SecurePassword123"
}
```

**Відповідь (200 OK):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": null,
  "user": null
}
```

---

### POST `/api/auth/login`

Логін користувача.

**Запит:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

**Відповідь (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "john_doe",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

## 🔐 JWT Token

Токен містить такі claims:
- `NameIdentifier` - ID користувача
- `Email` - Email користувача
- `Name` - Username

Термін дії токена: **7 днів**

---

## 📦 Структура проекту

```
PlaylistService.Auth/
├── Controllers/          # API контролери
│   └── AuthController.cs
├── Models/              # Моделі БД
│   └── User.cs
├── DTOs/                # Data Transfer Objects
│   ├── RegisterDto.cs
│   ├── LoginDto.cs
│   └── AuthResponseDto.cs
├── Services/            # Бізнес логіка
│   ├── IAuthService.cs
│   └── AuthService.cs
├── Data/                # Entity Framework контекст
│   └── AuthDbContext.cs
├── .env                 # Змінні середовища (НЕ комітьте!)
├── .env.example         # Приклад змінних (комітьте)
├── appsettings.json     # Конфігурація (за замовчуванням)
└── Program.cs           # Точка входу
```

---

## 🔑 Генерування Secret Key

Для генерування безпечного secret key:

```powershell
[System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

---

## 🗄️ База даних

**SQL Server LocalDB** з таблицею `Users`:

| Поле | Тип | Опис |
|------|-----|------|
| Id | int (PK) | Унікальний ідентифікатор |
| Email | string (UK) | Email користувача |
| Username | string (UK) | Username користувача |
| PasswordHash | string | Хешований пароль |
| CreatedAt | datetime | Дата реєстрації |
| LastLogin | datetime? | Остання авторизація |
| IsActive | bool | Активний статус |
| RefreshToken | string | Refresh token |
| RefreshTokenExpiryTime | datetime? | Час закінчення refresh token |

---

## 🛠️ Розробка

### Запуск з Hot Reload

```bash
dotnet watch run
```

### Запуск тестів

```bash
dotnet test
```

### Міграції БД

```bash
# Додати нову міграцію
dotnet ef migrations add MigrationName

# Видалити останню міграцію
dotnet ef migrations remove

# Оновити БД
dotnet ef database update

# Скасувати останню міграцію
dotnet ef database update PreviousMigrationName
```

---

## 🐛 Логування

Логи налаштовуються через `.env`:

```env
Logging__LogLevel__Default=Information
Logging__LogLevel__Microsoft.AspNetCore=Warning
```

---

## 📝 Ліцензія

MIT

---

## 👨‍💻 Автор

Sasha | Playlist Service
