import SortListTask from './tasks/SortListTask'
import ColorMatchTask from './tasks/ColorMatchTask'
import ArithmeticTask from './tasks/ArithmeticTask'
import GroupSeparationTask from './tasks/GroupSeparationTask'
import DefragmentationTask from './tasks/DefragmentationTask'
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
      return <ColorMatchTask task={task} onSubmit={onSubmit} isSubmitting={isSubmitting} />

    case 'arithmetic':
      return <ArithmeticTask task={task} onSubmit={onSubmit} isSubmitting={isSubmitting} />

    case 'group_separation':
      return <GroupSeparationTask task={task} onSubmit={onSubmit} isSubmitting={isSubmitting} />

    case 'defragmentation':
      return <DefragmentationTask task={task} onSubmit={onSubmit} isSubmitting={isSubmitting} />

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
