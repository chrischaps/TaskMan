// Organization Routes
// API endpoints for organization management

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import * as OrganizationService from '../services/organizationService';

const router = Router();

/**
 * GET /api/organizations
 * Get all organizations with member counts and task counts
 */
router.get('/', authMiddleware, async (_req, res, next) => {
  try {
    const organizations = await OrganizationService.getAllOrganizations();
    res.json(organizations);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/organizations/:id
 * Get organization details by ID
 */
router.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    const organization = await OrganizationService.getOrganizationById(req.params.id);

    if (!organization) {
      res.status(404).json({ message: 'Organization not found' });
      return;
    }

    res.json(organization);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/organizations/scoreboard
 * Get organization scoreboard (completion percentages)
 * Optional query param: projectId
 */
router.get('/scoreboard/current', authMiddleware, async (req, res, next) => {
  try {
    const projectId = req.query.projectId as string | undefined;
    const scoreboard = await OrganizationService.getOrganizationScoreboard(projectId);
    res.json(scoreboard);
  } catch (error) {
    next(error);
  }
});

export default router;
