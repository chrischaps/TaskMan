import { useState } from 'react'
import type { Task } from '../../types/task'

interface ColorMatchTaskProps {
  task: Task
  onSubmit: (solution: any) => void
  isSubmitting: boolean
}

interface ColorMatchData {
  targetColor: {
    r: number
    g: number
    b: number
  }
}

export default function ColorMatchTask({ task, onSubmit, isSubmitting }: ColorMatchTaskProps) {
  const data = task.data as ColorMatchData
  const targetColor = data.targetColor

  // Current color state
  const [r, setR] = useState(128)
  const [g, setG] = useState(128)
  const [b, setB] = useState(128)

  const handleSubmit = () => {
    onSubmit({
      submittedColor: { r, g, b },
    })
  }

  // Convert RGB to hex for display
  const rgbToHex = (r: number, g: number, b: number) => {
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
  }

  const currentColorHex = rgbToHex(r, g, b)
  const targetColorHex = rgbToHex(targetColor.r, targetColor.g, targetColor.b)

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        {/* Target Color Display */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Target Color</h3>
          <div className="flex items-center gap-4">
            <div
              className="w-32 h-32 rounded-lg border-4 border-gray-300 shadow-lg"
              style={{ backgroundColor: targetColorHex }}
            />
            <div className="text-gray-700">
              <p className="font-mono text-lg font-bold">{targetColorHex.toUpperCase()}</p>
              <p className="text-sm text-gray-500 mt-1">
                RGB({targetColor.r}, {targetColor.g}, {targetColor.b})
              </p>
            </div>
          </div>
        </div>

        {/* Current Color Display */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Your Color</h3>
          <div className="flex items-center gap-4">
            <div
              className="w-32 h-32 rounded-lg border-4 border-blue-500 shadow-lg transition-colors duration-200"
              style={{ backgroundColor: currentColorHex }}
            />
            <div className="text-gray-700">
              <p className="font-mono text-lg font-bold">{currentColorHex.toUpperCase()}</p>
              <p className="text-sm text-gray-500 mt-1">
                RGB({r}, {g}, {b})
              </p>
            </div>
          </div>
        </div>

        {/* RGB Sliders */}
        <div className="space-y-6 mb-8">
          {/* Red Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-red-600">Red</label>
              <span className="font-mono text-sm font-bold text-gray-900">{r}</span>
            </div>
            <input
              type="range"
              min="0"
              max="255"
              value={r}
              onChange={(e) => setR(Number(e.target.value))}
              className="w-full h-3 bg-gradient-to-r from-black to-red-500 rounded-lg appearance-none cursor-pointer slider-red"
              disabled={isSubmitting}
            />
          </div>

          {/* Green Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-green-600">Green</label>
              <span className="font-mono text-sm font-bold text-gray-900">{g}</span>
            </div>
            <input
              type="range"
              min="0"
              max="255"
              value={g}
              onChange={(e) => setG(Number(e.target.value))}
              className="w-full h-3 bg-gradient-to-r from-black to-green-500 rounded-lg appearance-none cursor-pointer slider-green"
              disabled={isSubmitting}
            />
          </div>

          {/* Blue Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-blue-600">Blue</label>
              <span className="font-mono text-sm font-bold text-gray-900">{b}</span>
            </div>
            <input
              type="range"
              min="0"
              max="255"
              value={b}
              onChange={(e) => setB(Number(e.target.value))}
              className="w-full h-3 bg-gradient-to-r from-black to-blue-500 rounded-lg appearance-none cursor-pointer slider-blue"
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full py-4 px-6 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors shadow-lg"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Color Match'}
        </button>

        {/* Instructions */}
        <p className="text-sm text-gray-500 text-center mt-4">
          Adjust the RGB sliders to match the target color as closely as possible
        </p>
      </div>

      <style>{`
        /* Custom slider styles */
        input[type='range']::-webkit-slider-thumb {
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: white;
          border: 3px solid #3b82f6;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        input[type='range']::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: white;
          border: 3px solid #3b82f6;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        input[type='range']:disabled::-webkit-slider-thumb {
          cursor: not-allowed;
          border-color: #93c5fd;
        }

        input[type='range']:disabled::-moz-range-thumb {
          cursor: not-allowed;
          border-color: #93c5fd;
        }
      `}</style>
    </div>
  )
}
