import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import apiClient from '../services/apiClient'
import TaskExecutor from '../components/TaskExecutor'
import { useUIStore } from '../stores/uiStore'
import { useUserStore } from '../stores/userStore'
import type { Task } from '../types/task'

export default function TaskExecution() {
  const { taskId } = useParams<{ taskId: string }>()
  const navigate = useNavigate()
  const addNotification = useUIStore((state) => state.addNotification)
  const { user, setUser } = useUserStore()

  // Accept task on mount
  const acceptMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post<{ message: string; task: Task }>(
        `/api/tasks/${id}/accept`
      )
      return response.data
    },
    onSuccess: (data) => {
      addNotification({
        type: 'success',
        message: `Task accepted: ${data.task.title}`,
      })
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to accept task'
      addNotification({
        type: 'error',
        message,
      })
      // Navigate back to task board on error
      navigate('/tasks')
    },
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

  // Accept task when component mounts
  useEffect(() => {
    if (taskId && !acceptMutation.data && !acceptMutation.isError) {
      acceptMutation.mutate(taskId)
    }
  }, [taskId])

  const handleSubmit = (solution: any) => {
    if (taskId) {
      submitMutation.mutate({ id: taskId, solution })
    }
  }

  // Loading state
  if (acceptMutation.isPending) {
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
  if (acceptMutation.isError || !acceptMutation.data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Failed to load task. Redirecting...</p>
        </div>
      </div>
    )
  }

  const task = acceptMutation.data.task

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{task.title}</h1>
              <p className="text-gray-600">{task.description}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-green-600">{task.tokenReward}</div>
              <div className="text-sm text-gray-500">tokens</div>
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

        {/* Back button */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/tasks')}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back to Task Board
          </button>
        </div>
      </div>
    </div>
  )
}
