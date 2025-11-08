// Task Status Utility Functions
// Calculate and format task status labels

import type { Task, TaskStatusLabel } from '../types/task';

/**
 * Calculate the status label for a task based on its current state
 */
export function calculateTaskStatus(task: Task): TaskStatusLabel {
  // Completed tasks
  if (task.status === 'completed') {
    return 'completed';
  }

  // In-progress tasks
  if (task.status === 'in_progress' && task.acceptedById) {
    // Check if expiring soon (within 1 hour)
    if (task.expiresAt) {
      const expiresAt = new Date(task.expiresAt);
      const now = new Date();
      const hourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

      if (expiresAt <= hourFromNow) {
        return 'expiring_soon';
      }
    }
    return 'claimed';
  }

  // Default: available
  return 'available';
}

/**
 * Status color classes for Tailwind CSS
 */
export const STATUS_COLORS: Record<TaskStatusLabel, string> = {
  available: 'bg-green-100 text-green-800 border-green-200',
  claimed: 'bg-blue-100 text-blue-800 border-blue-200',
  expiring_soon: 'bg-orange-100 text-orange-800 border-orange-200',
  completed: 'bg-gray-100 text-gray-800 border-gray-200',
};

/**
 * Status label display text
 */
export const STATUS_LABELS: Record<TaskStatusLabel, string> = {
  available: 'Available',
  claimed: 'Claimed',
  expiring_soon: 'Expiring Soon',
  completed: 'Completed',
};

/**
 * Get the background color for a status badge
 */
export function getStatusColor(status: TaskStatusLabel): string {
  return STATUS_COLORS[status] || STATUS_COLORS.available;
}

/**
 * Get the display label for a status
 */
export function getStatusLabel(status: TaskStatusLabel): string {
  return STATUS_LABELS[status] || 'Unknown';
}

/**
 * Add status label to a task object
 */
export function enrichTaskWithStatus(task: Task): Task {
  return {
    ...task,
    statusLabel: calculateTaskStatus(task),
  };
}

/**
 * Add status labels to an array of tasks
 */
export function enrichTasksWithStatus(tasks: Task[]): Task[] {
  return tasks.map(enrichTaskWithStatus);
}
