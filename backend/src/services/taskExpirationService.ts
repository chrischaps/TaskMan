// Task Expiration Service
// Handles periodic cleanup of expired tasks

import prisma from '../lib/prisma';

export class TaskExpirationService {
  /**
   * Release expired tasks back to available pool
   * Resets task status and removes acceptance metadata
   *
   * @returns Number of tasks released
   */
  static async releaseExpiredTasks(): Promise<number> {
    const now = new Date();

    try {
      const result = await prisma.task.updateMany({
        where: {
          status: 'in_progress',
          expiresAt: {
            not: null,
            lt: now, // Tasks where expiresAt < now
          },
        },
        data: {
          status: 'available',
          acceptedById: null,
          acceptedAt: null,
          expiresAt: null,
        },
      });

      if (result.count > 0) {
        console.log(`[TaskExpiration] Released ${result.count} expired task(s)`);
      }

      return result.count;
    } catch (error) {
      console.error('[TaskExpiration] Error releasing expired tasks:', error);
      return 0;
    }
  }

  /**
   * Start periodic cleanup service
   * Runs immediately on startup, then every 60 seconds
   *
   * @returns Interval ID that can be used to stop the service
   */
  static startPeriodicCleanup(): NodeJS.Timeout {
    console.log('[TaskExpiration] Cleanup service started (runs every 60 seconds)');

    // Run immediately on startup
    this.releaseExpiredTasks();

    // Then run every minute
    return setInterval(() => {
      this.releaseExpiredTasks().catch((error) => {
        console.error('[TaskExpiration] Periodic cleanup error:', error);
      });
    }, 60 * 1000);
  }

  /**
   * Stop the periodic cleanup service
   *
   * @param intervalId - The interval ID returned by startPeriodicCleanup
   */
  static stopPeriodicCleanup(intervalId: NodeJS.Timeout): void {
    clearInterval(intervalId);
    console.log('[TaskExpiration] Cleanup service stopped');
  }
}
