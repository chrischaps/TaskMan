import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
  id: string
  username: string
  email: string
  tokenBalance: number
  level: number
  tutorialCompleted: boolean
  taskBoardUnlocked: boolean
  compositeUnlocked: boolean
  organization?: {
    id: string
    name: string
  } | null
  createdAt: string
  tasksCompleted?: number
}

interface UserState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  setUser: (user: User) => void
  setToken: (token: string) => void
  clearUser: () => void
  updateTokenBalance: (newBalance: number) => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: true,
        }),

      setToken: (token) =>
        set({
          token,
        }),

      clearUser: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        }),

      updateTokenBalance: (newBalance) =>
        set((state) => ({
          user: state.user ? { ...state.user, tokenBalance: newBalance } : null,
        })),
    }),
    {
      name: 'taskman-user-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
