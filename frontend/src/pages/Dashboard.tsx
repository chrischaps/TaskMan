import { useUserStore } from '../stores/userStore'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const { user, clearUser } = useUserStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    clearUser()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">
              Dashboard
            </h1>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
            >
              Logout
            </button>
          </div>

          <div className="space-y-4">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Welcome, {user?.username}!
              </h2>
              <p className="text-gray-600">
                You have successfully logged in to TaskMan.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-gray-600 text-sm">Token Balance</p>
                <p className="text-2xl font-bold text-green-600">
                  {user?.tokenBalance || 0}
                </p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-gray-600 text-sm">Level</p>
                <p className="text-2xl font-bold text-purple-600">
                  {user?.level || 1}
                </p>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-gray-600 text-sm">Status</p>
                <p className="text-lg font-semibold text-orange-600">
                  {user?.tutorialCompleted ? 'Active' : 'Tutorial'}
                </p>
              </div>
            </div>

            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Ready to Complete Tasks?
              </h3>
              <p className="text-gray-600 mb-4">
                Browse available tasks, earn tokens, and level up your account!
              </p>
              <button
                onClick={() => navigate('/tasks')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-200"
              >
                Go to Task Board
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
