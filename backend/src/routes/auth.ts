import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { hashPassword, comparePassword } from '../utils/hash';
import { generateToken } from '../utils/jwt';
import { authMiddleware } from '../middleware/auth';
import * as OrganizationService from '../services/organizationService';

const router = Router();

// Validation schemas
const registerSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must not exceed 50 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'),
  email: z
    .string()
    .email('Invalid email address')
    .max(255, 'Email must not exceed 255 characters'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must not exceed 100 characters'),
});

const loginSchema = z.object({
  login: z.string().min(1, 'Email or username is required'),
  password: z.string().min(1, 'Password is required'),
});

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validationResult = registerSchema.safeParse(req.body);

    if (!validationResult.success) {
      res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid input data',
        details: validationResult.error.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      });
      return;
    }

    const { username, email, password } = validationResult.data;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      if (existingUser.email === email) {
        res.status(409).json({
          error: 'Conflict',
          message: 'Email already registered',
        });
        return;
      }
      if (existingUser.username === username) {
        res.status(409).json({
          error: 'Conflict',
          message: 'Username already taken',
        });
        return;
      }
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Find organization with fewest members for balanced assignment
    const smallestOrg = await OrganizationService.getSmallestOrganization();

    // Create user (with organization assignment if available)
    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        organizationId: smallestOrg?.id, // Assign to smallest org (null if no orgs exist)
      },
      include: {
        organization: true, // Include organization data in response
      },
    });

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      username: user.username,
    });

    // Return user data and token
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        tokenBalance: user.tokenBalance,
        level: user.level,
        tasksCompleted: user.tasksCompleted,
        tutorialCompleted: user.tutorialCompleted,
        taskBoardUnlocked: user.taskBoardUnlocked,
        compositeUnlocked: user.compositeUnlocked,
        organization: user.organization ? {
          id: user.organization.id,
          name: user.organization.name,
        } : null,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred during registration',
    });
  }
});

/**
 * POST /api/auth/login
 * Login an existing user
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validationResult = loginSchema.safeParse(req.body);

    if (!validationResult.success) {
      res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid input data',
        details: validationResult.error.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      });
      return;
    }

    const { login, password } = validationResult.data;

    // Find user by email or username
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: login }, { username: login }],
      },
      include: {
        organization: true, // Include organization data
      },
    });

    if (!user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid credentials',
      });
      return;
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.passwordHash);

    if (!isPasswordValid) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid credentials',
      });
      return;
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      username: user.username,
    });

    // Return user data and token
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        tokenBalance: user.tokenBalance,
        level: user.level,
        tasksCompleted: user.tasksCompleted,
        tutorialCompleted: user.tutorialCompleted,
        taskBoardUnlocked: user.taskBoardUnlocked,
        compositeUnlocked: user.compositeUnlocked,
        organization: user.organization ? {
          id: user.organization.id,
          name: user.organization.name,
        } : null,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred during login',
    });
  }
});

/**
 * GET /api/auth/me
 * Get current user profile (requires authentication)
 */
router.get('/me', authMiddleware, async (req: Request, res: Response) => {
  try {
    // User is attached to request by authMiddleware
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
      return;
    }

    // Fetch fresh user data from database
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: {
        organization: true, // Include organization data
      },
    });

    if (!user) {
      res.status(404).json({
        error: 'Not Found',
        message: 'User not found',
      });
      return;
    }

    // Return user data
    res.status(200).json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        tokenBalance: user.tokenBalance,
        level: user.level,
        tasksCompleted: user.tasksCompleted,
        tutorialCompleted: user.tutorialCompleted,
        taskBoardUnlocked: user.taskBoardUnlocked,
        compositeUnlocked: user.compositeUnlocked,
        organization: user.organization ? {
          id: user.organization.id,
          name: user.organization.name,
        } : null,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred while fetching user data',
    });
  }
});

export default router;
