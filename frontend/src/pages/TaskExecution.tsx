import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import apiClient from '../services/apiClient'
import TaskExecutor from '../components/TaskExecutor'
import { useUIStore } from '../stores/uiStore'
import { useUserStore } from '../stores/userStore'
import { useTaskTimer } from '../hooks/useTaskTimer'
import type { Task } from '../types/task'

export default function TaskExecution() {
  const { taskId } = useParams<{ taskId: string }>()
  const navigate = useNavigate()
  const addNotification = useUIStore((state) => state.addNotification)
  const { user, setUser } = useUserStore()

  console.log('[TaskExecution] Component render:', {
    taskId,
    user: user?.username,
  })

  // Accept task on mount
  const acceptMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log('[TaskExecution] Accept mutation starting for task:', id)
      try {
        const response = await apiClient.post<{ message: string; task: Task }>(
          `/api/tasks/${id}/accept`
        )
        console.log('[TaskExecution] Accept mutation success:', response.data)
        return response.data
      } catch (error: any) {
        console.error('[TaskExecution] Accept mutation error:', error)

        // 409 means task already accepted (can happen in StrictMode double-mount)
        // Fetch the task data instead of failing
        if (error.response?.status === 409) {
          console.log('[TaskExecution] Task already accepted, fetching task data from GET endpoint')
          // TODO: We need a GET endpoint for this. For now, just navigate back.
          throw new Error('Task already accepted by another user')
        }

        throw error
      }
    },
    onSuccess: (data) => {
      console.log('[TaskExecution] onSuccess called with:', data)
      addNotification({
        type: 'success',
        message: `Task accepted: ${data.task.title}`,
      })
    },
    onError: (error: any) => {
      console.error('[TaskExecution] onError called:', error)

      const message = error.response?.data?.message || error.message || 'Failed to accept task'
      addNotification({
        type: 'error',
        message,
      })
      // Navigate back to task board on error
      navigate('/tasks')
    },
  })

  console.log('[TaskExecution] Accept mutation state:', {
    isPending: acceptMutation.isPending,
    isError: acceptMutation.isError,
    isSuccess: acceptMutation.isSuccess,
    data: acceptMutation.data,
  })

  // Submit task solution
  const submitMutation = useMutation({
    mutationFn: async ({ id, solution }: { id: string; solution: any }) => {
      const response = await apiClient.post(`/api/tasks/${id}/submit`, solution)
      return response.data
    },
    onSuccess: (data) => {
      if (data.success) {
        addNotification({
          type: 'success',
          message: `Task completed! +${data.tokensAwarded} tokens`,
          duration: 5000,
        })

        // Update user token balance
        if (user) {
          setUser({
            ...user,
            tokenBalance: data.newBalance,
          })
        }

        // Navigate back to task board after a short delay
        setTimeout(() => {
          navigate('/tasks')
        }, 2000)
      } else {
        // Incorrect submission
        addNotification({
          type: 'error',
          message: data.message || 'Incorrect solution. Try again!',
          duration: 5000,
        })
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to submit task'
      addNotification({
        type: 'error',
        message,
      })
    },
  })

  // Abandon task
  const abandonMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post(`/api/tasks/${id}/abandon`)
      return response.data
    },
    onSuccess: () => {
      addNotification({
        type: 'success',
        message: 'Task abandoned. It has been returned to the task board.',
        duration: 3000,
      })
      // Navigate back to task board
      setTimeout(() => {
        navigate('/tasks')
      }, 1000)
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to abandon task'
      addNotification({
        type: 'error',
        message,
      })
    },
  })

  // Accept task when component mounts
  useEffect(() => {
    console.log('[TaskExecution] useEffect triggered:', {
      taskId,
      isPending: acceptMutation.isPending,
      isError: acceptMutation.isError,
      hasData: !!acceptMutation.data,
    })

    // Only call mutation if we haven't started yet (no data, no error, not pending)
    const shouldAccept = taskId && !acceptMutation.data && !acceptMutation.isError && !acceptMutation.isPending

    if (shouldAccept) {
      console.log('[TaskExecution] Calling acceptMutation.mutate')
      acceptMutation.mutate(taskId)
    } else {
      console.log('[TaskExecution] Skipping accept:', {
        reason: !taskId ? 'no taskId' : acceptMutation.data ? 'has data' : acceptMutation.isError ? 'has error' : 'is pending'
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId])

  // Call hooks before any early returns (Rules of Hooks)
  const task = acceptMutation.data?.task
  const timer = useTaskTimer(task?.expiresAt)

  // Handle expiration (must be before early returns)
  useEffect(() => {
    // Only trigger expiration if we have a valid expiresAt AND the timer shows expired
    // AND the actual expiration time has passed (to avoid false positives during initial render)
    if (task?.expiresAt && timer.isExpired) {
      const expirationTime = new Date(task.expiresAt).getTime()
      const now = Date.now()

      // Double-check that time has actually passed (not just initial state)
      if (now > expirationTime) {
        console.log('[TaskExecution] Task has expired, navigating back')
        addNotification({
          type: 'error',
          message: 'Task has expired! Returning to task board...',
        })
        setTimeout(() => {
          navigate('/tasks')
        }, 2000)
      }
    }
  }, [timer.isExpired, task?.expiresAt, navigate, addNotification])

  const handleSubmit = (solution: any) => {
    if (taskId) {
      submitMutation.mutate({ id: taskId, solution })
    }
  }

  const handleAbandon = () => {
    if (taskId && window.confirm('Are you sure you want to abandon this task? It will be returned to the task board for others to complete.')) {
      abandonMutation.mutate(taskId)
    }
  }

  // Loading state - only show if pending AND no data yet
  if (acceptMutation.isPending && !acceptMutation.data) {
    console.log('[TaskExecution] Rendering loading state')
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Accepting task...</p>
        </div>
      </div>
    )
  }

  // Error state (will redirect)
  if (acceptMutation.isError || !acceptMutation.data || !task) {
    console.log('[TaskExecution] Rendering error state')
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Failed to load task. Redirecting...</p>
        </div>
      </div>
    )
  }

  console.log('[TaskExecution] Rendering task execution view')

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{task.title}</h1>
              <p className="text-gray-600">{task.description}</p>
            </div>
            <div className="text-right flex flex-col gap-2">
              <div>
                <div className="text-3xl font-bold text-green-600">{task.tokenReward}</div>
                <div className="text-sm text-gray-500">tokens</div>
              </div>
              {task.expiresAt && (
                <div
                  className={`px-3 py-2 rounded-lg font-semibold ${
                    timer.isExpired
                      ? 'bg-red-100 text-red-800'
                      : timer.isLowTime
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  <div className="text-xs uppercase tracking-wide mb-1">Time Remaining</div>
                  <div className="text-2xl font-mono">{timer.formatted}</div>
                </div>
              )}
            </div>
          </div>

          {/* Task metadata */}
          <div className="flex items-center gap-6 text-sm text-gray-600 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-1">
              <span className="text-yellow-500">
                {'★'.repeat(task.difficulty)}
                {'☆'.repeat(5 - task.difficulty)}
              </span>
            </div>
            <div>
              Estimated time: ~{Math.ceil(task.estimatedTime / 60)} minutes
            </div>
            <div>
              Created by: {task.creator.username} (L{task.creator.level})
            </div>
          </div>
        </div>

        {/* Task UI */}
        <div className="bg-white rounded-lg shadow">
          <TaskExecutor
            task={task}
            onSubmit={handleSubmit}
            isSubmitting={submitMutation.isPending}
          />
        </div>

        {/* Validation feedback */}
        {submitMutation.data && !submitMutation.data.success && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-900 mb-2">Incorrect Solution</h3>
            <p className="text-red-800 mb-3">{submitMutation.data.message}</p>
            {submitMutation.data.validation && (
              <div className="bg-white rounded p-3 text-sm">
                <pre className="text-gray-800 whitespace-pre-wrap">
                  {JSON.stringify(submitMutation.data.validation, null, 2)}
                </pre>
              </div>
            )}
            <p className="text-red-700 mt-3 font-medium">
              Attempt #{submitMutation.data.submission.attemptNumber} - Try again!
            </p>
          </div>
        )}

        {/* Action buttons */}
        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            onClick={() => navigate('/tasks')}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back to Task Board
          </button>
          <button
            onClick={handleAbandon}
            disabled={abandonMutation.isPending}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed font-medium transition-colors"
          >
            {abandonMutation.isPending ? 'Abandoning...' : 'Abandon Task'}
          </button>
        </div>
      </div>
    </div>
  )
}
