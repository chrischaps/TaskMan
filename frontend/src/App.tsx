import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

function App() {
  const [count, setCount] = useState(0)

  // Demo query to verify TanStack Query is working
  const { data, isLoading } = useQuery({
    queryKey: ['demo'],
    queryFn: async () => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return { message: 'TanStack Query is working!' }
    },
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
        <h1 className="text-4xl font-bold text-gray-800 mb-6 text-center">
          TaskMan
        </h1>
        <p className="text-gray-600 text-center mb-8">
          Multiplayer task completion game
        </p>
        <div className="space-y-4">
          <button
            onClick={() => setCount((count) => count + 1)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 shadow-md hover:shadow-lg"
          >
            Count is {count}
          </button>
          <div className="text-sm text-gray-500 text-center space-y-2">
            <p>Tailwind CSS is working! 🎨</p>
            <p>
              {isLoading ? (
                <span className="animate-pulse">Loading query...</span>
              ) : (
                <span className="text-green-600 font-semibold">
                  ✓ {data?.message}
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
