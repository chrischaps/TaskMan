# Task Board UI Redesign Plan

**Feature Branch:** `feature/task-board-redesign`
**Created:** November 7, 2025
**Status:** In Progress

## Overview

Transform the task board from a simple card grid to a professional backlog list interface (JIRA-style) with user-created Initiatives as organizational units, while maintaining a simplified tutorial view.

## Design References

- **Monday.com**: Table/list view with customizable columns
- **JIRA**: Backlog list with grouping and inline actions

## Key Design Decisions

1. **Primary View**: Backlog list (JIRA Sprint-style)
2. **Grouping**: By user-created Initiatives (new concept)
3. **Status System**: Visual labels (Available, Claimed, Expiring Soon, Completed)
4. **Sorting**: Advanced sorting controls (reward, difficulty, time, date)
5. **Tutorial**: Separate simplified list view (not the new backlog view)

## Initiative Concept

**What is an Initiative?**
- User-created organizational layer between Project and Task
- Similar to epics/themes in JIRA
- Users can create initiatives and assign tasks to them
- Future: Token reward mechanics for initiative creators when tasks complete

**Initiative Mechanics (TBD):**
- Token rewards for creating initiatives
- Rewards for getting tasks in initiatives completed (by self or others)
- Detailed mechanics to be designed later

**Ungrouped Tasks:**
- Tasks without initiative appear in separate "Ungrouped Tasks" section
- Section appears at bottom of backlog list

---

## Implementation Phases

### Phase 1: Database & Backend - Initiative System

#### 1.1 Database Schema

**Add Initiative Model** (`backend/prisma/schema.prisma`)

```prisma
model Initiative {
  id          String @id @default(uuid()) @db.Uuid
  title       String @db.VarChar(255)
  description String? @db.Text

  // Creator and project relations
  creatorId String @map("creator_id") @db.Uuid
  creator   User   @relation("InitiativeCreator", fields: [creatorId], references: [id])

  projectId String?  @map("project_id") @db.Uuid
  project   Project? @relation(fields: [projectId], references: [id])

  // Token mechanics (TBD - placeholders for future)
  tokenReward Int @default(0) @map("token_reward")

  // Status
  status String @default("active") // "active", "completed", "archived"

  // Timestamps
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")
  completedAt DateTime? @map("completed_at")

  // Relations
  tasks Task[]

  @@index([creatorId])
  @@index([projectId])
  @@index([status])
  @@map("initiatives")
}
```

**Update Task Model** - Add initiative relation:

```prisma
// In Task model, add:
initiativeId String?     @map("initiative_id") @db.Uuid
initiative   Initiative? @relation(fields: [initiativeId], references: [id])

// Add index:
@@index([initiativeId])
```

**Update User Model** - Add initiative creator relation:

```prisma
// In User model, add:
createdInitiatives Initiative[] @relation("InitiativeCreator")
```

**Update Project Model** - Add initiative relation:

```prisma
// In Project model, add:
initiatives Initiative[]
```

**Create Migration:**
```bash
npx prisma migrate dev --name add_initiatives
```

#### 1.2 Backend API

**Routes** (`backend/src/routes/initiatives.ts`)

```typescript
// Initiative CRUD endpoints
POST   /api/initiatives          // Create initiative
GET    /api/initiatives          // List initiatives (with task counts, filters)
GET    /api/initiatives/:id      // Get initiative details + tasks
PATCH  /api/initiatives/:id      // Update initiative (title, description, status)
DELETE /api/initiatives/:id      // Delete initiative (only if no tasks or user is creator)
```

**Query Parameters for GET /api/initiatives:**
- `projectId` - Filter by project
- `status` - Filter by status (active, completed, archived)
- `creatorId` - Filter by creator
- `includeTasks` - Include full task data (default: false, only counts)

**Update Tasks API** - Modify `GET /api/tasks`:
- Include initiative data in response (id, title)
- Add `initiativeId` query parameter for filtering

#### 1.3 Backend Services

**Create InitiativeService** (`backend/src/services/initiativeService.ts`)

Functions:
- `createInitiative(userId, projectId, data)` - Create with validation
- `getInitiatives(filters)` - List with task counts
- `getInitiativeById(id)` - Get details + tasks
- `updateInitiative(id, userId, data)` - Update (auth check)
- `deleteInitiative(id, userId)` - Delete (auth check, no tasks)
- `getTaskCountForInitiative(initiativeId)` - Count tasks
- `getTotalRewardsForInitiative(initiativeId)` - Sum task rewards
- Placeholder functions for token reward mechanics (TBD)

**Validation Rules:**
- Title: 1-255 characters, required
- Description: Optional, max 5000 characters
- Only creator can update/delete
- Cannot delete if tasks are assigned

---

### Phase 2: Frontend - Type Definitions & Status System

#### 2.1 Type Definitions

**Create Initiative Interface** (`frontend/src/types/initiative.ts`)

```typescript
export interface Initiative {
  id: string
  title: string
  description?: string
  creatorId: string
  creator?: {
    id: string
    username: string
    level: number
  }
  projectId?: string
  tokenReward: number
  status: 'active' | 'completed' | 'archived'
  createdAt: string
  updatedAt: string
  completedAt?: string

  // Computed fields (from API)
  taskCount?: number
  totalTokenRewards?: number
}

export interface CreateInitiativeDto {
  title: string
  description?: string
  projectId?: string
}

export interface UpdateInitiativeDto {
  title?: string
  description?: string
  status?: 'active' | 'completed' | 'archived'
}
```

**Update Task Interface** (`frontend/src/types/task.ts`)

Add:
```typescript
export interface Task {
  // ... existing fields ...

  // New fields:
  initiativeId?: string
  initiative?: {
    id: string
    title: string
  }
  statusLabel: TaskStatusLabel
}

export type TaskStatusLabel = 'available' | 'claimed' | 'expiring_soon' | 'completed'
```

#### 2.2 Status Label Logic

**Create Utility** (`frontend/src/utils/taskStatus.ts`)

```typescript
export function calculateTaskStatus(task: Task): TaskStatusLabel {
  if (task.status === 'completed') {
    return 'completed'
  }

  if (task.status === 'in_progress' && task.acceptedBy) {
    // Check if expiring soon (within 1 hour)
    if (task.expiresAt) {
      const expiresAt = new Date(task.expiresAt)
      const now = new Date()
      const hourFromNow = new Date(now.getTime() + 60 * 60 * 1000)

      if (expiresAt <= hourFromNow) {
        return 'expiring_soon'
      }
    }
    return 'claimed'
  }

  return 'available'
}

export const STATUS_COLORS = {
  available: 'bg-green-100 text-green-800',
  claimed: 'bg-blue-100 text-blue-800',
  expiring_soon: 'bg-orange-100 text-orange-800',
  completed: 'bg-gray-100 text-gray-800',
}

export const STATUS_LABELS = {
  available: 'Available',
  claimed: 'Claimed',
  expiring_soon: 'Expiring Soon',
  completed: 'Completed',
}
```

---

### Phase 3: Frontend - Backlog List UI

#### 3.1 Main Backlog View Component

**Create** (`frontend/src/pages/TaskBoardBacklog.tsx`)

**Layout Structure:**
```
┌─────────────────────────────────────────────────────┐
│ Header: "Task Backlog" | Refresh | Create Task     │
├─────────────────────────────────────────────────────┤
│ Filters: Type | Difficulty | Min/Max Tokens         │
│ Sort: [Dropdown] | [Asc/Desc Toggle]                │
│ [Create Initiative Button]                          │
├─────────────────────────────────────────────────────┤
│ ▼ Initiative: "Q1 Data Processing" (5 tasks, 250t) │
│   ┌───────────────────────────────────────────────┐ │
│   │ [icon] Sort customer data | Available | ★★★ …│ │
│   │ [icon] Process invoices   | Claimed   | ★★  …│ │
│   └───────────────────────────────────────────────┘ │
│                                                      │
│ ▼ Initiative: "User Onboarding" (3 tasks, 150t)    │
│   └─ [Collapsed]                                    │
│                                                      │
│ ▼ Ungrouped Tasks (8 tasks, 400t)                  │
│   └─ [Task rows...]                                 │
└─────────────────────────────────────────────────────┘
```

**Features:**
- Group initiatives with task counts
- Collapsible sections (localStorage persistence)
- Sort controls (dropdown + asc/desc)
- Filter controls (existing + new)
- Auto-refresh (30s polling)
- Loading states (skeleton)
- Empty states

#### 3.2 Initiative Group Component

**Create** (`frontend/src/components/InitiativeGroup.tsx`)

**Props:**
```typescript
interface InitiativeGroupProps {
  initiative?: Initiative  // undefined for "Ungrouped Tasks"
  tasks: Task[]
  isExpanded: boolean
  onToggle: () => void
  onEdit?: () => void      // Only for creator
  onDelete?: () => void    // Only for creator
}
```

**Header Layout:**
```
▼ Initiative Title (Tooltip: description)  [Edit] [Delete]
  5 tasks • 250 tokens total
```

**Features:**
- Expand/collapse animation
- Show task count and total rewards
- Edit/delete icons (only for creator)
- Tooltip on hover shows description
- Colored border/background for visual separation

#### 3.3 Task Row Component

**Create** (`frontend/src/components/TaskRow.tsx`)

**Layout (Compact Horizontal):**
```
[Type Icon] | Title (expandable) | [Status Badge] | ★★★ | 50t | @creator | ~5m | [Accept]
```

**Columns:**
1. Type icon (colored circle with symbol)
2. Title (click to expand description inline)
3. Status badge (colored pill)
4. Difficulty (stars)
5. Reward (token amount)
6. Creator (username + level)
7. Estimated time
8. Actions (Accept button or "Your Task" label)

**Interaction:**
- Hover: Highlight row background
- Click title: Toggle description accordion
- Click Accept: Navigate to task execution

**Responsive:**
- Desktop: All columns visible
- Tablet: Hide creator, time
- Mobile: Stack vertically, show only essential

#### 3.4 Ungrouped Tasks Section

**Component:** Uses same `InitiativeGroup` component

**Props:**
```typescript
<InitiativeGroup
  initiative={undefined}  // Indicates ungrouped
  tasks={ungroupedTasks}
  isExpanded={isUngroupedExpanded}
  onToggle={() => toggleSection('ungrouped')}
/>
```

**Styling:**
- Title: "Ungrouped Tasks"
- Subtitle: "{count} tasks • {totalRewards} tokens"
- Different background color (lighter gray)
- Always appears at bottom

#### 3.5 Advanced Sorting Controls

**UI Component:** Dropdown + Toggle button

**Sort Options:**
- Newest First (createdAt DESC) ← default
- Oldest First (createdAt ASC)
- Highest Reward (tokenReward DESC)
- Lowest Reward (tokenReward ASC)
- Hardest First (difficulty DESC)
- Easiest First (difficulty ASC)
- Longest First (estimatedTime DESC)
- Shortest First (estimatedTime ASC)

**Persistence:**
- Save sort preference to localStorage
- Key: `taskBoardSort`

**Implementation:**
- Client-side sorting (tasks already fetched)
- OR backend sorting (add `sortBy` and `sortOrder` query params)

---

### Phase 4: Frontend - Initiative Management

#### 4.1 Initiative Creation Modal

**Create** (`frontend/src/components/CreateInitiativeModal.tsx`)

**Form Fields:**
- Title (required, text input, 1-255 chars)
- Description (optional, textarea, max 5000 chars)
- Project (auto-filled if user has active project)

**Token Mechanics Placeholder:**
- Gray info box: "Token reward mechanics for initiatives coming soon!"

**Actions:**
- Cancel button
- Create button (disabled until title valid)

**On Success:**
- Close modal
- Show success toast
- Refresh initiatives list
- Auto-expand new initiative section

#### 4.2 Initiative Management UI

**Create Initiative Button:**
- Location: Above task list in backlog view
- Style: Secondary button with plus icon
- Label: "+ Create Initiative"
- Opens CreateInitiativeModal

**Edit Initiative:**
- Pencil icon on initiative group header
- Only visible to creator
- Opens edit modal (same as create, pre-filled)
- Can update title, description, status

**Delete Initiative:**
- Trash icon on initiative group header
- Only visible to creator
- Confirmation dialog: "Delete initiative? This cannot be undone."
- Only allowed if no tasks assigned
- Error message if tasks exist: "Cannot delete initiative with assigned tasks. Move or delete tasks first."

#### 4.3 Assign Task to Initiative

**In Task Creation Modal:**
- Add dropdown: "Initiative (optional)"
- Options: List of active initiatives + "None (Ungrouped)"
- Default: "None"

**Move Task to Initiative:**
- Add dropdown menu to task row actions (three dots icon)
- Menu options:
  - "Move to Initiative" → submenu with initiative list
  - "Remove from Initiative" (if task has initiative)
- On selection: Update task, refresh view

**API Call:**
```typescript
PATCH /api/tasks/:id
Body: { initiativeId: "uuid" | null }
```

---

### Phase 5: Tutorial Simple List View

#### 5.1 Tutorial List Component

**Create** (`frontend/src/pages/TutorialTaskList.tsx`)

**Layout (Ultra-Simple):**
```
┌─────────────────────────────────────────────┐
│ Tutorial: Complete these 5 tasks to begin  │
│ Progress: ████░░░░░ 2 of 5 complete        │
├─────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────┐ │
│ │ 1. Sort the List                        │ │
│ │    [Sort List] ★ Easy  20 tokens        │ │
│ │    Learn the basics of sorting...       │ │
│ │    [Start Task →]                       │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ 2. Match the Color                      │ │
│ │    [Color Match] ★ Easy  20 tokens      │ │
│ │    [Start Task →]                       │ │
│ └─────────────────────────────────────────┘ │
│ ...                                         │
└─────────────────────────────────────────────┘
```

**Features:**
- No grouping, no initiatives
- Linear sequence (1 of 5, 2 of 5, etc.)
- Progress bar at top
- Larger cards than backlog rows (easier to read)
- No filters, no sorting
- Fixed order (tutorial sequence)
- Simple "Start Task" button

**Styling:**
- Friendly, less dense than backlog
- Larger fonts, more spacing
- Encouraging copy ("You're doing great!")
- Different color scheme (lighter, warmer)

**Data Source:**
- API: `GET /api/tasks/tutorial`
- Mark tasks as tutorial with `isTutorial: true`

#### 5.2 View Routing Logic

**Update Router** (`frontend/src/main.tsx` or routing file)

```typescript
// Pseudo-code
const TaskBoardRouter = () => {
  const { user } = useUserStore()

  if (!user.tutorialCompleted) {
    return <TutorialTaskList />
  }

  return <TaskBoardBacklog />
}
```

**Route Structure:**
- `/tasks` → Smart router (tutorial or backlog)
- `/tasks/tutorial` → TutorialTaskList (explicit)
- `/tasks/backlog` → TaskBoardBacklog (explicit)
- Keep old `/dashboard` → Dashboard (with grid view fallback)

**Transition:**
- When user completes 5th tutorial task
- Backend sets `user.tutorialCompleted = true`
- Frontend refetches user data
- Router automatically switches to TaskBoardBacklog
- Show celebration modal: "Tutorial complete! Welcome to the task board!"

---

### Phase 6: Polish & Integration

#### 6.1 Responsive Design

**Breakpoints:**
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

**Mobile Adjustments:**
- Stack task row columns vertically
- Hide less critical fields (creator, time)
- Larger tap targets for buttons
- Collapsible filters (accordion)

**Tablet Adjustments:**
- 2-column layout for filters
- Show essential task fields only
- Compact initiative headers

**Desktop:**
- Full table layout
- All columns visible
- Multi-column filters

#### 6.2 Loading & Empty States

**Loading States:**
- Skeleton loaders for initiative groups
- Skeleton loaders for task rows
- Spinner on refresh button (during manual refresh)
- Loading overlay during task acceptance

**Empty States:**

1. **No initiatives:**
   ```
   📋 No initiatives yet
   Create an initiative to organize your tasks
   [+ Create Initiative]
   ```

2. **No tasks in initiative:**
   ```
   This initiative has no tasks yet.
   Create a task and assign it here.
   ```

3. **No ungrouped tasks:**
   ```
   ✓ All tasks are organized into initiatives!
   ```

4. **Filters return no results:**
   ```
   No tasks match your filters
   [Clear Filters]
   ```

#### 6.3 Migration Strategy

**Parallel Development:**
- Keep existing components unchanged:
  - `TaskBoard.tsx` (old grid view)
  - `Dashboard.tsx` (old dashboard with grid)
  - `TaskCard.tsx` (old card component)
- Build new components alongside:
  - `TaskBoardBacklog.tsx` (new backlog view)
  - `TutorialTaskList.tsx` (new tutorial view)
  - `InitiativeGroup.tsx`, `TaskRow.tsx` (new components)

**Feature Flag (Optional):**
- Environment variable: `VITE_USE_NEW_TASK_BOARD=true`
- Or user preference toggle in settings
- Allows A/B testing

**Gradual Rollout:**
1. Phase 1-2: Backend + types (no UI changes)
2. Phase 3-4: New backlog view (accessible via `/tasks/backlog`)
3. Phase 5: Tutorial view
4. Phase 6: Update default routing to use new views
5. Deprecate old views (or keep as legacy option)

**Database Migration Safety:**
- Initiative model is additive (no breaking changes)
- Task.initiativeId is optional (nullable)
- Existing tasks continue to work (ungrouped)

#### 6.4 Documentation Updates

**Update CLAUDE.md:**
- Add Initiative system section
- Document new UI components
- Update project structure diagram
- Add Initiative API endpoints

**Update GDD.md:**
- Add Initiative mechanics section (placeholder for future)
- Document token reward system for initiatives (TBD)
- Update progression system (if affected)

**Update TDD.md:**
- Add Initiative database schema
- Add Initiative API endpoints
- Update frontend architecture section

**Create Screenshots:**
- Take screenshots of new backlog view
- Take screenshots of tutorial view
- Add to documentation or docs folder

---

## Implementation Order

### Recommended Sequence:

1. **Phase 1: Backend** (Day 1, ~4 hours)
   - 1.1: Database schema (Initiative model, migrations)
   - 1.2: API routes (Initiative CRUD)
   - 1.3: Services (InitiativeService)
   - Test with Postman/curl

2. **Phase 2: Frontend Types** (Day 1, ~2 hours)
   - 2.1: Type definitions (Initiative, update Task)
   - 2.2: Status calculation utility
   - Test types compile

3. **Phase 5: Tutorial View** (Day 2, ~3 hours)
   - 5.1: TutorialTaskList component
   - 5.2: Routing logic (tutorial check)
   - Test tutorial flow

4. **Phase 3: Backlog View** (Day 2-3, ~8 hours)
   - 3.1: TaskBoardBacklog component
   - 3.2: InitiativeGroup component
   - 3.3: TaskRow component
   - 3.4: Ungrouped section
   - 3.5: Sorting controls
   - Test backlog display

5. **Phase 4: Initiative Management** (Day 3, ~4 hours)
   - 4.1: CreateInitiativeModal
   - 4.2: Edit/delete UI
   - 4.3: Assign task to initiative
   - Test CRUD operations

6. **Phase 6: Polish** (Day 3, ~3 hours)
   - 6.1: Responsive design
   - 6.2: Loading/empty states
   - 6.3: Integration testing
   - 6.4: Documentation

### Total Estimated Time:
- **Backend**: ~4 hours
- **Frontend Types**: ~2 hours
- **Tutorial View**: ~3 hours
- **Backlog View**: ~8 hours
- **Initiative Management**: ~4 hours
- **Polish**: ~3 hours

**Grand Total: ~24 hours** (3 full days of focused work)

---

## Out of Scope (Future Enhancements)

### Not Included in This Redesign:
- Initiative token reward mechanics (detailed design)
- Kanban board view toggle
- Table view (Monday.com style)
- Drag-and-drop task reordering
- Drag-and-drop initiative assignment
- Saved filter presets
- Bulk task actions (multi-select)
- Full-text search functionality
- Task templates
- Task favoriting/starring
- Task comments/discussions
- Task attachments
- Initiative analytics/reports
- Initiative completion rewards (automated)

### Future Phase Ideas:
- **Phase 7**: Initiative token mechanics implementation
- **Phase 8**: View mode toggle (backlog/kanban/table)
- **Phase 9**: Advanced search and saved filters
- **Phase 10**: Collaboration features (comments, @mentions)

---

## Testing Checklist

### Backend Testing:
- [ ] Initiative CRUD operations work
- [ ] Cannot delete initiative with tasks
- [ ] Only creator can edit/delete initiative
- [ ] Task assignment to initiative works
- [ ] Task removal from initiative works
- [ ] API returns correct task counts and totals
- [ ] Migration runs successfully (up and down)

### Frontend Testing:
- [ ] Tutorial view displays for new users
- [ ] Backlog view displays for completed tutorial users
- [ ] Initiative groups expand/collapse correctly
- [ ] Task rows display all data correctly
- [ ] Sorting works (all options)
- [ ] Status labels calculate correctly
- [ ] Create initiative modal works
- [ ] Edit initiative modal works
- [ ] Delete initiative (with validation)
- [ ] Assign task to initiative (create and edit)
- [ ] Ungrouped section displays correctly
- [ ] Responsive design works (mobile, tablet, desktop)
- [ ] Loading states display
- [ ] Empty states display
- [ ] Auto-refresh (30s polling) works
- [ ] Manual refresh works

### Integration Testing:
- [ ] Tutorial completion transitions to backlog
- [ ] Creating initiative and tasks flow
- [ ] Moving tasks between initiatives
- [ ] Task acceptance from backlog view
- [ ] Filter and sort combinations
- [ ] Browser back/forward navigation
- [ ] Page refresh preserves collapsed states

---

## Success Criteria

### User Experience:
- ✅ Professional, polished interface (comparable to JIRA/Monday)
- ✅ Clear visual hierarchy and grouping
- ✅ Easy to scan and find tasks
- ✅ Smooth, performant interactions
- ✅ Intuitive initiative management

### Technical:
- ✅ No breaking changes to existing functionality
- ✅ Backward compatible (old views still work)
- ✅ Performant (< 1s load time for 100 tasks)
- ✅ Responsive (works on all devices)
- ✅ Accessible (keyboard navigation, ARIA labels)

### Business:
- ✅ Reduces cognitive load for users
- ✅ Enables better task organization
- ✅ Maintains tutorial simplicity for new users
- ✅ Sets foundation for future initiative mechanics

---

## Notes & Considerations

### Design Decisions Made:
1. **Why backlog list over kanban?**
   - User requested JIRA Sprint-style backlog
   - Better for scanning many tasks at once
   - Kanban can be added later as alternate view

2. **Why user-created initiatives vs admin-only?**
   - User requested user-created with token mechanics
   - Empowers players to organize collaboratively
   - More engaging gameplay (create, manage, earn)

3. **Why separate tutorial view vs simplified backlog?**
   - Tutorial needs to be ultra-simple (no overwhelm)
   - Backlog needs to be feature-rich (professional)
   - Too hard to make one view serve both needs

4. **Why ungrouped section vs forcing assignment?**
   - Flexibility for users (don't force structure)
   - Smooth migration (existing tasks ungrouped)
   - Clear call-to-action to organize tasks

### Technical Considerations:
- Initiative model is simple now (room for future mechanics)
- Status labels calculated client-side (could be server-side)
- Sorting client-side for now (could be server-side with pagination)
- No real-time updates (still 30s polling, could add WebSockets later)

### Open Questions (To Be Resolved During Implementation):
- [ ] Should initiatives have a "due date" or "target completion"?
- [ ] Should initiatives show completion percentage?
- [ ] Should initiatives be project-scoped or org-scoped?
- [ ] Should there be a limit on initiatives per user/project?
- [ ] Should initiatives be transferable (change creator)?

---

## File Structure

### New Backend Files:
```
backend/
├── prisma/
│   ├── schema.prisma (updated)
│   └── migrations/
│       └── YYYYMMDD_add_initiatives/
│           └── migration.sql
├── src/
│   ├── routes/
│   │   └── initiatives.ts (new)
│   └── services/
│       └── initiativeService.ts (new)
```

### New Frontend Files:
```
frontend/
├── src/
│   ├── components/
│   │   ├── InitiativeGroup.tsx (new)
│   │   ├── TaskRow.tsx (new)
│   │   └── CreateInitiativeModal.tsx (new)
│   ├── pages/
│   │   ├── TaskBoardBacklog.tsx (new)
│   │   └── TutorialTaskList.tsx (new)
│   ├── types/
│   │   ├── initiative.ts (new)
│   │   └── task.ts (updated)
│   ├── utils/
│   │   └── taskStatus.ts (new)
│   └── services/
│       └── initiativeService.ts (new)
```

### Updated Files:
```
- CLAUDE.md
- GDD.md (initiative mechanics section)
- TDD.md (API docs, schema)
- backend/prisma/schema.prisma
- frontend/src/types/task.ts
- frontend/src/main.tsx (routing)
```

---

## Version Control Strategy

### Branch Structure:
- Main branch: `master`
- Feature branch: `feature/task-board-redesign`

### Commit Strategy:
- Commit after each phase completion
- Use conventional commits:
  - `feat: Add Initiative database model`
  - `feat: Create Initiative API routes`
  - `feat: Implement TaskBoardBacklog component`
  - `feat: Add TutorialTaskList view`
  - `style: Add responsive design for mobile`
  - `docs: Update CLAUDE.md with Initiative system`

### PR Strategy:
- One PR for entire redesign
- Include before/after screenshots
- Document breaking changes (if any)
- Tag for review before merging

---

## Appendix: Visual Design Mockups

### Status Badge Colors:
- **Available**: Green background (#ECFDF5), green text (#047857)
- **Claimed**: Blue background (#DBEAFE), blue text (#1E40AF)
- **Expiring Soon**: Orange background (#FEF3C7), orange text (#B45309)
- **Completed**: Gray background (#F3F4F6), gray text (#4B5563)

### Task Type Colors:
- **Sort List**: Blue (#3B82F6)
- **Color Match**: Purple (#A855F7)
- **Arithmetic**: Green (#10B981)
- **Group Separation**: Yellow (#F59E0B)
- **Defragmentation**: Red (#EF4444)

### Initiative Group Styling:
- Border: Light gray (#E5E7EB), 1px
- Background: White (#FFFFFF)
- Header background: Light blue (#F0F9FF)
- Shadow: Subtle drop shadow on hover

### Task Row Styling:
- Default background: White
- Hover background: Very light gray (#F9FAFB)
- Border bottom: Light gray divider (#E5E7EB)
- Expanded description: Light blue background (#F0F9FF), inset

---

## Contact & Questions

For questions or clarifications during implementation:
- Review this document first
- Check CLAUDE.md for project context
- Consult GDD.md for game mechanics
- Consult TDD.md for technical architecture

---

**End of Plan**
