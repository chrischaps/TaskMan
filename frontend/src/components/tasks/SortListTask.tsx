import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { SortListData, SortListSolution } from '../../types/task'

interface SortListTaskProps {
  taskData: SortListData
  onSubmit: (solution: SortListSolution) => void
  isSubmitting?: boolean
}

interface SortableItemProps {
  id: string
  item: string
}

function SortableItem({ id, item }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white border-2 border-gray-300 rounded-lg p-4 mb-2 cursor-move hover:border-blue-400 hover:shadow-md transition-all select-none"
    >
      <div className="flex items-center gap-3">
        <svg
          className="w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 8h16M4 16h16"
          />
        </svg>
        <span className="text-lg font-medium text-gray-900">{item}</span>
      </div>
    </div>
  )
}

export default function SortListTask({ taskData, onSubmit, isSubmitting }: SortListTaskProps) {
  const [items, setItems] = useState<string[]>(taskData.items)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item === active.id)
        const newIndex = items.findIndex((item) => item === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const handleSubmit = () => {
    onSubmit({ sortedItems: items })
  }

  const handleReset = () => {
    setItems(taskData.items)
  }

  const getCriteriaLabel = () => {
    switch (taskData.sortCriteria) {
      case 'alphabetical':
        return 'alphabetically (A-Z)'
      case 'numerical':
        return 'numerically (lowest to highest)'
      case 'length':
        return 'by length (shortest to longest)'
      default:
        return ''
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Task: Sort List</h3>
        <p className="text-blue-800">
          Drag and drop the items to sort them <strong>{getCriteriaLabel()}</strong>.
        </p>
      </div>

      {/* Sortable List */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items} strategy={verticalListSortingStrategy}>
            {items.map((item) => (
              <SortableItem key={item} id={item} item={item} />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Solution'}
        </button>
        <button
          onClick={handleReset}
          disabled={isSubmitting}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Item count */}
      <p className="text-sm text-gray-500 text-center mt-4">
        {items.length} {items.length === 1 ? 'item' : 'items'}
      </p>
    </div>
  )
}
