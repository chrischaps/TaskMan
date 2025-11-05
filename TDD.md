# Technical Design Document: TaskMan

**Version:** 1.3
**Date:** November 4, 2025
**Status:** Prototype Design

---

## 1. Executive Summary

This document outlines the technical architecture, technology stack, data models, and implementation strategy for the TaskMan prototype. The system is designed as a multiplayer web application with a focus on scalability, responsive UI, and native control interactions.

**Prototype Philosophy**: The prototype prioritizes simplicity and rapid validation using HTTP polling for multiplayer features. The architecture is designed to easily integrate WebSockets in the future for real-time features like competitive modes, live collaboration, chat, and instant notifications.

### Key Technical Goals
- **Cross-platform web application** accessible on desktop and mobile browsers
- **Multiplayer task board** with HTTP polling (30s intervals + manual refresh)
- **Scalable stateless backend** for easy deployment and horizontal scaling
- **Native UI controls** with smooth, responsive interactions
- **Modular architecture** designed for easy WebSocket integration later

---

## 2. Technology Stack

### 2.1 Frontend: React + TypeScript

TaskMan uses **React 18+ with TypeScript** for the frontend, providing a robust foundation for the web-based multiplayer game.

**Why React for TaskMan**:

1. **Native Web Controls**: React uses actual HTML DOM elements (sliders, inputs, buttons, drag-and-drop), perfectly aligning with the design principle of using only native UI controls. This ensures the game feels natural on all devices without custom control implementations.

2. **Excellent Ecosystem**: React has the largest frontend ecosystem with mature solutions for:
   - HTTP polling (TanStack Query with built-in caching)
   - State management (Zustand, Jotai)
   - Drag-and-drop (dnd-kit)
   - Animations (Framer Motion)
   - UI frameworks (Tailwind CSS)

3. **Web-First Architecture**: React is battle-tested for browser-based applications, with excellent debugging tools, hot reload, and browser dev tools integration. This accelerates development and troubleshooting.

4. **Simple Deployment**: React apps compile to static files that can be deployed to any CDN or static hosting service (GCP Cloud Storage, Vercel, Netlify). No server-side rendering complexity needed for TaskMan.

5. **Progressive Enhancement**: Easy to add features incrementally:
   - Start with HTTP polling
   - Add PWA features for offline support
   - Integrate WebSockets when needed for real-time features
   - Expand to mobile with React Native (future)

6. **Strong Community**: Largest web framework community means:
   - Extensive documentation and tutorials
   - Quick answers on Stack Overflow
   - Easy to find developers for collaboration
   - Regular updates and long-term support

**Considerations**:
- Bundle size requires optimization (code splitting, lazy loading)
- Cross-browser testing needed for consistency
- Not as performant as native mobile apps for complex animations (acceptable for TaskMan's use case)

### 2.2 Frontend Technology Stack

```
Core Framework:
- React 18+ (TypeScript)
- Vite (build tool, faster than Create React App)

Data Management:
- TanStack Query (data fetching, caching, HTTP polling)
- Zustand or Jotai (lightweight global state management)

UI & Styling:
- Tailwind CSS (utility-first styling)
- Framer Motion (animations for task completion feedback)
- dnd-kit (drag-and-drop for composite task creation)

Routing & Navigation:
- React Router (client-side routing)

Development Tools:
- TypeScript (type safety)
- ESLint + Prettier (code quality)
- Vitest (unit testing)
- React Testing Library (component testing)
```

### 2.4 Backend: Node.js + Express

TaskMan uses **Node.js with Express** for the backend REST API, providing a stateless, scalable server architecture.

**Why Node.js + Express**:

1. **Language Consistency**: JavaScript/TypeScript across frontend and backend enables:
   - Code sharing (type definitions, validation schemas)
   - Easier context switching for developers
   - Unified tooling and build processes

2. **Perfect for REST APIs**: Express is lightweight and ideal for:
   - JSON-based APIs
   - Stateless request handling
   - Middleware architecture (authentication, validation, error handling)

3. **Non-Blocking I/O**: Node.js event loop handles concurrent requests efficiently:
   - Excellent for I/O-bound operations (database queries, HTTP polling)
   - Scales well with connection pooling
   - Low memory footprint per connection

4. **Rich Ecosystem**: Mature libraries for all TaskMan needs:
   - Authentication (JWT, bcrypt)
   - Database ORM (Prisma)
   - Validation (Zod)
   - Rate limiting (express-rate-limit)

5. **Future-Ready**: Easy to add WebSockets later:
   - Socket.io integrates seamlessly with Express
   - No architectural changes needed
   - Can run on same port as HTTP server

6. **Deployment Flexibility**: Works on any platform:
   - GCP Cloud Run (containerized, serverless)
   - Traditional VPS (PM2 process manager)
   - Serverless functions (AWS Lambda, Vercel)

### 2.5 Database: PostgreSQL + Prisma

**PostgreSQL 15+** provides the relational database for users, tasks, and transactions.

**Why PostgreSQL**:
- **ACID Compliance**: Critical for token transactions and task acceptance (race conditions)
- **JSON Support**: JSONB fields for flexible task data structures
- **Mature Ecosystem**: Well-supported on all cloud platforms
- **Performance**: Excellent with proper indexing for TaskMan's query patterns

**Prisma ORM Benefits**:
- Type-safe database access (TypeScript integration)
- Automatic migrations
- Intuitive query API
- Connection pooling built-in
- Works seamlessly with PostgreSQL's advanced features

### 2.6 Full Technology Stack Summary

```
Frontend:
- React 18+ with TypeScript
- Vite (build tool)
- TanStack Query (data fetching + polling)
- Zustand (state management)
- Tailwind CSS (styling)
- Framer Motion (animations)
- dnd-kit (drag-and-drop)
- React Router (routing)

Backend:
- Node.js 20+
- Express.js (REST API framework)
- TypeScript
- Prisma (ORM)
- Zod (validation)
- JWT (authentication)
- express-rate-limit (rate limiting)

Database & Infrastructure:
- PostgreSQL 15+ (primary database)
- Google Cloud Platform:
  - Cloud Storage + CDN (frontend hosting)
  - Cloud Run (backend hosting)
  - Cloud SQL (managed PostgreSQL)

Development Tools:
- Docker + Docker Compose (local development)
- ESLint + Prettier (code quality)
- Vitest + React Testing Library (testing)
- GitHub Actions (CI/CD)

Optional (Post-Prototype):
- Redis (caching, rate limiting, sessions)
- Socket.io (WebSocket server + client)
- React Native (native mobile apps)
```

---

## 3. System Architecture

### 3.1 High-Level Architecture (Prototype)

```
┌─────────────────────────────────────────────────────┐
│                   Client (Browser)                  │
│  ┌───────────────────────────────────────────────┐ │
│  │         React Application (TypeScript)        │ │
│  │  ┌─────────────┐  ┌────────────────────────┐ │ │
│  │  │ UI Components│  │   State Management     │ │ │
│  │  │  - Task UI   │  │   - Zustand stores     │ │ │
│  │  │  - Board     │  │   - TanStack Query     │ │ │
│  │  │  - Dashboard │  │   - Polling (30s)      │ │ │
│  │  └─────────────┘  └────────────────────────┘ │ │
│  │  ┌──────────────────────────────────────────┐ │ │
│  │  │      Communication Layer                 │ │ │
│  │  │  - REST API Client (fetch/axios)        │ │ │
│  │  │  - Smart polling with TanStack Query    │ │ │
│  │  │  - Optimistic UI updates                │ │ │
│  │  └──────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
                        │
                        │ HTTPS
                        ▼
┌─────────────────────────────────────────────────────┐
│         Backend Server (Node.js + Express)          │
│  ┌───────────────────────────────────────────────┐ │
│  │            API Layer (Express)                │ │
│  │  ┌──────────────────────────────────────────┐│ │
│  │  │          REST API Endpoints              ││ │
│  │  │                                          ││ │
│  │  │  /api/auth/*   - Authentication          ││ │
│  │  │  /api/tasks/*  - Task CRUD & submission  ││ │
│  │  │  /api/users/*  - User profile & stats    ││ │
│  │  │  /api/tokens/* - Token balance & history ││ │
│  │  │                                          ││ │
│  │  └──────────────────────────────────────────┘│ │
│  └───────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────┐ │
│  │          Business Logic Layer                 │ │
│  │  - Task validation                            │ │
│  │  - Token transactions                         │ │
│  │  - Composite task decomposition logic         │ │
│  │  - Economy balancing                          │ │
│  └───────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────┐ │
│  │            Data Access Layer                  │ │
│  │  - Prisma ORM                                 │ │
│  │  - Repository pattern                         │ │
│  │  - Query optimization                         │ │
│  │  - Transaction management                     │ │
│  └───────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
                        │
                        │
                        ▼
              ┌──────────────────┐
              │   PostgreSQL     │
              │   - Users        │
              │   - Tasks        │
              │   - Tokens       │
              │   - Transactions │
              └──────────────────┘

Note: Redis is optional for prototype (can add for caching/rate limiting later)
WebSocket support can be added post-prototype without major refactoring
```

### 3.2 Component Breakdown

#### 3.2.1 Frontend Components

**Core UI Components**:
- `<TaskBoard />` - Displays available tasks, filters, search
- `<TaskCard />` - Individual task preview with accept button
- `<TaskExecutor />` - Task-specific execution UI
  - `<SortListTask />`
  - `<ColorMatchTask />`
  - `<DefragTask />`
  - `<GroupSeparationTask />`
  - `<ArithmeticTask />`
- `<Dashboard />` - User stats, active tasks, token balance
- `<CompositeTaskCreator />` - Drag-and-drop task composition
- `<TokenDisplay />` - Animated token balance
- `<TutorialOverlay />` - Guided tour for new users

**State Management**:
```typescript
// Zustand stores
- userStore: { user, tokens, level, unlockedFeatures }
- taskStore: { activeTasks, completedTasks, taskHistory }
- boardStore: { availableTasks, filters, lastRefresh }
- uiStore: { modals, notifications, loading states }

// TanStack Query handles:
- Task board polling (30s interval + manual + on focus)
- API response caching
- Optimistic updates
- Request deduplication
```

#### 3.2.2 Backend Services

**REST API Endpoints**:
```
Authentication:
  POST   /api/auth/register
  POST   /api/auth/login
  POST   /api/auth/logout
  GET    /api/auth/me

Tasks:
  GET    /api/tasks              (list available tasks)
  GET    /api/tasks/:id          (get task details)
  POST   /api/tasks              (create/offer task)
  POST   /api/tasks/:id/accept   (accept task)
  POST   /api/tasks/:id/submit   (submit completed task)
  DELETE /api/tasks/:id          (cancel offered task)

Composite Tasks:
  GET    /api/composite-tasks/:id
  POST   /api/composite-tasks
  POST   /api/composite-tasks/:id/decompose
  GET    /api/composite-tasks/:id/subtasks

Users:
  GET    /api/users/me
  GET    /api/users/stats
  PATCH  /api/users/me

Tokens:
  GET    /api/tokens/balance
  GET    /api/tokens/history
```

**Polling Strategy**:
- Task board: Polled every 30 seconds
- Manual refresh button available
- Refresh on window focus
- Optimistic updates for immediate feedback
- Efficient queries with pagination and filtering

---

## 4. Data Models

### 4.1 Database Schema (PostgreSQL)

#### 4.1.1 Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  token_balance INTEGER DEFAULT 0 CHECK (token_balance >= 0),
  level INTEGER DEFAULT 1,
  tasks_completed INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Progression flags
  tutorial_completed BOOLEAN DEFAULT FALSE,
  task_board_unlocked BOOLEAN DEFAULT FALSE,
  composite_unlocked BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
```

#### 4.1.2 Tasks Table
```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(50) NOT NULL, -- 'simple', 'hard', 'composite'
  category VARCHAR(50) NOT NULL, -- 'sort', 'color_match', 'defrag', etc.

  -- Task details
  title VARCHAR(255) NOT NULL,
  description TEXT,
  data JSONB NOT NULL, -- Task-specific data (items to sort, target color, etc.)
  solution JSONB, -- Expected solution for validation

  -- Rewards and costs
  token_reward INTEGER NOT NULL CHECK (token_reward > 0),
  difficulty INTEGER CHECK (difficulty BETWEEN 1 AND 5),
  estimated_time_seconds INTEGER,

  -- Ownership and status
  creator_id UUID REFERENCES users(id) ON DELETE SET NULL,
  accepted_by_id UUID REFERENCES users(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'available', -- 'available', 'in_progress', 'completed', 'failed', 'expired'

  -- Composite task relationships
  parent_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  is_composite BOOLEAN DEFAULT FALSE,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  accepted_at TIMESTAMP,
  completed_at TIMESTAMP,
  expires_at TIMESTAMP,

  -- Metadata
  is_tutorial BOOLEAN DEFAULT FALSE,
  is_system_generated BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_creator ON tasks(creator_id);
CREATE INDEX idx_tasks_accepted_by ON tasks(accepted_by_id);
CREATE INDEX idx_tasks_parent ON tasks(parent_task_id);
CREATE INDEX idx_tasks_type ON tasks(type);
CREATE INDEX idx_tasks_available ON tasks(status) WHERE status = 'available';
```

#### 4.1.3 Composite Task Relationships Table
```sql
CREATE TABLE composite_subtasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  composite_task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  subtask_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  sequence_order INTEGER NOT NULL,
  is_valid BOOLEAN DEFAULT TRUE, -- Whether subtask is correct for this composite

  created_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(composite_task_id, subtask_id)
);

CREATE INDEX idx_composite_subtasks_composite ON composite_subtasks(composite_task_id);
CREATE INDEX idx_composite_subtasks_subtask ON composite_subtasks(subtask_id);
```

#### 4.1.4 Token Transactions Table
```sql
CREATE TABLE token_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- Positive for earnings, negative for spending
  balance_after INTEGER NOT NULL,
  transaction_type VARCHAR(50) NOT NULL, -- 'task_reward', 'task_offer', 'listing_fee', 'premium'

  -- Related entities
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,

  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_transactions_user ON token_transactions(user_id);
CREATE INDEX idx_transactions_task ON token_transactions(task_id);
CREATE INDEX idx_transactions_created_at ON token_transactions(created_at);
```

#### 4.1.5 Task Submissions Table
```sql
CREATE TABLE task_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  submitted_data JSONB NOT NULL, -- User's solution
  is_correct BOOLEAN NOT NULL,
  validation_details JSONB, -- Detailed feedback if incorrect

  time_taken_seconds INTEGER,
  submitted_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(task_id, user_id) -- One submission per user per task
);

CREATE INDEX idx_submissions_task ON task_submissions(task_id);
CREATE INDEX idx_submissions_user ON task_submissions(user_id);
```

### 4.2 Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id                  String    @id @default(uuid()) @db.Uuid
  username            String    @unique @db.VarChar(50)
  email               String    @unique @db.VarChar(255)
  passwordHash        String    @map("password_hash") @db.VarChar(255)
  tokenBalance        Int       @default(0) @map("token_balance")
  level               Int       @default(1)
  tasksCompleted      Int       @default(0) @map("tasks_completed")
  createdAt           DateTime  @default(now()) @map("created_at")
  updatedAt           DateTime  @updatedAt @map("updated_at")

  tutorialCompleted   Boolean   @default(false) @map("tutorial_completed")
  taskBoardUnlocked   Boolean   @default(false) @map("task_board_unlocked")
  compositeUnlocked   Boolean   @default(false) @map("composite_unlocked")

  createdTasks        Task[]    @relation("TaskCreator")
  acceptedTasks       Task[]    @relation("TaskAcceptor")
  transactions        TokenTransaction[]
  submissions         TaskSubmission[]

  @@map("users")
}

model Task {
  id                  String    @id @default(uuid()) @db.Uuid
  type                String    @db.VarChar(50)
  category            String    @db.VarChar(50)

  title               String    @db.VarChar(255)
  description         String?   @db.Text
  data                Json      @db.JsonB
  solution            Json?     @db.JsonB

  tokenReward         Int       @map("token_reward")
  difficulty          Int?
  estimatedTimeSeconds Int?     @map("estimated_time_seconds")

  creatorId           String?   @map("creator_id") @db.Uuid
  acceptedById        String?   @map("accepted_by_id") @db.Uuid
  status              String    @default("available") @db.VarChar(20)

  parentTaskId        String?   @map("parent_task_id") @db.Uuid
  isComposite         Boolean   @default(false) @map("is_composite")

  createdAt           DateTime  @default(now()) @map("created_at")
  acceptedAt          DateTime? @map("accepted_at")
  completedAt         DateTime? @map("completed_at")
  expiresAt           DateTime? @map("expires_at")

  isTutorial          Boolean   @default(false) @map("is_tutorial")
  isSystemGenerated   Boolean   @default(false) @map("is_system_generated")

  creator             User?     @relation("TaskCreator", fields: [creatorId], references: [id])
  acceptedBy          User?     @relation("TaskAcceptor", fields: [acceptedById], references: [id])
  parentTask          Task?     @relation("TaskHierarchy", fields: [parentTaskId], references: [id])
  subtasks            Task[]    @relation("TaskHierarchy")

  compositeRelations  CompositeSubtask[] @relation("CompositeTask")
  subtaskRelations    CompositeSubtask[] @relation("Subtask")

  transactions        TokenTransaction[]
  submissions         TaskSubmission[]

  @@index([status])
  @@index([creatorId])
  @@index([acceptedById])
  @@index([parentTaskId])
  @@index([type])
  @@map("tasks")
}

model CompositeSubtask {
  id                String    @id @default(uuid()) @db.Uuid
  compositeTaskId   String    @map("composite_task_id") @db.Uuid
  subtaskId         String    @map("subtask_id") @db.Uuid
  sequenceOrder     Int       @map("sequence_order")
  isValid           Boolean   @default(true) @map("is_valid")
  createdAt         DateTime  @default(now()) @map("created_at")

  compositeTask     Task      @relation("CompositeTask", fields: [compositeTaskId], references: [id], onDelete: Cascade)
  subtask           Task      @relation("Subtask", fields: [subtaskId], references: [id], onDelete: Cascade)

  @@unique([compositeTaskId, subtaskId])
  @@index([compositeTaskId])
  @@index([subtaskId])
  @@map("composite_subtasks")
}

model TokenTransaction {
  id              String    @id @default(uuid()) @db.Uuid
  userId          String    @map("user_id") @db.Uuid
  amount          Int
  balanceAfter    Int       @map("balance_after")
  transactionType String    @map("transaction_type") @db.VarChar(50)
  taskId          String?   @map("task_id") @db.Uuid
  description     String?   @db.Text
  createdAt       DateTime  @default(now()) @map("created_at")

  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  task            Task?     @relation(fields: [taskId], references: [id], onDelete: SetNull)

  @@index([userId])
  @@index([taskId])
  @@index([createdAt])
  @@map("token_transactions")
}

model TaskSubmission {
  id                 String    @id @default(uuid()) @db.Uuid
  taskId             String    @map("task_id") @db.Uuid
  userId             String    @map("user_id") @db.Uuid
  submittedData      Json      @map("submitted_data") @db.JsonB
  isCorrect          Boolean   @map("is_correct")
  validationDetails  Json?     @map("validation_details") @db.JsonB
  timeTakenSeconds   Int?      @map("time_taken_seconds")
  submittedAt        DateTime  @default(now()) @map("submitted_at")

  task               Task      @relation(fields: [taskId], references: [id], onDelete: Cascade)
  user               User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([taskId, userId])
  @@index([taskId])
  @@index([userId])
  @@map("task_submissions")
}
```

### 4.3 Task Data Structures

Each task type stores specific data in the `data` JSONB field:

#### Sort List Task
```typescript
interface SortListData {
  items: string[]; // Unsorted items
  sortCriteria: 'alphabetical' | 'numerical' | 'length';
}

interface SortListSolution {
  sortedItems: string[];
}
```

#### Color Match Task
```typescript
interface ColorMatchData {
  targetColor: { r: number; g: number; b: number }; // 0-255
  tolerance: number; // Percentage allowed deviation (e.g., 5%)
}

interface ColorMatchSolution {
  submittedColor: { r: number; g: number; b: number };
  isWithinTolerance: boolean;
}
```

#### Group Separation Task
```typescript
interface GroupSeparationData {
  items: Array<{
    id: string;
    label: string;
    attributes: Record<string, any>; // e.g., { color: 'red', shape: 'circle' }
  }>;
  groupBy: string; // Attribute to group by (e.g., 'color')
  expectedGroups: string[]; // Expected group names
}

interface GroupSeparationSolution {
  groups: Record<string, string[]>; // { 'red': ['item1', 'item2'], 'blue': ['item3'] }
}
```

#### Defragmentation Task
```typescript
interface DefragData {
  grid: string[][]; // 2D array of colors or IDs ('R', 'G', 'B', or empty '')
  rows: number;
  cols: number;
}

interface DefragSolution {
  grid: string[][]; // Defragmented grid
  moveCount: number; // Number of moves taken
}
```

#### Arithmetic Task
```typescript
interface ArithmeticData {
  expression: string; // e.g., "(45 * 3) + 127 - 89"
  correctAnswer: number;
}

interface ArithmeticSolution {
  answer: number;
}
```

---

## 5. Core Systems Implementation

### 5.1 Task Validation System

**Validation Flow**:
1. Client submits task solution via `POST /api/tasks/:id/submit`
2. Server retrieves task from database
3. Server runs validation logic based on task type
4. Server records submission in `task_submissions`
5. If correct:
   - Award tokens to user
   - Update task status to 'completed'
   - Create token transaction record
   - Return success response (client updates UI optimistically)
6. If incorrect:
   - Return validation error details
   - Allow retry (configurable retry limit)

Note: Other clients will see updated task board within 30s on next poll

**Validation Implementations**:

```typescript
// backend/src/validators/taskValidators.ts

interface ValidationResult {
  isCorrect: boolean;
  details?: string;
  score?: number; // For partial credit tasks
}

// Sort List Validator
export function validateSortList(
  solution: SortListSolution,
  taskData: SortListData
): ValidationResult {
  const expectedSorted = [...taskData.items].sort((a, b) => {
    if (taskData.sortCriteria === 'alphabetical') {
      return a.localeCompare(b);
    } else if (taskData.sortCriteria === 'numerical') {
      return parseFloat(a) - parseFloat(b);
    } else if (taskData.sortCriteria === 'length') {
      return a.length - b.length;
    }
    return 0;
  });

  const isCorrect = JSON.stringify(solution.sortedItems) === JSON.stringify(expectedSorted);

  return {
    isCorrect,
    details: isCorrect ? 'Perfect sort!' : 'Sort order is incorrect',
  };
}

// Color Match Validator
export function validateColorMatch(
  solution: ColorMatchSolution,
  taskData: ColorMatchData
): ValidationResult {
  const { r: tr, g: tg, b: tb } = taskData.targetColor;
  const { r: sr, g: sg, b: sb } = solution.submittedColor;

  const tolerance = taskData.tolerance / 100; // Convert percentage to decimal

  const rDiff = Math.abs(tr - sr) / 255;
  const gDiff = Math.abs(tg - sg) / 255;
  const bDiff = Math.abs(tb - sb) / 255;

  const avgDiff = (rDiff + gDiff + bDiff) / 3;
  const isCorrect = avgDiff <= tolerance;

  return {
    isCorrect,
    details: isCorrect
      ? `Great match! Accuracy: ${((1 - avgDiff) * 100).toFixed(1)}%`
      : `Too far off. Accuracy: ${((1 - avgDiff) * 100).toFixed(1)}%`,
    score: Math.max(0, 100 - avgDiff * 100),
  };
}

// Group Separation Validator
export function validateGroupSeparation(
  solution: GroupSeparationSolution,
  taskData: GroupSeparationData
): ValidationResult {
  // Build expected groups
  const expectedGroups: Record<string, Set<string>> = {};

  for (const item of taskData.items) {
    const groupKey = item.attributes[taskData.groupBy];
    if (!expectedGroups[groupKey]) {
      expectedGroups[groupKey] = new Set();
    }
    expectedGroups[groupKey].add(item.id);
  }

  // Compare with submitted groups
  let correctGroups = 0;
  let totalGroups = Object.keys(expectedGroups).length;

  for (const [groupName, expectedItems] of Object.entries(expectedGroups)) {
    const submittedItems = new Set(solution.groups[groupName] || []);

    if (setsEqual(expectedItems, submittedItems)) {
      correctGroups++;
    }
  }

  const isCorrect = correctGroups === totalGroups;

  return {
    isCorrect,
    details: isCorrect
      ? 'All groups correct!'
      : `${correctGroups}/${totalGroups} groups correct`,
    score: (correctGroups / totalGroups) * 100,
  };
}

function setsEqual<T>(a: Set<T>, b: Set<T>): boolean {
  if (a.size !== b.size) return false;
  for (const item of a) {
    if (!b.has(item)) return false;
  }
  return true;
}
```

### 5.2 Token Economy System

**Token Flow Architecture**:

```typescript
// backend/src/services/tokenService.ts

export class TokenService {
  /**
   * Award tokens to a user (e.g., task completion)
   */
  async awardTokens(
    userId: string,
    amount: number,
    transactionType: string,
    taskId?: string,
    description?: string
  ): Promise<TokenTransaction> {
    return await prisma.$transaction(async (tx) => {
      // Update user balance
      const user = await tx.user.update({
        where: { id: userId },
        data: {
          tokenBalance: { increment: amount },
        },
      });

      // Create transaction record
      const transaction = await tx.tokenTransaction.create({
        data: {
          userId,
          amount,
          balanceAfter: user.tokenBalance,
          transactionType,
          taskId,
          description,
        },
      });

      return transaction;
    });
  }

  /**
   * Deduct tokens from a user (e.g., offering a task)
   */
  async deductTokens(
    userId: string,
    amount: number,
    transactionType: string,
    taskId?: string,
    description?: string
  ): Promise<TokenTransaction> {
    return await prisma.$transaction(async (tx) => {
      // Check sufficient balance
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user || user.tokenBalance < amount) {
        throw new Error('Insufficient token balance');
      }

      // Update user balance
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          tokenBalance: { decrement: amount },
        },
      });

      // Create transaction record (negative amount)
      const transaction = await tx.tokenTransaction.create({
        data: {
          userId,
          amount: -amount,
          balanceAfter: updatedUser.tokenBalance,
          transactionType,
          taskId,
          description,
        },
      });

      return transaction;
    });
  }

  /**
   * Calculate composite task premium
   */
  calculatePremium(subtaskRewards: number[]): number {
    const totalSubtaskCost = subtaskRewards.reduce((sum, r) => sum + r, 0);
    const premiumPercentage = 0.15; // 15% premium
    return Math.floor(totalSubtaskCost * (1 + premiumPercentage));
  }
}
```

### 5.3 Task Board Polling System

**HTTP Polling with TanStack Query**:

```typescript
// frontend/src/hooks/useTaskBoard.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Task } from '../types';
import { apiClient } from '../services/apiClient';

interface TaskBoardFilters {
  type?: string;
  difficulty?: number;
  minReward?: number;
  maxReward?: number;
}

export function useTaskBoard(filters?: TaskBoardFilters) {
  const queryClient = useQueryClient();

  // Poll task board every 30 seconds
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['taskBoard', filters],
    queryFn: () => apiClient.get<Task[]>('/api/tasks', { params: filters }),
    refetchInterval: 30000, // 30 seconds
    refetchOnWindowFocus: true, // Refresh when user returns to tab
    staleTime: 10000, // Consider data stale after 10s (allows for fresher data on navigation)
  });

  // Mutation for accepting a task with optimistic update
  const acceptTaskMutation = useMutation({
    mutationFn: (taskId: string) => apiClient.post(`/api/tasks/${taskId}/accept`),
    onMutate: async (taskId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['taskBoard'] });

      // Snapshot previous value
      const previousTasks = queryClient.getQueryData<Task[]>(['taskBoard', filters]);

      // Optimistically remove task from board
      queryClient.setQueryData<Task[]>(['taskBoard', filters], (old) =>
        old?.filter((task) => task.id !== taskId) || []
      );

      return { previousTasks };
    },
    onError: (err, taskId, context) => {
      // Rollback on error
      if (context?.previousTasks) {
        queryClient.setQueryData(['taskBoard', filters], context.previousTasks);
      }
    },
    onSettled: () => {
      // Refetch to get accurate state
      queryClient.invalidateQueries({ queryKey: ['taskBoard'] });
    },
  });

  // Mutation for offering a task
  const offerTaskMutation = useMutation({
    mutationFn: (taskData: Partial<Task>) => apiClient.post('/api/tasks', taskData),
    onSuccess: (newTask) => {
      // Optimistically add task to board
      queryClient.setQueryData<Task[]>(['taskBoard', filters], (old) =>
        old ? [newTask, ...old] : [newTask]
      );
      // Invalidate to refetch accurate state
      queryClient.invalidateQueries({ queryKey: ['taskBoard'] });
    },
  });

  return {
    tasks: data || [],
    isLoading,
    refetch, // For manual refresh button
    acceptTask: acceptTaskMutation.mutate,
    offerTask: offerTaskMutation.mutate,
  };
}
```

**Backend API Endpoint**:

```typescript
// backend/src/routes/tasks.ts

import { Router } from 'express';
import { prisma } from '../prisma';
import { authenticate } from '../middleware/auth';

const router = Router();

// Get available tasks (with filters and pagination)
router.get('/', authenticate, async (req, res) => {
  const {
    type,
    difficulty,
    minReward,
    maxReward,
    page = 1,
    limit = 50,
  } = req.query;

  const where: any = {
    status: 'available',
    // Don't show tasks created by current user
    creatorId: { not: req.user.id },
  };

  if (type) where.type = type;
  if (difficulty) where.difficulty = parseInt(difficulty as string);
  if (minReward || maxReward) {
    where.tokenReward = {};
    if (minReward) where.tokenReward.gte = parseInt(minReward as string);
    if (maxReward) where.tokenReward.lte = parseInt(maxReward as string);
  }

  const tasks = await prisma.task.findMany({
    where,
    include: {
      creator: {
        select: { username: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: parseInt(limit as string),
    skip: (parseInt(page as string) - 1) * parseInt(limit as string),
  });

  // Include updated_at timestamp for client-side change detection
  res.json({
    tasks,
    page: parseInt(page as string),
    hasMore: tasks.length === parseInt(limit as string),
    serverTime: new Date().toISOString(), // For client time sync
  });
});

// Accept a task
router.post('/:id/accept', authenticate, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const task = await prisma.task.findUnique({ where: { id } });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (task.status !== 'available') {
      return res.status(400).json({ error: 'Task is no longer available' });
    }

    if (task.creatorId === userId) {
      return res.status(400).json({ error: 'Cannot accept your own task' });
    }

    // Update task status atomically
    const updatedTask = await prisma.task.update({
      where: { id, status: 'available' }, // Ensure it's still available
      data: {
        status: 'in_progress',
        acceptedById: userId,
        acceptedAt: new Date(),
      },
      include: {
        creator: { select: { username: true } },
      },
    });

    res.json({ task: updatedTask });
  } catch (error) {
    if (error.code === 'P2025') {
      // Prisma: Record not found or already updated
      return res.status(409).json({ error: 'Task was just taken by another user' });
    }
    throw error;
  }
});

export default router;
```

**Manual Refresh Component**:

```typescript
// frontend/src/components/TaskBoardHeader.tsx

import { useTaskBoard } from '../hooks/useTaskBoard';

export function TaskBoardHeader() {
  const { refetch, isLoading } = useTaskBoard();

  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-2xl font-bold">Task Board</h2>
      <button
        onClick={() => refetch()}
        disabled={isLoading}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {isLoading ? 'Refreshing...' : 'Refresh'}
      </button>
    </div>
  );
}
```

**Key Benefits of This Approach**:
- ✅ **Simpler Architecture**: No WebSocket server or connection management
- ✅ **Stateless Backend**: Easy to scale horizontally
- ✅ **Optimistic Updates**: Feels responsive despite polling
- ✅ **Smart Caching**: TanStack Query prevents unnecessary requests
- ✅ **Automatic Retries**: Built-in error handling and retry logic
- ✅ **Easy to Extend**: Adding WebSockets later requires minimal changes

### 5.4 Composite Task Decomposition

**Validation Logic**:

```typescript
// backend/src/services/compositeTaskService.ts

interface DecompositionRule {
  compositeCategory: string;
  validSubtaskCategories: string[];
  requiredSubtasks?: string[]; // Must include these
  forbiddenSubtasks?: string[]; // Cannot include these
  minSubtasks?: number;
  maxSubtasks?: number;
}

const decompositionRules: DecompositionRule[] = [
  {
    compositeCategory: 'data_processing',
    validSubtaskCategories: ['sort', 'arithmetic', 'group_separation'],
    minSubtasks: 2,
    maxSubtasks: 5,
  },
  {
    compositeCategory: 'visual_organization',
    validSubtaskCategories: ['color_match', 'defrag', 'group_separation'],
    minSubtasks: 2,
    maxSubtasks: 4,
  },
  // Add more rules as needed
];

export class CompositeTaskService {
  /**
   * Validate a proposed task decomposition
   */
  validateDecomposition(
    compositeTask: Task,
    proposedSubtasks: Task[]
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Find applicable rule
    const rule = decompositionRules.find(
      (r) => r.compositeCategory === compositeTask.category
    );

    if (!rule) {
      errors.push('No decomposition rules found for this task type');
      return { isValid: false, errors };
    }

    // Check subtask count
    if (rule.minSubtasks && proposedSubtasks.length < rule.minSubtasks) {
      errors.push(`Requires at least ${rule.minSubtasks} subtasks`);
    }
    if (rule.maxSubtasks && proposedSubtasks.length > rule.maxSubtasks) {
      errors.push(`Cannot exceed ${rule.maxSubtasks} subtasks`);
    }

    // Check subtask categories
    for (const subtask of proposedSubtasks) {
      if (!rule.validSubtaskCategories.includes(subtask.category)) {
        errors.push(`Invalid subtask type: ${subtask.category}`);
      }

      if (rule.forbiddenSubtasks?.includes(subtask.category)) {
        errors.push(`Forbidden subtask type: ${subtask.category}`);
      }
    }

    // Check required subtasks
    if (rule.requiredSubtasks) {
      const presentCategories = new Set(proposedSubtasks.map((t) => t.category));
      for (const required of rule.requiredSubtasks) {
        if (!presentCategories.has(required)) {
          errors.push(`Missing required subtask type: ${required}`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Create a composite task with subtasks
   */
  async createCompositeTask(
    creatorId: string,
    compositeTaskData: Partial<Task>,
    subtaskIds: string[]
  ): Promise<Task> {
    // Fetch proposed subtasks
    const subtasks = await prisma.task.findMany({
      where: { id: { in: subtaskIds } },
    });

    // Validate decomposition
    const validation = this.validateDecomposition(
      compositeTaskData as Task,
      subtasks
    );

    if (!validation.isValid) {
      throw new Error(`Invalid decomposition: ${validation.errors.join(', ')}`);
    }

    // Calculate token reward (subtask sum + premium)
    const tokenService = new TokenService();
    const subtaskRewards = subtasks.map((t) => t.tokenReward);
    const tokenReward = tokenService.calculatePremium(subtaskRewards);

    // Create composite task
    const compositeTask = await prisma.task.create({
      data: {
        ...compositeTaskData,
        creatorId,
        isComposite: true,
        tokenReward,
        status: 'available',
      },
    });

    // Link subtasks
    await prisma.compositeSubtask.createMany({
      data: subtasks.map((subtask, index) => ({
        compositeTaskId: compositeTask.id,
        subtaskId: subtask.id,
        sequenceOrder: index,
        isValid: true,
      })),
    });

    return compositeTask;
  }
}
```

### 5.5 Task Expiration System

**Purpose**: Automatically release tasks that are accepted but not completed within a calculated time limit to maintain a healthy task economy.

**Expiration Calculation**:
```typescript
// backend/src/utils/taskExpiration.ts

const TASK_TYPE_MULTIPLIERS = {
  sort_list: 1.0,
  arithmetic: 1.0,
  color_match: 1.2,
  group_separation: 1.3,
  defragmentation: 1.5,
};

const MIN_EXPIRATION_MS = 2 * 60 * 1000; // 2 minutes
const MAX_EXPIRATION_MS = 60 * 60 * 1000; // 60 minutes

export function calculateExpirationTime(
  estimatedTimeSeconds: number,
  difficulty: number,
  taskType: string
): Date {
  // Base: 3x estimated time
  const baseTime = estimatedTimeSeconds * 3 * 1000; // convert to ms

  // Difficulty multiplier: 1.0 to 1.8
  const difficultyMultiplier = 1.0 + (difficulty - 1) * 0.2;

  // Task type multiplier
  const typeMultiplier = TASK_TYPE_MULTIPLIERS[taskType] || 1.0;

  // Calculate total expiration time
  let expirationMs = baseTime * difficultyMultiplier * typeMultiplier;

  // Apply min/max caps
  expirationMs = Math.max(MIN_EXPIRATION_MS, Math.min(MAX_EXPIRATION_MS, expirationMs));

  // Return expiration timestamp
  return new Date(Date.now() + expirationMs);
}

export function isTaskExpired(expiresAt: Date | null): boolean {
  if (!expiresAt) return false;
  return new Date() > expiresAt;
}
```

**Task Acceptance Flow (Updated)**:
```typescript
// backend/src/routes/tasks.ts (POST /api/tasks/:id/accept)

import { calculateExpirationTime } from '../utils/taskExpiration';

router.post('/:id/accept', authMiddleware, async (req, res) => {
  const taskId = req.params.id;
  const userId = req.user!.userId;

  // Fetch task to calculate expiration
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { estimatedTimeSeconds: true, difficulty: true, type: true },
  });

  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }

  // Calculate expiration time
  const expiresAt = calculateExpirationTime(
    task.estimatedTimeSeconds || 60,
    task.difficulty || 1,
    task.type
  );

  // Atomic task acceptance with expiration
  const result = await prisma.task.updateMany({
    where: {
      id: taskId,
      status: 'available',
      creatorId: { not: userId },
    },
    data: {
      status: 'in_progress',
      acceptedById: userId,
      acceptedAt: new Date(),
      expiresAt, // Set expiration timestamp
    },
  });

  // ... rest of acceptance logic
});
```

**Task Submission Validation (Updated)**:
```typescript
// backend/src/routes/tasks.ts (POST /api/tasks/:id/submit)

import { isTaskExpired } from '../utils/taskExpiration';

router.post('/:id/submit', authMiddleware, async (req, res) => {
  const task = await prisma.task.findUnique({
    where: { id: req.params.id },
    select: { /* ... */, expiresAt: true },
  });

  // Check if task has expired
  if (isTaskExpired(task.expiresAt)) {
    return res.status(410).json({
      message: 'Task has expired. It has been returned to the available pool.',
      code: 'TASK_EXPIRED',
    });
  }

  // ... continue with normal validation
});
```

**Expiration Cleanup Service**:
```typescript
// backend/src/services/taskExpirationService.ts

export class TaskExpirationService {
  /**
   * Release expired tasks back to available pool
   * Should be called periodically (e.g., every 1 minute via cron)
   */
  static async releaseExpiredTasks(): Promise<number> {
    const now = new Date();

    const result = await prisma.task.updateMany({
      where: {
        status: 'in_progress',
        expiresAt: {
          not: null,
          lt: now, // Expired tasks
        },
      },
      data: {
        status: 'available',
        acceptedById: null,
        acceptedAt: null,
        expiresAt: null,
      },
    });

    if (result.count > 0) {
      console.log(`Released ${result.count} expired tasks`);
    }

    return result.count;
  }

  /**
   * Start periodic cleanup (runs every 60 seconds)
   */
  static startPeriodicCleanup(): NodeJS.Timeout {
    console.log('Task expiration cleanup service started');

    // Run immediately on startup
    this.releaseExpiredTasks();

    // Then run every minute
    return setInterval(() => {
      this.releaseExpiredTasks().catch(console.error);
    }, 60 * 1000);
  }
}
```

**Integration in Server**:
```typescript
// backend/src/server.ts

import { TaskExpirationService } from './services/taskExpirationService';

// ... Express setup

// Start expiration cleanup service
TaskExpirationService.startPeriodicCleanup();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

**Frontend Timer Display**:
```typescript
// frontend/src/hooks/useTaskTimer.ts

export function useTaskTimer(expiresAt: string | Date) {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = Date.now();
      const expiration = new Date(expiresAt).getTime();
      const remaining = Math.max(0, expiration - now);
      setTimeRemaining(remaining);
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  const minutes = Math.floor(timeRemaining / 60000);
  const seconds = Math.floor((timeRemaining % 60000) / 1000);

  return {
    timeRemaining,
    minutes,
    seconds,
    isExpired: timeRemaining === 0,
    formatted: `${minutes}:${seconds.toString().padStart(2, '0')}`,
  };
}
```

---

## 6. Security & Performance

### 6.1 Security Considerations

**Authentication**:
- JWT tokens for API authentication
- HTTP-only cookies for session management
- Bcrypt for password hashing (10 rounds)

**Authorization**:
- Users can only accept tasks not created by themselves
- Users can only submit tasks they've accepted
- Token transactions are atomic (database transactions)

**Input Validation**:
- All API inputs validated with Zod schemas
- Task solutions sanitized before validation
- Rate limiting on task creation and submission (10 tasks/min per user)
- Request deduplication to prevent race conditions

**Data Protection**:
- Environment variables for secrets (.env)
- Database credentials not in codebase
- CORS configured for specific origins

### 6.2 Performance Optimizations

**Database**:
- Indexes on frequently queried fields (status, creator, timestamps)
- Pagination for task board (50 tasks per page)
- Connection pooling (PgBouncer for production)
- Atomic updates to prevent race conditions on task acceptance

**Frontend**:
- Code splitting by route (React.lazy)
- Image optimization and lazy loading
- Debounce search and filter inputs
- Virtual scrolling for long task lists (react-window)
- Service Worker for offline support (PWA)

**Backend**:
- Response compression (gzip)
- Static asset caching (CDN for production)
- HTTP caching headers for task board (max-age=10s)
- Background jobs for task expiration cleanup (cron or scheduled job)

**Monitoring**:
- Sentry for error tracking
- Analytics for user behavior
- Performance metrics (API response times, polling efficiency)

---

## 7. Development Workflow

### 7.1 Tech Stack Summary

```
Frontend (Prototype):
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS
- Zustand (state management)
- TanStack Query (data fetching + polling)
- React Router (navigation)
- dnd-kit (drag-and-drop)
- Framer Motion (animations)

Backend (Prototype):
- Node.js 20+
- Express.js
- TypeScript
- Prisma (ORM)
- PostgreSQL 15+
- JWT (authentication)
- Zod (validation)
- express-rate-limit (rate limiting)

Optional (Post-Prototype):
- Redis (caching, rate limiting, sessions)
- Socket.io + Socket.io-client (real-time features)

DevOps:
- Docker + Docker Compose (PostgreSQL only for prototype)
- ESLint + Prettier
- Husky (pre-commit hooks)
- GitHub Actions (CI/CD)
```

### 7.2 Project Structure

```
taskman/
├── frontend/                   # React application
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── tasks/         # Task-specific components
│   │   │   ├── ui/            # Reusable UI components
│   │   │   └── layout/        # Layout components
│   │   ├── pages/             # Page components
│   │   ├── hooks/             # Custom React hooks
│   │   ├── stores/            # Zustand stores
│   │   ├── services/          # API and WebSocket services
│   │   ├── types/             # TypeScript types
│   │   ├── utils/             # Utility functions
│   │   └── App.tsx
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── backend/                    # Node.js API
│   ├── src/
│   │   ├── routes/            # Express routes
│   │   ├── controllers/       # Route handlers
│   │   ├── services/          # Business logic
│   │   ├── validators/        # Task validation logic
│   │   ├── middleware/        # Auth, error handling, rate limiting
│   │   ├── types/             # TypeScript types
│   │   ├── utils/             # Utility functions
│   │   └── server.ts          # Entry point
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── package.json
│   └── tsconfig.json
│
├── docker-compose.yml          # Local dev environment
├── .env.example               # Environment variable template
├── README.md
├── BRAINSTORM.md
├── GDD.md
└── TDD.md                     # This document
```

### 7.3 Development Setup

**Prerequisites**:
- Node.js 20+
- Docker + Docker Compose
- Git

**Initial Setup**:
```bash
# Clone repository
git clone <repo-url>
cd taskman

# Install dependencies
cd frontend && npm install
cd ../backend && npm install

# Start infrastructure (PostgreSQL only for prototype)
docker-compose up -d

# Setup database
cd backend
cp .env.example .env  # Edit with local config
npx prisma migrate dev
npx prisma db seed    # Seed with tutorial tasks

# Start backend
npm run dev           # Runs on http://localhost:3001

# Start frontend (new terminal)
cd frontend
npm run dev           # Runs on http://localhost:5173
```

**Note**: Redis is optional for the prototype. Add it later for caching or when integrating WebSockets.

---

## 8. Deployment Architecture

**Recommended Platform:** Google Cloud Platform (GCP)

This section provides detailed deployment instructions for GCP. For alternative platforms and cost comparisons, see `DEPLOYMENT_COSTS.md`.

### 8.1 Why Google Cloud Platform?

**Cost Efficiency:**
- **Prototype (10-50 users):** $12-14/month
- **Production (100-500 users):** $25-35/month
- **Production (500-1000 users):** $70-100/month
- **30-50% cheaper** than alternatives at production scale
- **$300 free credit** for new accounts (30 months of prototype hosting)

**Technical Benefits:**
- **Cloud Run:** True serverless, scales to zero, perfect for stateless Node.js API
- **Cloud SQL:** Managed PostgreSQL with automatic backups and high availability
- **Cloud CDN:** Global CDN with 80-120ms latency worldwide
- **Stateless Architecture:** Easy horizontal scaling without session management
- **No Redis Required:** For prototype (can add later if needed)

**Operational Benefits:**
- Full infrastructure control
- Industry-standard platform
- No cold starts with min instances
- Excellent monitoring and logging (Cloud Monitoring, Cloud Logging)
- Integration with other GCP services (BigQuery, Cloud Tasks, etc.)

### 8.2 GCP Architecture for TaskMan

```
┌─────────────────────────────────────────────────┐
│                    Users                        │
└──────────────────┬──────────────────────────────┘
                   │
                   │ HTTPS
                   ▼
┌─────────────────────────────────────────────────┐
│              Cloud Load Balancer                │
│           (HTTPS, SSL Termination)              │
└─────────┬─────────────────────────┬─────────────┘
          │                         │
          │ Static Assets           │ API Requests
          ▼                         ▼
┌──────────────────┐      ┌──────────────────────┐
│  Cloud Storage   │      │     Cloud Run        │
│   + Cloud CDN    │      │   (Node.js API)      │
│                  │      │                      │
│  - React build   │      │  - Stateless         │
│  - Images/fonts  │      │  - Auto-scaling      │
│  - Static assets │      │  - Min instances: 0  │
│  - Gzip enabled  │      │  - Max instances: 10 │
└──────────────────┘      └──────────┬───────────┘
                                     │
                                     │ SQL
                                     ▼
                          ┌──────────────────────┐
                          │      Cloud SQL       │
                          │   (PostgreSQL 15)    │
                          │                      │
                          │  - Automatic backups │
                          │  - Point-in-time     │
                          │  - High availability │
                          └──────────────────────┘
```

### 8.3 Prototype Deployment (10-50 Users)

**Cost Estimate:** $12-14/month (or $0 with free credits)

#### 8.3.1 Frontend: Cloud Storage + Cloud CDN

**Setup:**
```bash
# Create storage bucket
gsutil mb -p your-project-id -c STANDARD -l us-central1 gs://taskman-frontend

# Make bucket publicly readable
gsutil iam ch allUsers:objectViewer gs://taskman-frontend

# Enable Cloud CDN (via Load Balancer - see below)
```

**Build and Deploy:**
```bash
# Build React app
cd frontend
npm run build

# Upload to Cloud Storage
gsutil -m rsync -r -d dist/ gs://taskman-frontend

# Set cache control headers
gsutil -m setmeta -h "Cache-Control:public, max-age=31536000" gs://taskman-frontend/assets/**
gsutil -m setmeta -h "Cache-Control:public, max-age=0, must-revalidate" gs://taskman-frontend/index.html
```

**Costs:**
- Storage: ~5 MB × $0.020 = $0.10/month
- CDN Bandwidth: 20 GB × $0.08 = $1.60/month
- **Total: ~$1.70/month**

#### 8.3.2 Backend: Cloud Run

**Dockerfile:**
```dockerfile
# backend/Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Expose port
EXPOSE 8080

# Start server
CMD ["npm", "start"]
```

**Deploy:**
```bash
# Build and push container
gcloud builds submit --tag gcr.io/your-project-id/taskman-api

# Deploy to Cloud Run
gcloud run deploy taskman-api \
  --image gcr.io/your-project-id/taskman-api \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --min-instances 0 \
  --max-instances 10 \
  --memory 512Mi \
  --cpu 1 \
  --set-env-vars DATABASE_URL="postgresql://..." \
  --set-env-vars JWT_SECRET="..." \
  --set-env-vars NODE_ENV="production"
```

**Costs:**
- Requests: 2.6M - 2M free = 0.6M × $0.40 = $0.24/month
- CPU: Minimal overage ~$1-2/month
- Memory: Within free tier
- **Total: ~$1.50-2.50/month**

#### 8.3.3 Database: Cloud SQL

**Create Instance:**
```bash
gcloud sql instances create taskman-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=us-central1 \
  --root-password="your-secure-password" \
  --backup-start-time=03:00 \
  --enable-bin-log \
  --retained-backups-count=7
```

**Create Database:**
```bash
gcloud sql databases create taskman --instance=taskman-db

# Create user
gcloud sql users create taskman-user \
  --instance=taskman-db \
  --password="your-secure-password"
```

**Costs:**
- Instance: $9.37/month (db-f1-micro)
- Storage: 10 GB included
- **Total: ~$9.37/month**

**Prototype Total: ~$12.57/month**

### 8.4 Production Deployment (100-500 Users)

**Cost Estimate:** $25-40/month

#### 8.4.1 Frontend Scaling

**Setup Load Balancer with Cloud CDN:**
```bash
# Create backend bucket
gcloud compute backend-buckets create taskman-frontend-backend \
  --gcs-bucket-name=taskman-frontend \
  --enable-cdn

# Create URL map
gcloud compute url-maps create taskman-url-map \
  --default-backend-bucket=taskman-frontend-backend

# Create HTTPS proxy (requires SSL certificate)
gcloud compute target-https-proxies create taskman-https-proxy \
  --url-map=taskman-url-map \
  --ssl-certificates=taskman-cert

# Create forwarding rule
gcloud compute forwarding-rules create taskman-https-rule \
  --global \
  --target-https-proxy=taskman-https-proxy \
  --ports=443
```

**Costs:**
- CDN Bandwidth: 128 GB × $0.08 = $10.24/month
- Load Balancer: $18/month (fixed cost)
- **Total: ~$28/month**

#### 8.4.2 Backend Scaling

**Update Cloud Run:**
```bash
gcloud run deploy taskman-api \
  --image gcr.io/your-project-id/taskman-api \
  --min-instances 1 \
  --max-instances 20 \
  --memory 1Gi \
  --cpu 2 \
  --concurrency 80
```

**Costs:**
- Requests: 17.4M - 2M free = 15.4M × $0.40 = $6.16/month
- CPU: Estimated $15-20/month
- Memory: Estimated $2-5/month
- **Total: ~$23-31/month**

#### 8.4.3 Database Upgrade

**Upgrade to db-g1-small:**
```bash
gcloud sql instances patch taskman-db \
  --tier=db-g1-small
```

**Costs:**
- Instance: $28-32/month (db-g1-small)
- Storage: +2 GB × $0.17 = $0.34/month
- **Total: ~$28-33/month**

**Production Total: ~$79-92/month** (conservative estimate with Load Balancer)

**Optimized Production: ~$45-65/month** (without Load Balancer, using Cloud Storage direct URL)

### 8.5 Continuous Deployment with Cloud Build

**cloudbuild.yaml:**
```yaml
# cloudbuild.yaml (backend)
steps:
  # Build container
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/taskman-api', '.']

  # Push container
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/taskman-api']

  # Deploy to Cloud Run
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: gcloud
    args:
      - 'run'
      - 'deploy'
      - 'taskman-api'
      - '--image=gcr.io/$PROJECT_ID/taskman-api'
      - '--region=us-central1'
      - '--platform=managed'
      - '--allow-unauthenticated'

images:
  - 'gcr.io/$PROJECT_ID/taskman-api'
```

**Setup Trigger:**
```bash
gcloud builds triggers create github \
  --repo-name=taskman \
  --repo-owner=your-github-username \
  --branch-pattern="^main$" \
  --build-config=cloudbuild.yaml
```

### 8.6 Environment Configuration

**Cloud Run Environment Variables:**
```bash
gcloud run services update taskman-api \
  --set-env-vars="NODE_ENV=production" \
  --set-env-vars="DATABASE_URL=postgresql://user:pass@/taskman?host=/cloudsql/project:region:instance" \
  --set-env-vars="JWT_SECRET=your-secret-key-from-secret-manager" \
  --set-env-vars="CORS_ORIGIN=https://taskman.example.com"
```

**Using Secret Manager (Recommended):**
```bash
# Create secret
echo -n "your-jwt-secret" | gcloud secrets create jwt-secret --data-file=-

# Grant Cloud Run access
gcloud secrets add-iam-policy-binding jwt-secret \
  --member="serviceAccount:your-service-account@project.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

# Update Cloud Run to use secret
gcloud run services update taskman-api \
  --set-secrets="JWT_SECRET=jwt-secret:latest"
```

### 8.7 Monitoring & Logging

**Setup Alerts:**
```bash
# Create alert for high error rate
gcloud alpha monitoring policies create \
  --notification-channels=your-channel-id \
  --display-name="TaskMan API Error Rate" \
  --condition-display-name="Error rate > 5%" \
  --condition-threshold-value=0.05 \
  --condition-threshold-duration=300s
```

**View Logs:**
```bash
# Cloud Run logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=taskman-api" \
  --limit 50 \
  --format json

# Filter errors
gcloud logging read "resource.type=cloud_run_revision AND severity>=ERROR" \
  --limit 20
```

### 8.8 Database Management

**Backups:**
```bash
# Create on-demand backup
gcloud sql backups create --instance=taskman-db

# List backups
gcloud sql backups list --instance=taskman-db

# Restore from backup
gcloud sql backups restore backup-id --backup-instance=taskman-db --instance=taskman-db
```

**Migrations:**
```bash
# Run Prisma migrations
# Option 1: From local machine with Cloud SQL Proxy
cloud_sql_proxy -instances=project:region:instance=tcp:5432

# In another terminal
cd backend
DATABASE_URL="postgresql://user:pass@localhost:5432/taskman" npx prisma migrate deploy

# Option 2: Via Cloud Run job (recommended for production)
gcloud run jobs create taskman-migrate \
  --image gcr.io/your-project-id/taskman-api \
  --command="npx" \
  --args="prisma,migrate,deploy" \
  --set-env-vars DATABASE_URL="..."
```

### 8.9 Cost Optimization Tips

**Reduce Costs:**
1. **Use free tier credits** ($300 for new accounts)
2. **Set min instances to 0** during development (accept cold starts)
3. **Use db-f1-micro** for prototype (sufficient for 50 users)
4. **Enable Cloud CDN caching** for static assets
5. **Compress API responses** with gzip
6. **Use connection pooling** (PgBouncer) to reduce database costs
7. **Monitor and set billing alerts** (prevent surprises)

**Billing Alerts:**
```bash
# Set budget alert at $50/month
gcloud billing budgets create \
  --billing-account=your-billing-account-id \
  --display-name="TaskMan Monthly Budget" \
  --budget-amount=50 \
  --threshold-rule=percent=50 \
  --threshold-rule=percent=90 \
  --threshold-rule=percent=100
```

### 8.10 Alternative Platforms

**If GCP doesn't fit your needs:**

**Vercel (Easiest for Development):**
- Cost: $0 for development, $20-25/month for prototype
- Best for: Rapid prototyping without devops
- See `DEPLOYMENT_COSTS.md` for detailed comparison

**Render (Middle Ground):**
- Cost: $15-31/month for prototype
- Best for: Simple pricing, always-on services
- See `DEPLOYMENT_COSTS.md` for detailed comparison

**AWS (Enterprise Scale):**
- Cost: Similar to GCP at scale
- Best for: Teams already on AWS, need AWS-specific services
- More complex than GCP for small projects

---

## 9. Prototype Implementation Roadmap

### Phase 1: Foundation (2-3 weeks)
**Backend**:
- ✅ Setup Express + TypeScript project
- ✅ Configure Prisma + PostgreSQL
- ✅ Implement authentication (JWT)
- ✅ Create User and Task models
- ✅ Build REST API endpoints for tasks
- ✅ Implement token transaction system

**Frontend**:
- ✅ Setup React + Vite + TypeScript
- ✅ Configure Tailwind CSS
- ✅ Build authentication UI (login/register)
- ✅ Create basic layout and navigation
- ✅ Setup Zustand stores

### Phase 2: Core Task System (2-3 weeks)
**Backend**:
- ✅ Implement task validation logic
  - Sort List
  - Color Match
  - Arithmetic
  - Group Separation
  - Defragmentation
- ✅ Build tutorial task seeding
- ✅ Create task acceptance logic

**Frontend**:
- ✅ Build task execution components
  - `<SortListTask />`
  - `<ColorMatchTask />`
  - `<ArithmeticTask />`
  - `<GroupSeparationTask />`
  - `<DefragTask />`
- ✅ Create task board UI
- ✅ Implement task submission flow
- ✅ Add token display and animations

### Phase 3: Multiplayer with Polling (1 week)
**Backend**:
- ✅ Optimize task board API endpoint with filters and pagination
- ✅ Implement race condition handling for task acceptance
- ✅ Add HTTP caching headers

**Frontend**:
- ✅ Setup TanStack Query with polling strategy
- ✅ Implement task board with 30s auto-refresh
- ✅ Add manual refresh button
- ✅ Implement optimistic UI updates for task acceptance/offering

### Phase 4: Progression & Tutorial (1 week)
**Backend**:
- ✅ Implement progression unlocks
- ✅ Create tutorial task sequences

**Frontend**:
- ✅ Build tutorial overlay
- ✅ Add progression indicators
- ✅ Create unlock notifications

### Phase 5: Composite Tasks (2-3 weeks)
**Backend**:
- ✅ Implement composite task models
- ✅ Build decomposition validation
- ✅ Create premium calculation

**Frontend**:
- ✅ Build composite task creator UI
- ✅ Implement drag-and-drop composition
- ✅ Add validation feedback
- ✅ Create subtask monitoring dashboard

### Phase 6: Polish & Testing (1-2 weeks)
- ✅ UI/UX refinements
- ✅ Animation polish
- ✅ Bug fixes
- ✅ Performance optimization
- ✅ Playtesting with small group
- ✅ Balance adjustments

**Total Estimated Time**: 9-12 weeks (reduced from 10-14 weeks)

**Time Savings**: Removing WebSocket implementation saves ~1-2 weeks

---

## 10. Testing Strategy

### 10.1 Backend Testing
```typescript
// Unit tests (Jest)
- Task validation logic
- Token transaction calculations
- Decomposition rules

// Integration tests
- API endpoints
- Database operations
- Polling behavior

// E2E tests (future)
- Full task completion flows
- Multiplayer scenarios
- Race conditions on task acceptance
```

### 10.2 Frontend Testing
```typescript
// Unit tests (Vitest + React Testing Library)
- Component rendering
- User interactions
- State management

// Integration tests
- Task submission flows
- Polling and data refetching
- Optimistic updates

// E2E tests (Playwright)
- Full user journeys
- Cross-browser testing
```

---

## 11. Monitoring & Analytics

### 11.1 Key Metrics to Track

**User Engagement**:
- Daily/Monthly Active Users (DAU/MAU)
- Average session duration
- Tasks completed per session
- Retention rates (1-day, 7-day, 30-day)

**Economy Health**:
- Total tokens in circulation
- Token velocity (transactions per day)
- Average task price trends
- Token faucets vs sinks ratio

**Task Performance**:
- Task completion rates by type
- Average completion time by type
- Most popular task types
- Failure rates and retry patterns

**Multiplayer Activity**:
- Player-offered tasks vs system tasks
- Task board polling efficiency (requests/minute)
- Concurrent users
- Race condition frequency on task acceptance
- Composite task success rates

### 11.2 Tools
- **Analytics**: Plausible or Google Analytics
- **Error Tracking**: Sentry
- **Performance**: Vercel Analytics, Lighthouse
- **Custom Dashboards**: Grafana + Prometheus (production)

---

## 12. Risk Mitigation

### 12.1 Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Race conditions on task acceptance | Medium | Medium | Atomic database updates, proper error handling, optimistic UI rollback |
| Polling overhead at scale | Low | Medium | Efficient queries, HTTP caching, pagination, consider WebSockets later |
| Database performance at scale | Low | High | Proper indexing, query optimization, connection pooling |
| Token economy exploits | Medium | High | Transaction atomicity, rate limiting, fraud detection, audit logging |
| Task validation bypasses | Low | High | Server-side validation only, no client-side shortcuts |
| Poor mobile performance | Medium | Medium | Performance profiling, code splitting, lazy loading, service worker |

### 12.2 Product Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Low player engagement | Medium | High | Compelling tutorial, daily rewards, regular content |
| Unbalanced economy | High | Medium | Monitor metrics, adjust rewards dynamically |
| Tasks too difficult/easy | Medium | Medium | Playtesting, difficulty ratings, adaptive difficulty |
| Insufficient task variety | Medium | Medium | Procedural generation, community-created tasks (future) |
| Multiplayer ghosting | High | Low | Bot-generated tasks, incentives for task offering |

---

## 13. Future Technical Enhancements

### 13.1 Short-Term (Post-Prototype)
- Progressive Web App (PWA) features
- Offline task completion
- Push notifications for task updates
- Task history and stats dashboard
- Leaderboards (Redis sorted sets)

### 13.2 Medium-Term
- Native mobile apps (React Native or Flutter)
- Advanced analytics dashboard
- A/B testing framework
- User-generated content moderation
- Social features (friends, challenges)

### 13.3 Long-Term
- AI-generated tasks
- Procedural task generation
- Machine learning for difficulty adjustment
- Blockchain integration for token economy (if relevant)
- Cross-platform play (web, mobile, desktop)

### 13.4 WebSocket Integration Path (Post-Prototype)

**When to Add WebSockets**:
The prototype uses HTTP polling, which is sufficient for validation. Consider adding WebSockets when you need:

1. **Competitive/Time-Sensitive Modes**
   - Racing to complete tasks first
   - Timed challenges with leaderboards
   - Live tournaments or events

2. **Live Collaborative Tasks**
   - Multiple players working on the same composite task simultaneously
   - Shared task state that needs instant synchronization

3. **Real-Time Chat or Social Features**
   - In-game chat or messaging
   - Live notifications for friend activities
   - Social presence indicators

4. **Instant Notifications**
   - Task completion alerts
   - Token balance updates
   - System announcements

5. **High-Scale Real-Time Updates**
   - Thousands of concurrent users expecting instant updates
   - Polling becomes inefficient or costly

**Migration Strategy**:

The current architecture is designed to make adding WebSockets straightforward:

```typescript
// 1. Backend: Add Socket.io server alongside REST API
// backend/src/server.ts
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: { origin: process.env.FRONTEND_URL },
});

// Setup WebSocket handlers
setupTaskBoardSocket(io); // New file: backend/src/websocket/taskBoard.ts

httpServer.listen(PORT);
```

```typescript
// 2. Frontend: Add Socket.io client (optional, not forced)
// frontend/src/hooks/useTaskBoard.ts

export function useTaskBoard(filters?: TaskBoardFilters, useWebSocket = false) {
  const queryClient = useQueryClient();

  // Keep polling as fallback
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['taskBoard', filters],
    queryFn: () => apiClient.get<Task[]>('/api/tasks', { params: filters }),
    refetchInterval: useWebSocket ? false : 30000, // Disable polling if using WebSocket
    // ... rest of config
  });

  // Add WebSocket listeners if enabled
  useEffect(() => {
    if (!useWebSocket) return;

    socketService.connect(token);
    socketService.onTaskAdded((task) => {
      queryClient.setQueryData(['taskBoard', filters], (old) =>
        old ? [task, ...old] : [task]
      );
    });

    return () => socketService.disconnect();
  }, [useWebSocket]);

  // ... rest remains the same
}
```

**Key Design Decisions That Enable Easy WebSocket Integration**:

1. **Stateless Backend**: No session state means WebSockets can be added without refactoring core logic
2. **TanStack Query**: Already handles optimistic updates, so WebSocket events just update the cache
3. **Atomic Database Operations**: Task acceptance logic already handles race conditions
4. **Modular Frontend Hooks**: `useTaskBoard` can support both polling and WebSocket modes
5. **Separation of Concerns**: Business logic in services layer, not tied to transport layer

**Estimated Integration Time**: 1-2 weeks to add full WebSocket support

**Redis Integration** (also post-prototype, needed for WebSocket scaling):
- Session storage for WebSocket connections
- Pub/sub for multi-server WebSocket synchronization
- Rate limiting for WebSocket events
- Caching layer for frequently accessed data

---

## 14. Conclusion

This Technical Design Document provides a comprehensive blueprint for building the TaskMan prototype. The recommended React + TypeScript + Node.js stack with HTTP polling offers the best balance of:
- **Development speed** for rapid prototyping (9-12 weeks vs. 10-14 with WebSockets)
- **Native web controls** aligned with design principles
- **Simplified architecture** with stateless backend for easy scaling
- **Multiplayer functionality** via efficient HTTP polling
- **Future-ready design** for easy WebSocket integration when needed
- **Developer ecosystem** for long-term maintenance
- **Lower costs** ($0-7/month for prototype hosting)

The architecture is designed to be modular, allowing for iterative development and feature additions based on user feedback. The decision to use HTTP polling for the prototype reduces complexity while maintaining a clear path to add WebSockets for future real-time features (competitive modes, live collaboration, chat, instant notifications). By following the phased implementation roadmap, the prototype can be built in 9-12 weeks, with core gameplay validated early for rapid iteration.

**Next Steps**:
1. Review and approve this TDD
2. Setup development environment
3. Begin Phase 1 implementation
4. Establish regular playtesting cadence
5. Iterate based on feedback

---

## 15. Appendix

### 15.1 Useful Libraries

**Frontend**:
- `react-use` - Collection of useful React hooks
- `react-hot-toast` - Toast notifications
- `clsx` - Conditional class names
- `date-fns` - Date manipulation
- `zod` - Runtime type validation
- `react-error-boundary` - Error handling

**Backend**:
- `express-validator` - Request validation
- `helmet` - Security headers
- `cors` - CORS middleware
- `express-rate-limit` - Rate limiting
- `winston` - Logging
- `bull` - Job queue (Redis-based)

### 15.2 Environment Variables

```bash
# Backend .env (Local Development)
DATABASE_URL="postgresql://user:pass@localhost:5432/taskman"
JWT_SECRET="your-secret-key-change-this"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV="development"
CORS_ORIGIN="http://localhost:5173"

# Backend .env (GCP Production)
# Use Cloud Run environment variables or Secret Manager instead of .env file
NODE_ENV="production"
DATABASE_URL="postgresql://user:pass@/taskman?host=/cloudsql/project-id:region:instance-name"
JWT_SECRET="[stored in Secret Manager]"
CORS_ORIGIN="https://taskman.example.com"
PORT=8080

# Frontend .env (Local Development)
VITE_API_URL="http://localhost:3001"

# Frontend .env (GCP Production)
VITE_API_URL="https://taskman-api-xxxx-uc.a.run.app"

# Optional (post-prototype):
# REDIS_URL="redis://localhost:6379"  # Local development
# REDIS_URL="redis://[memorystore-ip]:6379"  # GCP Memorystore

# Optional (when WebSockets added):
# VITE_WS_URL="ws://localhost:3001"  # Local
# VITE_WS_URL="wss://taskman-api-xxxx-uc.a.run.app"  # GCP
# VITE_ENABLE_WEBSOCKET="false"
```

### 15.3 Useful Commands

```bash
# Backend
npm run dev          # Start dev server with hot reload
npm run build        # Compile TypeScript
npm run start        # Start production server
npm run test         # Run tests
npx prisma studio    # Open Prisma database GUI
npx prisma migrate dev --name init  # Create migration

# Frontend
npm run dev          # Start Vite dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run test         # Run tests
npm run lint         # Lint code

# Docker (Local Development)
docker-compose up -d              # Start PostgreSQL
docker-compose down               # Stop infrastructure
docker-compose logs -f postgres   # View PostgreSQL logs

# GCP Deployment
# Setup (one-time)
gcloud auth login                                    # Authenticate
gcloud config set project your-project-id            # Set project
gcloud services enable run.googleapis.com sql-component.googleapis.com storage-api.googleapis.com

# Backend Deployment
cd backend
gcloud builds submit --tag gcr.io/your-project-id/taskman-api
gcloud run deploy taskman-api --image gcr.io/your-project-id/taskman-api --region us-central1

# Frontend Deployment
cd frontend
npm run build
gsutil -m rsync -r -d dist/ gs://taskman-frontend

# Database Management
gcloud sql instances list                            # List instances
gcloud sql databases list --instance=taskman-db      # List databases
gcloud sql backups list --instance=taskman-db        # List backups

# Monitoring
gcloud run services describe taskman-api --region us-central1
gcloud logging read "resource.type=cloud_run_revision" --limit 20
gcloud monitoring dashboards list

# Cost Management
gcloud billing accounts list
gcloud billing budgets list --billing-account=YOUR_ACCOUNT_ID
```

---

**Document Version History**:
- v1.0 (2025-11-04): Initial draft with WebSocket implementation and React vs Flutter comparison
- v1.1 (2025-11-04): Updated to use HTTP polling for prototype; WebSockets moved to post-prototype phase. Added Section 13.4 for WebSocket integration path. Reduced timeline to 9-12 weeks.
- v1.2 (2025-11-04): Updated deployment architecture to recommend GCP. Replaced Section 8 with detailed GCP deployment instructions. Created DEPLOYMENT_COSTS.md for comprehensive cost analysis across platforms.
- v1.3 (2025-11-04): Finalized React as the frontend framework. Removed Flutter comparison from Section 2. Restructured technology stack section to be more definitive and implementation-focused.
