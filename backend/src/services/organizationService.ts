// Organization Service
// Handles organization management and balanced user assignment

import prisma from '../lib/prisma';

/**
 * Get all organizations
 */
export async function getAllOrganizations() {
  return await prisma.organization.findMany({
    include: {
      _count: {
        select: {
          users: true,
          tasks: true,
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  });
}

/**
 * Get organization by ID with details
 */
export async function getOrganizationById(organizationId: string) {
  return await prisma.organization.findUnique({
    where: { id: organizationId },
    include: {
      _count: {
        select: {
          users: true,
          tasks: true,
        },
      },
    },
  });
}

/**
 * Find the organization with the fewest members (for balanced assignment)
 * Returns null if no organizations exist
 */
export async function getSmallestOrganization() {
  const orgs = await prisma.organization.findMany({
    include: {
      _count: {
        select: {
          users: true,
        },
      },
    },
  });

  if (orgs.length === 0) {
    return null;
  }

  // Find organization with minimum user count
  return orgs.reduce((smallest, current) => {
    return current._count.users < smallest._count.users ? current : smallest;
  });
}

/**
 * Assign a user to an organization (balanced assignment)
 * Automatically picks the smallest organization
 */
export async function assignUserToOrganization(userId: string) {
  const smallestOrg = await getSmallestOrganization();

  if (!smallestOrg) {
    throw new Error('No organizations available for assignment');
  }

  return await prisma.user.update({
    where: { id: userId },
    data: { organizationId: smallestOrg.id },
  });
}

/**
 * Get organization leaderboard/scoreboard for a project
 * Returns completion percentage per organization
 */
export async function getOrganizationScoreboard(projectId?: string) {
  const orgs = await getAllOrganizations();

  const scoreboard = await Promise.all(
    orgs.map(async (org) => {
      // Build task query
      const taskQuery: any = {
        organizationId: org.id,
      };

      if (projectId) {
        taskQuery.projectId = projectId;
      }

      const totalTasks = await prisma.task.count({
        where: taskQuery,
      });

      const completedTasks = await prisma.task.count({
        where: {
          ...taskQuery,
          status: 'completed',
        },
      });

      const completionPercentage = totalTasks > 0
        ? Math.round((completedTasks / totalTasks) * 100)
        : 0;

      return {
        organizationId: org.id,
        organizationName: org.name,
        memberCount: org._count.users,
        totalTasks,
        completedTasks,
        completionPercentage,
      };
    })
  );

  // Sort by completion percentage (descending)
  return scoreboard.sort((a, b) => b.completionPercentage - a.completionPercentage);
}
