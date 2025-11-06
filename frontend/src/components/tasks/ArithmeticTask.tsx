import { useState } from 'react'
import type { Task } from '../../types/task'

interface ArithmeticTaskProps {
  task: Task
  onSubmit: (solution: any) => void
  isSubmitting: boolean
}

interface ArithmeticData {
  expression: string
  correctAnswer: number
}

export default function ArithmeticTask({ task, onSubmit, isSubmitting }: ArithmeticTaskProps) {
  const data = task.data as ArithmeticData

  // Handle legacy format (operation + operands) - convert to expression
  const expression = data.expression || (() => {
    const legacyData = task.data as any
    if (legacyData.operation && legacyData.operands) {
      const [a, b] = legacyData.operands
      if (legacyData.operation === 'add') return `${a} + ${b}`
      if (legacyData.operation === 'subtract') return `${a} - ${b}`
      if (legacyData.operation === 'multiply') return `${a} * ${b}`
    }
    return 'Invalid expression'
  })()

  const [answer, setAnswer] = useState<string>('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const numericAnswer = parseFloat(answer)

    if (isNaN(numericAnswer)) {
      return // Don't submit if not a valid number
    }

    onSubmit({
      answer: numericAnswer,
    })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e as any)
    }
  }

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        {/* Expression Display */}
        <div className="mb-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border-2 border-blue-200 shadow-lg">
          <h3 className="text-sm font-semibold text-blue-700 mb-3 uppercase tracking-wide">
            Calculate
          </h3>
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 font-mono tracking-wide">
              {expression}
            </div>
          </div>
        </div>

        {/* Answer Input */}
        <form onSubmit={handleSubmit} className="mb-8">
          <label className="block mb-3">
            <span className="text-lg font-semibold text-gray-900 mb-2 block">Your Answer</span>
            <input
              type="number"
              step="any"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter your answer..."
              className="w-full px-6 py-4 text-2xl font-mono text-center border-3 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all shadow-sm"
              disabled={isSubmitting}
              autoFocus
            />
          </label>

          {/* Hint Text */}
          <p className="text-sm text-gray-500 text-center mb-6">
            Enter a numeric value (decimals are allowed)
          </p>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !answer}
            className="w-full py-4 px-6 bg-blue-600 text-white font-semibold text-lg rounded-xl hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors shadow-lg hover:shadow-xl"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Answer'}
          </button>
        </form>

        {/* Instructions */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <span className="text-blue-600">💡</span> Instructions
          </h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Solve the mathematical expression shown above</li>
            <li>• Enter your answer in the input field</li>
            <li>• Press Enter or click Submit to check your answer</li>
            <li>• Use standard order of operations (PEMDAS/BODMAS)</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
