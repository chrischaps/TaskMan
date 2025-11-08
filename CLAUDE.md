# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**TaskMan** is a web-based multiplayer task completion game where players complete micro-tasks (sorting, color matching, arithmetic, etc.) to earn tokens, which they can use to offer tasks to other players. The game features a player-driven economy and progressive unlocking of composite task creation.

This is a **prototype** focused on validating core gameplay mechanics and the token economy.

## Repository Status

**Current State:** Phase 2 Core Task System - COMPLETE ✅ (19/19 tasks)

### Completed Work

**Design Phase (Complete):**
- **BRAINSTORM.md** - Original game concept
- **GDD.md** - Complete Game Design Document
- **TDD.md** - Technical Design Document (architecture, API specs, database schema)
- **DEFRAG_TASK_DESIGN.md** - Detailed defragmentation mechanic guide
- **DEPLOYMENT_COSTS.md** - Cost analysis for GCP, Vercel, and Render
- **IMPLEMENTATION_PLAN.md** - 67 tasks broken down for 9-12 week implementation

**Backend Implementation (Phase 1 - COMPLETE 10/10 tasks):**
- ✅ BE-001: Node.js + Express + TypeScript project initialized
- ✅ BE-002: TypeScript configuration with strict mode
- ✅ BE-003: Prisma schema with PostgreSQL (5 models: User, Task, CompositeSubtask, TokenTransaction, TaskSubmission)
- ✅ BE-004: Docker PostgreSQL container for local development
- ✅ BE-005: Authentication middleware (JWT + bcrypt)
- ✅ BE-006: User registration endpoint with Zod validation
- ✅ BE-007: User login endpoint (email or username)
- ✅ BE-008: GET /api/auth/me endpoint (protected route)
- ✅ BE-009: Token transaction service with atomic operations
- ✅ BE-010: Global error handling middleware

**Backend Implementation (Phase 2 - Core Task System - COMPLETE 11/11 tasks):**
- ✅ BE-011: Sort List validator
- ✅ BE-012: Color Match validator (10%/7%/5% tolerance)
- ✅ BE-013: Arithmetic validator
- ✅ BE-014: Group Separation validator
- ✅ BE-015: Defragmentation validator (contiguous color grouping)
- ✅ BE-016: Generic validation function router
- ✅ BE-017: Task generation service (all 5 types with difficulty scaling)
- ✅ BE-018: Tutorial task seeding (5 tasks, one per type)
- ✅ BE-019: GET /api/tasks endpoint (with filters)
- ✅ BE-020: POST /api/tasks/:id/accept endpoint (atomic with race condition protection)
- ✅ BE-021: POST /api/tasks/:id/submit endpoint (validates and awards tokens)

**Frontend Implementation (Phase 1 - COMPLETE 6/6 tasks):**
- ✅ FE-001: React + Vite + TypeScript project initialized
- ✅ FE-002: Tailwind CSS v3 configured
- ✅ FE-003: TanStack Query setup with 30s polling
- ✅ FE-004: Zustand stores (user, tasks, UI) with persistence
- ✅ FE-005: Axios API client with JWT interceptors
- ✅ FE-006: Authentication UI (Login, Register, Dashboard pages)

**Frontend Implementation (Phase 2 - Core Task System - COMPLETE 8/8 tasks):**
- ✅ FE-007: Task board page layout with filters
- ✅ FE-008: Task board polling with TanStack Query (30s intervals)
- ✅ FE-009: Sort List task UI with drag-and-drop (dnd-kit)
- ✅ FE-010: Color Match task UI with RGB sliders
- ✅ FE-011: Arithmetic task UI with number input
- ✅ FE-012: Group Separation task UI with drag-to-buckets
- ✅ FE-013: Defragmentation task UI with click-to-swap (contiguous color grouping mechanic)
- ✅ FE-014: Task execution flow (Accept → Execute → Submit with loading states)

### Working Features

**Backend:**
- PostgreSQL database running in Docker
- Full authentication system (register, login, JWT)
- Protected routes with Bearer token authentication
- Comprehensive input validation with Zod
- Password hashing with bcrypt (10 salt rounds)
- Token transaction service with atomic Prisma operations
- Global error handling with development/production modes
- User model with progression flags (tutorialCompleted, taskBoardUnlocked, compositeUnlocked)
- **Task System:**
  - All 5 task type validators (Sort, Color Match, Arithmetic, Group Separation, Defragmentation)
  - Task generation service with difficulty scaling (1-3)
  - Tutorial task seeding (5 tasks, one per type)
  - GET /api/tasks with filters (type, difficulty, status)
  - POST /api/tasks/:id/accept with atomic operations and race condition protection
  - POST /api/tasks/:id/submit with validation and token rewards
  - Task expiration system with automatic cleanup
  - Task abandonment functionality
  - Test user seeding (alice, bob, charlie with 100 tokens each)

**Frontend:**
- React 19.1.1 with Vite 7.1.12 and TypeScript
- Tailwind CSS v3 for styling
- TanStack Query for data fetching (30-second stale time)
- Zustand stores with localStorage persistence
- Axios client with JWT interceptors
- Complete authentication flow (Login → Register → Protected Dashboard)
- Toast notifications system
- React Router with protected/public route wrappers
- **Task Board:**
  - Task list page with grid layout
  - Filter by type, difficulty
  - 30-second automatic polling for updates
  - Manual refresh button
  - Task cards show title, type, difficulty, reward, time estimate
  - Accept button on each task
- **Task Execution Flow:**
  - Accept → Execute → Submit with loading states
  - TaskExecutor routes to appropriate task UI
  - Task abandonment support
  - Success/error feedback with notifications
  - Automatic redirect after submission
- **All 5 Task Type UIs implemented:**
  - Sort List: Drag-and-drop reordering with dnd-kit
  - Color Match: RGB sliders for color matching (10%/7%/5% tolerance by difficulty)
  - Arithmetic: Number input for mathematical expressions
  - Group Separation: Drag items into category buckets by attributes
  - Defragmentation: Click-to-swap grid puzzle (contiguous color grouping)

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

### Session 5 - Task Board UI Redesign & Initiative System
**Date:** November 7, 2025
**Branch:** `feature/task-board-redesign`
**Duration:** ~6 hours

**Major Changes:**
This session implemented a complete redesign of the task board UI from a simple card grid to a professional JIRA-style backlog interface with user-created Initiatives for task organization.

**Backend - Initiative System:**
1. **Database Schema:**
   - Added `Initiative` model with fields: id, title, description, creatorId, projectId, tokenReward, status
   - Added `initiativeId` foreign key to Task model
   - Created migration: `20251108033754_add_initiatives`
   - Added indexes for performance (creator_id, project_id, status, initiative_id)

2. **Initiative API** (`backend/src/routes/initiatives.ts`):
   - `POST /api/initiatives` - Create initiative
   - `GET /api/initiatives` - List initiatives with filters (projectId, status, creatorId, includeTasks)
   - `GET /api/initiatives/:id` - Get initiative details + tasks
   - `PATCH /api/initiatives/:id` - Update initiative (creator only)
   - `DELETE /api/initiatives/:id` - Delete initiative (creator only, no tasks)

3. **Initiative Service** (`backend/src/services/initiativeService.ts`):
   - Full CRUD operations with validation
   - Task count and total reward calculations
   - Authorization checks (only creator can edit/delete)
   - Placeholder functions for future token reward mechanics

4. **Tasks API Updates:**
   - Modified `GET /api/tasks` to include initiative data (id, title)
   - Added fields: initiativeId, expiresAt, acceptedById for status calculations

**Frontend - New UI Components:**
1. **Type Definitions:**
   - `Initiative` interface (`frontend/src/types/initiative.ts`)
   - Updated `Task` interface with initiative fields
   - `TaskStatusLabel` type: 'available' | 'claimed' | 'expiring_soon' | 'completed'
   - Status calculation utility (`frontend/src/utils/taskStatus.ts`)

2. **TutorialTaskList Component** (`frontend/src/pages/TutorialTaskList.tsx`):
   - Ultra-simple list view for new users
   - Linear progress tracking (1 of 5, 2 of 5, etc.)
   - Progress bar with encouraging messages
   - Larger cards with friendly UI
   - Auto-redirect to backlog when tutorial complete
   - No filters/sorting (fixed tutorial sequence)

3. **TaskBoardBacklog Component** (`frontend/src/pages/TaskBoardBacklog.tsx`):
   - Professional JIRA Sprint-style backlog view
   - Groups tasks by user-created initiatives
   - Separate "Ungrouped Tasks" section
   - **Advanced Sorting**: 8 options (newest, oldest, highest reward, lowest reward, hardest, easiest, longest, shortest)
   - **Filters**: type, difficulty, min/max tokens, hide own tasks
   - Collapsible sections with localStorage persistence
   - 30-second auto-polling + manual refresh
   - "Create Initiative" button

4. **TaskRow Component** (`frontend/src/components/TaskRow.tsx`):
   - Compact horizontal layout for task display
   - Columns: Type Icon | Title | Status Badge | Difficulty | Reward | Creator | Time | Accept
   - Click title to expand/collapse description
   - Responsive design (hides creator/time on mobile/tablet)
   - Status badges with color coding

5. **InitiativeGroup Component** (`frontend/src/components/InitiativeGroup.tsx`):
   - Collapsible section header for each initiative
   - Shows: initiative title, description (tooltip), task count, total rewards
   - Edit/delete icons (only for creator)
   - Contains list of TaskRow components
   - Supports "Ungrouped Tasks" section (undefined initiative)

6. **CreateInitiativeModal Component** (`frontend/src/components/CreateInitiativeModal.tsx`):
   - Form with title (required) and description (optional)
   - Character count indicators (255/5000)
   - Validation with error messages
   - Loading state during creation
   - Token reward mechanics placeholder

7. **Initiative API Service** (`frontend/src/services/initiativeService.ts`):
   - `createInitiative`, `getInitiatives`, `getInitiativeById`
   - `updateInitiative`, `deleteInitiative`
   - Proper TypeScript typing for all requests/responses

**Routing Updates:**
- `/tasks` - Smart router (tutorial if not completed, else backlog)
- `/tasks/tutorial` - Explicit tutorial view
- `/tasks/backlog` - Explicit backlog view
- `/tasks/grid` - Old card grid view (legacy/fallback)
- Router checks `user.tutorialCompleted` flag to determine view

**Design Philosophy:**
1. **Tutorial View**: Simple, friendly, encouraging - reduces overwhelm for new users
2. **Backlog View**: Professional, feature-rich - feels like a real project management tool
3. **Initiatives**: User-created organizational layer between Project and Task
4. **Future-Ready**: Token reward mechanics for initiative creators (placeholders in place)

**Status Labels System:**
- **Available**: Green - task ready to accept
- **Claimed**: Blue - task accepted, in progress
- **Expiring Soon**: Orange - task expires within 1 hour
- **Completed**: Gray - task finished

**Files Created:**
- `backend/src/services/initiativeService.ts`
- `backend/src/routes/initiatives.ts`
- `frontend/src/types/initiative.ts`
- `frontend/src/utils/taskStatus.ts`
- `frontend/src/services/initiativeService.ts`
- `frontend/src/pages/TutorialTaskList.tsx`
- `frontend/src/pages/TaskBoardBacklog.tsx`
- `frontend/src/components/TaskRow.tsx`
- `frontend/src/components/InitiativeGroup.tsx`
- `frontend/src/components/CreateInitiativeModal.tsx`
- `TASK_BOARD_REDESIGN_PLAN.md` (17,000+ word comprehensive plan)

**Files Modified:**
- `backend/prisma/schema.prisma` - Added Initiative model
- `backend/src/server.ts` - Registered initiative routes
- `backend/src/routes/tasks.ts` - Added initiative data to response
- `frontend/src/types/task.ts` - Added initiative fields + status label
- `frontend/src/main.tsx` - Updated routing with smart router

**Errors Encountered & Learnings:**

**Error 1: TypeScript Compilation Errors in Backend** (`backend/src/routes/initiatives.ts`)
- **Symptom**: `error TS7006: Parameter 'req' implicitly has an 'any' type.` and `Property 'id' does not exist on type 'JwtPayload'`
- **Root Cause**: Missing explicit type annotations, incorrect property name (`req.user!.id` instead of `req.user!.userId`)
- **Fix**: Added `Request, Response` types, corrected property names, added explicit return types
- **Lesson**: Always provide explicit types for Express route handlers: `async (req: Request, res: Response): Promise<void> =>`

**Error 2: Prisma Client Not Updated**
- **Symptom**: `error TS2353: Object literal may only specify known properties, and 'initiativeId' does not exist`
- **Root Cause**: Prisma client not regenerated after schema changes
- **Fix**: Run `npx prisma generate` after any schema modifications
- **Lesson**: Always regenerate Prisma client after schema changes, even if migrations succeed

**Error 3: CORS Configuration**
- **Symptom**: CORS errors when accessing frontend from localhost:5173
- **Root Cause**: Frontend `.env` pointed to localtunnel URL instead of localhost
- **Fix**: Changed `VITE_API_URL` from localtunnel to `http://localhost:3001`
- **Lesson**: Keep separate environment configurations for local development vs external access

**Error 4: Module Export Error (Critical Learning)**
- **Symptom**: `Uncaught SyntaxError: The requested module '/src/types/task.ts' does not provide an export named 'Task'`
- **Root Causes** (Multiple issues in `frontend/src/types/task.ts`):
  1. ❌ **`export type {}` at top of file** - This empty export declaration breaks all subsequent named exports
  2. ❌ **Missing semicolons** - Inconsistent formatting throughout file
  3. ❌ **Wrong type definition order** - Data types (SortListData, etc.) defined AFTER Task interface that uses them
  4. ❌ **Using `any` type** - `task.data: any` instead of proper union type
  5. ❌ **Wrong import pattern** - Components using `import { Task }` instead of `import type { Task }`

- **Fixes Applied**:
  1. ✅ **Removed `export type {}`** - This line serves no purpose and breaks exports
  2. ✅ **Added semicolons** - All type definitions now end with `;`
  3. ✅ **Reordered definitions** - Moved SortListData, GroupSeparationData, DefragData, ArithmeticData BEFORE Task interface
  4. ✅ **Proper union type** - Changed to `data: SortListData | GroupSeparationData | DefragData | ArithmeticData | Record<string, unknown>`
  5. ✅ **Used `import type`** - Changed all type imports to `import type { Task } from "../types/task";`
  6. ✅ **Applied Prettier** - Formatted all frontend files consistently

- **How to Detect These Errors**:
  - **Look for "does not provide an export" errors** - Usually indicates `export type {}` or circular dependency
  - **Check TypeScript compilation output** - Run `npm run build` or `tsc --noEmit` to catch issues early
  - **Review file structure** - Types should be defined in dependency order (dependencies first, consumers later)
  - **Validate imports** - Use `import type` for type-only imports (better tree-shaking, clearer intent)
  - **Run linter** - ESLint/Prettier will catch formatting inconsistencies

- **Prevention Checklist**:
  ```typescript
  // ✅ Good type file structure:
  // 1. No empty export type {} declarations
  // 2. Import statements first
  // 3. Base types/interfaces defined first
  // 4. Complex types that depend on base types second
  // 5. All definitions end with semicolons
  // 6. Consistent formatting (run Prettier)

  // Example:
  export type StatusLabel = 'available' | 'claimed'; // Base type first

  export interface BaseData {                        // Base interface
    id: string;
  }

  export interface Task {                            // Complex type using base types
    status: StatusLabel;
    data: BaseData | OtherData;                      // Union type, not 'any'
  }
  ```

- **When Importing Types**:
  ```typescript
  // ✅ Good: Type-only import
  import type { Task, Initiative } from "../types/task";

  // ❌ Bad: Mixed import (less clear, worse tree-shaking)
  import { Task, Initiative } from "../types/task";
  ```

**Next Steps (Future Work):**
- Initiative token reward mechanics (detailed design + implementation)
- Edit/delete initiative modals (currently placeholders)
- Assign tasks to initiatives in task creation flow
- Drag-and-drop task reordering
- Saved filter presets
- Search functionality
- Kanban board view toggle

**Documentation:**
- Complete redesign plan saved in `TASK_BOARD_REDESIGN_PLAN.md`
- Includes mockups, implementation phases, technical decisions, and future enhancements

### Session 4 - Task Type UIs Implementation
**Date:** November 5, 2025
**Tasks Completed:** FE-009, FE-010, FE-011, FE-012, FE-013
**Duration:** ~4 hours

**Work Done:**
1. **FE-009:** Sort List Task UI
   - Implemented drag-and-drop using dnd-kit/sortable
   - Displays items in vertical list with alphabetical, numerical, or length sorting criteria
   - Real-time feedback during dragging with visual indicators
   - Integrated into TaskExecutor component

2. **FE-010:** Color Match Task UI
   - Created RGB sliders (0-255 range) with custom styling
   - Side-by-side target vs current color display
   - Live color preview updates as sliders change
   - Fixed submission field name (submittedColor) to match backend validator
   - Balanced tolerance values: 10%/7%/5% for difficulties 1/2/3

3. **FE-011:** Arithmetic Task UI
   - Number input field with Enter key support
   - Large expression display in gradient background
   - Form validation prevents invalid number submission
   - Instructions card with PEMDAS reminder

4. **FE-012:** Group Separation Task UI
   - Drag-and-drop interface with dnd-kit
   - Items show all attributes with grouping attribute highlighted
   - Visual indicators: colored circles (colors), shape symbols (shapes), scaled boxes (sizes)
   - Ungrouped area with remaining count
   - Category buckets show item counts
   - Submit disabled until all items grouped

5. **FE-013:** Defragmentation Task UI
   - Click-to-swap grid interface (any two cells can swap)
   - Colored blocks (R/G/B/Y) with distinct styling
   - Move counter tracks swaps
   - **New mechanic**: Colors must be contiguous in reading order (left-to-right, top-to-bottom)
   - Real-time validation checks color contiguity
   - Fixed type imports from dnd-kit

**Technical Decisions:**
- Enhanced seed script to create 3 tasks per type (15 total test tasks) to avoid frequent reseeding
- Type assertions needed for literal difficulty types in seed script (`as 1 | 2 | 3`)
- Changed defragmentation from column-based (move to top) to color-based (contiguous grouping)
- Event types from dnd-kit must use `import type` syntax

**Defragmentation Mechanic Redesign:**
- **Old design**: Move blocks to top of columns, eliminate gaps per column
- **New design**: Group same colors contiguously when read left-to-right, top-to-bottom
- Created comprehensive DEFRAG_TASK_DESIGN.md document
- Updated frontend validation logic to check color contiguity
- Updated backend validator (checkDefragmentation function)
- Removed column-only swap restriction
- Makes colors central to the puzzle mechanic

**Testing:**
- All 5 task type UIs tested and working
- Defragmentation validation correctly checks for contiguous color groups
- Seed script creates variety of test tasks with varying difficulties

### Session 3 - Frontend Foundation & Backend Services
**Date:** November 4-5, 2025 (continued)
**Tasks Completed:** FE-001 through FE-006, BE-009, BE-010
**Duration:** ~4 hours

**Work Done:**
1. **FE-001 through FE-003:** Frontend project setup
   - Created React 19.1.1 + Vite 7.1.12 + TypeScript project
   - Installed and configured Tailwind CSS v3 (downgraded from v4 due to PostCSS compatibility)
   - Set up TanStack Query with 30-second stale time and React Query DevTools

2. **FE-004:** State management with Zustand
   - Created three stores: userStore, taskStore, uiStore
   - Implemented localStorage persistence for user authentication
   - Added notification system with auto-dismiss

3. **FE-005:** API client setup
   - Configured axios with base URL and JWT interceptors
   - Request interceptor adds Bearer token from store
   - Response interceptor handles 401 errors and redirects to login

4. **FE-006:** Authentication UI
   - Created Login, Register, and Dashboard pages
   - Implemented ProtectedRoute and PublicRoute wrappers
   - Added Zod validation matching backend schemas
   - Created Notifications component with toast system

5. **BE-009:** Token transaction service
   - Created TokenService with atomic Prisma transactions
   - Implemented awardTokens() and deductTokens() methods
   - Added calculateCompositePremium() (15% bonus)
   - Included transaction history and balance retrieval

6. **BE-010:** Error handling middleware
   - Created global error handler with consistent JSON format
   - Added 404 Not Found handler
   - Implemented asyncHandler wrapper for async routes
   - Development vs production error details

**Technical Decisions:**
- Downgraded Tailwind CSS v3 instead of v4 (PostCSS plugin compatibility issues)
- Used `any` types for axios config to resolve TypeScript import errors
- Token transactions store `balance` field (required by schema) after each operation
- Removed non-existent `type` field from TokenTransaction (schema only has amount/balance/reason)

**Testing:**
- Verified frontend authentication flow (register → login → dashboard)
- Confirmed JWT storage and retrieval from localStorage
- Tested protected routes and automatic logout on 401
- Backend compiles successfully with all TypeScript checks passing

### Session 2 - Authentication System Implementation
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
├── backend/                    # ✅ Phase 1 Complete
│   ├── src/
│   │   ├── server.ts          # ✅ Main Express app with error handlers
│   │   ├── routes/
│   │   │   └── auth.ts        # ✅ Auth endpoints (register, login, /me)
│   │   ├── middleware/
│   │   │   ├── auth.ts        # ✅ JWT authentication middleware
│   │   │   └── errorHandler.ts # ✅ Global error handling
│   │   ├── services/
│   │   │   └── tokenService.ts # ✅ Token transaction service
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
├── frontend/                   # ✅ Phase 1 Complete, ✅ Phase 2 Task UIs Complete
│   ├── src/
│   │   ├── components/
│   │   │   ├── Notifications.tsx # ✅ Toast notification system
│   │   │   ├── TaskExecutor.tsx  # ✅ Routes to task type UIs
│   │   │   └── tasks/         # ✅ All 5 task UIs complete
│   │   │   │   ├── SortListTask.tsx        # ✅ Drag-and-drop sorting
│   │   │   │   ├── ColorMatchTask.tsx      # ✅ RGB sliders
│   │   │   │   ├── ArithmeticTask.tsx      # ✅ Number input
│   │   │   │   ├── GroupSeparationTask.tsx # ✅ Drag to buckets
│   │   │   │   └── DefragmentationTask.tsx # ✅ Click-to-swap grid
│   │   ├── pages/
│   │   │   ├── Login.tsx      # ✅ Login page with validation
│   │   │   ├── Register.tsx   # ✅ Registration page
│   │   │   └── Dashboard.tsx  # ✅ Protected dashboard
│   │   ├── hooks/             # ⏳ useTaskBoard (Phase 2)
│   │   ├── stores/
│   │   │   ├── userStore.ts   # ✅ User authentication state
│   │   │   ├── taskStore.ts   # ✅ Task state management
│   │   │   └── uiStore.ts     # ✅ UI state (notifications)
│   │   ├── services/
│   │   │   └── apiClient.ts   # ✅ Axios client with JWT interceptors
│   │   ├── main.tsx           # ✅ App entry with routing
│   │   ├── index.css          # ✅ Tailwind imports
│   │   └── App.tsx            # ✅ Root component
│   ├── .env                   # ✅ Environment variables
│   ├── .env.example           # ✅ Example env file
│   ├── tailwind.config.js     # ✅ Tailwind v3 config
│   ├── postcss.config.js      # ✅ PostCSS config
│   ├── tsconfig.json          # ✅ TypeScript config
│   ├── vite.config.ts         # ✅ Vite config
│   └── package.json           # ✅ Dependencies
├── docker-compose.yml         # ✅ PostgreSQL container
├── CLAUDE.md                  # ✅ This file
├── GDD.md                     # ✅ Game Design Document
├── TDD.md                     # ✅ Technical Design Document
├── DEFRAG_TASK_DESIGN.md      # ✅ Defragmentation mechanic detailed guide
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
