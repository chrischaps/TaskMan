import { create } from 'zustand'

export type NotificationType = 'success' | 'error' | 'info' | 'warning'

export interface Notification {
  id: string
  type: NotificationType
  message: string
  duration?: number
}

interface UIState {
  // Modal states
  isCreateTaskModalOpen: boolean
  isTaskExecutionModalOpen: boolean
  currentExecutingTaskId: string | null

  // Notification states
  notifications: Notification[]

  // Loading states
  isLoading: boolean
  loadingMessage: string

  // Modal actions
  openCreateTaskModal: () => void
  closeCreateTaskModal: () => void
  openTaskExecutionModal: (taskId: string) => void
  closeTaskExecutionModal: () => void

  // Notification actions
  addNotification: (notification: Omit<Notification, 'id'>) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void

  // Loading actions
  setLoading: (isLoading: boolean, message?: string) => void
}

export const useUIStore = create<UIState>((set) => ({
  // Initial modal states
  isCreateTaskModalOpen: false,
  isTaskExecutionModalOpen: false,
  currentExecutingTaskId: null,

  // Initial notification states
  notifications: [],

  // Initial loading states
  isLoading: false,
  loadingMessage: '',

  // Modal actions
  openCreateTaskModal: () =>
    set({
      isCreateTaskModalOpen: true,
    }),

  closeCreateTaskModal: () =>
    set({
      isCreateTaskModalOpen: false,
    }),

  openTaskExecutionModal: (taskId) =>
    set({
      isTaskExecutionModalOpen: true,
      currentExecutingTaskId: taskId,
    }),

  closeTaskExecutionModal: () =>
    set({
      isTaskExecutionModalOpen: false,
      currentExecutingTaskId: null,
    }),

  // Notification actions
  addNotification: (notification) =>
    set((state) => ({
      notifications: [
        ...state.notifications,
        { ...notification, id: `${Date.now()}-${Math.random()}` },
      ],
    })),

  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),

  clearNotifications: () =>
    set({
      notifications: [],
    }),

  // Loading actions
  setLoading: (isLoading, message = '') =>
    set({
      isLoading,
      loadingMessage: message,
    }),
}))
