import SortListTask from './tasks/SortListTask'
import type { Task } from '../types/task'
import type { SortListData, SortListSolution } from '../types/task'

interface TaskExecutorProps {
  task: Task
  onSubmit: (solution: any) => void
  isSubmitting: boolean
}

/**
 * TaskExecutor component routes to the appropriate task UI based on task type
 */
export default function TaskExecutor({ task, onSubmit, isSubmitting }: TaskExecutorProps) {
  switch (task.type) {
    case 'sort_list':
      return (
        <SortListTask
          taskData={task.data as SortListData}
          onSubmit={(solution: SortListSolution) => onSubmit(solution)}
          isSubmitting={isSubmitting}
        />
      )

    case 'color_match':
      return (
        <div className="max-w-2xl mx-auto p-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-yellow-900 mb-2">
              Color Match Task - Not Implemented Yet
            </h3>
            <p className="text-yellow-800">
              This task type will be implemented in FE-010. For now, only Sort List tasks are
              supported.
            </p>
          </div>
        </div>
      )

    case 'arithmetic':
      return (
        <div className="max-w-2xl mx-auto p-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-yellow-900 mb-2">
              Arithmetic Task - Not Implemented Yet
            </h3>
            <p className="text-yellow-800">
              This task type will be implemented in FE-011. For now, only Sort List tasks are
              supported.
            </p>
          </div>
        </div>
      )

    case 'group_separation':
      return (
        <div className="max-w-2xl mx-auto p-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-yellow-900 mb-2">
              Group Separation Task - Not Implemented Yet
            </h3>
            <p className="text-yellow-800">
              This task type will be implemented in FE-012. For now, only Sort List tasks are
              supported.
            </p>
          </div>
        </div>
      )

    case 'defragmentation':
      return (
        <div className="max-w-2xl mx-auto p-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-yellow-900 mb-2">
              Defragmentation Task - Not Implemented Yet
            </h3>
            <p className="text-yellow-800">
              This task type will be implemented in FE-013. For now, only Sort List tasks are
              supported.
            </p>
          </div>
        </div>
      )

    default:
      return (
        <div className="max-w-2xl mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-900 mb-2">Unknown Task Type</h3>
            <p className="text-red-800">
              Task type <code className="font-mono bg-white px-2 py-1 rounded">{task.type}</code>{' '}
              is not recognized.
            </p>
          </div>
        </div>
      )
  }
}
