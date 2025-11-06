// Admin Routes
// CMS-like interface for project and organization management

import { Router } from 'express';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth';
import { adminMiddleware } from '../middleware/adminAuth';
import prisma from '../lib/prisma';

const router = Router();

// Apply auth and admin middleware to all routes
router.use(authMiddleware);
router.use(adminMiddleware);

// ============================================================================
// Dashboard Stats
// ============================================================================

/**
 * GET /api/admin/dashboard
 * Get overview statistics for admin dashboard
 */
router.get('/dashboard', async (_req, res, next) => {
  try {
    const [
      totalUsers,
      totalOrganizations,
      totalProjects,
      totalTasks,
      activeProject,
      recentUsers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.organization.count(),
      prisma.project.count(),
      prisma.task.count(),
      prisma.project.findFirst({
        where: { status: 'active' },
        include: {
          _count: { select: { tasks: true } },
        },
      }),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          username: true,
          email: true,
          organization: { select: { id: true, name: true } },
          createdAt: true,
        },
      }),
    ]);

    res.json({
      stats: {
        totalUsers,
        totalOrganizations,
        totalProjects,
        totalTasks,
      },
      activeProject,
      recentUsers,
    });
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// User Management
// ============================================================================

/**
 * GET /api/admin/users
 * Get all users with pagination and filters
 */
router.get('/users', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const organizationId = req.query.organizationId as string;

    const where: any = {};

    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (organizationId) {
      where.organizationId = organizationId;
    }

    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          username: true,
          email: true,
          tokenBalance: true,
          level: true,
          tasksCompleted: true,
          isAdmin: true,
          organization: {
            select: { id: true, name: true },
          },
          createdAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      users,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/admin/users/:id
 * Update user (make admin, change organization, adjust tokens)
 */
router.patch('/users/:id', async (req, res, next) => {
  try {
    const updateSchema = z.object({
      isAdmin: z.boolean().optional(),
      organizationId: z.string().uuid().optional().nullable(),
      tokenBalance: z.number().int().optional(),
    });

    const validatedData = updateSchema.parse(req.body);

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: validatedData,
      select: {
        id: true,
        username: true,
        email: true,
        isAdmin: true,
        tokenBalance: true,
        organization: { select: { id: true, name: true } },
      },
    });

    res.json({ message: 'User updated successfully', user });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        message: 'Validation error',
        errors: error.issues,
      });
      return;
    }
    next(error);
  }
});

// ============================================================================
// Organization Management
// ============================================================================

/**
 * POST /api/admin/organizations
 * Create a new organization
 */
router.post('/organizations', async (req, res, next) => {
  try {
    const createSchema = z.object({
      name: z.string().min(3).max(100),
      description: z.string().optional(),
    });

    const validatedData = createSchema.parse(req.body);

    const organization = await prisma.organization.create({
      data: validatedData,
    });

    res.status(201).json({
      message: 'Organization created successfully',
      organization,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        message: 'Validation error',
        errors: error.issues,
      });
      return;
    }
    next(error);
  }
});

/**
 * PATCH /api/admin/organizations/:id
 * Update organization
 */
router.patch('/organizations/:id', async (req, res, next) => {
  try {
    const updateSchema = z.object({
      name: z.string().min(3).max(100).optional(),
      description: z.string().optional(),
    });

    const validatedData = updateSchema.parse(req.body);

    const organization = await prisma.organization.update({
      where: { id: req.params.id },
      data: validatedData,
    });

    res.json({
      message: 'Organization updated successfully',
      organization,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        message: 'Validation error',
        errors: error.issues,
      });
      return;
    }
    next(error);
  }
});

/**
 * DELETE /api/admin/organizations/:id
 * Delete organization (only if no users)
 */
router.delete('/organizations/:id', async (req, res, next) => {
  try {
    const userCount = await prisma.user.count({
      where: { organizationId: req.params.id },
    });

    if (userCount > 0) {
      res.status(400).json({
        message: `Cannot delete organization with ${userCount} users`,
      });
      return;
    }

    await prisma.organization.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Organization deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// Project Management (Enhanced)
// ============================================================================

/**
 * GET /api/admin/projects
 * Get all projects with enhanced details
 */
router.get('/projects', async (_req, res, next) => {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { tasks: true } },
      },
    });

    res.json(projects);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/admin/projects/:id
 * Delete a project and all associated tasks
 */
router.delete('/projects/:id', async (req, res, next) => {
  try {
    // Delete all tasks first (cascade should handle this, but being explicit)
    await prisma.task.deleteMany({
      where: { projectId: req.params.id },
    });

    // Delete the project
    await prisma.project.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Project and associated tasks deleted successfully' });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/admin/projects/:id
 * Update project details
 */
router.patch('/projects/:id', async (req, res, next) => {
  try {
    const updateSchema = z.object({
      name: z.string().min(3).max(255).optional(),
      description: z.string().optional(),
      scheduledStartTime: z.string().datetime().optional().nullable(),
    });

    const validatedData = updateSchema.parse(req.body);

    const data: any = {
      name: validatedData.name,
      description: validatedData.description,
    };

    if (validatedData.scheduledStartTime !== undefined) {
      data.scheduledStartTime = validatedData.scheduledStartTime
        ? new Date(validatedData.scheduledStartTime)
        : null;
    }

    const project = await prisma.project.update({
      where: { id: req.params.id },
      data,
    });

    res.json({
      message: 'Project updated successfully',
      project,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        message: 'Validation error',
        errors: error.issues,
      });
      return;
    }
    next(error);
  }
});

// ============================================================================
// Task Management
// ============================================================================

/**
 * GET /api/admin/tasks
 * Get all tasks with filters
 */
router.get('/tasks', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const projectId = req.query.projectId as string;
    const organizationId = req.query.organizationId as string;
    const status = req.query.status as string;

    const where: any = {};

    if (projectId) where.projectId = projectId;
    if (organizationId) where.organizationId = organizationId;
    if (status) where.status = status;

    const [tasks, totalCount] = await Promise.all([
      prisma.task.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          creator: {
            select: { id: true, username: true },
          },
          acceptedBy: {
            select: { id: true, username: true },
          },
          organization: {
            select: { id: true, name: true },
          },
          project: {
            select: { id: true, name: true },
          },
        },
      }),
      prisma.task.count({ where }),
    ]);

    res.json({
      tasks,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/admin/tasks/:id
 * Delete a specific task
 */
router.delete('/tasks/:id', async (req, res, next) => {
  try {
    await prisma.task.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
