import { useState } from 'react'
import SortListTask from '../components/tasks/SortListTask'
import type { SortListData, SortListSolution } from '../types/task'

export default function TestTasks() {
  const [result, setResult] = useState<SortListSolution | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Test data for alphabetical sort
  const alphabeticalData: SortListData = {
    items: ['Zebra', 'Apple', 'Mango', 'Banana', 'Cherry', 'Orange'],
    sortCriteria: 'alphabetical',
  }

  // Test data for numerical sort
  const numericalData: SortListData = {
    items: ['42', '7', '100', '23', '3', '89'],
    sortCriteria: 'numerical',
  }

  // Test data for length sort
  const lengthData: SortListData = {
    items: ['Cat', 'Elephant', 'Dog', 'Butterfly', 'Ant', 'Tiger'],
    sortCriteria: 'length',
  }

  const [currentTest, setCurrentTest] = useState<'alphabetical' | 'numerical' | 'length'>(
    'alphabetical'
  )

  const getCurrentData = () => {
    switch (currentTest) {
      case 'alphabetical':
        return alphabeticalData
      case 'numerical':
        return numericalData
      case 'length':
        return lengthData
    }
  }

  const handleSubmit = (solution: SortListSolution) => {
    setIsSubmitting(true)
    // Simulate API call
    setTimeout(() => {
      setResult(solution)
      setIsSubmitting(false)
      console.log('Submitted solution:', solution)
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Task Component Testing</h1>
          <p className="text-gray-600">Test the Sort List task component with different criteria</p>
        </div>

        {/* Test Type Selector */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Test Scenario</h2>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setCurrentTest('alphabetical')
                setResult(null)
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentTest === 'alphabetical'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Alphabetical Sort
            </button>
            <button
              onClick={() => {
                setCurrentTest('numerical')
                setResult(null)
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentTest === 'numerical'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Numerical Sort
            </button>
            <button
              onClick={() => {
                setCurrentTest('length')
                setResult(null)
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentTest === 'length'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Length Sort
            </button>
          </div>
        </div>

        {/* Task Component */}
        <div className="bg-white rounded-lg shadow mb-6">
          <SortListTask
            taskData={getCurrentData()}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </div>

        {/* Result Display */}
        {result && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-900 mb-2">Submitted Solution</h3>
            <div className="bg-white rounded p-4">
              <pre className="text-sm text-gray-800">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
            <p className="text-sm text-green-700 mt-4">
              Check the browser console for the logged solution object.
            </p>
          </div>
        )}

        {/* Expected Solutions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Expected Solutions</h3>
          <div className="space-y-3">
            <div>
              <strong className="text-blue-800">Alphabetical:</strong>
              <code className="ml-2 text-sm bg-white px-2 py-1 rounded">
                Apple, Banana, Cherry, Mango, Orange, Zebra
              </code>
            </div>
            <div>
              <strong className="text-blue-800">Numerical:</strong>
              <code className="ml-2 text-sm bg-white px-2 py-1 rounded">
                3, 7, 23, 42, 89, 100
              </code>
            </div>
            <div>
              <strong className="text-blue-800">Length:</strong>
              <code className="ml-2 text-sm bg-white px-2 py-1 rounded">
                Cat, Dog, Ant, Tiger, Zebra, Elephant, Butterfly
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
