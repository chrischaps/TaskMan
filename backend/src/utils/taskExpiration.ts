// Task Expiration Utility Functions

const TASK_TYPE_MULTIPLIERS: Record<string, number> = {
  sort_list: 1.0,
  arithmetic: 1.0,
  color_match: 1.2,
  group_separation: 1.3,
  defragmentation: 1.5,
};

const MIN_EXPIRATION_MS = 2 * 60 * 1000; // 2 minutes
const MAX_EXPIRATION_MS = 60 * 60 * 1000; // 60 minutes

/**
 * Calculate the expiration time for a task based on its properties
 *
 * Formula: estimatedTime × 3 × difficultyMultiplier × taskTypeMultiplier
 * Min: 2 minutes, Max: 60 minutes
 *
 * @param estimatedTimeSeconds - Estimated time to complete task in seconds
 * @param difficulty - Task difficulty (1-5)
 * @param taskType - Type of task (sort_list, arithmetic, etc.)
 * @returns Date object representing when the task will expire
 */
export function calculateExpirationTime(
  estimatedTimeSeconds: number,
  difficulty: number,
  taskType: string
): Date {
  // Base: 3x estimated time (converted to milliseconds)
  const baseTime = estimatedTimeSeconds * 3 * 1000;

  // Difficulty multiplier: 1.0 (diff 1) to 1.8 (diff 5)
  const difficultyMultiplier = 1.0 + (difficulty - 1) * 0.2;

  // Task type multiplier
  const typeMultiplier = TASK_TYPE_MULTIPLIERS[taskType] || 1.0;

  // Calculate total expiration time
  let expirationMs = baseTime * difficultyMultiplier * typeMultiplier;

  // Apply min/max caps
  expirationMs = Math.max(MIN_EXPIRATION_MS, Math.min(MAX_EXPIRATION_MS, expirationMs));

  // Return expiration timestamp
  return new Date(Date.now() + expirationMs);
}

/**
 * Check if a task has expired
 *
 * @param expiresAt - The expiration timestamp (or null if no expiration)
 * @returns true if the task has expired, false otherwise
 */
export function isTaskExpired(expiresAt: Date | null): boolean {
  if (!expiresAt) return false;
  return new Date() > expiresAt;
}

/**
 * Get human-readable time remaining until expiration
 *
 * @param expiresAt - The expiration timestamp
 * @returns Object with minutes and seconds remaining
 */
export function getTimeRemaining(expiresAt: Date): { minutes: number; seconds: number } {
  const now = Date.now();
  const expiration = expiresAt.getTime();
  const remaining = Math.max(0, expiration - now);

  const minutes = Math.floor(remaining / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);

  return { minutes, seconds };
}
