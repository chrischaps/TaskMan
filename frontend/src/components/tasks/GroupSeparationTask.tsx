import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import { SortableContext, useSortable, rectSortingStrategy } from '@dnd-kit/sortable'
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
    <div className="p-4 max-w-7xl mx-auto">
      {/* Compact Instructions */}
      <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h3 className="font-semibold text-blue-900 text-sm">
          Group items by <span className="font-mono bg-blue-100 px-2 py-0.5 rounded">{groupBy}</span>
        </h3>
      </div>

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Ungrouped Items - Takes 2 columns on large screens */}
          <div className="lg:col-span-2">
            <h4 className="font-semibold text-gray-700 mb-2 text-sm flex items-center gap-2">
              <span>Items to Group</span>
              <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full">
                {ungroupedCount}
              </span>
            </h4>
            <DroppableContainer id="ungrouped" items={groups.ungrouped || []}>
              {(groups.ungrouped || []).map((itemId) => {
                const item = getItemById(itemId)
                if (!item) return null
                return <DraggableItem key={itemId} item={item} />
              })}
            </DroppableContainer>
          </div>

          {/* Group Buckets - Take remaining columns */}
          <div className="lg:col-span-2 grid grid-cols-1 gap-4">
            {groupValues.map((groupValue) => (
              <div key={groupValue}>
                <h4 className="font-semibold text-gray-700 mb-2 text-sm flex items-center gap-2">
                  <span className="capitalize">{groupValue}</span>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                    {groups[groupValue]?.length || 0}
                  </span>
                </h4>
                <DroppableContainer id={groupValue} items={groups[groupValue] || []}>
                  {(groups[groupValue] || []).map((itemId) => {
                    const item = getItemById(itemId)
                    if (!item) return null
                    return <DraggableItem key={itemId} item={item} />
                  })}
                </DroppableContainer>
              </div>
            ))}
          </div>
        </div>

        <DragOverlay>
          {activeItem ? <VisualShape item={activeItem} isDragging /> : null}
        </DragOverlay>
      </DndContext>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={isSubmitting || !isComplete}
        className="w-full mt-4 py-3 px-6 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors shadow-lg hover:shadow-xl"
      >
        {isSubmitting ? 'Submitting...' : isComplete ? 'Submit Grouping' : `Group ${ungroupedCount} more items`}
      </button>

      {!isComplete && (
        <p className="text-xs text-amber-600 text-center mt-2">
          All items must be grouped before submitting
        </p>
      )}
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
    <SortableContext id={id} items={items} strategy={rectSortingStrategy}>
      <div
        ref={setNodeRef}
        className="min-h-[200px] bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-3"
      >
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-6 gap-2">
          {children}
        </div>
      </div>
    </SortableContext>
  )
}

interface DraggableItemProps {
  item: ItemData
}

function DraggableItem({ item }: DraggableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <VisualShape item={item} isDragging={isDragging} />
    </div>
  )
}

interface VisualShapeProps {
  item: ItemData
  isDragging?: boolean
}

function VisualShape({ item, isDragging = false }: VisualShapeProps) {
  const shape = item.attributes.shape
  const color = item.attributes.color
  const size = item.attributes.size

  // Map size to actual pixel dimensions
  const sizeMap = {
    small: 32,
    medium: 48,
    large: 64,
  }
  const dimension = sizeMap[size as keyof typeof sizeMap] || 48

  // Map color names to hex values
  const colorMap: Record<string, string> = {
    red: '#EF4444',
    blue: '#3B82F6',
    green: '#10B981',
    yellow: '#F59E0B',
    purple: '#A855F7',
    orange: '#F97316',
    pink: '#EC4899',
    cyan: '#06B6D4',
    gray: '#6B7280',
  }
  const fillColor = colorMap[color?.toLowerCase()] || color || '#6B7280'

  return (
    <div
      className={`flex items-center justify-center p-2 rounded-lg cursor-grab active:cursor-grabbing ${
        isDragging ? 'bg-blue-100 shadow-lg' : 'bg-white hover:bg-gray-50'
      } transition-all border-2 ${isDragging ? 'border-blue-400' : 'border-transparent'}`}
      style={{ width: dimension + 16, height: dimension + 16 }}
      title={`${size} ${color} ${shape}`}
    >
      <svg width={dimension} height={dimension} viewBox="0 0 100 100">
        {shape === 'circle' && (
          <circle cx="50" cy="50" r="45" fill={fillColor} stroke="#1F2937" strokeWidth="2" />
        )}
        {shape === 'square' && (
          <rect x="5" y="5" width="90" height="90" fill={fillColor} stroke="#1F2937" strokeWidth="2" />
        )}
        {shape === 'rectangle' && (
          <rect x="10" y="25" width="80" height="50" fill={fillColor} stroke="#1F2937" strokeWidth="2" />
        )}
        {shape === 'triangle' && (
          <polygon points="50,5 95,90 5,90" fill={fillColor} stroke="#1F2937" strokeWidth="2" />
        )}
        {shape === 'pentagon' && (
          <polygon
            points="50,5 95,35 80,90 20,90 5,35"
            fill={fillColor}
            stroke="#1F2937"
            strokeWidth="2"
          />
        )}
        {shape === 'hexagon' && (
          <polygon
            points="50,5 90,25 90,75 50,95 10,75 10,25"
            fill={fillColor}
            stroke="#1F2937"
            strokeWidth="2"
          />
        )}
        {shape === 'star' && (
          <polygon
            points="50,5 61,39 96,39 68,60 79,94 50,73 21,94 32,60 4,39 39,39"
            fill={fillColor}
            stroke="#1F2937"
            strokeWidth="2"
          />
        )}
      </svg>
    </div>
  )
}
