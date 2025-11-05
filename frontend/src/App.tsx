import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useUserStore } from './stores/userStore'
import { useUIStore } from './stores/uiStore'
import apiClient from './services/apiClient'

function App() {
  const [count, setCount] = useState(0)
  const { user, setUser, updateTokenBalance } = useUserStore()
  const { addNotification, notifications, removeNotification } = useUIStore()

  // Demo query to verify TanStack Query is working
  const { data, isLoading } = useQuery({
    queryKey: ['demo'],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return { message: 'TanStack Query is working!' }
    },
  })

  const testUserStore = () => {
    setUser({
      id: '1',
      username: 'testuser',
      email: 'test@example.com',
      tokenBalance: 100,
      level: 1,
      tutorialCompleted: false,
      taskBoardUnlocked: false,
      compositeUnlocked: false,
      createdAt: new Date().toISOString(),
    })
    addNotification({
      type: 'success',
      message: 'User store working! User created.',
    })
  }

  const testTokenUpdate = () => {
    if (user) {
      updateTokenBalance(user.tokenBalance + 50)
      addNotification({
        type: 'info',
        message: `Token balance increased to ${user.tokenBalance + 50}!`,
      })
    }
  }

  const testApiClient = async () => {
    try {
      const response = await apiClient.get('/api/health')
      addNotification({
        type: 'success',
        message: `API connected! ${response.data.message || 'Backend is healthy'}`,
      })
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'API connection failed. Make sure backend is running.',
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
        <h1 className="text-4xl font-bold text-gray-800 mb-6 text-center">
          TaskMan
        </h1>
        <p className="text-gray-600 text-center mb-8">
          Multiplayer task completion game
        </p>

        <div className="space-y-4 mb-6">
          <button
            onClick={() => setCount((count) => count + 1)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 shadow-md hover:shadow-lg"
          >
            Count is {count}
          </button>

          <button
            onClick={testUserStore}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 shadow-md hover:shadow-lg"
          >
            Test User Store
          </button>

          <button
            onClick={testApiClient}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 shadow-md hover:shadow-lg"
          >
            Test API Connection
          </button>

          {user && (
            <button
              onClick={testTokenUpdate}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 shadow-md hover:shadow-lg"
            >
              Add 50 Tokens
            </button>
          )}

          <div className="text-sm text-gray-500 text-center space-y-2">
            <p>✓ Tailwind CSS is working! 🎨</p>
            <p>
              {isLoading ? (
                <span className="animate-pulse">Loading query...</span>
              ) : (
                <span className="text-green-600 font-semibold">
                  ✓ {data?.message}
                </span>
              )}
            </p>
            {user && (
              <p className="text-blue-600 font-semibold">
                ✓ User: {user.username} | Tokens: {user.tokenBalance}
              </p>
            )}
          </div>
        </div>

        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="space-y-2">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-3 rounded-lg flex justify-between items-center ${
                  notif.type === 'success' ? 'bg-green-100 text-green-800' :
                  notif.type === 'error' ? 'bg-red-100 text-red-800' :
                  notif.type === 'info' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}
              >
                <span className="text-sm">{notif.message}</span>
                <button
                  onClick={() => removeNotification(notif.id)}
                  className="text-lg font-bold ml-2"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default App
