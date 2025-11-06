# TaskMan Admin CMS

A comprehensive Content Management System (CMS) for administering TaskMan projects, organizations, users, and tasks.

## Features Implemented

### Backend (Complete)

#### 1. Admin Authentication & Authorization
- **File**: `backend/src/middleware/adminAuth.ts`
- Added `isAdmin` flag to User model
- Created `adminMiddleware` to protect admin-only routes
- All admin endpoints require both authentication and admin privileges

#### 2. Admin API Endpoints
- **File**: `backend/src/routes/admin.ts`
- **Base Path**: `/api/admin`

**Dashboard:**
- `GET /api/admin/dashboard` - Overview statistics, active project, recent users

**User Management:**
- `GET /api/admin/users` - List users with pagination, search, and filters
- `PATCH /api/admin/users/:id` - Update user (make admin, change organization, adjust tokens)

**Organization Management:**
- `POST /api/admin/organizations` - Create organization
- `PATCH /api/admin/organizations/:id` - Update organization
- `DELETE /api/admin/organizations/:id` - Delete organization (only if no users)

**Project Management:**
- `GET /api/admin/projects` - List all projects with task counts
- `PATCH /api/admin/projects/:id` - Update project details
- `DELETE /api/admin/projects/:id` - Delete project and associated tasks

**Task Management:**
- `GET /api/admin/tasks` - List all tasks with pagination and filters
- `DELETE /api/admin/tasks/:id` - Delete specific task

### Frontend (Complete)

#### 1. Admin UI Components

**Layout & Navigation:**
- **File**: `frontend/src/components/AdminLayout.tsx`
- Sidebar navigation with dashboard, projects, organizations, users, tasks
- User info display and logout
- "Back to App" button
- Modern dark sidebar design

**Route Protection:**
- **File**: `frontend/src/components/AdminRoute.tsx`
- Redirects non-admin users to dashboard
- Redirects non-authenticated users to login

#### 2. Admin Pages

**Dashboard** (`/admin`)
- **File**: `frontend/src/pages/admin/AdminDashboard.tsx`
- Stats cards: Total users, organizations, projects, tasks
- Active project display with task count and start time
- Recent users list with organization membership
- Real-time polling every 30 seconds

**Projects Management** (`/admin/projects`)
- **File**: `frontend/src/pages/admin/AdminProjects.tsx`
- Full CRUD operations for projects
- Visual status badges (draft, scheduled, active, completed)
- Task count and timing information
- **Create Project Modal**: Name, description, scheduled start time, task templates
- **Project Activation**: Convert draft to active, duplicates tasks to all organizations
- **Project Completion**: Mark active projects as completed
- **Project Deletion**: Remove draft/scheduled/completed projects

**Organizations Management** (`/admin/organizations`)
- **File**: `frontend/src/pages/admin/AdminOrganizations.tsx`
- Create new organizations
- Edit organization name and description
- Delete organizations (only if no users)
- Member count display
- Grid card layout with inline editing

**Task Template Builder:**
- **File**: `frontend/src/components/TaskTemplateBuilder.tsx`
- Visual task template creation with 5 task types:
  - Sort List
  - Color Match
  - Arithmetic
  - Group Separation
  - Defragmentation
- Automatic default data/solution generation
- Collapsible template editing with JSON data/solution fields
- Token reward, difficulty (1-5), estimated time configuration
- Drag-to-reorder (visual UI for order management)

#### 3. Admin Services
- **File**: `frontend/src/services/adminService.ts`
- Type-safe API client methods for all admin operations
- Complete TypeScript interfaces for admin data structures

#### 4. User Access
- Admin panel button appears in Dashboard for users with `isAdmin: true`
- **Location**: Top right of Dashboard header
- Purple "Admin Panel" button

## Usage

### Making a User an Admin

1. **Using Database Migration:**
```sql
UPDATE users SET is_admin = true WHERE email = 'admin@example.com';
```

2. **Using Admin Panel** (once you have at least one admin):
   - Navigate to `/admin/users`
   - Find the user
   - Toggle "Admin" status
   - Click "Update"

### Creating a Project

1. Navigate to `/admin/projects`
2. Click "Create Project"
3. Fill in project details:
   - **Name**: e.g., "Weekly Challenge #1"
   - **Description**: Optional description
   - **Scheduled Start Time**: Optional future activation time
4. Add task templates using the Task Template Builder:
   - Select task type
   - Enter title and description
   - Set token reward and difficulty
   - Review/edit JSON data and solution
5. Click "Create Project"
6. Project is created with status "draft"

### Activating a Project

1. Find the draft project in the project list
2. Click "Activate"
3. In the modal, add/configure task templates
4. Click the activation button
5. System will:
   - Change project status to "active"
   - Duplicate all task templates to each organization
   - Make tasks available on the task board
6. Only ONE project can be active at a time

### Managing Organizations

1. Navigate to `/admin/organizations`
2. **Create**: Click "New Organization", enter name and description
3. **Edit**: Click "Edit" on an organization card, modify fields, click "Save"
4. **Delete**: Click trash icon (only works if organization has no members)

### Project Workflow

```
Draft → Scheduled (optional) → Active → Completed
  ↓                               ↓
Delete                         Complete
```

- **Draft**: Newly created, no tasks generated
- **Scheduled**: Has a future activation time (requires external scheduler for auto-activation)
- **Active**: Tasks duplicated to all organizations, visible on task board
- **Completed**: Marked as finished, no longer active

## Admin Panel Navigation

- **Dashboard** (`/admin`) - Overview and statistics
- **Projects** (`/admin/projects`) - Project management
- **Organizations** (`/admin/organizations`) - Organization management
- **Users** (`/admin/users`) - User management (not yet implemented in UI)
- **Tasks** (`/admin/tasks`) - Task management (not yet implemented in UI)

## Technical Details

### Database Changes
- Added `is_admin` BOOLEAN field to `users` table (defaults to false)
- Migration: `20251106031532_add_is_admin_flag`

### Authentication Flow
1. User logs in → JWT token includes userId
2. Request to `/api/admin/*` → `authMiddleware` validates JWT
3. `adminMiddleware` checks `users.is_admin` field
4. If `isAdmin === false` → 403 Forbidden
5. If `isAdmin === true` → Proceed to admin route

### Security
- All admin routes protected by both `authMiddleware` and `adminMiddleware`
- Frontend `AdminRoute` wrapper prevents unauthorized access
- Non-admin users redirected to dashboard
- Token balance adjustments logged in `token_transactions`

## Remaining Work (Future Enhancements)

1. **Users Page** - Full UI for user management (backend ready)
2. **Tasks Page** - Full UI for task management (backend ready)
3. **Bulk Operations** - Select multiple items for bulk actions
4. **Project Templates** - Save and reuse project configurations
5. **Scheduled Activation** - Cron job to auto-activate projects at `scheduledStartTime`
6. **Analytics Dashboard** - Historical performance tracking
7. **Audit Logs** - Track all admin actions
8. **Role-Based Access Control** - Multiple admin permission levels

## Files Created/Modified

### Backend
- `backend/prisma/schema.prisma` - Added isAdmin field
- `backend/src/middleware/adminAuth.ts` - **NEW** - Admin authentication middleware
- `backend/src/routes/admin.ts` - **NEW** - Admin API endpoints
- `backend/src/routes/auth.ts` - Modified to include isAdmin in responses
- `backend/src/server.ts` - Registered admin routes

### Frontend
- `frontend/src/components/AdminRoute.tsx` - **NEW** - Admin route protection
- `frontend/src/components/AdminLayout.tsx` - **NEW** - Admin panel layout
- `frontend/src/components/TaskTemplateBuilder.tsx` - **NEW** - Task template creation UI
- `frontend/src/pages/admin/AdminDashboard.tsx` - **NEW** - Admin dashboard page
- `frontend/src/pages/admin/AdminProjects.tsx` - **NEW** - Projects management page
- `frontend/src/pages/admin/AdminOrganizations.tsx` - **NEW** - Organizations management page
- `frontend/src/services/adminService.ts` - **NEW** - Admin API client
- `frontend/src/stores/userStore.ts` - Added isAdmin to User interface
- `frontend/src/pages/Dashboard.tsx` - Added "Admin Panel" button for admins
- `frontend/src/main.tsx` - Added admin routes

## Documentation
- `PROJECT_ADMIN_GUIDE.md` - Comprehensive guide for project administration via API

## Testing the Admin Panel

1. **Create an admin user:**
```bash
# In psql or your database tool
UPDATE users SET is_admin = true WHERE username = 'yourusername';
```

2. **Login to the app**
3. **Click "Admin Panel"** button in dashboard header
4. **Create an organization:**
   - Navigate to Organizations
   - Click "New Organization"
   - Enter "Team Gamma", description
   - Save

5. **Create a project:**
   - Navigate to Projects
   - Click "Create Project"
   - Enter name, description
   - Add 2-3 task templates
   - Create

6. **Activate the project:**
   - Click "Activate" on your draft project
   - Tasks will be duplicated to all organizations
   - Check the main app dashboard - tasks should appear on the task board

## Known Issues

**Note**: There are some pre-existing TypeScript compilation errors in the codebase (from previous sessions) that need to be addressed:
- `organizations.ts` - unused `req` parameter, missing return statements
- `projects.ts` - ZodError property access issues, missing return statements
- These errors existed before the admin CMS work and need to be fixed separately

The admin CMS code itself compiles correctly when these issues are resolved.
