# Nova Dashboard — Full Stack Setup Guide
## Stack: React + Vite + Tailwind · Spring Boot 3 · MySQL 8 · JWT Auth

---

## 📁 Project Structure

```
nova-fullstack/
├── backend/                          ← Spring Boot
│   ├── src/main/java/com/nova/
│   │   ├── NovaApplication.java
│   │   ├── entity/
│   │   │   ├── User.java
│   │   │   ├── Project.java
│   │   │   └── Notification.java
│   │   ├── repository/
│   │   │   ├── UserRepository.java
│   │   │   ├── ProjectRepository.java
│   │   │   └── NotificationRepository.java
│   │   ├── security/
│   │   │   ├── JwtUtils.java
│   │   │   ├── JwtAuthFilter.java
│   │   │   └── SecurityConfig.java
│   │   ├── controller/
│   │   │   ├── AuthController.java      ← /api/auth/*
│   │   │   ├── ProjectController.java   ← /api/projects/*
│   │   │   ├── NotificationController.java
│   │   │   └── UserController.java
│   │   └── exception/
│   │       └── GlobalExceptionHandler.java
│   ├── src/main/resources/
│   │   └── application.yml
│   ├── pom.xml
│   └── Dockerfile
│
├── frontend/                         ← React + Vite
│   ├── src/
│   │   ├── api/
│   │   │   ├── client.js             ← Axios + JWT interceptor
│   │   │   ├── auth.js
│   │   │   ├── projects.js
│   │   │   ├── notifications.js
│   │   │   └── users.js
│   │   ├── context/
│   │   │   └── AuthContext.jsx       ← Global auth state
│   │   ├── components/
│   │   │   ├── Dashboard.jsx         ← Main UI (your existing file)
│   │   │   └── ProtectedRoute.jsx
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   └── DashboardPage.jsx     ← Connects API → Dashboard UI
│   │   └── App.jsx                   ← Router setup
│   ├── vite.config.js
│   ├── package.json
│   └── Dockerfile
│
└── docker-compose.yml                ← Run everything together
```

---

## 🔌 API Endpoints

| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| POST | `/api/auth/register` | ❌ | Create account |
| POST | `/api/auth/login` | ❌ | Login → JWT |
| POST | `/api/auth/refresh` | ❌ | Refresh access token |
| GET  | `/api/auth/me` | ✅ | Current user info |
| GET  | `/api/projects` | ✅ | List my projects |
| POST | `/api/projects` | ✅ | Create project |
| PUT  | `/api/projects/{id}` | ✅ | Update project |
| PATCH| `/api/projects/{id}/status` | ✅ | Change status |
| DELETE | `/api/projects/{id}` | ✅ | Delete project |
| GET  | `/api/notifications` | ✅ | List notifications |
| GET  | `/api/notifications/unread-count` | ✅ | Badge count |
| PATCH| `/api/notifications/{id}/read` | ✅ | Mark one read |
| PATCH| `/api/notifications/read-all` | ✅ | Mark all read |
| DELETE | `/api/notifications/{id}` | ✅ | Delete |
| PATCH| `/api/users/profile` | ✅ | Update name/email |
| PATCH| `/api/users/password` | ✅ | Change password |
| DELETE | `/api/users/account` | ✅ | Delete account |

---

## 🚀 Option A — Run Locally (Development)

### Step 1: MySQL
```bash
# Using Docker for MySQL only:
docker run -d \
  --name nova_mysql \
  -e MYSQL_ROOT_PASSWORD=password \
  -e MYSQL_DATABASE=nova_db \
  -p 3306:3306 \
  mysql:8.0
```

Or install MySQL locally and create:
```sql
CREATE DATABASE nova_db;
```

### Step 2: Backend
```bash
cd backend
./mvnw spring-boot:run
# Runs on http://localhost:8080
# Tables auto-created by Hibernate (ddl-auto: update)
```

### Step 3: Frontend
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

Open http://localhost:5173 → Register → Dashboard ✅

---

## 🐳 Option B — Docker Compose (Full Stack)

```bash
# From project root:
docker compose up --build

# App runs at:
# Frontend → http://localhost
# Backend  → http://localhost:8080
# MySQL    → localhost:3306
```

---

## ☁️ Option C — Deploy Online (Free)

### Backend → Railway.app
1. Push backend folder to GitHub
2. Go to railway.app → New Project → Deploy from GitHub
3. Add MySQL plugin in Railway
4. Set environment variables:
   ```
   DB_USERNAME=...
   DB_PASSWORD=...
   JWT_SECRET=your-very-long-random-secret
   ```
5. Railway gives you a URL like: `https://nova-backend.up.railway.app`

### Frontend → Vercel
1. Push frontend folder to GitHub
2. Go to vercel.com → New Project → Import
3. Set environment variable:
   ```
   VITE_API_URL=https://nova-backend.up.railway.app
   ```
4. Deploy → get URL like: `https://nova-dashboard.vercel.app`

### Update CORS in application.yml:
```yaml
nova:
  cors:
    allowed-origins:
      - https://nova-dashboard.vercel.app
```

---

## 🔐 Security Notes

1. **Change JWT secret** in production — must be 32+ chars:
   ```
   JWT_SECRET=abc123xyz...  # bad ❌
   JWT_SECRET=k9#mP2$xQw8@vRnL5jFdA7uYeB1cZ0hT  # good ✅
   ```

2. **Never commit `.env` files** — use environment variables

3. **Use HTTPS** in production — Railway and Vercel do this automatically

4. For production, change `ddl-auto: update` → `ddl-auto: validate`

---

## 🔧 Integrate Dashboard.jsx with Real API

In your existing `Dashboard.jsx`, replace localStorage calls like this:

```jsx
// ❌ OLD (localStorage)
const [projects, setProjects] = useState(() => ls.get("nova_projects", DEFAULT_PROJECTS));

// ✅ NEW (from DashboardPage props)
// Dashboard.jsx receives props from DashboardPage.jsx:
export default function NovaDashboard({
  user,
  projects,           // from API
  onCreateProject,    // calls projectsApi.create()
  onUpdateProject,    // calls projectsApi.update()
  onDeleteProject,    // calls projectsApi.remove()
  notifications,
  onMarkNotifRead,
  // ...etc
}) { ... }
```

---

## 📦 Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS v4 |
| State | React Context + useState |
| HTTP | Axios with JWT interceptor |
| Routing | React Router v6 |
| Backend | Spring Boot 3.2 (Java 17) |
| Auth | JWT (access + refresh tokens) |
| Database | MySQL 8 + Spring Data JPA |
| Deploy FE | Vercel (free) |
| Deploy BE | Railway.app (free tier) |
| Container | Docker + Docker Compose |
