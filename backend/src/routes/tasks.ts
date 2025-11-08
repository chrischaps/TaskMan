// Task Routes
// Handles task listing, acceptance, and submission

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { validateTask } from '../validators/taskValidators';
import { TokenService } from '../services/tokenService';
import { calculateExpirationTime, isTaskExpired } from '../utils/taskExpiration';

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
  hideOwnTasks: z.string().optional().default('false'), // New filter to hide own tasks
});

const createTaskSchema = z.object({
  type: z.enum(['sort_list', 'color_match', 'arithmetic', 'group_separation', 'defragmentation']),
  title: z.string().min(3).max(255),
  description: z.string().max(1000).optional(),
  data: z.any(), // Task-specific data (will be validated by task type)
  solution: z.any(), // Expected solution
  tokenReward: z.number().int().min(5).max(1000),
  difficulty: z.number().int().min(1).max(5).optional(),
  estimatedTime: z.number().int().min(10).max(3600).optional(), // 10 seconds to 1 hour
});

// ============================================================================
// POST /api/tasks - Create a new task
// ============================================================================

router.post(
  '/',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // Validate request body
    const validation = createTaskSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        message: 'Invalid task data',
        errors: validation.error.issues,
      });
      return;
    }

    const { type, title, description, data, solution, tokenReward, difficulty, estimatedTime } =
      validation.data;

    const userId = req.user!.userId;

    // Calculate total cost: reward + 20% listing fee
    const listingFee = Math.ceil(tokenReward * 0.2);
    const totalCost = tokenReward + listingFee;

    // Check if user has enough tokens
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { tokenBalance: true },
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (user.tokenBalance < totalCost) {
      res.status(400).json({
        message: 'Insufficient tokens',
        required: totalCost,
        available: user.tokenBalance,
        breakdown: {
          reward: tokenReward,
          listingFee: listingFee,
          total: totalCost,
        },
      });
      return;
    }

    // Deduct tokens and create task in a transaction
    const task = await prisma.$transaction(async (tx) => {
      // Deduct tokens - manual transaction logic
      const currentUser = await tx.user.findUnique({
        where: { id: userId },
        select: { tokenBalance: true },
      });

      if (!currentUser) {
        throw new Error('User not found');
      }

      if (currentUser.tokenBalance < totalCost) {
        throw new Error('Insufficient token balance');
      }

      // Update user balance
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          tokenBalance: {
            decrement: totalCost,
          },
        },
        select: {
          tokenBalance: true,
        },
      });

      // Create transaction record
      await tx.tokenTransaction.create({
        data: {
          userId,
          amount: -totalCost,
          balance: updatedUser.tokenBalance,
          reason: `Created task: ${title} (reward: ${tokenReward}, fee: ${listingFee})`,
        },
      });

      // Create task
      const newTask = await tx.task.create({
        data: {
          type,
          category: type, // For atomic tasks, category = type
          title,
          description: description || null,
          data,
          solution,
          tokenReward,
          difficulty: difficulty || null,
          estimatedTime: estimatedTime || null,
          status: 'available',
          isComposite: false,
          isTutorial: false,
          creatorId: userId,
        },
      });

      return newTask;
    });

    res.status(201).json({
      message: 'Task created successfully',
      task: {
        id: task.id,
        type: task.type,
        title: task.title,
        tokenReward: task.tokenReward,
        difficulty: task.difficulty,
        status: task.status,
        createdAt: task.createdAt,
      },
      cost: {
        reward: tokenReward,
        listingFee: listingFee,
        total: totalCost,
      },
    });
  })
);

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

    const { page, limit, type, difficulty, minReward, maxReward, hideOwnTasks } = validation.data;

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

    // Get user's organization
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { organizationId: true },
    });

    // Build where clause
    const where: any = {
      status: 'available',
      // Filter by organization (only show tasks from user's organization)
      ...(user?.organizationId ? {
        organizationId: user.organizationId,
      } : {}),
      // Conditionally exclude tasks created by current user based on filter
      ...(hideOwnTasks === 'true' ? {
        creatorId: {
          not: req.user!.userId,
        },
      } : {}),
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
          creatorId: true,
          initiativeId: true,
          expiresAt: true,
          acceptedById: true,
          creator: {
            select: {
              id: true,
              username: true,
              level: true,
            },
          },
          initiative: {
            select: {
              id: true,
              title: true,
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

    // Add isOwnTask flag to each task
    const tasksWithOwnership = tasks.map((task) => ({
      ...task,
      isOwnTask: task.creatorId === req.user!.userId,
    }));

    res.json({
      tasks: tasksWithOwnership,
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

// ============================================================================
// POST /api/tasks/:id/accept - Accept a task
// ============================================================================

router.post(
  '/:id/accept',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const taskId = req.params.id;
    const userId = req.user!.userId;

    console.log('[POST /api/tasks/:id/accept] Request received:', { taskId, userId });

    // Validate UUID format (basic check)
    if (!taskId || taskId.length !== 36) {
      console.log('[POST /api/tasks/:id/accept] Invalid task ID format');
      res.status(400).json({
        message: 'Invalid task ID format',
      });
      return;
    }

    // Fetch task to calculate expiration time
    console.log('[POST /api/tasks/:id/accept] Fetching task for expiration calculation');
    const taskForExpiration = await prisma.task.findUnique({
      where: { id: taskId },
      select: {
        estimatedTime: true,
        difficulty: true,
        type: true,
        status: true,
        creatorId: true,
      },
    });

    console.log('[POST /api/tasks/:id/accept] Task data:', taskForExpiration);

    if (!taskForExpiration) {
      console.log('[POST /api/tasks/:id/accept] Task not found');
      res.status(404).json({
        message: 'Task not found',
      });
      return;
    }

    // Calculate expiration time
    console.log('[POST /api/tasks/:id/accept] Calculating expiration time');
    const expiresAt = calculateExpirationTime(
      taskForExpiration.estimatedTime || 60,
      taskForExpiration.difficulty || 1,
      taskForExpiration.type
    );
    console.log('[POST /api/tasks/:id/accept] Expiration time:', expiresAt);

    // Verify user exists (prevent FK constraint error)
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      console.log('[POST /api/tasks/:id/accept] User not found (stale token?):', userId);
      res.status(401).json({
        message: 'Invalid user session. Please log in again.',
      });
      return;
    }

    console.log('[POST /api/tasks/:id/accept] User verified:', user.username);

    // Atomic task acceptance with race condition prevention
    // Using Prisma's updateMany with WHERE conditions to ensure atomicity
    console.log('[POST /api/tasks/:id/accept] Attempting to accept task');
    const result = await prisma.task.updateMany({
      where: {
        id: taskId,
        status: 'available', // Only update if still available
        creatorId: {
          not: userId, // Prevent accepting own tasks
        },
      },
      data: {
        status: 'in_progress',
        acceptedById: user.id,
        acceptedAt: new Date(),
        expiresAt, // Set calculated expiration time
      },
    });

    // Check if update was successful
    if (result.count === 0) {
      // Task not found, already taken, or user trying to accept own task
      const task = await prisma.task.findUnique({
        where: { id: taskId },
        select: {
          id: true,
          status: true,
          creatorId: true,
        },
      });

      if (!task) {
        res.status(404).json({
          message: 'Task not found',
        });
        return;
      }

      if (task.creatorId === userId) {
        res.status(400).json({
          message: 'Cannot accept your own task',
        });
        return;
      }

      if (task.status !== 'available') {
        res.status(409).json({
          message: 'Task already taken',
          status: task.status,
        });
        return;
      }

      // Shouldn't reach here, but handle unexpected cases
      res.status(500).json({
        message: 'Failed to accept task',
      });
      return;
    }

    // Fetch the accepted task with full details
    const acceptedTask = await prisma.task.findUnique({
      where: { id: taskId },
      select: {
        id: true,
        type: true,
        title: true,
        description: true,
        data: true,
        tokenReward: true,
        difficulty: true,
        estimatedTime: true,
        status: true,
        acceptedAt: true,
        expiresAt: true,
        creator: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    res.json({
      message: 'Task accepted successfully',
      task: acceptedTask,
    });
  })
);

// ============================================================================
// POST /api/tasks/:id/abandon - Abandon an accepted task
// ============================================================================

router.post(
  '/:id/abandon',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const taskId = req.params.id;
    const userId = req.user!.userId;

    console.log('[POST /api/tasks/:id/abandon] Request received:', { taskId, userId });

    // Validate UUID format
    if (!taskId || taskId.length !== 36) {
      res.status(400).json({
        message: 'Invalid task ID format',
      });
      return;
    }

    // Fetch the task
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: {
        id: true,
        status: true,
        acceptedById: true,
      },
    });

    if (!task) {
      res.status(404).json({
        message: 'Task not found',
      });
      return;
    }

    // Verify task is in progress
    if (task.status !== 'in_progress') {
      res.status(400).json({
        message: 'Task is not in progress',
        status: task.status,
      });
      return;
    }

    // Verify task is accepted by current user
    if (task.acceptedById !== userId) {
      res.status(403).json({
        message: 'You have not accepted this task',
      });
      return;
    }

    // Release the task back to available pool
    await prisma.task.update({
      where: { id: taskId },
      data: {
        status: 'available',
        acceptedById: null,
        acceptedAt: null,
        expiresAt: null,
      },
    });

    console.log('[POST /api/tasks/:id/abandon] Task abandoned successfully');

    res.json({
      message: 'Task abandoned successfully',
    });
  })
);

// ============================================================================
// POST /api/tasks/:id/submit - Submit task solution
// ============================================================================

router.post(
  '/:id/submit',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const taskId = req.params.id;
    const userId = req.user!.userId;
    const solution = req.body;

    // Validate UUID format
    if (!taskId || taskId.length !== 36) {
      res.status(400).json({
        message: 'Invalid task ID format',
      });
      return;
    }

    // Fetch the task with all necessary data
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: {
        id: true,
        type: true,
        title: true,
        data: true,
        solution: true,
        tokenReward: true,
        difficulty: true,
        status: true,
        acceptedById: true,
        creatorId: true,
        expiresAt: true,
      },
    });

    // Validate task exists
    if (!task) {
      res.status(404).json({
        message: 'Task not found',
      });
      return;
    }

    // Validate task is in progress and accepted by current user
    if (task.status !== 'in_progress') {
      res.status(400).json({
        message: 'Task is not in progress',
        status: task.status,
      });
      return;
    }

    if (task.acceptedById !== userId) {
      res.status(403).json({
        message: 'You have not accepted this task',
      });
      return;
    }

    // Check if task has expired
    if (isTaskExpired(task.expiresAt)) {
      res.status(410).json({
        message: 'Task has expired. It has been returned to the available pool.',
        code: 'TASK_EXPIRED',
      });
      return;
    }

    // Get previous submission count for attempt number
    const previousSubmissions = await prisma.taskSubmission.count({
      where: {
        taskId,
        userId,
      },
    });

    const attemptNumber = previousSubmissions + 1;

    // Validate the submission using the appropriate validator
    const validationResult = validateTask(task.type, solution, task.data, task.difficulty || 3);

    // Create submission record
    const submission = await prisma.taskSubmission.create({
      data: {
        taskId,
        userId,
        submission: solution,
        isCorrect: validationResult.isCorrect,
        feedback: validationResult as any,
        attemptNumber,
      },
    });

    // If correct, award tokens and mark task as completed
    if (validationResult.isCorrect) {
      // Use transaction to ensure atomicity
      await prisma.$transaction(async (tx) => {
        // Update task status to completed
        await tx.task.update({
          where: { id: taskId },
          data: {
            status: 'completed',
            completedAt: new Date(),
          },
        });

        // Update user stats
        await tx.user.update({
          where: { id: userId },
          data: {
            tasksCompleted: {
              increment: 1,
            },
          },
        });
      });

      // Award tokens (uses its own transaction)
      const { newBalance } = await TokenService.awardTokens(
        userId,
        task.tokenReward,
        `Completed task: ${task.title}`
      );

      res.json({
        success: true,
        message: 'Task completed successfully!',
        validation: validationResult,
        tokensAwarded: task.tokenReward,
        newBalance,
        submission: {
          id: submission.id,
          attemptNumber: submission.attemptNumber,
          createdAt: submission.createdAt,
        },
      });
      return;
    }

    // If incorrect, allow retry
    res.json({
      success: false,
      message: 'Submission incorrect. You can try again.',
      validation: validationResult,
      submission: {
        id: submission.id,
        attemptNumber: submission.attemptNumber,
        createdAt: submission.createdAt,
      },
      canRetry: true,
    });
  })
);

export default router;
