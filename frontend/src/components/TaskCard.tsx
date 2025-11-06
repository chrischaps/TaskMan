import { useState } from 'react'
import type { Task } from '../types/task'

interface TaskCardProps {
  task: Task
  onAccept?: (taskId: string) => void
  isAccepting?: boolean
}

const TASK_TYPE_LABELS: Record<string, string> = {
  sort_list: 'Sort List',
  color_match: 'Color Match',
  arithmetic: 'Arithmetic',
  group_separation: 'Group Separation',
  defragmentation: 'Defragmentation',
}

const TASK_TYPE_COLORS: Record<string, string> = {
  sort_list: 'bg-blue-100 text-blue-800',
  color_match: 'bg-purple-100 text-purple-800',
  arithmetic: 'bg-green-100 text-green-800',
  group_separation: 'bg-yellow-100 text-yellow-800',
  defragmentation: 'bg-red-100 text-red-800',
}

export default function TaskCard({ task, onAccept, isAccepting }: TaskCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const typeLabel = TASK_TYPE_LABELS[task.type] || task.type
  const typeColor = TASK_TYPE_COLORS[task.type] || 'bg-gray-100 text-gray-800'

  const difficultyStars = '★'.repeat(task.difficulty) + '☆'.repeat(5 - task.difficulty)

  const estimatedMinutes = Math.ceil(task.estimatedTime / 60)

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 border border-gray-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-semibold px-2 py-1 rounded ${typeColor}`}>
              {typeLabel}
            </span>
            {task.isTutorial && (
              <span className="text-xs font-semibold px-2 py-1 rounded bg-indigo-100 text-indigo-800">
                Tutorial
              </span>
            )}
            {task.isOwnTask && (
              <span className="text-xs font-semibold px-2 py-1 rounded bg-orange-100 text-orange-800">
                Your Task
              </span>
            )}
          </div>
          <h3 className="text-lg font-bold text-gray-900">{task.title}</h3>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-green-600">{task.tokenReward}</div>
          <div className="text-xs text-gray-500">tokens</div>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
        <div className="flex items-center gap-1">
          <span className="text-yellow-500">{difficultyStars}</span>
        </div>
        <div className="flex items-center gap-1">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>~{estimatedMinutes}m</span>
        </div>
        <div className="flex items-center gap-1">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          <span>
            {task.creator.username} (L{task.creator.level})
          </span>
        </div>
      </div>

      {/* Expanded details */}
      {isExpanded && (
        <div className="border-t border-gray-200 pt-3 mb-3">
          <p className="text-sm text-gray-700">{task.description}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          {isExpanded ? 'Show Less' : 'Show More'}
        </button>
        {onAccept && (
          <button
            onClick={() => !task.isOwnTask && onAccept(task.id)}
            disabled={isAccepting || task.isOwnTask}
            className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            title={task.isOwnTask ? "You can't accept your own task" : ''}
          >
            {task.isOwnTask ? 'Your Task' : isAccepting ? 'Accepting...' : 'Accept Task'}
          </button>
        )}
      </div>
    </div>
  )
}
