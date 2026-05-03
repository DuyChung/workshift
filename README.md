# WorkShift — Internal Work Schedule Management System

A full-stack application for managing employee work schedules, built with NestJS, Next.js, PostgreSQL, Prisma, JWT authentication, and real-time WebSocket notifications.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | NestJS (Node.js) |
| Frontend | Next.js 14 (App Router) |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | JWT (Access + Refresh Token) |
| Real-time | Socket.IO (WebSocket) |
| Styling | Tailwind CSS |
| State | Zustand + React Query |

---

## Project Structure

```
workshift/
├── backend/               # NestJS API
│   ├── prisma/
│   │   ├── schema.prisma  # Database schema
│   │   └── seed.ts        # Sample data
│   └── src/
│       ├── auth/          # JWT auth, login, refresh
│       ├── users/         # User CRUD (Admin)
│       ├── schedules/     # Schedule management
│       ├── notifications/ # WebSocket + notification service
│       ├── common/        # Guards, decorators
│       └── prisma/        # Prisma service
├── frontend/              # Next.js App
│   └── src/
│       ├── app/
│       │   ├── login/
│       │   ├── admin/     # Admin dashboard, employees, schedules
│       │   └── staff/     # Staff dashboard, schedule, notifications
│       ├── components/
│       ├── hooks/
│       ├── store/         # Zustand auth store
│       ├── types/
│       └── utils/
└── docker-compose.yml
```

---

## Quick Start (Docker — Recommended)

### Prerequisites
- Docker & Docker Compose installed

### Run everything with one command:

```bash
git clone <your-repo>
cd workshift
docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:4000/api
- Swagger Docs: http://localhost:4000/api/docs

---

## Local Development Setup

### 1. Start PostgreSQL

```bash
docker run --name workshift_pg \
  -e POSTGRES_USER=workshift \
  -e POSTGRES_PASSWORD=workshift123 \
  -e POSTGRES_DB=workshift_db \
  -p 5432:5432 -d postgres:16-alpine
```

### 2. Setup Backend

```bash
cd backend
cp .env.example .env
npm install
npx prisma migrate dev --name init
npx prisma db seed
npm run start:dev
```

### 3. Setup Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

---

## Demo Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@workshift.com | Admin@123456 |
| Staff | an.nguyen@workshift.com | Staff@123456 |
| Staff | bich.tran@workshift.com | Staff@123456 |

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | Login |
| POST | /api/auth/refresh | Refresh access token |
| POST | /api/auth/logout | Logout |

### Users (Admin only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/users | List all users |
| GET | /api/users/:id | Get user by ID |
| POST | /api/users | Create user |
| PATCH | /api/users/:id | Update user |
| DELETE | /api/users/:id | Delete user |
| PATCH | /api/users/:id/toggle-status | Toggle active/inactive |

### Schedules
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | /api/schedules | All schedules | Admin |
| GET | /api/schedules/me | My schedules | Staff |
| GET | /api/schedules/:id | Get by ID | All |
| POST | /api/schedules | Create shift | Admin |
| PATCH | /api/schedules/:id | Update shift | Admin |
| DELETE | /api/schedules/:id | Delete shift | Admin |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/notifications | My notifications |
| GET | /api/notifications/unread-count | Unread count |
| PATCH | /api/notifications/:id/read | Mark as read |
| PATCH | /api/notifications/read-all | Mark all as read |

> Full interactive docs at: **http://localhost:4000/api/docs** (Swagger UI)

---

## Features

### Admin
- ✅ Dashboard with stats overview
- ✅ Employee management (Create / Update / Delete / Toggle status)
- ✅ Schedule management with weekly view
- ✅ Assign multiple staff to a shift
- ✅ Auto-send notifications when shift is created/updated
- ✅ Notification center

### Staff
- ✅ Personal dashboard with today's shifts
- ✅ Monthly calendar view + list view
- ✅ Real-time notifications via WebSocket
- ✅ Notification panel with unread badge

### System
- ✅ JWT Access Token (15min) + Refresh Token (7 days)
- ✅ bcrypt password hashing
- ✅ Role-based access control (ADMIN / STAFF)
- ✅ Input validation with class-validator
- ✅ WebSocket real-time notifications
- ✅ Swagger API documentation
- ✅ Docker + Docker Compose
- ✅ Seed data

---

## Database Schema

```
User
  id, fullName, email, password (bcrypt),
  dateOfBirth, salaryGrade, role, status, createdAt

Schedule
  id, date, startTime, endTime, note, createdAt

ShiftAssignment
  id, userId, scheduleId  (many-to-many join)

Notification
  id, userId, title, message, isRead, createdAt

RefreshToken
  id, token, userId, expiresAt
```

---

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://workshift:workshift123@localhost:5432/workshift_db
JWT_SECRET=your_super_secret_key
PORT=4000
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```
