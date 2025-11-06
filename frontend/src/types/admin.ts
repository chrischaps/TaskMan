// Admin-specific types

export interface TaskTemplate {
  type: string
  category: string
  title: string
  description?: string
  data: any
  solution: any
  tokenReward: number
  difficulty?: number
  estimatedTime?: number
  creatorId?: string
}

export interface AdminProject {
  id: string
  name: string
  description?: string
  status: 'draft' | 'scheduled' | 'active' | 'completed'
  scheduledStartTime?: string
  actualStartTime?: string
  completedAt?: string
  taskCount: number
  createdAt: string
  updatedAt: string
  _count?: {
    tasks: number
  }
}

export interface AdminUser {
  id: string
  username: string
  email: string
  tokenBalance: number
  level: number
  tasksCompleted: number
  isAdmin: boolean
  organization: {
    id: string
    name: string
  } | null
  createdAt: string
}

export interface AdminTask {
  id: string
  type: string
  category: string
  title: string
  description?: string
  tokenReward: number
  difficulty?: number
  status: string
  creator: {
    id: string
    username: string
  }
  acceptedBy?: {
    id: string
    username: string
  } | null
  organization?: {
    id: string
    name: string
  } | null
  project?: {
    id: string
    name: string
  } | null
  createdAt: string
}
