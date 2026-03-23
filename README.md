# Nova Dashboard — Full Stack

React + Vite + Tailwind CSS · Spring Boot 3 · MySQL 8 · JWT Auth

## Quick Start

### 1. Install frontend dependencies
```bash
cd frontend
npm install
```

### 2. Start MySQL (Docker)
```bash
docker run -d --name nova_mysql \
  -e MYSQL_ROOT_PASSWORD=password \
  -e MYSQL_DATABASE=nova_db \
  -p 3306:3306 \
  mysql:8.0
```

### 3. Start backend
```bash
cd backend
./mvnw spring-boot:run
# Runs on http://localhost:8080
# Tables auto-created on first run
```

### 4. Start frontend
```bash
cd frontend
npm run dev
# Runs on http://localhost:5173
```

Open http://localhost:5173 → Register → Dashboard ✅

---

## Folder Structure

```
nova-fullstack/
├── backend/                    Spring Boot 3
│   ├── src/main/java/com/nova/
│   │   ├── entity/             User, Project, Notification
│   │   ├── repository/         JPA repositories
│   │   ├── security/           JWT filter + config
│   │   ├── controller/         REST API endpoints
│   │   └── exception/          Global error handler
│   ├── pom.xml
│   └── Dockerfile
│
├── frontend/                   React + Vite
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── src/
│       ├── main.jsx            Entry point
│       ├── App.jsx             Router setup
│       ├── index.css           Global reset
│       ├── api/                Axios API services
│       │   ├── client.js       Axios + JWT interceptor
│       │   ├── auth.js
│       │   ├── projects.js
│       │   ├── notifications.js
│       │   └── users.js
│       ├── context/
│       │   └── AuthContext.jsx Global auth state
│       ├── pages/
│       │   ├── LoginPage.jsx
│       │   ├── RegisterPage.jsx
│       │   └── DashboardPage.jsx
│       └── components/
│           ├── Dashboard.jsx   Main UI (API-connected)
│           └── ProtectedRoute.jsx
│
├── docker-compose.yml          Run all services
└── SETUP.md                    Full deploy guide
```

## API Endpoints

| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| POST | /api/auth/register | ❌ | Create account |
| POST | /api/auth/login | ❌ | Login → JWT |
| POST | /api/auth/refresh | ❌ | Refresh token |
| GET | /api/auth/me | ✅ | Current user |
| GET/POST | /api/projects | ✅ | List / Create |
| PUT/DELETE | /api/projects/{id} | ✅ | Update / Delete |
| GET | /api/notifications | ✅ | List notifications |
| PATCH | /api/users/profile | ✅ | Update profile |
| PATCH | /api/users/password | ✅ | Change password |

## Deploy Free

- **Frontend** → [Vercel](https://vercel.com) (connect GitHub repo)
- **Backend + DB** → [Railway.app](https://railway.app) (add MySQL plugin)

Set environment variable in Railway:
```
JWT_SECRET=your-very-long-random-secret-here
```

Set environment variable in Vercel:
```
VITE_API_URL=https://your-backend.up.railway.app
```
