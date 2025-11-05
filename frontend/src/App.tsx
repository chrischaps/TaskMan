import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

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
          <p className="text-sm text-gray-500 text-center">
            Tailwind CSS is working! 🎨
          </p>
        </div>
      </div>
    </div>
  )
}

export default App
