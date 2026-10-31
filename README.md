# TaskMan

A web-based multiplayer task completion game where players complete micro-tasks (sorting, color matching, arithmetic, etc.) to earn tokens, which they can use to offer tasks to other players.

**Project page:** [chaps.dev/projects/taskman](https://chaps.dev/projects/taskman/), with a screenshot of the game.

## Project Status

**Phase 1: Foundation** - In Progress (53% Complete)

### Completed Tasks (Session 1 & 2)
**Prerequisites:**
- ✅ ENV-001: GCP account setup
- ✅ ENV-002: Development environment setup
- ✅ ENV-003: Review design documents

**Backend Setup:**
- ✅ BE-001: Initialize Node.js + Express project
- ✅ BE-002: Configure TypeScript
- ✅ BE-003: Setup Prisma with PostgreSQL schema
- ✅ BE-004: Setup local PostgreSQL with Docker
- ✅ BE-005: Implement authentication middleware (JWT + bcrypt)
- ✅ BE-006: Create user registration endpoint
- ✅ BE-007: Create user login endpoint
- ✅ BE-008: Create GET /api/auth/me endpoint (protected)

### Next Tasks
- 🔄 BE-009: Implement token transaction service (1.5 days)
- ⏳ BE-010: Create basic error handling middleware (0.5 days)
- ⏳ FE-001 through FE-007: Frontend setup (can start in parallel)

**Overall Progress:** 11/70 tasks complete (16%)

## Quick Start

### Prerequisites
- Node.js 20+ installed
- Docker Desktop installed and running
- Git configured

### Setup

1. **Clone repository and install dependencies**
```bash
# Backend
cd backend
npm install

# Frontend (when implemented)
cd frontend
npm install
```

2. **Start PostgreSQL database**
```bash
# From project root
docker-compose up -d

# Verify database is running
docker ps
```

3. **Run database migrations**
```bash
cd backend
npx prisma migrate dev
```

4. **Start development servers**
```bash
# Backend (from backend/ directory)
npm run dev
# Server runs on http://localhost:3001

# Frontend (from frontend/ directory - not yet implemented)
npm run dev
# App runs on http://localhost:5173
```

## Project Structure

```
TaskMan/
├── backend/                    # ✅ Node.js + Express + Prisma backend
│   ├── src/
│   │   ├── server.ts          # ✅ Main Express application
│   │   ├── routes/
│   │   │   └── auth.ts        # ✅ Auth endpoints (register, login, /me)
│   │   ├── middleware/
│   │   │   └── auth.ts        # ✅ JWT authentication middleware
│   │   ├── utils/
│   │   │   ├── jwt.ts         # ✅ JWT utilities
│   │   │   └── hash.ts        # ✅ Password hashing (bcrypt)
│   │   └── lib/
│   │       └── prisma.ts      # ✅ Prisma Client singleton
│   ├── prisma/
│   │   ├── schema.prisma      # ✅ Database schema
│   │   └── migrations/        # ✅ Database migrations
│   ├── dist/                  # ✅ Compiled JavaScript
│   ├── .env                   # ✅ Environment variables
│   └── package.json           # ✅ Dependencies
├── frontend/                   # ⏳ React + Vite frontend (not started)
├── docker-compose.yml          # ✅ PostgreSQL container
├── GDD.md                      # ✅ Game Design Document
├── TDD.md                      # ✅ Technical Design Document
├── IMPLEMENTATION_PLAN.md      # ✅ Task breakdown (11/70 complete)
├── DEPLOYMENT_COSTS.md         # ✅ Cost analysis
└── CLAUDE.md                   # ✅ Claude Code guidance (updated)
```

## Technology Stack

### Backend (✅ Functional)
- **Runtime:** Node.js 22+
- **Language:** TypeScript 5.9+
- **Framework:** Express 5.1
- **ORM:** Prisma 6.18
- **Database:** PostgreSQL 15 (Docker)
- **Authentication:** JWT (jsonwebtoken 9.0.2) + bcrypt 6.0.0
- **Validation:** Zod 3.x

### Frontend (Planned)
- **Framework:** React 18+
- **Build Tool:** Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Data Fetching:** TanStack Query
- **State Management:** Zustand

## Database

### Connection
- **Host:** localhost:5432
- **Database:** taskman
- **User:** taskman
- **Password:** taskman

### Schema
The database includes 5 main models:
- **User** - Authentication, token balance, progression flags
- **Task** - All task types with JSONB data and solution fields
- **CompositeSubtask** - Links composite tasks to their subtasks
- **TokenTransaction** - Audit trail for token changes
- **TaskSubmission** - Tracks task attempts and validation results

### Useful Commands
```bash
# View database in Prisma Studio (GUI)
cd backend && npm run prisma:studio

# Create new migration after schema changes
cd backend && npx prisma migrate dev --name description

# Reset database (WARNING: deletes all data)
cd backend && npx prisma migrate reset
```

## Docker Commands

```bash
# Start database
docker-compose up -d

# Stop database
docker-compose down

# Stop and remove volumes (deletes data)
docker-compose down -v

# View logs
docker-compose logs -f postgres

# Access PostgreSQL shell
docker exec -it taskman-postgres psql -U taskman -d taskman
```

## API Endpoints

### Currently Available ✅
- `GET /` - API server status
- `GET /api/health` - Health check + database connection status
- `POST /api/auth/register` - User registration (returns JWT)
- `POST /api/auth/login` - User login (accepts email or username, returns JWT)
- `GET /api/auth/me` - Get current user profile (protected, requires JWT)

### Coming Soon
- Task endpoints (list, create, accept, submit)
- Composite task endpoints
- Tutorial endpoints
- Token transaction endpoints

## Development Workflow

1. Make code changes
2. TypeScript compiles automatically (with nodemon)
3. Test endpoint with curl or browser
4. Commit changes with task ID reference (e.g., "BE-005: Implement auth")

## Design Documents

For detailed information about the game design, architecture, and implementation plan, see:
- **GDD.md** - Game mechanics, task types, progression system
- **TDD.md** - Technical architecture, API specs, database schema
- **IMPLEMENTATION_PLAN.md** - 67 tasks across 6 phases
- **DEPLOYMENT_COSTS.md** - GCP cost analysis

## License

ISC
