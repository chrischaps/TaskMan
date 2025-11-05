# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**TaskMan** is a web-based multiplayer task completion game where players complete micro-tasks (sorting, color matching, arithmetic, etc.) to earn tokens, which they can use to offer tasks to other players. The game features a player-driven economy and progressive unlocking of composite task creation.

This is a **prototype** focused on validating core gameplay mechanics and the token economy.

## Repository Status

**Current State:** Backend Phase 1 - Foundation (In Progress)

### Completed Work

**Design Phase (Complete):**
- **BRAINSTORM.md** - Original game concept
- **GDD.md** - Complete Game Design Document
- **TDD.md** - Technical Design Document (architecture, API specs, database schema)
- **DEPLOYMENT_COSTS.md** - Cost analysis for GCP, Vercel, and Render
- **IMPLEMENTATION_PLAN.md** - 67 tasks broken down for 9-12 week implementation

**Backend Implementation (Phase 1 - 8/10 tasks complete):**
- ✅ BE-001: Node.js + Express + TypeScript project initialized
- ✅ BE-002: TypeScript configuration with strict mode
- ✅ BE-003: Prisma schema with PostgreSQL (5 models: User, Task, CompositeSubtask, TokenTransaction, TaskSubmission)
- ✅ BE-004: Docker PostgreSQL container for local development
- ✅ BE-005: Authentication middleware (JWT + bcrypt)
- ✅ BE-006: User registration endpoint with Zod validation
- ✅ BE-007: User login endpoint (email or username)
- ✅ BE-008: GET /api/auth/me endpoint (protected route)
- ⏳ BE-009: Token transaction service (next)
- ⏳ BE-010: Basic error handling middleware

**Frontend:** Not started (begins after Phase 1 backend completion)

### Working Features

The backend server is functional with:
- PostgreSQL database running in Docker
- Full authentication system (register, login, JWT)
- Protected routes with Bearer token authentication
- Comprehensive input validation with Zod
- Password hashing with bcrypt (10 salt rounds)
- User model with progression flags (tutorialCompleted, taskBoardUnlocked, compositeUnlocked)

## Architecture Overview

### Technology Stack

**Frontend:**
- React 18+ with TypeScript, Vite
- TanStack Query for data fetching with **30-second HTTP polling** (no WebSockets in prototype)
- Zustand for state management
- Tailwind CSS, Framer Motion, dnd-kit (drag-and-drop), React Router

**Backend:**
- Node.js 20+ with Express.js, TypeScript
- Prisma ORM with PostgreSQL 15+
- JWT authentication with bcrypt
- Zod for validation

**Infrastructure:**
- Google Cloud Platform: Cloud Storage (frontend), Cloud Run (backend), Cloud SQL (database)
- Local development: Docker for PostgreSQL

### Key Design Decisions

1. **HTTP Polling (Not WebSockets):** Task board refreshes every 30 seconds + manual refresh + on window focus. Architecture is designed to easily add WebSockets later (see TDD.md Section 13.4).

2. **Stateless Backend:** Enables horizontal scaling, simplifies WebSocket integration later.

3. **Atomic Database Operations:** All token transactions and task acceptances use Prisma transactions to prevent race conditions.

4. **Composite Task Premium:** Composite tasks award 15% more tokens than the sum of subtasks to incentivize task management.

## Recent Development Sessions

### Session 2 (Current) - Authentication System Implementation
**Date:** November 4-5, 2025
**Tasks Completed:** BE-005 through BE-008
**Duration:** ~3 hours

**Work Done:**
1. **BE-005:** Implemented authentication middleware
   - Installed jsonwebtoken 9.0.2 and bcrypt 6.0.0
   - Created `src/utils/jwt.ts` (generateToken, verifyToken)
   - Created `src/utils/hash.ts` (hashPassword, comparePassword)
   - Created `src/middleware/auth.ts` (authMiddleware, optionalAuthMiddleware)
   - Extended Express Request type to include user property
   - JWT tokens with 7-day expiration

2. **BE-006:** User registration endpoint
   - Installed Zod 3.x for validation
   - Created `src/routes/auth.ts` with POST /api/auth/register
   - Zod schemas for username (3-50 chars, alphanumeric+_-), email, password (8-100 chars)
   - Duplicate detection (409 status codes)
   - Returns JWT token and user data on success

3. **BE-007:** User login endpoint
   - Added POST /api/auth/login to `src/routes/auth.ts`
   - Flexible login field (accepts email OR username)
   - Password verification with bcrypt
   - Generic error messages for security (doesn't leak user existence)

4. **BE-008:** Protected route implementation
   - Added GET /api/auth/me endpoint
   - First route using authMiddleware
   - Fetches fresh user data from database
   - Returns complete profile including timestamps

**Technical Decisions:**
- Chose username/password over Google OAuth for prototype simplicity
- Used `as any` cast for jwt.sign() options to resolve TypeScript type issues
- Implemented secure error messages (generic 401 responses for auth failures)

**Testing:**
- All endpoints tested with curl
- Verified registration, login, duplicate detection, validation errors, protected routes
- Confirmed JWT token generation and verification working correctly

### Session 1 - Design Documents & Project Foundation
**Date:** November 3-4, 2025
**Tasks Completed:** ENV-001 through BE-004

**Work Done:**
- Created all design documents (GDD, TDD, DEPLOYMENT_COSTS, IMPLEMENTATION_PLAN)
- Initialized backend project with Node.js, Express, TypeScript
- Set up Prisma with complete database schema
- Configured Docker PostgreSQL container
- Database migrations applied successfully

## Project Structure

```
TaskMan/
├── backend/                    # ✅ Implemented
│   ├── src/
│   │   ├── server.ts          # ✅ Main Express app
│   │   ├── routes/
│   │   │   └── auth.ts        # ✅ Auth endpoints (register, login, /me)
│   │   ├── middleware/
│   │   │   └── auth.ts        # ✅ JWT authentication middleware
│   │   ├── services/          # ⏳ Next: TokenService
│   │   ├── validators/        # ⏳ Task validation (Phase 2)
│   │   ├── utils/
│   │   │   ├── jwt.ts         # ✅ JWT utilities
│   │   │   └── hash.ts        # ✅ Bcrypt password hashing
│   │   └── lib/
│   │       └── prisma.ts      # ✅ Prisma client singleton
│   ├── prisma/
│   │   ├── schema.prisma      # ✅ Complete database schema
│   │   └── migrations/        # ✅ Migration history
│   ├── dist/                  # ✅ Compiled JS output
│   ├── .env                   # ✅ Environment variables
│   ├── .env.example           # ✅ Example env file
│   ├── tsconfig.json          # ✅ TypeScript config
│   ├── package.json           # ✅ Dependencies
│   └── README.md              # ✅ Backend documentation
├── frontend/                   # ⏳ Not started
│   ├── src/
│   │   ├── components/
│   │   │   └── tasks/         # Task UIs (SortListTask, ColorMatchTask, etc.)
│   │   ├── pages/             # Dashboard, TaskBoard, Login, Register
│   │   ├── hooks/             # useTaskBoard (polling logic), useAuth
│   │   ├── stores/            # Zustand stores (user, tasks, UI)
│   │   └── services/          # API client with JWT interceptors
│   └── package.json
├── docker-compose.yml         # ✅ PostgreSQL container
├── CLAUDE.md                  # ✅ This file
├── GDD.md                     # ✅ Game Design Document
├── TDD.md                     # ✅ Technical Design Document
├── IMPLEMENTATION_PLAN.md     # ✅ Task breakdown
└── DEPLOYMENT_COSTS.md        # ✅ Cost analysis
```

## Core Systems

### 1. Task System (5 Types)

Each task type has:
- **Validator** (backend): `validators/taskValidators.ts` - validates player submissions
- **UI Component** (frontend): `components/tasks/{Type}Task.tsx` - interactive interface
- **JSON Schema**: Task data stored in `tasks.data` JSONB field, solution in `tasks.solution`

Task types: Sort List, Color Match, Arithmetic, Group Separation, Defragmentation

**See GDD.md Section 4 for task specifications and rewards.**

### 2. Token Economy

Managed by `TokenService` (TDD Section 5.2):
- `awardTokens(userId, amount, reason)` - atomic balance update + transaction record
- `deductTokens(userId, amount, reason)` - checks balance, atomic operation
- `calculateCompositePremium(subtaskCosts)` - returns sum * 1.15

All operations use Prisma transactions to ensure atomicity.

### 3. Composite Tasks

Multi-step workflow (TDD Section 5.4):
1. Player accepts composite task
2. Decomposes into 2-10 subtasks (must be valid per decomposition rules)
3. Subtasks posted to task board for other players
4. When all subtasks complete, composite task can be submitted
5. Player earns premium (subtask cost sum + 15%)

**Decomposition rules** define valid subtask types per composite category (e.g., "data_processing" requires Sort + Arithmetic, forbids Color Match).

### 4. Progression System

- **Tutorial Phase**: Complete 5 tutorial tasks → unlock task board
- **Task Board Access**: Complete 25 tasks + earn 500 tokens → unlock composite task creation
- Managed by `ProgressionService`, flags stored on User model

### 5. HTTP Polling Architecture

Frontend uses TanStack Query (TDD Section 5.3):
```typescript
// hooks/useTaskBoard.ts
useQuery({
  queryKey: ['taskBoard', filters],
  queryFn: () => apiClient.get<Task[]>('/api/tasks'),
  refetchInterval: 30000,  // 30 seconds
  refetchOnWindowFocus: true
})
```

Backend returns `Cache-Control: max-age=10, must-revalidate` headers.

## Database Schema

See TDD.md Section 4.2 for complete Prisma schema.

**Key Models:**
- `User` - auth, token balance, progression flags (tutorialCompleted, taskBoardUnlocked, compositeUnlocked)
- `Task` - all task types, JSONB data/solution fields, status (available/in_progress/completed)
- `CompositeSubtask` - links composite tasks to their subtasks
- `TokenTransaction` - audit trail for all token changes
- `TaskSubmission` - tracks attempts, allows retry on failure

**Critical Indexes:**
- `tasks.status`, `tasks.creator_id`, `tasks.accepted_by_id`, `tasks.created_at`
- `task_submissions.task_id`, `token_transactions.user_id`

## API Endpoints

### Authentication (✅ Implemented)
- `POST /api/auth/register` - create user, returns JWT (backend/src/routes/auth.ts:36)
- `POST /api/auth/login` - returns JWT, accepts email or username (backend/src/routes/auth.ts:127)
- `GET /api/auth/me` - get current user, requires JWT (backend/src/routes/auth.ts:208)

### Tasks
- `GET /api/tasks` - list available tasks (filters: type, difficulty, reward range)
- `POST /api/tasks` - create task (deducts tokens for reward + 20% listing fee)
- `POST /api/tasks/:id/accept` - accept task atomically (409 if already taken)
- `POST /api/tasks/:id/submit` - submit solution, validates, awards tokens
- `GET /api/tasks/tutorial` - ordered tutorial tasks

### Composite Tasks
- `POST /api/composite-tasks` - create composite (validates decomposition)
- `POST /api/composite-tasks/:id/accept` - accept composite, posts subtasks
- `GET /api/composite-tasks/:id/status` - subtask completion progress
- `POST /api/composite-tasks/:id/submit` - submit when all subtasks done

## Development Workflow

**Prerequisites (ENV-001 to ENV-003 in IMPLEMENTATION_PLAN.md):**
1. GCP account with $300 free credits
2. Node.js 20+, Docker Desktop, VS Code
3. Read all design documents

**Local Development Setup (when code exists):**
```bash
# Start PostgreSQL
docker-compose up -d

# Backend setup
cd backend
npm install
npx prisma migrate dev
npx prisma db seed      # Creates tutorial tasks
npm run dev             # Runs on :3001

# Frontend setup (separate terminal)
cd frontend
npm install
npm run dev             # Runs on :5173
```

**Environment Variables:**
```
# backend/.env
DATABASE_URL="postgresql://user:pass@localhost:5432/taskman"
JWT_SECRET="..."
NODE_ENV="development"

# frontend/.env
VITE_API_URL="http://localhost:3001"
```

## Implementation Guide

Follow **IMPLEMENTATION_PLAN.md** sequentially:
- Phase 1: Foundation (auth, database, basic UI)
- Phase 2: Core task system (validators + UIs)
- Phase 3: Multiplayer (polling, task creation)
- Phase 4: Progression & tutorial
- Phase 5: Composite tasks
- Phase 6: Polish, testing, deployment

**All tasks are scoped to ≤2 days.** Commit messages should reference task IDs (e.g., "BE-009: Implement token transaction service").

## Testing

**Backend (when implemented):**
- Unit tests for validators: `npm test -- validators`
- Unit tests for services: `npm test -- services`
- Target: 80%+ code coverage

**Frontend (when implemented):**
- Component tests with React Testing Library
- Test task UIs, forms, hooks

## Deployment

Deploy to GCP following TDD.md Section 8:
1. Cloud SQL (db-f1-micro, PostgreSQL 15)
2. Cloud Run (backend, 512MB, 0-10 instances)
3. Cloud Storage + CDN (frontend static files)

**Estimated cost:** $12-14/month prototype (or $0 with free credits)

## Design Document Priority

When questions arise about implementation:
1. **IMPLEMENTATION_PLAN.md** - task breakdown and dependencies
2. **TDD.md** - technical architecture, API specs, database schema, code examples
3. **GDD.md** - game mechanics, task specifications, token economy, progression
4. **DEPLOYMENT_COSTS.md** - infrastructure costs and alternatives

These documents are comprehensive and authoritative.
