import { useState } from 'react'
import type { Task } from '../../types/task'
import type { DefragData, DefragSolution } from '../../types/task'

interface DefragmentationTaskProps {
  task: Task
  onSubmit: (solution: DefragSolution) => void
  isSubmitting: boolean
}

const BLOCK_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  R: { bg: 'bg-red-500', border: 'border-red-600', text: 'text-white' },
  G: { bg: 'bg-green-500', border: 'border-green-600', text: 'text-white' },
  B: { bg: 'bg-blue-500', border: 'border-blue-600', text: 'text-white' },
  Y: { bg: 'bg-yellow-400', border: 'border-yellow-500', text: 'text-gray-900' },
}

export default function DefragmentationTask({
  task,
  onSubmit,
  isSubmitting,
}: DefragmentationTaskProps) {
  const data = task.data as DefragData
  const { rows, cols } = data

  // Initialize grid state as a deep copy
  const [grid, setGrid] = useState<string[][]>(data.grid.map((row) => [...row]))
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null)
  const [moveCount, setMoveCount] = useState(0)

  const handleCellClick = (row: number, col: number) => {
    if (isSubmitting) return

    // If no cell is selected, select this cell
    if (selectedCell === null) {
      setSelectedCell({ row, col })
      return
    }

    // If clicking the same cell, deselect
    if (selectedCell.row === row && selectedCell.col === col) {
      setSelectedCell(null)
      return
    }

    // Different cell - perform swap
    const newGrid = grid.map((r) => [...r])
    const temp = newGrid[selectedCell.row][selectedCell.col]
    newGrid[selectedCell.row][selectedCell.col] = newGrid[row][col]
    newGrid[row][col] = temp

    setGrid(newGrid)
    setMoveCount((prev) => prev + 1)
    setSelectedCell(null)
  }

  const handleSubmit = () => {
    onSubmit({
      grid,
      moveCount,
    })
  }

  // Check if defragmented (colors are contiguous in reading order)
  const isDefragmented = () => {
    // Flatten grid to reading order (left-to-right, top-to-bottom)
    const sequence: string[] = []
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        sequence.push(grid[row][col])
      }
    }

    // Track the range (start and end positions) for each color
    const colorRanges = new Map<string, { start: number; end: number }>()

    sequence.forEach((cell, index) => {
      if (cell !== '') {
        if (!colorRanges.has(cell)) {
          colorRanges.set(cell, { start: index, end: index })
        } else {
          colorRanges.get(cell)!.end = index
        }
      }
    })

    // Check if each color is contiguous
    for (const [color, range] of colorRanges) {
      const count = sequence.filter((c) => c === color).length
      const rangeSize = range.end - range.start + 1
      if (rangeSize !== count) {
        return false // Color is fragmented
      }
    }

    return true
  }

  const complete = isDefragmented()

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Instructions */}
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Defragment the Grid</h3>
          <p className="text-sm text-blue-800 mb-2">
            Group same-colored blocks together so each color is contiguous when reading left-to-right, top-to-bottom.
          </p>
          <div className="text-xs text-blue-700 space-y-1">
            <div>• Click a cell to select it (yellow ring)</div>
            <div>• Click any other cell to swap them</div>
            <div>• Goal: All blocks of the same color must be grouped together</div>
            <div>• Reading order: left-to-right on each row, then next row</div>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="text-gray-600">Moves:</span>{' '}
              <span className="font-semibold text-gray-900">{moveCount}</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-600">Grid:</span>{' '}
              <span className="font-semibold text-gray-900">
                {rows} × {cols}
              </span>
            </div>
          </div>
          {complete && (
            <div className="text-sm font-semibold text-green-600 flex items-center gap-2">
              <span className="text-lg">✓</span> Defragmented!
            </div>
          )}
        </div>

        {/* Grid */}
        <div className="mb-6 flex justify-center">
          <div
            className="inline-grid gap-1 bg-gray-200 p-3 rounded-lg"
            style={{
              gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
            }}
          >
            {grid.map((row, rowIdx) =>
              row.map((cell, colIdx) => {
                const isSelected =
                  selectedCell?.row === rowIdx && selectedCell?.col === colIdx
                const colors = cell ? BLOCK_COLORS[cell] : null

                return (
                  <button
                    key={`${rowIdx}-${colIdx}`}
                    onClick={() => handleCellClick(rowIdx, colIdx)}
                    disabled={isSubmitting}
                    className={`
                      w-16 h-16 border-2 rounded-lg font-bold text-lg
                      transition-all duration-150
                      ${
                        colors
                          ? `${colors.bg} ${colors.border} ${colors.text} hover:scale-105 hover:shadow-md`
                          : 'bg-white border-gray-300 hover:border-gray-400'
                      }
                      ${isSelected ? 'ring-4 ring-yellow-400 scale-105' : ''}
                      ${isSubmitting ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
                    `}
                  >
                    {cell || ''}
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="mb-6 flex justify-center gap-4 text-sm">
          {Object.entries(BLOCK_COLORS).map(([key, colors]) => (
            <div key={key} className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded ${colors.bg} ${colors.border} border-2`} />
              <span className="text-gray-700">
                {key === 'R' && 'Red'}
                {key === 'G' && 'Green'}
                {key === 'B' && 'Blue'}
                {key === 'Y' && 'Yellow'}
              </span>
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !complete}
          className="w-full py-4 px-6 bg-blue-600 text-white font-semibold text-lg rounded-xl hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors shadow-lg hover:shadow-xl"
        >
          {isSubmitting ? 'Submitting...' : complete ? 'Submit Solution' : 'Complete defragmentation to submit'}
        </button>

        {!complete && (
          <p className="text-sm text-amber-600 text-center mt-3">
            Each color must form a contiguous group in reading order
          </p>
        )}
      </div>
    </div>
  )
}
