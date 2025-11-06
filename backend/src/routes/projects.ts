// Project Routes
// API endpoints for project management (admin operations)

import { Router } from 'express';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth';
import * as ProjectService from '../services/projectService';

const router = Router();

// Validation schemas
const createProjectSchema = z.object({
  name: z.string().min(3).max(255),
  description: z.string().optional(),
  scheduledStartTime: z.string().datetime().optional(),
  taskTemplates: z.array(z.object({
    type: z.string(),
    category: z.string(),
    title: z.string(),
    description: z.string().optional(),
    data: z.any(),
    solution: z.any(),
    tokenReward: z.number().int().positive(),
    difficulty: z.number().int().min(1).max(5).optional(),
    estimatedTime: z.number().int().positive().optional(),
  })).min(1),
});

const activateProjectSchema = z.object({
  taskTemplates: z.array(z.object({
    type: z.string(),
    category: z.string(),
    title: z.string(),
    description: z.string().optional(),
    data: z.any(),
    solution: z.any(),
    tokenReward: z.number().int().positive(),
    difficulty: z.number().int().min(1).max(5).optional(),
    estimatedTime: z.number().int().positive().optional(),
    creatorId: z.string(),
  })).min(1),
});

const scheduleProjectSchema = z.object({
  scheduledStartTime: z.string().datetime(),
});

/**
 * GET /api/projects
 * Get all projects
 */
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const projects = await ProjectService.getAllProjects();
    res.json(projects);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/projects/active
 * Get the currently active project
 */
router.get('/active', authMiddleware, async (req, res, next) => {
  try {
    const project = await ProjectService.getActiveProject();

    if (!project) {
      return res.status(404).json({ message: 'No active project' });
    }

    res.json(project);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/projects/:id
 * Get project by ID
 */
router.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    const project = await ProjectService.getProjectById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/projects/:id/progress
 * Get project progress for all organizations
 */
router.get('/:id/progress', authMiddleware, async (req, res, next) => {
  try {
    const progress = await ProjectService.getProjectProgress(req.params.id);
    res.json(progress);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/projects
 * Create a new project (draft status)
 * Admin only (for now, no auth check - add later if needed)
 */
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const validatedData = createProjectSchema.parse(req.body);

    const project = await ProjectService.createProject({
      name: validatedData.name,
      description: validatedData.description,
      scheduledStartTime: validatedData.scheduledStartTime
        ? new Date(validatedData.scheduledStartTime)
        : undefined,
      taskTemplates: validatedData.taskTemplates,
    });

    res.status(201).json({
      message: 'Project created successfully',
      project,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Validation error',
        errors: error.errors,
      });
    }
    next(error);
  }
});

/**
 * POST /api/projects/:id/activate
 * Activate a project (duplicates tasks to all organizations)
 */
router.post('/:id/activate', authMiddleware, async (req, res, next) => {
  try {
    const validatedData = activateProjectSchema.parse(req.body);

    const result = await ProjectService.activateProject(
      req.params.id,
      validatedData.taskTemplates
    );

    res.json({
      message: 'Project activated successfully',
      ...result,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Validation error',
        errors: error.errors,
      });
    }

    if (error instanceof Error) {
      return res.status(400).json({ message: error.message });
    }

    next(error);
  }
});

/**
 * POST /api/projects/:id/complete
 * Mark a project as completed
 */
router.post('/:id/complete', authMiddleware, async (req, res, next) => {
  try {
    const project = await ProjectService.completeProject(req.params.id);

    res.json({
      message: 'Project completed successfully',
      project,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/projects/:id/schedule
 * Schedule a project for future activation
 */
router.post('/:id/schedule', authMiddleware, async (req, res, next) => {
  try {
    const validatedData = scheduleProjectSchema.parse(req.body);

    const project = await ProjectService.scheduleProject(
      req.params.id,
      new Date(validatedData.scheduledStartTime)
    );

    res.json({
      message: 'Project scheduled successfully',
      project,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Validation error',
        errors: error.errors,
      });
    }
    next(error);
  }
});

export default router;
