// Task Routes
// Handles task listing, acceptance, and submission

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// ============================================================================
// Validation Schemas
// ============================================================================

const getTasksSchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('50'),
  type: z
    .enum(['sort_list', 'color_match', 'arithmetic', 'group_separation', 'defragmentation'])
    .optional(),
  difficulty: z.string().optional(),
  minReward: z.string().optional(),
  maxReward: z.string().optional(),
});

// ============================================================================
// GET /api/tasks - List available tasks
// ============================================================================

router.get(
  '/',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // Validate query parameters
    const validation = getTasksSchema.safeParse(req.query);

    if (!validation.success) {
      res.status(400).json({
        message: 'Invalid query parameters',
        errors: validation.error.issues,
      });
      return;
    }

    const { page, limit, type, difficulty, minReward, maxReward } = validation.data;

    // Parse pagination
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
      res.status(400).json({
        message: 'Invalid pagination parameters. Page must be >= 1, limit between 1-100.',
      });
      return;
    }

    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {
      status: 'available',
      // Exclude tasks created by current user
      creatorId: {
        not: req.user!.userId,
      },
    };

    // Apply filters
    if (type) {
      where.type = type;
    }

    if (difficulty) {
      const difficultyNum = parseInt(difficulty, 10);
      if (!isNaN(difficultyNum) && difficultyNum >= 1 && difficultyNum <= 5) {
        where.difficulty = difficultyNum;
      }
    }

    if (minReward || maxReward) {
      where.tokenReward = {};
      if (minReward) {
        const min = parseInt(minReward, 10);
        if (!isNaN(min)) {
          where.tokenReward.gte = min;
        }
      }
      if (maxReward) {
        const max = parseInt(maxReward, 10);
        if (!isNaN(max)) {
          where.tokenReward.lte = max;
        }
      }
    }

    // Fetch tasks with creator information
    const [tasks, totalCount] = await Promise.all([
      prisma.task.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          type: true,
          category: true,
          title: true,
          description: true,
          data: true,
          tokenReward: true,
          difficulty: true,
          estimatedTime: true,
          status: true,
          isComposite: true,
          isTutorial: true,
          createdAt: true,
          creator: {
            select: {
              id: true,
              username: true,
              level: true,
            },
          },
        },
      }),
      prisma.task.count({ where }),
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.json({
      tasks,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalCount,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
    });
  })
);

// ============================================================================
// GET /api/tasks/tutorial - Get tutorial tasks
// ============================================================================

router.get(
  '/tutorial',
  authMiddleware,
  asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const tutorialTasks = await prisma.task.findMany({
      where: {
        isTutorial: true,
        status: 'available',
      },
      orderBy: {
        createdAt: 'asc', // Tutorial tasks in order
      },
      select: {
        id: true,
        type: true,
        title: true,
        description: true,
        data: true,
        tokenReward: true,
        difficulty: true,
        estimatedTime: true,
        isTutorial: true,
        createdAt: true,
      },
    });

    res.json({
      tasks: tutorialTasks,
      count: tutorialTasks.length,
    });
  })
);

export default router;
