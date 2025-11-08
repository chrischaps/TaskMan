// TaskMan Initiative Routes
// CRUD endpoints for user-created initiatives

import express, { Request, Response } from 'express';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth';
import { InitiativeService } from '../services/initiativeService';
import { asyncHandler } from '../middleware/errorHandler';

const router = express.Router();

// ============================================================================
// Validation Schemas
// ============================================================================

const createInitiativeSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(5000).optional(),
  projectId: z.string().uuid().optional(),
});

const updateInitiativeSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().max(5000).optional(),
  status: z.enum(['active', 'completed', 'archived']).optional(),
});

// ============================================================================
// POST /api/initiatives
// Create a new initiative
// ============================================================================

router.post(
  '/',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // Validate request body
    const validatedData = createInitiativeSchema.parse(req.body);

    // Create initiative
    const initiative = await InitiativeService.createInitiative(
      req.user!.userId,
      validatedData
    );

    res.status(201).json({
      message: 'Initiative created successfully',
      initiative,
    });
  })
);

// ============================================================================
// GET /api/initiatives
// List initiatives with filters
// Query params:
//   - projectId: Filter by project
//   - status: Filter by status (active, completed, archived)
//   - creatorId: Filter by creator
//   - includeTasks: Include full task data (default: false)
// ============================================================================

router.get(
  '/',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const filters = {
      projectId: req.query.projectId as string | undefined,
      status: req.query.status as string | undefined,
      creatorId: req.query.creatorId as string | undefined,
      includeTasks: req.query.includeTasks === 'true',
    };

    const initiatives = await InitiativeService.getInitiatives(filters);

    res.json({
      initiatives,
      count: initiatives.length,
    });
  })
);

// ============================================================================
// GET /api/initiatives/:id
// Get initiative by ID with full details
// ============================================================================

router.get(
  '/:id',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const initiative = await InitiativeService.getInitiativeById(req.params.id);

    if (!initiative) {
      res.status(404).json({ error: 'Initiative not found' });
      return;
    }

    res.json({ initiative });
  })
);

// ============================================================================
// PATCH /api/initiatives/:id
// Update an initiative (only creator can update)
// ============================================================================

router.patch(
  '/:id',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // Validate request body
    const validatedData = updateInitiativeSchema.parse(req.body);

    try {
      const updated = await InitiativeService.updateInitiative(
        req.params.id,
        req.user!.userId,
        validatedData
      );

      res.json({
        message: 'Initiative updated successfully',
        initiative: updated,
      });
    } catch (error: any) {
      if (
        error.message === 'Initiative not found' ||
        error.message === 'Only the initiative creator can update it'
      ) {
        res.status(403).json({ error: error.message });
        return;
      }
      throw error;
    }
  })
);

// ============================================================================
// DELETE /api/initiatives/:id
// Delete an initiative (only creator, only if no tasks)
// ============================================================================

router.delete(
  '/:id',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await InitiativeService.deleteInitiative(
        req.params.id,
        req.user!.userId
      );

      res.json(result);
    } catch (error: any) {
      if (
        error.message === 'Initiative not found' ||
        error.message === 'Only the initiative creator can delete it'
      ) {
        res.status(403).json({ error: error.message });
        return;
      }

      if (
        error.message.includes('Cannot delete initiative with assigned tasks')
      ) {
        res.status(400).json({ error: error.message });
        return;
      }

      throw error;
    }
  })
);

export default router;
