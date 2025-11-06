// Admin Authentication Middleware
// Checks if the authenticated user has admin privileges

import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';

/**
 * Middleware to check if user is an admin
 * Must be used AFTER authMiddleware
 */
export async function adminMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user.userId) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    // Fetch user from database to check admin status
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { isAdmin: true },
    });

    if (!user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }

    if (!user.isAdmin) {
      res.status(403).json({ message: 'Admin access required' });
      return;
    }

    // User is admin, proceed to next middleware/route
    next();
  } catch (error) {
    next(error);
  }
}
