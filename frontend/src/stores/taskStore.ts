import { create } from 'zustand'

export type TaskType = 'sort_list' | 'color_match' | 'arithmetic' | 'group_separation' | 'defragmentation'
export type TaskStatus = 'available' | 'in_progress' | 'completed'

export interface Task {
  id: string
  type: TaskType
  status: TaskStatus
  reward: number
  difficulty: number
  data: unknown
  solution?: unknown
  isTutorial: boolean
  creatorId: string
  acceptedById?: string
  createdAt: string
  acceptedAt?: string
  completedAt?: string
}

interface TaskState {
  activeTasks: Task[]
  completedTasks: Task[]
  setActiveTasks: (tasks: Task[]) => void
  setCompletedTasks: (tasks: Task[]) => void
  addActiveTask: (task: Task) => void
  removeActiveTask: (taskId: string) => void
  moveToCompleted: (taskId: string) => void
  clearTasks: () => void
}

export const useTaskStore = create<TaskState>((set) => ({
  activeTasks: [],
  completedTasks: [],

  setActiveTasks: (tasks) =>
    set({
      activeTasks: tasks,
    }),

  setCompletedTasks: (tasks) =>
    set({
      completedTasks: tasks,
    }),

  addActiveTask: (task) =>
    set((state) => ({
      activeTasks: [...state.activeTasks, task],
    })),

  removeActiveTask: (taskId) =>
    set((state) => ({
      activeTasks: state.activeTasks.filter((t) => t.id !== taskId),
    })),

  moveToCompleted: (taskId) =>
    set((state) => {
      const task = state.activeTasks.find((t) => t.id === taskId)
      if (!task) return state

      return {
        activeTasks: state.activeTasks.filter((t) => t.id !== taskId),
        completedTasks: [...state.completedTasks, { ...task, status: 'completed' as TaskStatus }],
      }
    }),

  clearTasks: () =>
    set({
      activeTasks: [],
      completedTasks: [],
    }),
}))
