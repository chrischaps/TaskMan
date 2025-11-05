// Task type definitions
export type {}

export interface Task {
  id: string
  type: string
  title: string
  description: string
  tokenReward: number
  difficulty: number
  estimatedTime: number
  isTutorial: boolean
  creator: {
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
