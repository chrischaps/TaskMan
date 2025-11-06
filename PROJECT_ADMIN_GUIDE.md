# TaskMan Project Administration Guide

## Overview

This guide explains how administrators can create, configure, and start projects in TaskMan. Projects are collections of tasks that are duplicated across all organizations, creating competitive scenarios where organizations race to complete their assigned tasks.

## Table of Contents

1. [Project Concepts](#project-concepts)
2. [Project Lifecycle](#project-lifecycle)
3. [Creating a Project](#creating-a-project)
4. [Activating a Project](#activating-a-project)
5. [Scheduling a Project](#scheduling-a-project)
6. [Completing a Project](#completing-a-project)
7. [API Reference](#api-reference)
8. [Examples](#examples)

## Project Concepts

### What is a Project?

A **Project** in TaskMan is a competitive event where:
- A collection of tasks is defined by an administrator
- When activated, all tasks are duplicated to each organization independently
- Organizations compete to complete their copy of the tasks
- Progress is tracked via a real-time scoreboard
- Only one project can be active at a time

### Project Statuses

Projects move through the following statuses:

| Status | Description |
|--------|-------------|
| `draft` | Project created but not yet active. Tasks not yet duplicated. |
| `scheduled` | Project set to activate at a future time. Tasks not yet duplicated. |
| `active` | Project is currently running. Tasks have been duplicated to all organizations. |
| `completed` | Project has finished. No longer shown as active. |

### Task Duplication

When a project is activated:
1. For each organization (Team Alpha, Team Beta, etc.)
2. For each task template in the project
3. A new Task record is created with:
   - `organizationId`: The specific organization
   - `projectId`: The project ID
   - All other task properties from the template

This ensures each organization has independent task instances that don't affect other organizations.

## Project Lifecycle

```
┌─────────┐
│  Draft  │ ──── Create Project ────┐
└─────────┘                          │
                                     ▼
                              ┌────────────┐
                              │ Scheduled  │ (optional)
                              └────────────┘
                                     │
                              Activation Time
                              or Manual Activation
                                     ▼
                              ┌────────────┐
                              │   Active   │
                              └────────────┘
                                     │
                              Admin Completion
                              or Auto-Complete
                                     ▼
                              ┌────────────┐
                              │ Completed  │
                              └────────────┘
```

## Creating a Project

### API Endpoint

**POST** `/api/projects`

### Request Headers

```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### Request Body

```json
{
  "name": "Project Name",
  "description": "Optional project description",
  "scheduledStartTime": "2025-11-10T14:00:00Z", // Optional ISO 8601 datetime
  "taskTemplates": [
    {
      "type": "sort_list",
      "category": "sorting",
      "title": "Sort Numbers Task",
      "description": "Sort the following numbers in ascending order",
      "data": {
        "items": [5, 2, 8, 1, 9]
      },
      "solution": {
        "items": [1, 2, 5, 8, 9]
      },
      "tokenReward": 100,
      "difficulty": 2,
      "estimatedTime": 300
    },
    {
      "type": "arithmetic",
      "category": "math",
      "title": "Calculate Sum",
      "description": "Calculate the sum of the numbers",
      "data": {
        "operation": "add",
        "operands": [15, 27, 33]
      },
      "solution": {
        "result": 75
      },
      "tokenReward": 150,
      "difficulty": 3,
      "estimatedTime": 180
    }
  ]
}
```

### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Project name (3-255 characters) |
| `description` | string | No | Project description |
| `scheduledStartTime` | ISO 8601 datetime | No | Future activation time |
| `taskTemplates` | array | Yes | Array of task templates (minimum 1) |

### Task Template Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | Yes | Task type: `sort_list`, `color_match`, `arithmetic`, `group_separation`, `defragmentation` |
| `category` | string | Yes | Task category (e.g., "sorting", "math", "visual") |
| `title` | string | Yes | Task title shown to users |
| `description` | string | No | Task instructions |
| `data` | object | Yes | Task-specific input data (JSONB) |
| `solution` | object | Yes | Expected solution (JSONB) |
| `tokenReward` | integer | Yes | Tokens awarded for completion (positive) |
| `difficulty` | integer | No | Difficulty level 1-5 |
| `estimatedTime` | integer | No | Estimated completion time in seconds |

### Response

```json
{
  "message": "Project created successfully",
  "project": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Project Name",
    "description": "Optional project description",
    "status": "draft",
    "scheduledStartTime": "2025-11-10T14:00:00.000Z",
    "taskCount": 2,
    "createdAt": "2025-11-05T10:00:00.000Z",
    "updatedAt": "2025-11-05T10:00:00.000Z"
  }
}
```

### Important Notes

- Projects are created in `draft` status by default
- Task templates are stored but **not yet created as actual tasks**
- Tasks will only be duplicated when the project is activated
- `scheduledStartTime` is optional; if omitted, project must be manually activated

## Activating a Project

### Manual Activation

Activating a project immediately creates task instances for all organizations.

**POST** `/api/projects/:id/activate`

### Request Headers

```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### Request Body

You must provide the same task templates again (for validation):

```json
{
  "taskTemplates": [
    {
      "type": "sort_list",
      "category": "sorting",
      "title": "Sort Numbers Task",
      "description": "Sort the following numbers in ascending order",
      "data": {
        "items": [5, 2, 8, 1, 9]
      },
      "solution": {
        "items": [1, 2, 5, 8, 9]
      },
      "tokenReward": 100,
      "difficulty": 2,
      "estimatedTime": 300,
      "creatorId": "550e8400-e29b-41d4-a716-446655440000"
    }
  ]
}
```

**Important:** Each task template must include a `creatorId` field (system user ID).

### Response

```json
{
  "message": "Project activated successfully",
  "project": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Project Name",
    "status": "active",
    "actualStartTime": "2025-11-05T10:30:00.000Z",
    "taskCount": 2
  },
  "tasksCreated": 4,
  "organizationsCount": 2
}
```

### What Happens During Activation

1. **Validation**: Project must be in `draft` or `scheduled` status
2. **Status Update**: Project status → `active`, `actualStartTime` set to current time
3. **Task Duplication**:
   - Fetches all organizations
   - For each organization:
     - For each task template:
       - Creates Task with `status: 'available'`, `organizationId`, `projectId`
4. **Atomic Transaction**: All operations wrapped in Prisma transaction (rollback on failure)
5. **Scoreboard Update**: Organizations now show 0% completion for the new project

### Scheduled Activation

If `scheduledStartTime` was provided during creation, the project will automatically activate at that time.

**Note:** Automatic scheduled activation requires a cron job or scheduled task runner (not implemented in prototype).

**Manual override:** You can manually activate a scheduled project before its scheduled time using the activate endpoint.

## Scheduling a Project

### Update Scheduled Time

**POST** `/api/projects/:id/schedule`

### Request Body

```json
{
  "scheduledStartTime": "2025-11-12T09:00:00Z"
}
```

### Response

```json
{
  "message": "Project scheduled successfully",
  "project": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "scheduled",
    "scheduledStartTime": "2025-11-12T09:00:00.000Z"
  }
}
```

### Notes

- Can only schedule projects in `draft` status
- Status automatically changes to `scheduled`
- Requires external scheduler for automatic activation (future enhancement)

## Completing a Project

### Manual Completion

**POST** `/api/projects/:id/complete`

### Request Headers

```
Authorization: Bearer <JWT_TOKEN>
```

### Request Body

No body required.

### Response

```json
{
  "message": "Project completed successfully",
  "project": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "completed",
    "completedAt": "2025-11-05T18:00:00.000Z"
  }
}
```

### What Happens During Completion

1. Project status → `completed`
2. `completedAt` timestamp set to current time
3. Project no longer returned by `/api/projects/active`
4. Tasks remain in database for historical tracking
5. Scoreboard shows final completion percentages

### Auto-Completion (Future Enhancement)

Projects could automatically complete when:
- All organizations reach 100% completion
- A deadline expires
- Other business rules

This is not implemented in the current prototype.

## API Reference

### Get All Projects

**GET** `/api/projects`

Returns all projects (draft, scheduled, active, completed).

**Response:**
```json
[
  {
    "id": "...",
    "name": "...",
    "status": "active",
    "taskCount": 10,
    "createdAt": "...",
    "scheduledStartTime": "...",
    "actualStartTime": "..."
  }
]
```

### Get Active Project

**GET** `/api/projects/active`

Returns the currently active project (if any).

**Response:**
```json
{
  "id": "...",
  "name": "Weekly Challenge #1",
  "status": "active",
  "actualStartTime": "2025-11-05T10:00:00.000Z",
  "taskCount": 15
}
```

**Status Codes:**
- `200 OK`: Active project found
- `404 Not Found`: No active project

### Get Project by ID

**GET** `/api/projects/:id`

**Response:**
```json
{
  "id": "...",
  "name": "...",
  "description": "...",
  "status": "active",
  "scheduledStartTime": null,
  "actualStartTime": "2025-11-05T10:00:00.000Z",
  "completedAt": null,
  "taskCount": 10,
  "createdAt": "...",
  "updatedAt": "..."
}
```

### Get Project Progress

**GET** `/api/projects/:id/progress`

Returns completion statistics for all organizations.

**Response:**
```json
[
  {
    "organizationId": "...",
    "organizationName": "Team Alpha",
    "totalTasks": 10,
    "completedTasks": 7,
    "inProgressTasks": 2,
    "availableTasks": 1,
    "completionPercentage": 70
  },
  {
    "organizationId": "...",
    "organizationName": "Team Beta",
    "totalTasks": 10,
    "completedTasks": 5,
    "inProgressTasks": 3,
    "availableTasks": 2,
    "completionPercentage": 50
  }
]
```

## Examples

### Example 1: Simple Math Project

```bash
curl -X POST http://localhost:3001/api/projects \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Math Challenge Week 1",
    "description": "Basic arithmetic tasks for all organizations",
    "taskTemplates": [
      {
        "type": "arithmetic",
        "category": "math",
        "title": "Addition Challenge",
        "description": "Calculate the sum",
        "data": { "operation": "add", "operands": [15, 23, 42] },
        "solution": { "result": 80 },
        "tokenReward": 100,
        "difficulty": 1,
        "estimatedTime": 120
      },
      {
        "type": "arithmetic",
        "category": "math",
        "title": "Multiplication Challenge",
        "description": "Calculate the product",
        "data": { "operation": "multiply", "operands": [7, 8] },
        "solution": { "result": 56 },
        "tokenReward": 150,
        "difficulty": 2,
        "estimatedTime": 180
      }
    ]
  }'
```

**Response:** Project created with ID `abc-123-def`

**Activate immediately:**

```bash
curl -X POST http://localhost:3001/api/projects/abc-123-def/activate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "taskTemplates": [
      {
        "type": "arithmetic",
        "category": "math",
        "title": "Addition Challenge",
        "description": "Calculate the sum",
        "data": { "operation": "add", "operands": [15, 23, 42] },
        "solution": { "result": 80 },
        "tokenReward": 100,
        "difficulty": 1,
        "estimatedTime": 120,
        "creatorId": "system-user-id-here"
      },
      {
        "type": "arithmetic",
        "category": "math",
        "title": "Multiplication Challenge",
        "description": "Calculate the product",
        "data": { "operation": "multiply", "operands": [7, 8] },
        "solution": { "result": 56 },
        "tokenReward": 150,
        "difficulty": 2,
        "estimatedTime": 180,
        "creatorId": "system-user-id-here"
      }
    ]
  }'
```

**Result:**
- 2 organizations × 2 tasks = 4 tasks created
- Project status: `active`
- Scoreboard shows both organizations at 0%

### Example 2: Scheduled Project

```bash
# Create project scheduled for next Monday at 9 AM
curl -X POST http://localhost:3001/api/projects \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Monday Morning Challenge",
    "description": "Weekly sorting tasks",
    "scheduledStartTime": "2025-11-11T09:00:00Z",
    "taskTemplates": [
      {
        "type": "sort_list",
        "category": "sorting",
        "title": "Sort Employee IDs",
        "description": "Sort in ascending order",
        "data": { "items": [1045, 1002, 1098, 1001, 1067] },
        "solution": { "items": [1001, 1002, 1045, 1067, 1098] },
        "tokenReward": 200,
        "difficulty": 2,
        "estimatedTime": 240
      }
    ]
  }'
```

**Note:** Automatic activation at scheduled time requires external scheduler (not in prototype).

### Example 3: Mixed Task Types Project

```bash
curl -X POST http://localhost:3001/api/projects \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Multi-Skill Challenge",
    "description": "Tests sorting, math, and visual skills",
    "taskTemplates": [
      {
        "type": "sort_list",
        "category": "sorting",
        "title": "Sort Names",
        "data": { "items": ["Charlie", "Alice", "Bob"] },
        "solution": { "items": ["Alice", "Bob", "Charlie"] },
        "tokenReward": 100,
        "difficulty": 1
      },
      {
        "type": "arithmetic",
        "category": "math",
        "title": "Division",
        "data": { "operation": "divide", "operands": [100, 4] },
        "solution": { "result": 25 },
        "tokenReward": 120,
        "difficulty": 2
      },
      {
        "type": "color_match",
        "category": "visual",
        "title": "Match RGB Colors",
        "data": {
          "target": "#FF5733",
          "options": ["#FF5733", "#33FF57", "#3357FF"]
        },
        "solution": { "selected": "#FF5733" },
        "tokenReward": 80,
        "difficulty": 1
      }
    ]
  }'
```

## Best Practices

### 1. Task Template Design

- **Variety**: Mix different task types for engagement
- **Difficulty Progression**: Start easy, gradually increase difficulty
- **Balanced Rewards**: Higher difficulty = higher rewards
- **Clear Instructions**: Ensure `description` fields are comprehensive

### 2. Project Timing

- **Scheduled Projects**: Use scheduled start times for regular events (e.g., "Monday Morning Challenge")
- **Manual Activation**: Use for special events or ad-hoc competitions
- **Duration**: Consider task count and estimated times when planning project duration

### 3. Competitive Balance

- **Equal Tasks**: All organizations receive identical task sets
- **Fair Rewards**: Ensure total token rewards are consistent across projects
- **Task Count**: 5-20 tasks recommended for a project (too few = quick, too many = overwhelming)

### 4. Monitoring

- **Check Progress**: Use `/api/projects/:id/progress` to monitor competition
- **Scoreboard**: Frontend displays real-time completion percentages
- **Completion Timing**: Manually complete projects when appropriate, or when one org reaches 100%

### 5. System User Setup

- Create a dedicated "system" user account for task creation
- Use this user's ID as `creatorId` in task templates
- Prevents tasks from being attributed to admin personal accounts

## Troubleshooting

### Issue: "Project not found"
- Verify project ID is correct
- Check project hasn't been deleted

### Issue: "Cannot activate project"
- Ensure project is in `draft` or `scheduled` status
- Check that another project isn't already `active` (one active project limit)

### Issue: "Validation error" on activation
- Verify all task templates include required fields
- Ensure `creatorId` is provided and valid
- Check that `tokenReward` values are positive integers

### Issue: Tasks not appearing for users
- Verify project was activated successfully
- Check that users are assigned to organizations
- Ensure tasks have `status: 'available'`
- Confirm `organizationId` matches user's organization

### Issue: Scoreboard not updating
- Frontend polls every 30 seconds
- Manual refresh may be needed
- Verify tasks are being completed successfully

## Future Enhancements

### Planned Features (Not in Prototype)

1. **Automatic Scheduled Activation**: Cron job to activate projects at `scheduledStartTime`
2. **Auto-Completion**: Complete projects when all orgs reach 100%
3. **Project Templates**: Save and reuse common project configurations
4. **Task Randomization**: Generate random task data for replayability
5. **Difficulty Balancing**: AI-powered task difficulty assessment
6. **Project Analytics**: Historical performance tracking per organization
7. **Leaderboards**: All-time organization rankings across multiple projects

## Security Considerations

### Authentication Required

All project management endpoints require JWT authentication:
```
Authorization: Bearer <JWT_TOKEN>
```

### Admin-Only Operations

Current implementation: All authenticated users can manage projects.

**Recommended for production:**
- Add `isAdmin` flag to User model
- Create admin middleware: `adminMiddleware`
- Protect project creation/activation/completion with admin checks

### Input Validation

All endpoints use Zod schemas for validation:
- Prevents invalid task data
- Ensures required fields are present
- Validates data types and formats

### Rate Limiting

**Recommended for production:**
- Limit project creation to prevent abuse
- Rate limit activation endpoint to prevent duplicate task creation

## Database Schema Reference

### Project Model

```prisma
model Project {
  id                 String    @id @default(uuid()) @db.Uuid
  name               String    @db.VarChar(255)
  description        String?   @db.Text
  status             String    @default("draft") @db.VarChar(20)
  scheduledStartTime DateTime? @map("scheduled_start_time")
  actualStartTime    DateTime? @map("actual_start_time")
  completedAt        DateTime? @map("completed_at")
  taskCount          Int       @default(0) @map("task_count")
  createdAt          DateTime  @default(now()) @map("created_at")
  updatedAt          DateTime  @updatedAt @map("updated_at")

  tasks              Task[]

  @@index([status])
  @@index([scheduledStartTime])
  @@map("projects")
}
```

### Task Model (Project-Related Fields)

```prisma
model Task {
  // ... other fields

  projectId      String?  @map("project_id") @db.Uuid
  project        Project? @relation(fields: [projectId], references: [id])

  organizationId String?  @map("organization_id") @db.Uuid
  organization   Organization? @relation(fields: [organizationId], references: [id])

  @@index([projectId])
  @@index([organizationId])
}
```

## Conclusion

Projects in TaskMan provide a structured way to create competitive events across organizations. By following this guide, administrators can:

- Create task collections
- Schedule or manually activate competitions
- Monitor progress in real-time
- Complete projects when appropriate

For technical implementation details, see:
- **Backend**: `backend/src/services/projectService.ts`
- **Routes**: `backend/src/routes/projects.ts`
- **Database Schema**: `backend/prisma/schema.prisma`
- **Frontend Integration**: `frontend/src/services/organizationService.ts`
