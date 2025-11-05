// Task type definitions
export type {}

export interface Task {
  id: string
  type: string
  title: string
  description: string
  data: any // JSONB field containing task-specific data (e.g., SortListData)
  tokenReward: number
  difficulty: number
  estimatedTime: number
  status?: string
  isTutorial: boolean
  acceptedAt?: string
  expiresAt?: string
  creator: {
    id?: string
    username: string
    level: number
  }
}

export interface TasksResponse {
  tasks: Task[]
  pagination: {
    page: number
    limit: number
    totalCount: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

// Task-specific data types
export interface SortListData {
  items: string[]
  sortCriteria: 'alphabetical' | 'numerical' | 'length'
}

export interface SortListSolution {
  sortedItems: string[]
}
