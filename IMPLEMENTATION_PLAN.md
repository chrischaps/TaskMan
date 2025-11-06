# TaskMan Prototype Implementation Plan

**Version:** 1.0
**Date:** November 4, 2025
**Based on:** TDD v1.3, GDD v1.0

---

## Executive Summary

This document provides a detailed task breakdown for implementing the TaskMan prototype. All tasks are scoped to ≤2 days of work to enable clear progress tracking and manageable implementation.

**Total Estimated Time:** 9-12 weeks (1 developer, full-time)
**Total Tasks:** 74 tasks across 6 phases
**Critical Path:** 43-50 days (can be reduced with parallel work)

### Current Progress (Updated: November 5, 2025)

**Phase Completion:**
- ✅ Prerequisites: 3/3 tasks complete (100%)
- ✅ Phase 1 - Foundation: 16/16 tasks complete (100%) **COMPLETE**
- ✅ Phase 2 - Core Task System: 23/23 tasks complete (100%) **COMPLETE**
- ⏳ Phase 3 - Progression & Tutorial: 0/7 tasks complete (0%)
- ⏳ Phase 4 - Composite Tasks: 0/11 tasks complete (0%)
- ⏳ Phase 5 - Polish & Testing: 0/10 tasks complete (0%)
- ⏳ Phase 6 - Optimizations: 0/4 tasks complete (0%)

**Overall Progress:** 42/74 tasks complete (57%)

**Next Tasks:**
- Phase 3 - Progression & Tutorial
- BE-023: Implement progression unlock logic
- BE-024: Create tutorial task endpoint

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Phase 1: Foundation (2-3 weeks)](#phase-1-foundation-2-3-weeks)
3. [Phase 2: Core Task System (2-3 weeks)](#phase-2-core-task-system-2-3-weeks)
4. [Phase 3: Progression & Tutorial (1 week)](#phase-3-progression--tutorial-1-week)
5. [Phase 4: Composite Tasks (2-3 weeks)](#phase-4-composite-tasks-2-3-weeks)
6. [Phase 5: Polish & Testing (1-2 weeks)](#phase-5-polish--testing-1-2-weeks)
7. [Phase 6: Optimizations (1 week)](#phase-6-optimizations-1-week)
8. [Task Summary by Category](#task-summary-by-category)
9. [Critical Path Analysis](#critical-path-analysis)
10. [Progress Tracking](#progress-tracking)

---

## Prerequisites

**Before starting implementation:**

- [x] **ENV-001**: GCP account created with billing enabled (0.5 days) ✅ **COMPLETED**
  - Enable $300 free credits
  - Setup billing alerts
  - Install gcloud CLI
  - **Completed:** Session 1 (Nov 3-4, 2025)

- [x] **ENV-002**: Development environment setup (1 day) ✅ **COMPLETED**
  - Node.js 20+ installed
  - Docker Desktop installed
  - VS Code + extensions (ESLint, Prettier, Prisma)
  - Git configured
  - **Completed:** Session 1 (Nov 3-4, 2025)

- [x] **ENV-003**: Review design documents (0.5 days) ✅ **COMPLETED**
  - Read GDD.md completely
  - Read TDD.md completely
  - Understand BRAINSTORM.md
  - **Completed:** Session 1 (Nov 3-4, 2025)

**Total Prerequisites Time:** 2 days ✅ **ALL COMPLETE**

---

## Phase 1: Foundation (2-3 weeks)

**Goal:** Setup project structure, authentication, database, and basic API.

**Estimated Time:** 10-15 days
**Tasks:** 15 tasks

### Backend Setup

- [x] **BE-001**: Initialize Node.js + Express project (0.5 days) ✅ **COMPLETED**
  - **Description:** Create backend folder structure, setup package.json, install dependencies
  - **Dependencies:** ENV-002
  - **Deliverables:**
    - `backend/` folder with Express app
    - `package.json` with dependencies (express, typescript, prisma, zod, etc.)
    - Basic `server.ts` with Express hello world
  - **Acceptance Criteria:**
    - `npm run dev` starts server on port 3001
    - Can hit http://localhost:3001 and get response
  - **Completed:** Session 1 (Nov 3-4, 2025)

- [x] **BE-002**: Configure TypeScript (0.5 days) ✅ **COMPLETED**
  - **Description:** Setup tsconfig.json, add type definitions
  - **Dependencies:** BE-001
  - **Deliverables:**
    - `tsconfig.json` configured for Node.js
    - Type definitions for Express, Node
    - Build script in package.json
  - **Acceptance Criteria:**
    - TypeScript compiles without errors
    - `npm run build` works
  - **Completed:** Session 1 (Nov 3-4, 2025)

- [x] **BE-003**: Setup Prisma with PostgreSQL schema (1 day) ✅ **COMPLETED**
  - **Description:** Initialize Prisma, create schema for users, tasks, tokens, transactions
  - **Dependencies:** BE-002
  - **Deliverables:**
    - `prisma/schema.prisma` with all models (from TDD Section 4.2)
    - Initial migration created
    - Prisma client generated
  - **Acceptance Criteria:**
    - Schema includes: User, Task, CompositeSubtask, TokenTransaction, TaskSubmission models
    - Can run `npx prisma migrate dev`
    - Prisma Studio opens and shows tables
  - **Completed:** Session 1 (Nov 3-4, 2025)

- [x] **BE-004**: Setup local PostgreSQL with Docker (0.5 days) ✅ **COMPLETED**
  - **Description:** Create docker-compose.yml for PostgreSQL
  - **Dependencies:** ENV-002
  - **Deliverables:**
    - `docker-compose.yml` at project root
    - `.env.example` with DATABASE_URL
  - **Acceptance Criteria:**
    - `docker-compose up -d` starts PostgreSQL
    - Can connect to database from backend
    - Database persists data across restarts
  - **Completed:** Session 1 (Nov 3-4, 2025)

- [x] **BE-005**: Implement authentication middleware (1.5 days) ✅ **COMPLETED**
  - **Description:** JWT token generation, verification, password hashing with bcrypt
  - **Dependencies:** BE-003
  - **Deliverables:**
    - `middleware/auth.ts` with JWT verification
    - `utils/jwt.ts` with token generation
    - `utils/hash.ts` with bcrypt functions
  - **Acceptance Criteria:**
    - Can generate JWT tokens
    - Can verify JWT tokens
    - Passwords are hashed with bcrypt (10 rounds)
    - Middleware protects routes correctly
  - **Completed:** Session 2 (Nov 4-5, 2025)
  - **Notes:** Used `as any` cast for jwt.sign() options to resolve TypeScript type issues

- [x] **BE-006**: Create user registration endpoint (1 day) ✅ **COMPLETED**
  - **Description:** POST /api/auth/register with validation
  - **Dependencies:** BE-005
  - **Deliverables:**
    - `routes/auth.ts` with registration endpoint
    - Zod schema for input validation
    - Error handling for duplicate users
  - **Acceptance Criteria:**
    - Can register new user with username, email, password
    - Returns JWT token on success
    - Validates input (email format, password strength)
    - Returns 400 for invalid data, 409 for duplicates
  - **Completed:** Session 2 (Nov 4-5, 2025)
  - **Notes:** Installed Zod 3.x for validation

- [x] **BE-007**: Create user login endpoint (0.5 days) ✅ **COMPLETED**
  - **Description:** POST /api/auth/login
  - **Dependencies:** BE-006
  - **Deliverables:**
    - Login endpoint in `routes/auth.ts`
    - Password verification
  - **Acceptance Criteria:**
    - Can login with email/username + password
    - Returns JWT token on success
    - Returns 401 for invalid credentials
  - **Completed:** Session 2 (Nov 4-5, 2025)
  - **Notes:** Flexible login field accepts email OR username

- [x] **BE-008**: Create GET /api/auth/me endpoint (0.5 days) ✅ **COMPLETED**
  - **Description:** Get current user info from JWT
  - **Dependencies:** BE-007
  - **Deliverables:**
    - `/api/auth/me` endpoint
    - Returns user data (no password)
  - **Acceptance Criteria:**
    - Requires authentication
    - Returns user profile with token balance
    - Returns 401 if not authenticated
  - **Completed:** Session 2 (Nov 4-5, 2025)
  - **Notes:** First protected route using authMiddleware

- [x] **BE-009**: Implement token transaction service (1.5 days) ✅ **COMPLETED**
  - **Description:** TokenService class with award/deduct methods (from TDD Section 5.2)
  - **Dependencies:** BE-003
  - **Deliverables:**
    - `services/tokenService.ts` with TokenService class
    - Atomic transactions with Prisma
    - Premium calculation method
  - **Acceptance Criteria:**
    - Can award tokens (updates balance + creates transaction record)
    - Can deduct tokens (checks balance, atomic operation)
    - Calculates composite task premium (15%)
    - All operations are atomic (no race conditions)
  - **Completed:** Session 3 (Nov 4-5, 2025)
  - **Notes:** Token transactions now store `balance` field after each operation for audit trail

- [x] **BE-010**: Create basic error handling middleware (0.5 days) ✅ **COMPLETED**
  - **Description:** Global error handler for Express
  - **Dependencies:** BE-002
  - **Deliverables:**
    - `middleware/errorHandler.ts`
    - Consistent error response format
  - **Acceptance Criteria:**
    - Catches unhandled errors
    - Returns consistent JSON error format
    - Logs errors to console
    - Doesn't leak sensitive info in production
  - **Completed:** Session 3 (Nov 4-5, 2025)
  - **Notes:** Added 404 handler and asyncHandler wrapper for async routes

### Frontend Setup

- [x] **FE-001**: Initialize React + Vite project (0.5 days) ✅ **COMPLETED**
  - **Description:** Create frontend with Vite, setup TypeScript
  - **Dependencies:** ENV-002
  - **Deliverables:**
    - `frontend/` folder with Vite + React
    - `package.json` with dependencies
    - Basic App.tsx rendering
  - **Acceptance Criteria:**
    - `npm run dev` starts dev server on port 5173
    - Hot reload works
    - TypeScript configured
  - **Completed:** Session 3 (Nov 4-5, 2025)
  - **Notes:** React 19.1.1 + Vite 7.1.12 + TypeScript

- [x] **FE-002**: Install and configure Tailwind CSS (0.5 days) ✅ **COMPLETED**
  - **Description:** Setup Tailwind with Vite
  - **Dependencies:** FE-001
  - **Deliverables:**
    - `tailwind.config.js`
    - `postcss.config.js`
    - Tailwind directives in main CSS
  - **Acceptance Criteria:**
    - Tailwind classes work in components
    - Can see styled elements
  - **Completed:** Session 3 (Nov 4-5, 2025)
  - **Notes:** Used Tailwind CSS v3 instead of v4 due to PostCSS compatibility

- [x] **FE-003**: Setup TanStack Query (0.5 days) ✅ **COMPLETED**
  - **Description:** Configure React Query for data fetching
  - **Dependencies:** FE-001
  - **Deliverables:**
    - QueryClient setup in main.tsx
    - QueryClientProvider wrapping App
  - **Acceptance Criteria:**
    - Can use useQuery and useMutation hooks
    - React Query DevTools available
  - **Completed:** Session 3 (Nov 4-5, 2025)
  - **Notes:** Configured with 30-second stale time for polling

- [x] **FE-004**: Setup Zustand stores (0.5 days) ✅ **COMPLETED**
  - **Description:** Create stores for user, tasks, UI state
  - **Dependencies:** FE-001
  - **Deliverables:**
    - `stores/userStore.ts` (user, tokens, level)
    - `stores/taskStore.ts` (active/completed tasks)
    - `stores/uiStore.ts` (modals, notifications)
  - **Acceptance Criteria:**
    - Stores have TypeScript types
    - Can read/write to stores in components
  - **Completed:** Session 3 (Nov 4-5, 2025)
  - **Notes:** Implemented with persist middleware for localStorage

- [x] **FE-005**: Create API client service (1 day) ✅ **COMPLETED**
  - **Description:** Axios setup with interceptors for JWT
  - **Dependencies:** FE-003
  - **Deliverables:**
    - `services/apiClient.ts`
    - Axios interceptors for auth tokens
    - Request/response interceptors
  - **Acceptance Criteria:**
    - Automatically adds JWT to requests
    - Handles 401 errors (logout user)
    - Base URL configurable via .env
  - **Completed:** Session 3 (Nov 4-5, 2025)
  - **Notes:** Used `any` types for axios config to resolve TypeScript import errors

- [x] **FE-006**: Create authentication UI (Login/Register) (1.5 days) ✅ **COMPLETED**
  - **Description:** Login and registration forms
  - **Dependencies:** FE-005
  - **Deliverables:**
    - `pages/Login.tsx`
    - `pages/Register.tsx`
    - Form validation with Zod
    - Error display
  - **Acceptance Criteria:**
    - Can register new user
    - Can login existing user
    - JWT stored in localStorage/sessionStorage
    - Redirects to dashboard after login
    - Shows validation errors
  - **Completed:** Session 3 (Nov 4-5, 2025)
  - **Notes:** Added Dashboard page and Notifications component with toast system

**Phase 1 Total:** 16 tasks, 12-14 days ✅ **ALL COMPLETE**

---

## Phase 2: Core Task System (2-3 weeks)

**Goal:** Implement all task types, validation logic, task board UI, and submission flow.

**Estimated Time:** 10-15 days
**Tasks:** 18 tasks

### Backend Task Validation

- [x] **BE-011 through BE-016**: All task validators (Combined in single commit) ✅ COMPLETE
  - **Description:** All 5 task type validators implemented
  - **Completed:** November 4, 2025
  - **Deliverables:**
    - `validators/taskValidators.ts` with all validators ✓
    - ValidationResult interface ✓
    - validateSortList() - alphabetical/numerical/length ✓
    - validateColorMatch() - 10%/7%/5% tolerance by difficulty ✓
    - validateArithmetic() - exact answer comparison ✓
    - validateGroupSeparation() - set comparison logic ✓
    - validateDefragmentation() - contiguous color grouping validation ✓
    - validateTaskSubmission() - router function ✓

- [x] **BE-017**: Create task generation service (1.5 days) ✅ COMPLETE
  - **Description:** Generate random tasks for testing/seeding
  - **Completed:** November 4, 2025
  - **Deliverables:**
    - `services/taskGenerator.ts` ✓
    - Functions to generate each task type ✓
    - Randomization of difficulty ✓
  - **Acceptance Criteria:**
    - Can generate valid tasks of each type ✓
    - Randomized but solvable ✓
    - Appropriate difficulty scaling ✓

- [x] **BE-018**: Create tutorial task seeding script (1 day) ✅ COMPLETE
  - **Description:** Seed database with 5 tutorial tasks
  - **Completed:** November 4, 2025
  - **Deliverables:**
    - `prisma/seed.ts` with tutorial tasks ✓
    - One of each task type ✓
    - Test users (alice, bob, charlie) ✓
    - 15 test tasks (3 per type) ✓
  - **Acceptance Criteria:**
    - `npx prisma db seed` creates tutorial tasks ✓
    - Tasks are marked as `isTutorial: true` ✓
    - Tasks have appropriate rewards (5-20 tokens) ✓

- [x] **BE-019**: Create GET /api/tasks endpoint (1 day) ✅ COMPLETE
  - **Description:** List available tasks with filters and pagination
  - **Completed:** November 4, 2025
  - **Deliverables:**
    - `routes/tasks.ts` with GET endpoint ✓
    - Filtering (type, difficulty, reward range) ✓
    - Pagination (page, limit) ✓
    - Exclude own tasks ✓
  - **Acceptance Criteria:**
    - Returns only available tasks ✓
    - Doesn't show tasks created by current user ✓
    - Pagination works (default 50 items) ✓
    - Filters work correctly ✓
    - Includes creator username ✓

- [x] **BE-020**: Create POST /api/tasks/:id/accept endpoint (1 day) ✅ COMPLETE
  - **Description:** Accept a task atomically
  - **Completed:** November 4, 2025
  - **Deliverables:**
    - Accept endpoint with race condition handling ✓
    - Atomic update (check status in WHERE clause) ✓
    - Task expiration system ✓
  - **Acceptance Criteria:**
    - Updates task to 'in_progress' ✓
    - Sets acceptedById and acceptedAt ✓
    - Returns 409 if already taken ✓
    - Returns 400 if trying to accept own task ✓
    - Atomic operation (no race conditions) ✓

- [x] **BE-021**: Create POST /api/tasks/:id/submit endpoint (1.5 days) ✅ COMPLETE
  - **Description:** Submit completed task for validation
  - **Completed:** November 4, 2025
  - **Deliverables:**
    - Submit endpoint with validation dispatch ✓
    - Calls appropriate validator based on task type ✓
    - Awards tokens on success ✓
    - Records submission in task_submissions ✓
  - **Acceptance Criteria:**
    - Validates submission with correct validator ✓
    - Awards tokens on correct submission ✓
    - Updates task status to 'completed' ✓
    - Returns validation details ✓
    - Allows retry on incorrect submission ✓

### Frontend Task Components

- [x] **FE-007**: Create task board page layout (1 day) ✅ COMPLETE
  - **Description:** TaskBoard component with list and filters
  - **Completed:** November 4, 2025
  - **Dependencies:** FE-006
  - **Deliverables:**
    - `pages/TaskBoard.tsx` ✓
    - `components/TaskCard.tsx` for individual tasks ✓
    - Filter UI (type, difficulty) ✓
    - Manual refresh button ✓
  - **Acceptance Criteria:**
    - Displays list of available tasks ✓
    - Can filter by task properties ✓
    - Shows task details (type, reward, difficulty, creator) ✓
    - Responsive design (mobile + desktop) ✓

- [x] **FE-008**: Implement task board polling with TanStack Query (1 day) ✅ COMPLETE
  - **Description:** useTaskBoard hook with 30s polling
  - **Completed:** November 4, 2025
  - **Dependencies:** FE-007
  - **Deliverables:**
    - TanStack Query integration ✓
    - 30-second refetch interval ✓
    - Manual refresh capability ✓
    - Refresh on window focus ✓
  - **Acceptance Criteria:**
    - Polls every 30 seconds automatically ✓
    - Manual refresh button works ✓
    - Refreshes when tab regains focus ✓
    - Shows loading state ✓

- [x] **FE-009**: Create Sort List task UI (1 day) ✅ COMPLETE
  - **Description:** Drag-and-drop sortable list
  - **Dependencies:** FE-007
  - **Deliverables:**
    - `components/tasks/SortListTask.tsx`
    - Drag-and-drop with dnd-kit
    - Submit button
  - **Acceptance Criteria:**
    - Can drag items to reorder ✓
    - Visual feedback during drag ✓
    - Submit sends sorted array ✓
    - Shows success/error feedback ✓
  - **Completed:** November 5, 2025

- [x] **FE-010**: Create Color Match task UI (1 day) ✅ COMPLETE
  - **Description:** RGB sliders to match target color
  - **Dependencies:** FE-007
  - **Deliverables:**
    - `components/tasks/ColorMatchTask.tsx`
    - Three sliders (R, G, B)
    - Live preview of current color
    - Target color display
  - **Acceptance Criteria:**
    - Sliders control RGB values (0-255) ✓
    - Shows current color preview ✓
    - Shows target color ✓
    - Submit sends RGB values (submittedColor) ✓
    - Tolerance: 10%/7%/5% by difficulty ✓
  - **Completed:** November 5, 2025

- [x] **FE-011**: Create Arithmetic task UI (0.5 days) ✅ COMPLETE
  - **Description:** Simple number input for calculation
  - **Dependencies:** FE-007
  - **Deliverables:**
    - `components/tasks/ArithmeticTask.tsx`
    - Number input field
    - Expression display
  - **Acceptance Criteria:**
    - Shows math expression clearly ✓
    - Number input with validation ✓
    - Submit sends answer ✓
    - Enter key support ✓
  - **Completed:** November 5, 2025

- [x] **FE-012**: Create Group Separation task UI (1.5 days) ✅ COMPLETE
  - **Description:** Drag items into category buckets
  - **Dependencies:** FE-009
  - **Deliverables:**
    - `components/tasks/GroupSeparationTask.tsx`
    - Draggable items
    - Drop zones for categories
    - Visual grouping
  - **Acceptance Criteria:**
    - Can drag items to groups ✓
    - Shows which group each item is in ✓
    - Clear visual distinction between groups ✓
    - Submit sends grouping data ✓
    - Visual indicators (colors, shapes, sizes) ✓
  - **Completed:** November 5, 2025

- [x] **FE-013**: Create Defragmentation task UI (2 days) ✅ COMPLETE
  - **Description:** Click-to-swap grid with contiguous color grouping mechanic
  - **Dependencies:** FE-009
  - **Deliverables:**
    - `components/tasks/DefragmentationTask.tsx`
    - Grid display (colored blocks R/G/B/Y)
    - Click-to-swap mechanism (any two cells)
    - Move counter
  - **Acceptance Criteria:**
    - Grid renders with colored blocks ✓
    - Can swap any two blocks (click-to-swap) ✓
    - Tracks number of moves ✓
    - Visual feedback for selected cell ✓
    - Submit sends final grid state ✓
    - Validation: colors contiguous in reading order ✓
  - **Notes:** Mechanic changed from column-based to contiguous color grouping
  - **Completed:** November 5, 2025

- [x] **FE-014**: Create task execution flow (1 day) ✅ COMPLETE
  - **Description:** Accept → Execute → Submit flow
  - **Completed:** November 4, 2025
  - **Dependencies:** FE-013
  - **Deliverables:**
    - Task execution page ✓
    - Accept button on task cards ✓
    - TaskExecutor component (routes to specific task UI) ✓
    - Submission handling with loading states ✓
    - Task abandonment feature ✓
  - **Acceptance Criteria:**
    - Can accept task from board ✓
    - Redirects to task execution ✓
    - Shows correct task UI based on type ✓
    - Submits solution ✓
    - Shows validation result ✓
    - Awards tokens on success ✓
    - Notifications on success/error ✓

### Dashboard & Visibility Controls

- [x] **FE-016**: Add own task visibility controls (1 day) ✅ COMPLETE
  - **Description:** Filter to hide/show own created tasks on task board
  - **Completed:** November 5, 2025
  - **Deliverables:**
    - Toggle control to show/hide own tasks ✓
    - State management for visibility preference ✓
    - Filter logic in task board ✓
  - **Acceptance Criteria:**
    - Players can toggle own task visibility ✓
    - Setting persists in store ✓
    - Task board updates immediately ✓

- [x] **FE-017**: Embed TaskBoard into Dashboard with redesigned header (1.5 days) ✅ COMPLETE
  - **Description:** Integrate task board into main dashboard with new header layout
  - **Completed:** November 5, 2025
  - **Deliverables:**
    - Embed TaskBoard component in Dashboard ✓
    - Redesigned dashboard header with stats ✓
    - Navigation integration ✓
    - Responsive layout ✓
  - **Acceptance Criteria:**
    - Task board displays on dashboard ✓
    - Header shows player stats (tokens, tasks completed) ✓
    - Layout responsive on mobile/desktop ✓
    - No navigation needed to see task board ✓

- [x] **FE-018**: Redesign group separation task UI for compact visual layout (1 day) ✅ COMPLETE
  - **Description:** Improved UI for group separation task with visual compactness
  - **Completed:** November 5, 2025
  - **Deliverables:**
    - Redesigned GroupSeparationTask component ✓
    - Compact visual layout for groups ✓
    - Improved drag-and-drop UX ✓
    - Better visual feedback ✓
  - **Acceptance Criteria:**
    - Visually compact and efficient ✓
    - All task functionality works correctly ✓
    - Mobile responsive ✓
    - Drag indicators clear ✓

### Task Creation

- [ ] **BE-022**: Implement POST /api/tasks to offer tasks (1.5 days)
  - **Description:** Players can create and offer tasks
  - **Dependencies:** BE-021
  - **Deliverables:**
    - POST /api/tasks endpoint
    - Deduct tokens for listing fee
    - Validate task data with Zod
    - Set reward and difficulty
  - **Acceptance Criteria:**
    - Creates new task in 'available' state
    - Deducts tokens (reward + listing fee 20%)
    - Returns 400 if insufficient tokens
    - Validates task data structure

- [ ] **FE-015**: Create task offering UI (1.5 days)
  - **Description:** Form to create and offer tasks
  - **Dependencies:** FE-014
  - **Deliverables:**
    - `components/CreateTaskModal.tsx`
    - Form for task type selection
    - Task data input based on type
    - Reward and difficulty setting
    - Cost calculator (reward + fee)
  - **Acceptance Criteria:**
    - Can select task type
    - Appropriate input fields for each type
    - Shows cost before submission
    - Validates data before sending
    - Success feedback on creation

**Phase 2 Total:** 23 tasks, 21-23 days ✅ **ALL COMPLETE**

---

## Phase 3: Progression & Tutorial (1 week)

**Goal:** Tutorial system, progression unlocks, daily rewards.

**Estimated Time:** 5-7 days
**Tasks:** 7 tasks

### Backend Progression

- [ ] **BE-023**: Implement progression unlock logic (1 day)
  - **Description:** Check task completion count, award unlocks
  - **Dependencies:** BE-021
  - **Deliverables:**
    - `services/progressionService.ts`
    - Check for task board unlock (5 tasks)
    - Check for composite unlock (25 tasks + 500 tokens)
    - Update user flags
  - **Acceptance Criteria:**
    - Updates `taskBoardUnlocked` after 5 tutorial tasks
    - Updates `compositeUnlocked` after 25 tasks + 500 tokens
    - Returns unlock status with user profile

- [ ] **BE-024**: Create tutorial task endpoint (0.5 days)
  - **Description:** GET /api/tasks/tutorial for ordered tutorial
  - **Dependencies:** BE-018
  - **Deliverables:**
    - Endpoint to fetch tutorial tasks in order
    - Filters out completed tutorials
  - **Acceptance Criteria:**
    - Returns tutorial tasks in sequence
    - Shows only incomplete tutorials
    - Marks which task is next

### Frontend Tutorial

- [ ] **FE-023**: Create tutorial overlay system (1.5 days)
  - **Description:** Tooltip/modal system for tutorial guidance
  - **Dependencies:** FE-014
  - **Deliverables:**
    - `components/TutorialOverlay.tsx`
    - Step-by-step guidance
    - Highlight relevant UI elements
    - Progress indicator
  - **Acceptance Criteria:**
    - Shows on first login
    - Can skip tutorial
    - Highlights buttons/areas
    - Next/previous navigation
    - Progress bar showing step X of Y

- [ ] **FE-024**: Create tutorial task flow (1 day)
  - **Description:** Special UI for tutorial tasks
  - **Dependencies:** FE-023
  - **Deliverables:**
    - Tutorial-specific task page
    - Extra guidance/hints
    - Progress tracking
  - **Acceptance Criteria:**
    - Shows tutorial tasks in order
    - Provides helpful hints
    - Shows progress (X of 5 complete)
    - Celebrates milestones

- [ ] **FE-025**: Implement progression unlock UI (1 day)
  - **Description:** Visual celebration of unlocks
  - **Dependencies:** FE-024
  - **Deliverables:**
    - Unlock modal/notification
    - Progress bars towards unlocks
    - Lock icons on disabled features
  - **Acceptance Criteria:**
    - Shows modal on unlock achievement
    - Progress bars update correctly
    - Locked features clearly indicated
    - Unlock animations satisfying

- [ ] **FE-026**: Add user stats dashboard (1 day)
  - **Description:** Profile page with stats
  - **Dependencies:** FE-025
  - **Deliverables:**
    - Stats display (tasks completed, tokens earned, level)
    - Progress towards next unlock
    - Task history
  - **Acceptance Criteria:**
    - Shows all key stats
    - Accurate token/task counts
    - Progress indicators
    - Clean design

- [ ] **BE-025**: Implement daily login rewards (0.5 days)
  - **Description:** Award tokens for daily login
  - **Dependencies:** BE-023
  - **Deliverables:**
    - Track last login date
    - Award 10 tokens on first login each day
    - Endpoint to claim reward
  - **Acceptance Criteria:**
    - Awards tokens once per day
    - Tracks login streaks (optional)
    - Returns reward status

**Phase 3 Total:** 8 tasks, 7-8 days

---

## Phase 4: Composite Tasks (2-3 weeks)

**Goal:** Composite task creation, decomposition validation, sub-task management.

**Estimated Time:** 10-15 days
**Tasks:** 11 tasks

### Backend Composite Tasks

- [ ] **BE-026**: Create decomposition rule system (1.5 days)
  - **Description:** Rules for valid task decomposition (from TDD Section 5.4)
  - **Dependencies:** BE-025
  - **Deliverables:**
    - `services/compositeTaskService.ts`
    - DecompositionRule interface
    - Rules for different composite categories
    - Validation function
  - **Acceptance Criteria:**
    - Defines valid subtask types for each composite type
    - Validates min/max subtasks
    - Checks required vs forbidden subtasks
    - Returns validation errors

- [ ] **BE-027**: Implement composite task creation endpoint (1.5 days)
  - **Description:** POST /api/composite-tasks
  - **Dependencies:** BE-026
  - **Deliverables:**
    - Endpoint to create composite task
    - Links subtasks with composite_subtasks table
    - Calculates premium (15%)
  - **Acceptance Criteria:**
    - Validates decomposition
    - Creates composite task
    - Links all subtasks
    - Calculates correct reward (sum + 15%)
    - Returns 400 on invalid decomposition

- [ ] **BE-028**: Create composite task acceptance endpoint (1 day)
  - **Description:** POST /api/composite-tasks/:id/accept
  - **Dependencies:** BE-027
  - **Deliverables:**
    - Accept composite task
    - Make subtasks available to others
  - **Acceptance Criteria:**
    - Accepts composite task
    - Creates/assigns subtasks to task board
    - Tracks which subtasks belong to which composite

- [ ] **BE-029**: Implement composite completion logic (1.5 days)
  - **Description:** Auto-complete composite when all subtasks done
  - **Dependencies:** BE-028
  - **Deliverables:**
    - Check on subtask completion
    - Mark composite as completable
    - Endpoint to complete composite task
  - **Acceptance Criteria:**
    - Detects when all subtasks completed
    - Allows composite task submission
    - Awards premium tokens
    - Atomically updates all related records

- [ ] **BE-030**: Create composite task status endpoints (0.5 days)
  - **Description:** GET /api/composite-tasks/:id/status and subtasks
  - **Dependencies:** BE-029
  - **Deliverables:**
    - Endpoint to check composite status
    - List all subtasks and their status
  - **Acceptance Criteria:**
    - Returns composite task details
    - Lists all subtasks with completion status
    - Shows progress (X of Y complete)

### Frontend Composite Tasks

- [ ] **FE-027**: Create composite task creator UI foundation (1 day)
  - **Description:** Page layout for task composition
  - **Dependencies:** FE-015
  - **Deliverables:**
    - `pages/CreateCompositeTask.tsx`
    - High-level task description input
    - Category selection
  - **Acceptance Criteria:**
    - Form for composite task info
    - Category dropdown (data_processing, visual_organization)
    - Description input

- [ ] **FE-028**: Implement subtask selection palette (1.5 days)
  - **Description:** Available task types to choose from
  - **Dependencies:** FE-027
  - **Deliverables:**
    - Palette of available task types
    - Visual representation of each type
    - Drag-from-palette capability
  - **Acceptance Criteria:**
    - Shows all atomic task types
    - Can drag from palette
    - Shows task type info (description, typical reward)

- [ ] **FE-029**: Implement composition area with drag-and-drop (2 days)
  - **Description:** Drop zone for building workflow
  - **Dependencies:** FE-028
  - **Deliverables:**
    - Drop area for task workflow
    - Reordering of subtasks
    - Remove subtasks
    - Visual workflow representation
  - **Acceptance Criteria:**
    - Can drag tasks from palette to composition area
    - Can reorder subtasks
    - Can remove subtasks
    - Shows sequence clearly (step 1, 2, 3...)
    - Minimum 2, maximum 10 subtasks

- [ ] **FE-030**: Implement decomposition validation feedback (1 day)
  - **Description:** Real-time validation as user composes
  - **Dependencies:** FE-029
  - **Deliverables:**
    - Client-side validation rules
    - Visual feedback (green checkmark or red X)
    - Error messages for invalid compositions
  - **Acceptance Criteria:**
    - Shows validation status in real-time
    - Explains why composition is invalid
    - Prevents submission if invalid
    - Shows estimated reward (sum + premium)

- [ ] **FE-031**: Implement composite task submission (1 day)
  - **Description:** Submit composite task to backend
  - **Dependencies:** FE-030
  - **Deliverables:**
    - Submit composition to API
    - Handle validation errors
    - Success feedback
  - **Acceptance Criteria:**
    - Sends composition to backend
    - Shows validation errors from server
    - Success animation on creation
    - Redirects to composite task tracking page

- [ ] **FE-032**: Create composite task monitoring dashboard (1.5 days)
  - **Description:** Track composite tasks and their subtasks
  - **Dependencies:** FE-031
  - **Deliverables:**
    - `pages/MyCompositeTasks.tsx`
    - List of accepted composite tasks
    - Subtask progress for each
    - Completion status
  - **Acceptance Criteria:**
    - Lists all composite tasks user has accepted
    - Shows subtask progress (3/5 complete)
    - Visual progress indicators
    - Can submit composite when all subtasks done
    - Celebrates completion and premium tokens

**Phase 4 Total:** 11 tasks, 13-15 days (FE task numbers shifted to FE-027 through FE-032)

---

## Phase 5: Polish & Testing (1-2 weeks)

**Goal:** UI/UX refinements, animations, bug fixes, testing, deployment.

**Estimated Time:** 7-14 days
**Tasks:** 10 tasks

### Polish

- [ ] **FE-033**: Implement success animations (1.5 days)
  - **Description:** Task completion celebrations with Framer Motion
  - **Dependencies:** FE-014
  - **Deliverables:**
    - Checkmark animations
    - Token fly-in animations
    - Confetti effects
    - Sound effects (optional)
  - **Acceptance Criteria:**
    - Satisfying visual feedback on task completion
    - Smooth animations (60fps)
    - Not annoying or too slow
    - Can disable in settings (optional)

- [ ] **FE-034**: Implement loading states and skeletons (1 day)
  - **Description:** Loading indicators for all async operations
  - **Dependencies:** FE-033
  - **Deliverables:**
    - Skeleton screens for task board
    - Loading spinners for actions
    - Disable buttons during submission
  - **Acceptance Criteria:**
    - Shows loading state during API calls
    - Skeleton screens instead of blank pages
    - Buttons disabled and show loading during actions

- [ ] **FE-035**: Implement error boundaries (0.5 days)
  - **Description:** Catch React errors gracefully
  - **Dependencies:** FE-034
  - **Deliverables:**
    - Error boundary component
    - Fallback UI for errors
    - Error reporting (Sentry optional)
  - **Acceptance Criteria:**
    - App doesn't crash on component errors
    - Shows friendly error message
    - Option to reload or go home

- [ ] **FE-036**: Mobile responsive optimization (1.5 days)
  - **Description:** Ensure all components work on mobile
  - **Dependencies:** FE-035
  - **Deliverables:**
    - Mobile-optimized layouts
    - Touch-friendly buttons
    - Responsive task UIs
  - **Acceptance Criteria:**
    - Works on 320px width screens
    - Touch targets ≥44px
    - No horizontal scrolling
    - Readable text sizes

- [ ] **FE-037**: Accessibility improvements (1 day)
  - **Description:** ARIA labels, keyboard navigation, screen reader support
  - **Dependencies:** FE-036
  - **Deliverables:**
    - ARIA labels on interactive elements
    - Keyboard shortcuts for common actions
    - Focus management
    - Semantic HTML
  - **Acceptance Criteria:**
    - Can navigate with keyboard only
    - Screen reader friendly
    - Proper focus indicators
    - Sufficient color contrast

### Testing

- [ ] **BE-031**: Write backend unit tests (2 days)
  - **Description:** Test validators and services
  - **Dependencies:** BE-030
  - **Deliverables:**
    - Tests for all validators
    - Tests for TokenService
    - Tests for CompositeTaskService
    - 80%+ code coverage
  - **Acceptance Criteria:**
    - All validators tested
    - TokenService atomic operations tested
    - Decomposition validation tested
    - Tests pass consistently

- [ ] **FE-038**: Write frontend component tests (1.5 days)
  - **Description:** Test key components with React Testing Library
  - **Dependencies:** FE-037
  - **Deliverables:**
    - Tests for task components
    - Tests for forms
    - Tests for hooks
  - **Acceptance Criteria:**
    - Task UIs render correctly
    - Forms validate properly
    - User interactions work
    - Tests pass

### Deployment

- [ ] **OPS-001**: Deploy to GCP (2 days)
  - **Description:** Follow TDD Section 8 to deploy to production
  - **Dependencies:** BE-031, FE-027
  - **Deliverables:**
    - Cloud SQL instance created
    - Cloud Run service deployed
    - Frontend deployed to Cloud Storage
    - Environment variables configured
    - Database migrated
  - **Acceptance Criteria:**
    - App accessible via public URL
    - Database connected and working
    - No CORS errors
    - HTTPS working
    - Can register, login, play tasks

- [ ] **OPS-002**: Setup monitoring and alerts (1 day)
  - **Description:** Cloud Monitoring, logs, billing alerts
  - **Dependencies:** OPS-001
  - **Deliverables:**
    - Billing alert at $50/month
    - Error rate alert
    - Cloud Logging configured
  - **Acceptance Criteria:**
    - Can view logs in Cloud Console
    - Billing alert email works
    - Error tracking setup

- [ ] **QA-001**: Playtesting and bug fixes (2-4 days)
  - **Description:** Manual testing with real users, fix bugs
  - **Dependencies:** OPS-002
  - **Deliverables:**
    - Test with 5-10 users
    - Bug list created
    - Critical bugs fixed
    - User feedback documented
  - **Acceptance Criteria:**
    - No critical bugs
    - Gameplay feels good
    - Token economy seems balanced
    - Users understand mechanics

**Phase 5 Total:** 10 tasks, 14-17 days (FE task numbers shifted to FE-033 through FE-038)

---

## Phase 6: Optimizations (1 week)

**Goal:** Database indexing, caching headers, rate limiting, optimistic UI updates.

**Estimated Time:** 3-5 days
**Tasks:** 4 tasks

### Backend Optimizations

- [ ] **BE-032**: Add database indexes (1 day)
  - **Description:** Add performance indexes to critical queries
  - **Dependencies:** BE-021
  - **Deliverables:**
    - Indexes on `tasks.status`, `tasks.created_at`, `tasks.accepted_by_id`
    - Indexes on `task_submissions.task_id`, `token_transactions.user_id`
    - Composite indexes for common queries
  - **Acceptance Criteria:**
    - Indexes created in migration
    - Query performance improved (verify with EXPLAIN)
    - No N+1 queries in task endpoints

- [ ] **BE-033**: Implement HTTP caching headers (0.75 days)
  - **Description:** Add Cache-Control, ETag headers
  - **Dependencies:** BE-021
  - **Deliverables:**
    - Cache-Control headers for GET /api/tasks
    - ETag support for task data
    - Middleware for cache headers
  - **Acceptance Criteria:**
    - GET /api/tasks includes cache headers
    - Browser cache working (304 responses)
    - Reduces unnecessary API calls

- [ ] **BE-034**: Add rate limiting middleware (0.75 days)
  - **Description:** Prevent abuse with request rate limits
  - **Dependencies:** BE-010
  - **Deliverables:**
    - Rate limiting middleware using express-rate-limit
    - Different limits for auth vs task endpoints
    - IP-based or user-based limiting
  - **Acceptance Criteria:**
    - Auth endpoints limited (e.g., 5 requests/minute)
    - Task endpoints limited (e.g., 100 requests/minute)
    - Returns 429 when limit exceeded

### Frontend Optimizations

- [ ] **FE-039**: Implement optimistic UI updates (1 day)
  - **Description:** Update UI before API response for better UX
  - **Dependencies:** FE-014
  - **Deliverables:**
    - Optimistic token deduction on task acceptance
    - Optimistic task status updates
    - Rollback on error
  - **Acceptance Criteria:**
    - UI updates immediately on action
    - Reverts if API call fails
    - Shows loading state during request
    - No race conditions with polling

**Phase 6 Total:** 4 tasks, 3-5 days

---

## Task Summary by Category

### Backend (34 tasks)
- Phase 1 (Foundation): 10 tasks (6.5 days) ✅ COMPLETE
- Phase 2 (Core Task System): 11 tasks (7.25 days) ✅ COMPLETE
- Phase 3 (Progression & Tutorial): 2 tasks (1.5 days)
- Phase 4 (Composite Tasks): 5 tasks (6 days)
- Phase 5 (Polish & Testing): 2 tasks (2 days)
- Phase 6 (Optimizations): 3 tasks (2.5 days)

**Backend Total:** 34 tasks, 25.75 days (16 complete, 18 remaining)

### Frontend (37 tasks)
- Phase 1 (Foundation): 6 tasks (5 days) ✅ COMPLETE
- Phase 2 (Core Task System): 11 tasks (10 days) ✅ COMPLETE (includes FE-016, FE-017, FE-018)
- Phase 3 (Progression & Tutorial): 4 tasks (5 days) [FE-023 through FE-026]
- Phase 4 (Composite Tasks): 6 tasks (8 days) [FE-027 through FE-032]
- Phase 5 (Polish & Testing): 6 tasks (7 days) [FE-033 through FE-038]
- Phase 6 (Optimizations): 1 task (1 day) [FE-039]

**Frontend Total:** 37 tasks, 36 days (17 complete, 20 remaining)

### DevOps (2 tasks)
- Deployment: 2 tasks (3 days)

### QA (1 task)
- Playtesting: 1 task (2-4 days)

**Grand Total:** 74 tasks, 75.75 days (~15 weeks single-threaded)

**With parallel work:** 48-55 days (~9-11 weeks)

---

## Critical Path Analysis

**Critical path** (tasks that MUST be done sequentially, longest path):

1. ENV-001 → ENV-002 → ENV-003 (2 days) ✅ COMPLETE
2. BE-001 → BE-002 → BE-003 → BE-004 (2.5 days) ✅ COMPLETE
3. BE-005 → BE-006 → BE-007 → BE-008 (3.5 days) ✅ COMPLETE
4. BE-011 → BE-012/013/014/015/016 → BE-017 → BE-018 (5.25 days) ✅ COMPLETE
5. BE-019 → BE-020 → BE-021 (3.5 days) ✅ COMPLETE
6. FE-001 → FE-002 → FE-003 → FE-004 → FE-005 → FE-006 (5 days) ✅ COMPLETE
7. FE-007 → FE-008 → FE-009 → FE-014 (4 days) ✅ COMPLETE
8. BE-026 → BE-027 → BE-028 → BE-029 (5.5 days)
9. FE-023 → FE-024 → FE-025 → FE-026 (4 days)
10. FE-027 → FE-028 → FE-029 → FE-030 → FE-031 (6.5 days)
11. OPS-001 → OPS-002 → QA-001 (5-7 days)

**Critical Path Total (Completed):** ~27 days
**Critical Path Total (Remaining):** ~17-19 days (~3-4 weeks)

**Parallel work opportunities:**
- FE and BE tasks can mostly be done in parallel
- Multiple validators (BE-012 to BE-016) can be done in parallel
- Multiple frontend task UIs (FE-009 to FE-013) can be done in parallel
- Phase 3 Tutorial (FE-023 to FE-026) can be done in parallel with Phase 4 work
- Polish tasks (FE-033 to FE-037) can be done in parallel

---

## Progress Tracking

### Week 1-2: Foundation ✅ COMPLETE
- [x] Prerequisites complete
- [x] Backend: Express + Prisma + Auth (BE-001 to BE-010)
- [x] Frontend: React + Vite + Tailwind + Auth UI (FE-001 to FE-006)
- [x] **Milestone:** Can register, login, see empty task board

### Week 3-4: Core Task System ✅ COMPLETE
- [x] Backend: All validators + task endpoints (BE-011 to BE-021)
- [x] Frontend: All task UIs (FE-007 to FE-014)
- [x] **Milestone:** Can complete all 5 task types, earn tokens

### Week 4-5: Dashboard & Task Creation (Phase 2 Completion)
- [x] Frontend: Dashboard redesign & visibility controls (FE-016, FE-017, FE-018) ✅ COMPLETE
- [ ] Backend: Task offering (BE-022)
- [ ] Frontend: Task creation UI (FE-015)
- [ ] **Milestone:** Players can create and offer tasks

### Week 6: Progression & Tutorial (Phase 3)
- [ ] Backend: Progression logic (BE-023 to BE-025)
- [ ] Frontend: Tutorial overlay + dashboard (FE-023 to FE-026)
- [ ] **Milestone:** Tutorial works, progression unlocks function

### Week 7-9: Composite Tasks (Phase 4)
- [ ] Backend: Composite task system (BE-026 to BE-030)
- [ ] Frontend: Task composer + monitoring (FE-027 to FE-032)
- [ ] **Milestone:** Can create, accept, complete composite tasks

### Week 10-11: Polish, Testing & Optimizations (Phase 5-6)
- [ ] Frontend: Animations + polish (FE-033 to FE-037)
- [ ] Backend: Unit tests (BE-031)
- [ ] Frontend: Component tests (FE-038)
- [ ] Backend: Optimizations (BE-032 to BE-034)
- [ ] Frontend: Optimistic updates (FE-039)
- [ ] **Milestone:** Polished, tested, optimized prototype

### Week 12: Deployment & QA
- [ ] Deploy to GCP (OPS-001, OPS-002)
- [ ] Playtesting and fixes (QA-001)
- [ ] **Milestone:** Production-ready prototype on GCP

---

## Risk Mitigation

### High-Risk Tasks (>1.5 days or complex)

**FE-013: Defrag UI** (2 days) ✅ COMPLETE
- **Risk:** Most complex task UI, drag-and-drop grid
- **Mitigation:** Research dnd-kit grid examples first
- **Fallback:** Use click-to-swap instead of drag

**FE-029: Composition drag-and-drop** (2 days)
- **Risk:** Complex interaction model
- **Mitigation:** Build incrementally (add first, drag second)
- **Fallback:** Use simpler UI (buttons to add/remove)

**BE-029: Composite completion** (1.5 days)
- **Risk:** Complex multi-record atomic update
- **Mitigation:** Use Prisma transactions, test thoroughly
- **Fallback:** Manual completion button (less automatic)

### Dependencies on External Services

**GCP Setup** (OPS-001)
- **Risk:** GCP complexity, deployment issues
- **Mitigation:** Follow TDD Section 8 exactly, use free credits
- **Fallback:** Deploy to Vercel instead (simpler, slightly more expensive)

### Time Overruns

**If behind schedule:**
1. **Cut scope on polish** (FE-033 to FE-037) - reduce animations
2. **Simplify defrag task** - easier validation
3. **Reduce composite task complexity** - fewer validation rules
4. **Skip some tests** - prioritize integration over unit tests

**If ahead of schedule:**
1. Add more task types
2. Implement daily quests
3. Add user profiles
4. Implement achievements

---

## Getting Started

**To begin implementation:**

1. **Read all design documents** (BRAINSTORM.md, GDD.md, TDD.md)
2. **Setup development environment** (Prerequisites section)
3. **Start with BE-001** (backend foundation)
4. **Start with FE-001** (frontend foundation) - can be parallel to backend
5. **Follow phase order** for most dependencies
6. **Check off tasks** as you complete them
7. **Track time** to improve estimates
8. **Ask questions** early when blocked

**Daily workflow:**
- Pick next uncompleted task with satisfied dependencies
- Read task description and acceptance criteria
- Estimate if you can finish in ≤2 days
- Implement feature
- Test against acceptance criteria
- Check off task
- Commit code with reference to task ID (e.g., "FE-009: Implement sort list UI")

**Weekly reviews:**
- Check milestone progress
- Identify blockers
- Adjust timeline if needed
- Celebrate completed phases!

---

**Good luck building TaskMan! 🎮**

For questions or clarifications, refer to:
- **Game Design:** GDD.md
- **Technical Details:** TDD.md
- **Cost Planning:** DEPLOYMENT_COSTS.md
- **Original Vision:** BRAINSTORM.md
