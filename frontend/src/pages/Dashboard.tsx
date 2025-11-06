import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useUserStore } from '../stores/userStore'
import { useUIStore } from '../stores/uiStore'
import { useTaskBoard } from '../hooks/useTaskBoard'
import TaskCard from '../components/TaskCard'
import { CreateTaskModal } from '../components/CreateTaskModal'

export default function Dashboard() {
  const { user, clearUser } = useUserStore()
  const navigate = useNavigate()
  const addNotification = useUIStore((state) => state.addNotification)

  const [filters, setFilters] = useState({
    type: '',
    difficulty: '',
    minReward: '',
    maxReward: '',
    hideOwnTasks: false,
    page: 1,
  })
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  // Fetch tasks with automatic polling
  const { data, isLoading, error, refetch, isFetching } = useTaskBoard(filters)

  const handleLogout = () => {
    clearUser()
    navigate('/login')
  }

  const handleAcceptTask = (taskId: string) => {
    // Navigate to task execution page
    navigate(`/tasks/${taskId}`)
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key === 'page' ? prev.page : 1, // Reset to page 1 when changing filters
    }))
  }

  const handleRefresh = () => {
    refetch()
    addNotification({
      type: 'info',
      message: 'Refreshing tasks...',
      duration: 2000,
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with user stats */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Title with Icon */}
            <div className="flex items-center gap-4">
              <img src="/icon.png" alt="TaskMan" className="w-12 h-12" />
              <h1 className="text-4xl font-bold text-gray-900 tracking-tight">TaskMan</h1>
            </div>

            {/* Center: User Stats */}
            <div className="hidden md:flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Tokens:</span>
                <span className="font-bold text-green-600 text-lg">
                  {user?.tokenBalance || 0}
                </span>
              </div>
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Level:</span>
                <span className="font-bold text-purple-600 text-lg">
                  {user?.level || 1}
                </span>
              </div>
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Tasks:</span>
                <span className="font-bold text-blue-600 text-lg">
                  {user?.tasksCompleted || 0}
                </span>
              </div>
            </div>

            {/* Right: Logout */}
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
            >
              Logout
            </button>
          </div>

          {/* Mobile: User Stats */}
          <div className="md:hidden mt-3 flex items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <span className="text-gray-600">Tokens:</span>
              <span className="font-bold text-green-600">{user?.tokenBalance || 0}</span>
            </div>
            <div className="h-4 w-px bg-gray-300" />
            <div className="flex items-center gap-1">
              <span className="text-gray-600">Lvl:</span>
              <span className="font-bold text-purple-600">{user?.level || 1}</span>
            </div>
            <div className="h-4 w-px bg-gray-300" />
            <div className="flex items-center gap-1">
              <span className="text-gray-600">Tasks:</span>
              <span className="font-bold text-blue-600">{user?.tasksCompleted || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Welcome Message */}
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <h2 className="text-lg font-semibold text-gray-800">
            Welcome back, {user?.username}!
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Browse available tasks below, or create your own to earn tokens.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Available Tasks</h2>
          <div className="flex gap-3">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Plus size={20} />
              Create Task
            </button>
            <button
              onClick={handleRefresh}
              disabled={isFetching}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center gap-2"
            >
              <svg
                className={`w-5 h-5 ${isFetching ? 'animate-spin' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Type filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Task Type
              </label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Types</option>
                <option value="sort_list">Sort List</option>
                <option value="color_match">Color Match</option>
                <option value="arithmetic">Arithmetic</option>
                <option value="group_separation">Group Separation</option>
                <option value="defragmentation">Defragmentation</option>
              </select>
            </div>

            {/* Difficulty filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Difficulty
              </label>
              <select
                value={filters.difficulty}
                onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Difficulties</option>
                <option value="1">★ Easy</option>
                <option value="2">★★ Medium</option>
                <option value="3">★★★ Hard</option>
                <option value="4">★★★★ Very Hard</option>
                <option value="5">★★★★★ Expert</option>
              </select>
            </div>

            {/* Min reward filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Tokens
              </label>
              <input
                type="number"
                value={filters.minReward}
                onChange={(e) => handleFilterChange('minReward', e.target.value)}
                placeholder="0"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Max reward filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Tokens
              </label>
              <input
                type="number"
                value={filters.maxReward}
                onChange={(e) => handleFilterChange('maxReward', e.target.value)}
                placeholder="1000"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Hide my tasks checkbox */}
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.hideOwnTasks}
                  onChange={(e) => handleFilterChange('hideOwnTasks', e.target.checked.toString())}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Hide My Tasks</span>
              </label>
            </div>

            {/* Clear filters button */}
            <div className="flex items-end">
              <button
                onClick={() =>
                  setFilters({ type: '', difficulty: '', minReward: '', maxReward: '', hideOwnTasks: false, page: 1 })
                }
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading tasks...</p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-red-800">Failed to load tasks. Please try again.</p>
            <button
              onClick={() => refetch()}
              className="mt-2 text-red-600 hover:text-red-700 font-medium"
            >
              Retry
            </button>
          </div>
        )}

        {/* Task list */}
        {data && data.tasks.length > 0 && (
          <>
            <div className="mb-4 text-sm text-gray-600">
              Showing {data.tasks.length} of {data.pagination.totalCount} tasks (Page{' '}
              {data.pagination.page} of {data.pagination.totalPages})
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {data.tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onAccept={handleAcceptTask}
                  isAccepting={false}
                />
              ))}
            </div>

            {/* Pagination */}
            {data.pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => handleFilterChange('page', (filters.page - 1).toString())}
                  disabled={!data.pagination.hasPrevPage}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg font-medium hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400 transition-colors"
                >
                  Previous
                </button>
                <span className="text-gray-600">
                  Page {data.pagination.page} of {data.pagination.totalPages}
                </span>
                <button
                  onClick={() => handleFilterChange('page', (filters.page + 1).toString())}
                  disabled={!data.pagination.hasNextPage}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg font-medium hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        {/* Empty state */}
        {data && data.tasks.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No tasks available</h3>
            <p className="mt-1 text-gray-500">
              Try adjusting your filters or check back later for new tasks.
            </p>
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onTaskCreated={() => {
          refetch()
          addNotification({
            type: 'success',
            message: 'Task will appear on the board for other players!',
            duration: 3000,
          })
        }}
      />
    </div>
  )
}
