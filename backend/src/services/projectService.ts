// Project Service
// Handles project management, activation, and task duplication

import prisma from '../lib/prisma';
import { Prisma } from '@prisma/client';

/**
 * Get all projects
 */
export async function getAllProjects() {
  return await prisma.project.findMany({
    include: {
      _count: {
        select: {
          tasks: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

/**
 * Get project by ID
 */
export async function getProjectById(projectId: string) {
  return await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      _count: {
        select: {
          tasks: true,
        },
      },
    },
  });
}

/**
 * Get the currently active project (only one can be active at a time)
 */
export async function getActiveProject() {
  return await prisma.project.findFirst({
    where: { status: 'active' },
    include: {
      _count: {
        select: {
          tasks: true,
        },
      },
    },
  });
}

/**
 * Create a new project in draft status
 */
export async function createProject(data: {
  name: string;
  description?: string;
  scheduledStartTime?: Date;
  taskTemplates: any[]; // Array of task data to duplicate per organization
}) {
  const { taskTemplates, ...projectData } = data;

  // Create project with task count
  const project = await prisma.project.create({
    data: {
      ...projectData,
      taskCount: taskTemplates.length,
      status: 'draft',
    },
  });

  return project;
}

/**
 * Activate a project
 * - Sets status to 'active'
 * - Deactivates any other active projects
 * - Duplicates tasks to all organizations
 */
export async function activateProject(projectId: string, taskTemplates: any[]) {
  // First, check if there's already an active project
  const activeProject = await getActiveProject();

  if (activeProject && activeProject.id !== projectId) {
    throw new Error('Another project is already active. Only one project can be active at a time.');
  }

  // Get all organizations
  const organizations = await prisma.organization.findMany();

  if (organizations.length === 0) {
    throw new Error('No organizations available to activate project');
  }

  // Get the project
  const project = await getProjectById(projectId);

  if (!project) {
    throw new Error('Project not found');
  }

  if (project.status === 'active') {
    throw new Error('Project is already active');
  }

  // Use a transaction to ensure atomicity
  const result = await prisma.$transaction(async (tx) => {
    // Update project status to active
    const updatedProject = await tx.project.update({
      where: { id: projectId },
      data: {
        status: 'active',
        actualStartTime: new Date(),
      },
    });

    // Duplicate tasks for each organization
    const createdTasks = [];

    for (const org of organizations) {
      for (const template of taskTemplates) {
        const task = await tx.task.create({
          data: {
            ...template,
            organizationId: org.id,
            projectId: projectId,
            status: 'available',
          },
        });
        createdTasks.push(task);
      }
    }

    return {
      project: updatedProject,
      tasksCreated: createdTasks.length,
      organizationsCount: organizations.length,
    };
  });

  return result;
}

/**
 * Complete a project
 * - Sets status to 'completed'
 * - Records completedAt timestamp
 */
export async function completeProject(projectId: string) {
  return await prisma.project.update({
    where: { id: projectId },
    data: {
      status: 'completed',
      completedAt: new Date(),
    },
  });
}

/**
 * Schedule a project for future activation
 */
export async function scheduleProject(projectId: string, scheduledStartTime: Date) {
  return await prisma.project.update({
    where: { id: projectId },
    data: {
      status: 'scheduled',
      scheduledStartTime,
    },
  });
}

/**
 * Get project progress for all organizations
 */
export async function getProjectProgress(projectId: string) {
  const organizations = await prisma.organization.findMany();

  const progress = await Promise.all(
    organizations.map(async (org) => {
      const totalTasks = await prisma.task.count({
        where: {
          projectId,
          organizationId: org.id,
        },
      });

      const completedTasks = await prisma.task.count({
        where: {
          projectId,
          organizationId: org.id,
          status: 'completed',
        },
      });

      const inProgressTasks = await prisma.task.count({
        where: {
          projectId,
          organizationId: org.id,
          status: 'in_progress',
        },
      });

      const completionPercentage = totalTasks > 0
        ? Math.round((completedTasks / totalTasks) * 100)
        : 0;

      return {
        organizationId: org.id,
        organizationName: org.name,
        totalTasks,
        completedTasks,
        inProgressTasks,
        availableTasks: totalTasks - completedTasks - inProgressTasks,
        completionPercentage,
      };
    })
  );

  // Sort by completion percentage (descending)
  return progress.sort((a, b) => b.completionPercentage - a.completionPercentage);
}
