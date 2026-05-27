# Todo App 

Full-stack task manager with categories, JWT auth + refresh tokens, search/filter, and infinite scroll.

## Stack

- **Backend:** ASP.NET Core 8, EF Core, PostgreSQL, Identity + JWT
- **Frontend:** Angular 19, Tailwind CSS

## Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download)
- [Node.js 20+](https://nodejs.org/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for PostgreSQL)

## Important: folder name `to-do(c#)`

The **`#` character in the path** breaks Angular/Vite dev server (MIME type errors in browser).

**Use the junction path** (already created on this machine):

```
E:\projects\todo-app   →   E:\projects\to-do(c#)
```

Run **frontend** only from `E:\projects\todo-app\frontend`, not from `to-do(c#)\frontend`.

Or rename the project folder to e.g. `todo-app` (no `#` or `()`).

## Quick start 

### 1. Start PostgreSQL

```bash
docker compose up -d
```

### 2. Apply database migrations

```bash
cd backend
dotnet ef database update --project TodoApp.Infrastructure --startup-project TodoApp.Api
```

### 3. Run API

```bash
cd backend/TodoApp.Api
dotnet run --launch-profile http
```

API: http://localhost:5055  
Swagger: http://localhost:5055/swagger

### 4. Run Angular

```bash
cd frontend
npm install
npm start
```

App: http://localhost:4200

> Do **not** use `ng serve` from `to-do(c#)\frontend` — Vite fails on `#` in the path.

## Features

| Feature | Description |
|---------|-------------|
| CRUD tasks | Title, description, due date, completed |
| Categories | One category per task (MS To-Do lists); optional |
| Auth | Register, login, logout (refresh token invalidated, user stays in DB) |
| Pagination | API paged; UI infinite scroll (10 per page) |
| Search | Case-insensitive title/description |
| Filter | Category, completed status, due before |
| Sort | createdAt, dueDate, title |

## API endpoints

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh
POST   /api/auth/logout
GET    /api/auth/me

GET    /api/categories
POST   /api/categories
PUT    /api/categories/{id}
DELETE /api/categories/{id}

GET    /api/tasks?page=1&pageSize=10&search=&categoryId=&isCompleted=&sortBy=createdAt&sortDirection=desc
POST   /api/tasks
PUT    /api/tasks/{id}
DELETE /api/tasks/{id}
```

## Project structure

```
to-do/
├── backend/
│   ├── TodoApp.Api/           # Controllers, Program.cs
│   ├── TodoApp.Application/   # DTOs, interfaces
│   ├── TodoApp.Domain/        # Entities
│   └── TodoApp.Infrastructure/# EF, services, repositories
├── frontend/                  # Angular SPA
└── docker-compose.yml
```

## Auth notes

- **Access token:** JWT in memory + sessionStorage (short-lived)
- **Refresh token:** httpOnly cookie + stored in DB
- **Logout:** revokes refresh token only; user account remains in database

## Default DB connection

```
Host=localhost;Port=5432;Database=tododb;Username=todo;Password=todo123
```
