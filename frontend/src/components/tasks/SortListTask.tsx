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
      className="bg-white border-2 border-gray-300 rounded-lg p-4 mb-2 hover:border-blue-400 hover:shadow-md transition-[border-color,box-shadow] select-none"
    >
      <div className="flex items-center gap-3">
        {/* Drag Handle - Only this is draggable */}
        <button
          {...attributes}
          {...listeners}
          className="flex-shrink-0 cursor-grab active:cursor-grabbing p-2 -m-2 hover:bg-gray-100 rounded transition-colors touch-none"
          aria-label="Drag to reorder"
        >
          <svg
            className="w-6 h-6 text-gray-500"
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
        </button>
        {/* Item content - scrollable area */}
        <span className="text-lg font-medium text-gray-900 flex-1">{item}</span>
      </div>
    </div>
  )
}

export default function SortListTask({ taskData, onSubmit, isSubmitting }: SortListTaskProps) {
  const [items, setItems] = useState<string[]>(taskData.items)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before drag starts (helps with accidental touches)
      },
    }),
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
          Use the <span className="inline-flex align-middle mx-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
            </svg>
          </span> handle to drag and drop items to sort them <strong>{getCriteriaLabel()}</strong>.
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
