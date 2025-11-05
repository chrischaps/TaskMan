import { useState } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Task } from '../../types/task'
import type { GroupSeparationData, GroupSeparationSolution } from '../../types/task'

interface GroupSeparationTaskProps {
  task: Task
  onSubmit: (solution: GroupSeparationSolution) => void
  isSubmitting: boolean
}

interface ItemData {
  id: string
  attributes: Record<string, string>
}

export default function GroupSeparationTask({
  task,
  onSubmit,
  isSubmitting,
}: GroupSeparationTaskProps) {
  const data = task.data as GroupSeparationData
  const { items, groupBy } = data

  // Determine unique group values
  const groupValues = Array.from(new Set(items.map((item) => item.attributes[groupBy]))).sort()

  // Initialize state: all items in 'ungrouped' container
  const [groups, setGroups] = useState<Record<string, string[]>>({
    ungrouped: items.map((item) => item.id),
    ...Object.fromEntries(groupValues.map((value) => [value, []])),
  })

  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    // Find which container the active item is in
    const activeContainer = Object.keys(groups).find((key) => groups[key].includes(activeId))

    // Determine target container (either dropped on container or on item in container)
    let targetContainer = overId
    if (!Object.keys(groups).includes(overId)) {
      // Dropped on an item, find which container it's in
      targetContainer = Object.keys(groups).find((key) => groups[key].includes(overId)) || ''
    }

    if (!activeContainer || !targetContainer) return
    if (activeContainer === targetContainer) return

    // Move item to new container
    setGroups((prev) => {
      const newGroups = { ...prev }
      newGroups[activeContainer] = prev[activeContainer].filter((id) => id !== activeId)
      newGroups[targetContainer] = [...prev[targetContainer], activeId]
      return newGroups
    })
  }

  const handleSubmit = () => {
    // Remove 'ungrouped' from submission
    const { ungrouped, ...submittedGroups } = groups
    onSubmit({ groups: submittedGroups })
  }

  const getItemById = (id: string): ItemData | undefined => {
    return items.find((item) => item.id === id)
  }

  const activeItem = activeId ? getItemById(activeId) : null

  // Count ungrouped items
  const ungroupedCount = groups.ungrouped?.length || 0
  const isComplete = ungroupedCount === 0

  return (
    <div className="p-8">
      <div className="max-w-5xl mx-auto">
        {/* Instructions */}
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">
            Group items by <span className="font-mono bg-blue-100 px-2 py-1 rounded">{groupBy}</span>
          </h3>
          <p className="text-sm text-blue-800">
            Drag each item into the correct group based on its {groupBy} attribute.
          </p>
        </div>

        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          {/* Ungrouped Items */}
          <div className="mb-8">
            <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <span>Items to Group</span>
              <span className="text-sm bg-gray-200 px-2 py-0.5 rounded-full">
                {ungroupedCount} remaining
              </span>
            </h4>
            <DroppableContainer id="ungrouped" items={groups.ungrouped || []}>
              {(groups.ungrouped || []).map((itemId) => {
                const item = getItemById(itemId)
                if (!item) return null
                return <DraggableItem key={itemId} item={item} groupBy={groupBy} />
              })}
            </DroppableContainer>
          </div>

          {/* Group Buckets */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {groupValues.map((groupValue) => (
              <div key={groupValue}>
                <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <span className="capitalize">{groupValue}</span>
                  <span className="text-sm bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                    {groups[groupValue]?.length || 0}
                  </span>
                </h4>
                <DroppableContainer id={groupValue} items={groups[groupValue] || []}>
                  {(groups[groupValue] || []).map((itemId) => {
                    const item = getItemById(itemId)
                    if (!item) return null
                    return <DraggableItem key={itemId} item={item} groupBy={groupBy} />
                  })}
                </DroppableContainer>
              </div>
            ))}
          </div>

          <DragOverlay>
            {activeItem ? <ItemCard item={activeItem} groupBy={groupBy} isDragging /> : null}
          </DragOverlay>
        </DndContext>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !isComplete}
          className="w-full py-4 px-6 bg-blue-600 text-white font-semibold text-lg rounded-xl hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors shadow-lg hover:shadow-xl"
        >
          {isSubmitting ? 'Submitting...' : isComplete ? 'Submit Grouping' : `Group ${ungroupedCount} more items`}
        </button>

        {!isComplete && (
          <p className="text-sm text-amber-600 text-center mt-3">
            All items must be grouped before submitting
          </p>
        )}
      </div>
    </div>
  )
}

interface DroppableContainerProps {
  id: string
  items: string[]
  children: React.ReactNode
}

function DroppableContainer({ id, items, children }: DroppableContainerProps) {
  const { setNodeRef } = useSortable({
    id,
    data: { type: 'container' },
  })

  return (
    <SortableContext id={id} items={items} strategy={verticalListSortingStrategy}>
      <div
        ref={setNodeRef}
        className="min-h-[120px] bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-3 space-y-2"
      >
        {children}
      </div>
    </SortableContext>
  )
}

interface DraggableItemProps {
  item: ItemData
  groupBy: string
}

function DraggableItem({ item, groupBy }: DraggableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <ItemCard item={item} groupBy={groupBy} isDragging={isDragging} />
    </div>
  )
}

interface ItemCardProps {
  item: ItemData
  groupBy: string
  isDragging?: boolean
}

function ItemCard({ item, groupBy, isDragging = false }: ItemCardProps) {
  const groupValue = item.attributes[groupBy]

  return (
    <div
      className={`bg-white border-2 rounded-lg p-3 cursor-grab active:cursor-grabbing ${
        isDragging ? 'border-blue-400 shadow-lg' : 'border-gray-300 hover:border-blue-300'
      } transition-all`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="font-mono text-xs text-gray-500 mb-1">{item.id}</div>
          <div className="space-y-1">
            {Object.entries(item.attributes).map(([key, value]) => (
              <div key={key} className="flex items-center gap-2 text-sm">
                <span className="text-gray-600 capitalize">{key}:</span>
                <span
                  className={`font-semibold capitalize ${
                    key === groupBy ? 'bg-blue-100 text-blue-700 px-2 py-0.5 rounded' : 'text-gray-900'
                  }`}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Visual indicator for the grouping attribute */}
        <div className="ml-3">
          {groupBy === 'color' && (
            <div
              className="w-12 h-12 rounded-full border-2 border-gray-300"
              style={{ backgroundColor: groupValue }}
            />
          )}
          {groupBy === 'shape' && (
            <div className="w-12 h-12 flex items-center justify-center text-2xl">
              {groupValue === 'circle' && '○'}
              {groupValue === 'square' && '□'}
              {groupValue === 'triangle' && '△'}
              {groupValue === 'rectangle' && '▭'}
              {groupValue === 'pentagon' && '⬠'}
            </div>
          )}
          {groupBy === 'size' && (
            <div className="flex items-center justify-center">
              {groupValue === 'small' && <div className="w-4 h-4 bg-gray-400 rounded" />}
              {groupValue === 'medium' && <div className="w-8 h-8 bg-gray-400 rounded" />}
              {groupValue === 'large' && <div className="w-12 h-12 bg-gray-400 rounded" />}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
