# TaskMan Prototype Implementation Plan

**Version:** 1.0
**Date:** November 4, 2025
**Based on:** TDD v1.3, GDD v1.0

---

## Executive Summary

This document provides a detailed task breakdown for implementing the TaskMan prototype. All tasks are scoped to ≤2 days of work to enable clear progress tracking and manageable implementation.

**Total Estimated Time:** 9-12 weeks (1 developer, full-time)
**Total Tasks:** 67 tasks across 6 phases
**Critical Path:** 45 days (can be reduced with parallel work)

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Phase 1: Foundation (2-3 weeks)](#phase-1-foundation-2-3-weeks)
3. [Phase 2: Core Task System (2-3 weeks)](#phase-2-core-task-system-2-3-weeks)
4. [Phase 3: Multiplayer with Polling (1 week)](#phase-3-multiplayer-with-polling-1-week)
5. [Phase 4: Progression & Tutorial (1 week)](#phase-4-progression--tutorial-1-week)
6. [Phase 5: Composite Tasks (2-3 weeks)](#phase-5-composite-tasks-2-3-weeks)
7. [Phase 6: Polish & Testing (1-2 weeks)](#phase-6-polish--testing-1-2-weeks)
8. [Task Summary by Category](#task-summary-by-category)
9. [Critical Path Analysis](#critical-path-analysis)
10. [Progress Tracking](#progress-tracking)

---

## Prerequisites

**Before starting implementation:**

- [ ] **ENV-001**: GCP account created with billing enabled (0.5 days)
  - Enable $300 free credits
  - Setup billing alerts
  - Install gcloud CLI

- [ ] **ENV-002**: Development environment setup (1 day)
  - Node.js 20+ installed
  - Docker Desktop installed
  - VS Code + extensions (ESLint, Prettier, Prisma)
  - Git configured

- [ ] **ENV-003**: Review design documents (0.5 days)
  - Read GDD.md completely
  - Read TDD.md completely
  - Understand BRAINSTORM.md

**Total Prerequisites Time:** 2 days

---

## Phase 1: Foundation (2-3 weeks)

**Goal:** Setup project structure, authentication, database, and basic API.

**Estimated Time:** 10-15 days
**Tasks:** 15 tasks

### Backend Setup

- [ ] **BE-001**: Initialize Node.js + Express project (0.5 days)
  - **Description:** Create backend folder structure, setup package.json, install dependencies
  - **Dependencies:** ENV-002
  - **Deliverables:**
    - `backend/` folder with Express app
    - `package.json` with dependencies (express, typescript, prisma, zod, etc.)
    - Basic `server.ts` with Express hello world
  - **Acceptance Criteria:**
    - `npm run dev` starts server on port 3001
    - Can hit http://localhost:3001 and get response

- [ ] **BE-002**: Configure TypeScript (0.5 days)
  - **Description:** Setup tsconfig.json, add type definitions
  - **Dependencies:** BE-001
  - **Deliverables:**
    - `tsconfig.json` configured for Node.js
    - Type definitions for Express, Node
    - Build script in package.json
  - **Acceptance Criteria:**
    - TypeScript compiles without errors
    - `npm run build` works

- [ ] **BE-003**: Setup Prisma with PostgreSQL schema (1 day)
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

- [ ] **BE-004**: Setup local PostgreSQL with Docker (0.5 days)
  - **Description:** Create docker-compose.yml for PostgreSQL
  - **Dependencies:** ENV-002
  - **Deliverables:**
    - `docker-compose.yml` at project root
    - `.env.example` with DATABASE_URL
  - **Acceptance Criteria:**
    - `docker-compose up -d` starts PostgreSQL
    - Can connect to database from backend
    - Database persists data across restarts

- [ ] **BE-005**: Implement authentication middleware (1.5 days)
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

- [ ] **BE-006**: Create user registration endpoint (1 day)
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

- [ ] **BE-007**: Create user login endpoint (0.5 days)
  - **Description:** POST /api/auth/login
  - **Dependencies:** BE-006
  - **Deliverables:**
    - Login endpoint in `routes/auth.ts`
    - Password verification
  - **Acceptance Criteria:**
    - Can login with email/username + password
    - Returns JWT token on success
    - Returns 401 for invalid credentials

- [ ] **BE-008**: Create GET /api/auth/me endpoint (0.5 days)
  - **Description:** Get current user info from JWT
  - **Dependencies:** BE-007
  - **Deliverables:**
    - `/api/auth/me` endpoint
    - Returns user data (no password)
  - **Acceptance Criteria:**
    - Requires authentication
    - Returns user profile with token balance
    - Returns 401 if not authenticated

- [ ] **BE-009**: Implement token transaction service (1.5 days)
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

- [ ] **BE-010**: Create basic error handling middleware (0.5 days)
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

### Frontend Setup

- [ ] **FE-001**: Initialize React + Vite project (0.5 days)
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

- [ ] **FE-002**: Install and configure Tailwind CSS (0.5 days)
  - **Description:** Setup Tailwind with Vite
  - **Dependencies:** FE-001
  - **Deliverables:**
    - `tailwind.config.js`
    - `postcss.config.js`
    - Tailwind directives in main CSS
  - **Acceptance Criteria:**
    - Tailwind classes work in components
    - Can see styled elements

- [ ] **FE-003**: Setup TanStack Query (0.5 days)
  - **Description:** Configure React Query for data fetching
  - **Dependencies:** FE-001
  - **Deliverables:**
    - QueryClient setup in main.tsx
    - QueryClientProvider wrapping App
  - **Acceptance Criteria:**
    - Can use useQuery and useMutation hooks
    - React Query DevTools available

- [ ] **FE-004**: Setup Zustand stores (0.5 days)
  - **Description:** Create stores for user, tasks, UI state
  - **Dependencies:** FE-001
  - **Deliverables:**
    - `stores/userStore.ts` (user, tokens, level)
    - `stores/taskStore.ts` (active/completed tasks)
    - `stores/uiStore.ts` (modals, notifications)
  - **Acceptance Criteria:**
    - Stores have TypeScript types
    - Can read/write to stores in components

- [ ] **FE-005**: Create API client service (1 day)
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

- [ ] **FE-006**: Create authentication UI (Login/Register) (1.5 days)
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

**Phase 1 Total:** 15 tasks, 11-13 days

---

## Phase 2: Core Task System (2-3 weeks)

**Goal:** Implement all task types, validation logic, task board UI, and submission flow.

**Estimated Time:** 10-15 days
**Tasks:** 18 tasks

### Backend Task Validation

- [ ] **BE-011**: Create task validation service structure (0.5 days)
  - **Description:** Base validator structure and interfaces
  - **Dependencies:** BE-009
  - **Deliverables:**
    - `validators/taskValidators.ts` with ValidationResult interface
    - Base validator functions
  - **Acceptance Criteria:**
    - Interface defined for validation results
    - Structure ready for specific validators

- [ ] **BE-012**: Implement Sort List validator (0.5 days)
  - **Description:** Validate sorted lists (code from TDD Section 5.1)
  - **Dependencies:** BE-011
  - **Deliverables:**
    - `validateSortList()` function
    - Support for alphabetical, numerical, length sorting
  - **Acceptance Criteria:**
    - Correctly validates sorted lists
    - Returns correct/incorrect with details
    - Handles edge cases (empty lists, single item)

- [ ] **BE-013**: Implement Color Match validator (0.5 days)
  - **Description:** Validate RGB color matching within tolerance
  - **Dependencies:** BE-011
  - **Deliverables:**
    - `validateColorMatch()` function
    - Tolerance percentage calculation
  - **Acceptance Criteria:**
    - Calculates color difference correctly
    - Applies tolerance properly
    - Returns accuracy percentage

- [ ] **BE-014**: Implement Group Separation validator (0.5 days)
  - **Description:** Validate item grouping by attributes
  - **Dependencies:** BE-011
  - **Deliverables:**
    - `validateGroupSeparation()` function
    - Set comparison logic
  - **Acceptance Criteria:**
    - Validates all groups correctly
    - Returns partial credit for some correct groups

- [ ] **BE-015**: Implement Arithmetic validator (0.25 days)
  - **Description:** Validate arithmetic calculations
  - **Dependencies:** BE-011
  - **Deliverables:**
    - `validateArithmetic()` function
  - **Acceptance Criteria:**
    - Compares user answer to correct answer
    - Simple equals comparison

- [ ] **BE-016**: Implement Defragmentation validator (1 day)
  - **Description:** Validate defragged grid (most complex)
  - **Dependencies:** BE-011
  - **Deliverables:**
    - `validateDefragmentation()` function
    - Grid contiguity checking
    - Move count tracking
  - **Acceptance Criteria:**
    - Validates contiguous color blocks
    - Checks all colors defragmented
    - Optionally scores based on move efficiency

- [ ] **BE-017**: Create task generation service (1.5 days)
  - **Description:** Generate random tasks for testing/seeding
  - **Dependencies:** BE-012 to BE-016
  - **Deliverables:**
    - `services/taskGenerator.ts`
    - Functions to generate each task type
    - Randomization of difficulty
  - **Acceptance Criteria:**
    - Can generate valid tasks of each type
    - Randomized but solvable
    - Appropriate difficulty scaling

- [ ] **BE-018**: Create tutorial task seeding script (1 day)
  - **Description:** Seed database with 5-10 tutorial tasks
  - **Dependencies:** BE-017
  - **Deliverables:**
    - `prisma/seed.ts` with tutorial tasks
    - One of each task type
    - Progressive difficulty
  - **Acceptance Criteria:**
    - `npx prisma db seed` creates tutorial tasks
    - Tasks are marked as `isTutorial: true`
    - Tasks have appropriate rewards (5-20 tokens)

- [ ] **BE-019**: Create GET /api/tasks endpoint (1 day)
  - **Description:** List available tasks with filters and pagination
  - **Dependencies:** BE-018
  - **Deliverables:**
    - `routes/tasks.ts` with GET endpoint
    - Filtering (type, difficulty, reward range)
    - Pagination (page, limit)
    - Exclude own tasks
  - **Acceptance Criteria:**
    - Returns only available tasks
    - Doesn't show tasks created by current user
    - Pagination works (default 50 items)
    - Filters work correctly
    - Includes creator username

- [ ] **BE-020**: Create POST /api/tasks/:id/accept endpoint (1 day)
  - **Description:** Accept a task atomically
  - **Dependencies:** BE-019
  - **Deliverables:**
    - Accept endpoint with race condition handling
    - Atomic update (check status in WHERE clause)
  - **Acceptance Criteria:**
    - Updates task to 'in_progress'
    - Sets acceptedById and acceptedAt
    - Returns 409 if already taken
    - Returns 400 if trying to accept own task
    - Atomic operation (no race conditions)

- [ ] **BE-021**: Create POST /api/tasks/:id/submit endpoint (1.5 days)
  - **Description:** Submit completed task for validation
  - **Dependencies:** BE-020
  - **Deliverables:**
    - Submit endpoint with validation dispatch
    - Calls appropriate validator based on task type
    - Awards tokens on success
    - Records submission in task_submissions
  - **Acceptance Criteria:**
    - Validates submission with correct validator
    - Awards tokens on correct submission
    - Updates task status to 'completed'
    - Returns validation details
    - Allows retry on incorrect submission

### Frontend Task Components

- [ ] **FE-007**: Create task board page layout (1 day)
  - **Description:** TaskBoard component with list and filters
  - **Dependencies:** FE-006
  - **Deliverables:**
    - `pages/TaskBoard.tsx`
    - `components/TaskCard.tsx` for individual tasks
    - Filter UI (type, difficulty, reward)
    - Manual refresh button
  - **Acceptance Criteria:**
    - Displays list of available tasks
    - Can filter by task properties
    - Shows task details (type, reward, difficulty, creator)
    - Responsive design (mobile + desktop)

- [ ] **FE-008**: Implement task board polling with TanStack Query (1 day)
  - **Description:** useTaskBoard hook with 30s polling
  - **Dependencies:** FE-007
  - **Deliverables:**
    - `hooks/useTaskBoard.ts`
    - 30-second refetch interval
    - Manual refresh capability
    - Refresh on window focus
  - **Acceptance Criteria:**
    - Polls every 30 seconds automatically
    - Manual refresh button works
    - Refreshes when tab regains focus
    - Shows loading state

- [ ] **FE-009**: Create Sort List task UI (1 day)
  - **Description:** Drag-and-drop sortable list
  - **Dependencies:** FE-007
  - **Deliverables:**
    - `components/tasks/SortListTask.tsx`
    - Drag-and-drop with dnd-kit
    - Submit button
  - **Acceptance Criteria:**
    - Can drag items to reorder
    - Visual feedback during drag
    - Submit sends sorted array
    - Shows success/error feedback

- [ ] **FE-010**: Create Color Match task UI (1 day)
  - **Description:** RGB sliders to match target color
  - **Dependencies:** FE-007
  - **Deliverables:**
    - `components/tasks/ColorMatchTask.tsx`
    - Three sliders (R, G, B)
    - Live preview of current color
    - Target color display
  - **Acceptance Criteria:**
    - Sliders control RGB values (0-255)
    - Shows current color preview
    - Shows target color
    - Submit sends RGB values

- [ ] **FE-011**: Create Arithmetic task UI (0.5 days)
  - **Description:** Simple number input for calculation
  - **Dependencies:** FE-007
  - **Deliverables:**
    - `components/tasks/ArithmeticTask.tsx`
    - Number input field
    - Expression display
  - **Acceptance Criteria:**
    - Shows math expression clearly
    - Number input with validation
    - Submit sends answer

- [ ] **FE-012**: Create Group Separation task UI (1.5 days)
  - **Description:** Drag items into category buckets
  - **Dependencies:** FE-009
  - **Deliverables:**
    - `components/tasks/GroupSeparationTask.tsx`
    - Draggable items
    - Drop zones for categories
    - Visual grouping
  - **Acceptance Criteria:**
    - Can drag items to groups
    - Shows which group each item is in
    - Clear visual distinction between groups
    - Submit sends grouping data

- [ ] **FE-013**: Create Defragmentation task UI (2 days)
  - **Description:** Grid with drag-to-swap blocks (most complex)
  - **Dependencies:** FE-009
  - **Deliverables:**
    - `components/tasks/DefragTask.tsx`
    - Grid display (colored blocks)
    - Swap mechanism (click two blocks or drag)
    - Move counter
  - **Acceptance Criteria:**
    - Grid renders with colored blocks
    - Can swap blocks
    - Tracks number of moves
    - Visual feedback for swaps
    - Submit sends final grid state

- [ ] **FE-014**: Create task execution flow (1 day)
  - **Description:** Accept → Execute → Submit flow
  - **Dependencies:** FE-013
  - **Deliverables:**
    - Task execution page
    - Accept button on task cards
    - Task executor component (routes to specific task UI)
    - Submission handling with optimistic updates
  - **Acceptance Criteria:**
    - Can accept task from board
    - Redirects to task execution
    - Shows correct task UI based on type
    - Submits solution
    - Shows validation result
    - Awards tokens on success
    - Updates UI optimistically

**Phase 2 Total:** 18 tasks, 15-17 days

---

## Phase 3: Multiplayer with Polling (1 week)

**Goal:** Optimize API for multiplayer, handle race conditions, implement efficient polling.

**Estimated Time:** 5-7 days
**Tasks:** 6 tasks

### Backend Optimizations

- [ ] **BE-022**: Add database indexes for performance (0.5 days)
  - **Description:** Create indexes from TDD Section 4.1
  - **Dependencies:** BE-021
  - **Deliverables:**
    - Migration with indexes on:
      - `tasks.status`
      - `tasks.creator_id`
      - `tasks.accepted_by_id`
      - `tasks.created_at`
      - `task_submissions.task_id`
      - `token_transactions.user_id`
  - **Acceptance Criteria:**
    - Indexes created successfully
    - Query performance improved (measure with EXPLAIN)

- [ ] **BE-023**: Implement HTTP caching headers (0.5 days)
  - **Description:** Add Cache-Control headers to task board endpoint
  - **Dependencies:** BE-019
  - **Deliverables:**
    - Cache-Control headers on GET /api/tasks
    - ETag support (optional)
  - **Acceptance Criteria:**
    - Returns `Cache-Control: max-age=10, must-revalidate`
    - Browser respects caching

- [ ] **BE-024**: Add rate limiting middleware (1 day)
  - **Description:** Rate limit API endpoints with express-rate-limit
  - **Dependencies:** BE-010
  - **Deliverables:**
    - `middleware/rateLimiter.ts`
    - Different limits for different endpoints
    - Rate limit on task creation (10/min)
    - Rate limit on task submission (20/min)
  - **Acceptance Criteria:**
    - Returns 429 when rate limit exceeded
    - Headers show rate limit info
    - Different limits per endpoint

- [ ] **BE-025**: Implement POST /api/tasks to offer tasks (1.5 days)
  - **Description:** Players can create and offer tasks
  - **Dependencies:** BE-024
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

### Frontend Multiplayer

- [ ] **FE-015**: Implement optimistic UI updates (1.5 days)
  - **Description:** Update UI immediately on actions, rollback on failure
  - **Dependencies:** FE-014
  - **Deliverables:**
    - Optimistic update on task acceptance (from TDD Section 5.3)
    - Rollback on error
    - Toast notifications for success/error
  - **Acceptance Criteria:**
    - Task disappears from board immediately when accepted
    - Rollback if accept fails (409 or other error)
    - Shows success/error notification
    - Smooth UX even with network latency

- [ ] **FE-016**: Create task offering UI (1.5 days)
  - **Description:** Form to create and offer tasks
  - **Dependencies:** FE-015
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

**Phase 3 Total:** 6 tasks, 6-7 days

---

## Phase 4: Progression & Tutorial (1 week)

**Goal:** Tutorial system, progression unlocks, daily rewards.

**Estimated Time:** 5-7 days
**Tasks:** 7 tasks

### Backend Progression

- [ ] **BE-026**: Implement progression unlock logic (1 day)
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

- [ ] **BE-027**: Create tutorial task endpoint (0.5 days)
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

- [ ] **FE-017**: Create tutorial overlay system (1.5 days)
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

- [ ] **FE-018**: Create tutorial task flow (1 day)
  - **Description:** Special UI for tutorial tasks
  - **Dependencies:** FE-017
  - **Deliverables:**
    - Tutorial-specific task execution
    - Inline hints/tips
    - More forgiving validation (optional)
  - **Acceptance Criteria:**
    - Shows tutorial tasks first
    - Provides helpful hints
    - Celebrates completion
    - Smooth transition to task board after 5 tasks

- [ ] **FE-019**: Create progression notifications (1 day)
  - **Description:** Unlock animations and celebrations
  - **Dependencies:** FE-018
  - **Deliverables:**
    - `components/UnlockNotification.tsx`
    - Animations with Framer Motion
    - Toast notifications for unlocks
  - **Acceptance Criteria:**
    - Shows animation when task board unlocked
    - Shows animation when composite tasks unlocked
    - Explains what was unlocked
    - Confetti or celebration effect

- [ ] **FE-020**: Create dashboard/stats page (1.5 days)
  - **Description:** User stats, token balance, progress
  - **Dependencies:** FE-019
  - **Deliverables:**
    - `pages/Dashboard.tsx`
    - Display user stats (tokens, level, tasks completed)
    - Progress toward next unlock
    - Recent activity
  - **Acceptance Criteria:**
    - Shows token balance prominently
    - Shows tasks completed count
    - Shows progress to next unlock
    - Shows recent task history

- [ ] **FE-021**: Create navigation and layout (1 day)
  - **Description:** Top nav, sidebar, routing
  - **Dependencies:** FE-020
  - **Deliverables:**
    - `components/Layout.tsx`
    - Navigation menu
    - React Router setup
    - Responsive layout
  - **Acceptance Criteria:**
    - Can navigate between pages
    - Consistent layout across pages
    - Mobile-responsive
    - Shows current page indicator

**Phase 4 Total:** 7 tasks, 7-8 days

---

## Phase 5: Composite Tasks (2-3 weeks)

**Goal:** Composite task creation, decomposition validation, sub-task management.

**Estimated Time:** 10-15 days
**Tasks:** 11 tasks

### Backend Composite Tasks

- [ ] **BE-028**: Create decomposition rule system (1.5 days)
  - **Description:** Rules for valid task decomposition (from TDD Section 5.4)
  - **Dependencies:** BE-026
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

- [ ] **BE-029**: Implement composite task creation endpoint (1.5 days)
  - **Description:** POST /api/composite-tasks
  - **Dependencies:** BE-028
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

- [ ] **BE-030**: Create composite task acceptance endpoint (1 day)
  - **Description:** POST /api/composite-tasks/:id/accept
  - **Dependencies:** BE-029
  - **Deliverables:**
    - Accept composite task
    - Make subtasks available to others
  - **Acceptance Criteria:**
    - Accepts composite task
    - Creates/assigns subtasks to task board
    - Tracks which subtasks belong to which composite

- [ ] **BE-031**: Implement composite completion logic (1.5 days)
  - **Description:** Auto-complete composite when all subtasks done
  - **Dependencies:** BE-030
  - **Deliverables:**
    - Check on subtask completion
    - Mark composite as completable
    - Endpoint to complete composite task
  - **Acceptance Criteria:**
    - Detects when all subtasks completed
    - Allows composite task submission
    - Awards premium tokens
    - Atomically updates all related records

- [ ] **BE-032**: Create composite task status endpoints (0.5 days)
  - **Description:** GET /api/composite-tasks/:id/status and subtasks
  - **Dependencies:** BE-031
  - **Deliverables:**
    - Endpoint to check composite status
    - List all subtasks and their status
  - **Acceptance Criteria:**
    - Returns composite task details
    - Lists all subtasks with completion status
    - Shows progress (X of Y complete)

### Frontend Composite Tasks

- [ ] **FE-022**: Create composite task creator UI foundation (1 day)
  - **Description:** Page layout for task composition
  - **Dependencies:** FE-021
  - **Deliverables:**
    - `pages/CreateCompositeTask.tsx`
    - High-level task description input
    - Category selection
  - **Acceptance Criteria:**
    - Form for composite task info
    - Category dropdown (data_processing, visual_organization)
    - Description input

- [ ] **FE-023**: Implement subtask selection palette (1.5 days)
  - **Description:** Available task types to choose from
  - **Dependencies:** FE-022
  - **Deliverables:**
    - Palette of available task types
    - Visual representation of each type
    - Drag-from-palette capability
  - **Acceptance Criteria:**
    - Shows all atomic task types
    - Can drag from palette
    - Shows task type info (description, typical reward)

- [ ] **FE-024**: Implement composition area with drag-and-drop (2 days)
  - **Description:** Drop zone for building workflow
  - **Dependencies:** FE-023
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

- [ ] **FE-025**: Implement decomposition validation feedback (1 day)
  - **Description:** Real-time validation as user composes
  - **Dependencies:** FE-024
  - **Deliverables:**
    - Client-side validation rules
    - Visual feedback (green checkmark or red X)
    - Error messages for invalid compositions
  - **Acceptance Criteria:**
    - Shows validation status in real-time
    - Explains why composition is invalid
    - Prevents submission if invalid
    - Shows estimated reward (sum + premium)

- [ ] **FE-026**: Implement composite task submission (1 day)
  - **Description:** Submit composite task to backend
  - **Dependencies:** FE-025
  - **Deliverables:**
    - Submit composition to API
    - Handle validation errors
    - Success feedback
  - **Acceptance Criteria:**
    - Sends composition to backend
    - Shows validation errors from server
    - Success animation on creation
    - Redirects to composite task tracking page

- [ ] **FE-027**: Create composite task monitoring dashboard (1.5 days)
  - **Description:** Track composite tasks and their subtasks
  - **Dependencies:** FE-026
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

**Phase 5 Total:** 11 tasks, 13-15 days

---

## Phase 6: Polish & Testing (1-2 weeks)

**Goal:** UI/UX refinements, animations, bug fixes, testing, deployment.

**Estimated Time:** 7-14 days
**Tasks:** 10 tasks

### Polish

- [ ] **FE-028**: Implement success animations (1.5 days)
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

- [ ] **FE-029**: Implement loading states and skeletons (1 day)
  - **Description:** Loading indicators for all async operations
  - **Dependencies:** FE-028
  - **Deliverables:**
    - Skeleton screens for task board
    - Loading spinners for actions
    - Disable buttons during submission
  - **Acceptance Criteria:**
    - Shows loading state during API calls
    - Skeleton screens instead of blank pages
    - Buttons disabled and show loading during actions

- [ ] **FE-030**: Implement error boundaries (0.5 days)
  - **Description:** Catch React errors gracefully
  - **Dependencies:** FE-029
  - **Deliverables:**
    - Error boundary component
    - Fallback UI for errors
    - Error reporting (Sentry optional)
  - **Acceptance Criteria:**
    - App doesn't crash on component errors
    - Shows friendly error message
    - Option to reload or go home

- [ ] **FE-031**: Mobile responsive optimization (1.5 days)
  - **Description:** Ensure all components work on mobile
  - **Dependencies:** FE-030
  - **Deliverables:**
    - Mobile-optimized layouts
    - Touch-friendly buttons
    - Responsive task UIs
  - **Acceptance Criteria:**
    - Works on 320px width screens
    - Touch targets ≥44px
    - No horizontal scrolling
    - Readable text sizes

- [ ] **FE-032**: Accessibility improvements (1 day)
  - **Description:** ARIA labels, keyboard navigation, screen reader support
  - **Dependencies:** FE-031
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

- [ ] **BE-033**: Write backend unit tests (2 days)
  - **Description:** Test validators and services
  - **Dependencies:** BE-032
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

- [ ] **FE-033**: Write frontend component tests (1.5 days)
  - **Description:** Test key components with React Testing Library
  - **Dependencies:** FE-032
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
  - **Dependencies:** BE-033, FE-033
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

**Phase 6 Total:** 10 tasks, 14-17 days

---

## Task Summary by Category

### Backend (33 tasks)
- Setup: 10 tasks (6.5 days)
- Task Validation: 11 tasks (7.25 days)
- Multiplayer: 4 tasks (3.5 days)
- Progression: 2 tasks (1.5 days)
- Composite Tasks: 5 tasks (6 days)
- Testing: 1 task (2 days)

**Backend Total:** 33 tasks, 26.75 days

### Frontend (27 tasks)
- Setup: 6 tasks (5 days)
- Task Components: 8 tasks (9 days)
- Multiplayer: 2 tasks (3 days)
- Progression: 5 tasks (6 days)
- Composite Tasks: 6 tasks (8 days)
- Polish & Testing: 6 tasks (7 days)

**Frontend Total:** 27 tasks, 38 days

### DevOps (2 tasks)
- Deployment: 2 tasks (3 days)

### QA (1 task)
- Playtesting: 1 task (2-4 days)

**Grand Total:** 67 tasks, 69.75 days (~14 weeks single-threaded)

**With parallel work:** 45-55 days (~9-11 weeks)

---

## Critical Path Analysis

**Critical path** (tasks that MUST be done sequentially, longest path):

1. ENV-001 → ENV-002 → ENV-003 (2 days)
2. BE-001 → BE-002 → BE-003 → BE-004 (2.5 days)
3. BE-005 → BE-006 → BE-007 → BE-008 (3.5 days)
4. BE-011 → BE-012/013/014/015/016 → BE-017 → BE-018 (5.25 days)
5. BE-019 → BE-020 → BE-021 (3.5 days)
6. FE-001 → FE-002 → FE-003 → FE-004 → FE-005 → FE-006 (5 days)
7. FE-007 → FE-008 → FE-009 → FE-014 (4 days)
8. BE-028 → BE-029 → BE-030 → BE-031 (5.5 days)
9. FE-022 → FE-023 → FE-024 → FE-025 → FE-026 (6.5 days)
10. OPS-001 → OPS-002 → QA-001 (5-7 days)

**Critical Path Total:** ~43-45 days (~9 weeks)

**Parallel work opportunities:**
- FE and BE tasks can mostly be done in parallel
- Multiple validators (BE-012 to BE-016) can be done in parallel
- Multiple frontend task UIs (FE-009 to FE-013) can be done in parallel
- Polish tasks (FE-028 to FE-032) can be done in parallel

---

## Progress Tracking

### Week 1-2: Foundation
- [ ] Prerequisites complete
- [ ] Backend: Express + Prisma + Auth (BE-001 to BE-010)
- [ ] Frontend: React + Vite + Tailwind + Auth UI (FE-001 to FE-006)
- [ ] **Milestone:** Can register, login, see empty task board

### Week 3-4: Core Task System
- [ ] Backend: All validators + task endpoints (BE-011 to BE-021)
- [ ] Frontend: All task UIs (FE-007 to FE-014)
- [ ] **Milestone:** Can complete all 5 task types, earn tokens

### Week 5: Multiplayer
- [ ] Backend: Optimizations + task offering (BE-022 to BE-025)
- [ ] Frontend: Polling + optimistic updates + task creation (FE-015 to FE-016)
- [ ] **Milestone:** Multiple users can offer/accept tasks, task board updates

### Week 6: Progression
- [ ] Backend: Progression logic (BE-026 to BE-027)
- [ ] Frontend: Tutorial + dashboard (FE-017 to FE-021)
- [ ] **Milestone:** Tutorial works, progression unlocks function

### Week 7-9: Composite Tasks
- [ ] Backend: Composite task system (BE-028 to BE-032)
- [ ] Frontend: Task composer + monitoring (FE-022 to FE-027)
- [ ] **Milestone:** Can create, accept, complete composite tasks

### Week 10-12: Polish & Deploy
- [ ] Frontend: Animations + polish (FE-028 to FE-032)
- [ ] Backend: Unit tests (BE-033)
- [ ] Frontend: Component tests (FE-033)
- [ ] Deploy to GCP (OPS-001, OPS-002)
- [ ] Playtesting and fixes (QA-001)
- [ ] **Milestone:** Production-ready prototype on GCP

---

## Risk Mitigation

### High-Risk Tasks (>1.5 days or complex)

**BE-016: Defragmentation validator** (1 day)
- **Risk:** Most complex validation logic
- **Mitigation:** Start simple (just check contiguity), iterate
- **Fallback:** Reduce complexity, allow more lenient validation

**FE-013: Defrag UI** (2 days)
- **Risk:** Most complex task UI, drag-and-drop grid
- **Mitigation:** Research dnd-kit grid examples first
- **Fallback:** Use click-to-swap instead of drag

**FE-024: Composition drag-and-drop** (2 days)
- **Risk:** Complex interaction model
- **Mitigation:** Build incrementally (add first, drag second)
- **Fallback:** Use simpler UI (buttons to add/remove)

**BE-031: Composite completion** (1.5 days)
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
1. **Cut scope on polish** (FE-028 to FE-032) - reduce animations
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
