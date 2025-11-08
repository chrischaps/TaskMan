// Task type definitions

export type TaskStatusLabel = 'available' | 'claimed' | 'expiring_soon' | 'completed';

// Task-specific data types (defined before Task interface)
export interface SortListData {
  items: string[];
  sortCriteria: 'alphabetical' | 'numerical' | 'length';
}

export interface GroupSeparationData {
  items: Array<{
    id: string;
    attributes: Record<string, string>;
  }>;
  groupBy: string;
}

export interface DefragData {
  grid: string[][];
  rows: number;
  cols: number;
}

export interface ArithmeticData {
  expression: string;
  correctAnswer: number;
}

export interface Task {
  id: string;
  type: string;
  title: string;
  description: string;
  data: SortListData | GroupSeparationData | DefragData | ArithmeticData | Record<string, unknown>; // JSONB field containing task-specific data (e.g., SortListData)
  tokenReward: number;
  difficulty: number;
  estimatedTime: number;
  status?: string;
  isTutorial: boolean;
  isOwnTask?: boolean;
  acceptedAt?: string;
  expiresAt?: string;
  acceptedById?: string | null;
  organizationId?: string | null;
  projectId?: string | null;
  initiativeId?: string | null;
  initiative?: {
    id: string;
    title: string;
  };
  statusLabel?: TaskStatusLabel;
  createdAt?: string;
  creator: {
    id?: string;
    username: string;
    level: number;
  };
}

export interface TasksResponse {
  tasks: Task[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// Solution types
export interface SortListSolution {
  sortedItems: string[];
}

export interface GroupSeparationSolution {
  groups: Record<string, string[]>;
}

export interface DefragSolution {
  grid: string[][];
  moveCount: number;
}
