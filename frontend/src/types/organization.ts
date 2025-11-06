// Organization and Project Types

export interface Organization {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    users: number;
    tasks: number;
  };
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'draft' | 'scheduled' | 'active' | 'completed';
  scheduledStartTime?: string;
  actualStartTime?: string;
  completedAt?: string;
  taskCount: number;
  createdAt: string;
  updatedAt: string;
  _count?: {
    tasks: number;
  };
}

export interface OrganizationScoreboard {
  organizationId: string;
  organizationName: string;
  memberCount: number;
  totalTasks: number;
  completedTasks: number;
  completionPercentage: number;
}

export interface ProjectProgress {
  organizationId: string;
  organizationName: string;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  availableTasks: number;
  completionPercentage: number;
}
