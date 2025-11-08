// Initiative Type Definitions
// For user-created initiative system

export interface Initiative {
  id: string;
  title: string;
  description?: string;
  creatorId: string;
  creator?: {
    id: string;
    username: string;
    level: number;
  };
  projectId?: string;
  tokenReward: number;
  status: 'active' | 'completed' | 'archived';
  createdAt: string;
  updatedAt: string;
  completedAt?: string;

  // Computed fields (from API)
  taskCount?: number;
  totalTokenRewards?: number;
}

export interface CreateInitiativeDto {
  title: string;
  description?: string;
  projectId?: string;
}

export interface UpdateInitiativeDto {
  title?: string;
  description?: string;
  status?: 'active' | 'completed' | 'archived';
}
