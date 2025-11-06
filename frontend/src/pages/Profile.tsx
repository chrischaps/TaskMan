import { useNavigate } from 'react-router-dom'
import { ArrowLeft, User, Mail, Calendar, Trophy, Coins, Target } from 'lucide-react'
import { useUserStore } from '../stores/userStore'

export default function Profile() {
  const navigate = useNavigate()
  const { user } = useUserStore()

  if (!user) {
    navigate('/login')
    return null
  }

  // Generate initials from username
  const getInitials = (username: string) => {
    return username
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Back Button */}
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Dashboard</span>
        </button>

        {/* Profile Header Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-3xl shadow-lg">
              {getInitials(user.username)}
            </div>

            {/* User Info */}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{user.username}</h1>
              <p className="text-gray-600 mb-3">{user.email}</p>
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium text-sm">
                  Level {user.level}
                </span>
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium text-sm">
                  {user.tokenBalance} tokens
                </span>
                {user.isAdmin && (
                  <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-medium text-sm">
                    Admin
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Tasks Completed */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Target className="text-blue-600" size={20} />
              </div>
              <h3 className="font-semibold text-gray-700">Tasks Completed</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{user.tasksCompleted}</p>
          </div>

          {/* Token Balance */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Coins className="text-green-600" size={20} />
              </div>
              <h3 className="font-semibold text-gray-700">Token Balance</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{user.tokenBalance}</p>
          </div>

          {/* Level */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Trophy className="text-purple-600" size={20} />
              </div>
              <h3 className="font-semibold text-gray-700">Current Level</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{user.level}</p>
          </div>
        </div>

        {/* Account Details */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Details</h2>

          <div className="space-y-4">
            {/* Username */}
            <div className="flex items-start gap-3 pb-4 border-b border-gray-200">
              <User className="text-gray-400 mt-1" size={20} />
              <div>
                <p className="text-sm text-gray-500 font-medium">Username</p>
                <p className="text-gray-900">{user.username}</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-3 pb-4 border-b border-gray-200">
              <Mail className="text-gray-400 mt-1" size={20} />
              <div>
                <p className="text-sm text-gray-500 font-medium">Email</p>
                <p className="text-gray-900">{user.email}</p>
              </div>
            </div>

            {/* Member Since */}
            <div className="flex items-start gap-3 pb-4 border-b border-gray-200">
              <Calendar className="text-gray-400 mt-1" size={20} />
              <div>
                <p className="text-sm text-gray-500 font-medium">Member Since</p>
                <p className="text-gray-900">{formatDate(user.createdAt)}</p>
              </div>
            </div>

            {/* Organization */}
            {user.organization && (
              <div className="flex items-start gap-3">
                <Trophy className="text-gray-400 mt-1" size={20} />
                <div>
                  <p className="text-sm text-gray-500 font-medium">Organization</p>
                  <p className="text-gray-900">{user.organization.name}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Progression Status */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Progression Status</h2>

          <div className="space-y-4">
            {/* Tutorial */}
            <div className="flex items-center gap-3">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  user.tutorialCompleted ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                {user.tutorialCompleted && (
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <span className={user.tutorialCompleted ? 'text-gray-900' : 'text-gray-500'}>
                Tutorial Completed
              </span>
            </div>

            {/* Task Board */}
            <div className="flex items-center gap-3">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  user.taskBoardUnlocked ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                {user.taskBoardUnlocked && (
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <span className={user.taskBoardUnlocked ? 'text-gray-900' : 'text-gray-500'}>
                Task Board Unlocked
              </span>
            </div>

            {/* Composite Tasks */}
            <div className="flex items-center gap-3">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  user.compositeUnlocked ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                {user.compositeUnlocked && (
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <span className={user.compositeUnlocked ? 'text-gray-900' : 'text-gray-500'}>
                Composite Tasks Unlocked
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
