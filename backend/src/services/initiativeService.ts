// TaskMan Initiative Service
// Handles business logic for user-created initiatives

import prisma from '../lib/prisma';

interface CreateInitiativeData {
  title: string;
  description?: string;
  projectId?: string;
}

interface UpdateInitiativeData {
  title?: string;
  description?: string;
  status?: 'active' | 'completed' | 'archived';
}

interface InitiativeFilters {
  projectId?: string;
  status?: string;
  creatorId?: string;
  includeTasks?: boolean;
}

/**
 * Initiative Service
 * Provides CRUD operations and business logic for initiatives
 */
export class InitiativeService {
  /**
   * Create a new initiative
   */
  static async createInitiative(userId: string, data: CreateInitiativeData) {
    // Validate title
    if (!data.title || data.title.trim().length === 0) {
      throw new Error('Initiative title is required');
    }

    if (data.title.length > 255) {
      throw new Error('Initiative title must be 255 characters or less');
    }

    // Validate description if provided
    if (data.description && data.description.length > 5000) {
      throw new Error('Initiative description must be 5000 characters or less');
    }

    // Validate project exists if projectId provided
    if (data.projectId) {
      const project = await prisma.project.findUnique({
        where: { id: data.projectId },
      });

      if (!project) {
        throw new Error('Project not found');
      }
    }

    // Create initiative
    const initiative = await prisma.initiative.create({
      data: {
        title: data.title.trim(),
        description: data.description?.trim(),
        creatorId: userId,
        projectId: data.projectId,
        status: 'active',
        tokenReward: 0, // Placeholder for future mechanics
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            level: true,
          },
        },
        project: true,
      },
    });

    return initiative;
  }

  /**
   * Get initiatives with filters and task counts
   */
  static async getInitiatives(filters: InitiativeFilters = {}) {
    const where: any = {};

    if (filters.projectId) {
      where.projectId = filters.projectId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.creatorId) {
      where.creatorId = filters.creatorId;
    }

    const initiatives = await prisma.initiative.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            level: true,
          },
        },
        project: filters.includeTasks,
        tasks: filters.includeTasks
          ? {
              select: {
                id: true,
                title: true,
                type: true,
                status: true,
                tokenReward: true,
                difficulty: true,
                estimatedTime: true,
                createdAt: true,
              },
            }
          : undefined,
        _count: {
          select: { tasks: true },
        },
      },
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    });

    // Calculate totals for each initiative
    const initiativesWithTotals = await Promise.all(
      initiatives.map(async (initiative) => {
        const totalTokenRewards = await this.getTotalRewardsForInitiative(
          initiative.id
        );

        return {
          ...initiative,
          taskCount: initiative._count.tasks,
          totalTokenRewards,
        };
      })
    );

    return initiativesWithTotals;
  }

  /**
   * Get initiative by ID with full details
   */
  static async getInitiativeById(id: string) {
    const initiative = await prisma.initiative.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            level: true,
          },
        },
        project: true,
        tasks: {
          select: {
            id: true,
            title: true,
            type: true,
            status: true,
            tokenReward: true,
            difficulty: true,
            estimatedTime: true,
            creator: {
              select: {
                id: true,
                username: true,
                level: true,
              },
            },
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: { tasks: true },
        },
      },
    });

    if (!initiative) {
      return null;
    }

    const totalTokenRewards = await this.getTotalRewardsForInitiative(id);

    return {
      ...initiative,
      taskCount: initiative._count.tasks,
      totalTokenRewards,
    };
  }

  /**
   * Update an initiative
   * Only the creator can update
   */
  static async updateInitiative(
    id: string,
    userId: string,
    data: UpdateInitiativeData
  ) {
    // Check if initiative exists
    const initiative = await prisma.initiative.findUnique({
      where: { id },
    });

    if (!initiative) {
      throw new Error('Initiative not found');
    }

    // Check if user is the creator
    if (initiative.creatorId !== userId) {
      throw new Error('Only the initiative creator can update it');
    }

    // Validate title if provided
    if (data.title !== undefined) {
      if (!data.title || data.title.trim().length === 0) {
        throw new Error('Initiative title cannot be empty');
      }

      if (data.title.length > 255) {
        throw new Error('Initiative title must be 255 characters or less');
      }
    }

    // Validate description if provided
    if (data.description !== undefined && data.description.length > 5000) {
      throw new Error('Initiative description must be 5000 characters or less');
    }

    // Prepare update data
    const updateData: any = {};

    if (data.title !== undefined) {
      updateData.title = data.title.trim();
    }

    if (data.description !== undefined) {
      updateData.description = data.description.trim();
    }

    if (data.status !== undefined) {
      updateData.status = data.status;

      // Set completedAt if status is completed
      if (data.status === 'completed') {
        updateData.completedAt = new Date();
      }
    }

    // Update initiative
    const updated = await prisma.initiative.update({
      where: { id },
      data: updateData,
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            level: true,
          },
        },
        project: true,
      },
    });

    return updated;
  }

  /**
   * Delete an initiative
   * Only the creator can delete, and only if no tasks are assigned
   */
  static async deleteInitiative(id: string, userId: string) {
    // Check if initiative exists
    const initiative = await prisma.initiative.findUnique({
      where: { id },
      include: {
        _count: {
          select: { tasks: true },
        },
      },
    });

    if (!initiative) {
      throw new Error('Initiative not found');
    }

    // Check if user is the creator
    if (initiative.creatorId !== userId) {
      throw new Error('Only the initiative creator can delete it');
    }

    // Check if there are tasks assigned
    if (initiative._count.tasks > 0) {
      throw new Error(
        'Cannot delete initiative with assigned tasks. Move or delete tasks first.'
      );
    }

    // Delete initiative
    await prisma.initiative.delete({
      where: { id },
    });

    return { success: true, message: 'Initiative deleted successfully' };
  }

  /**
   * Get task count for an initiative
   */
  static async getTaskCountForInitiative(initiativeId: string): Promise<number> {
    const count = await prisma.task.count({
      where: { initiativeId },
    });

    return count;
  }

  /**
   * Get total token rewards for all tasks in an initiative
   */
  static async getTotalRewardsForInitiative(
    initiativeId: string
  ): Promise<number> {
    const result = await prisma.task.aggregate({
      where: { initiativeId },
      _sum: {
        tokenReward: true,
      },
    });

    return result._sum.tokenReward || 0;
  }

  /**
   * Assign a task to an initiative
   */
  static async assignTaskToInitiative(taskId: string, initiativeId: string | null) {
    // Validate initiative exists if initiativeId is provided
    if (initiativeId) {
      const initiative = await prisma.initiative.findUnique({
        where: { id: initiativeId },
      });

      if (!initiative) {
        throw new Error('Initiative not found');
      }
    }

    // Update task
    const task = await prisma.task.update({
      where: { id: taskId },
      data: { initiativeId },
      include: {
        initiative: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return task;
  }

  // ============================================================================
  // PLACEHOLDER FUNCTIONS FOR FUTURE TOKEN REWARD MECHANICS
  // ============================================================================

  /**
   * Calculate token reward for initiative creator
   * TBD: Detailed mechanics for how initiative creators earn tokens
   */
  static async calculateInitiativeReward(
    _initiativeId: string
  ): Promise<number> {
    // Placeholder implementation
    // Future: Implement reward calculation based on:
    // - Number of tasks completed in initiative
    // - Total token value of completed tasks
    // - Completion by others vs self
    // - Time to complete
    // - etc.

    return 0;
  }

  /**
   * Award tokens to initiative creator when tasks in initiative are completed
   * TBD: Detailed mechanics for when/how rewards are distributed
   */
  static async awardInitiativeReward(
    _initiativeId: string,
    _taskId: string
  ): Promise<void> {
    // Placeholder implementation
    // Future: Implement reward distribution logic
    // - Check if task is part of initiative
    // - Calculate reward based on mechanics
    // - Award tokens to initiative creator
    // - Record transaction
    // - Update initiative tokenReward field

    return;
  }
}
