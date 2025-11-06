import { create } from 'zustand'
import type { OrganizationScoreboard } from '../types/organization'

interface ScoreboardState {
  scoreboard: OrganizationScoreboard[]
  activeProjectId: string | null
  isLoading: boolean
  error: string | null
  setScoreboard: (scoreboard: OrganizationScoreboard[]) => void
  setActiveProjectId: (projectId: string | null) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  clearScoreboard: () => void
}

export const useScoreboardStore = create<ScoreboardState>((set) => ({
  scoreboard: [],
  activeProjectId: null,
  isLoading: false,
  error: null,

  setScoreboard: (scoreboard) =>
    set({
      scoreboard,
      error: null,
    }),

  setActiveProjectId: (projectId) =>
    set({
      activeProjectId: projectId,
    }),

  setLoading: (isLoading) =>
    set({
      isLoading,
    }),

  setError: (error) =>
    set({
      error,
      isLoading: false,
    }),

  clearScoreboard: () =>
    set({
      scoreboard: [],
      activeProjectId: null,
      error: null,
      isLoading: false,
    }),
}))
