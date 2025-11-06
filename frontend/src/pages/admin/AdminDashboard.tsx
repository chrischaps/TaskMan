import { useQuery } from '@tanstack/react-query'
import { AdminLayout } from '../../components/AdminLayout'
import { getDashboardStats } from '../../services/adminService'
import { Users, Building2, FolderKanban, ListTodo, TrendingUp } from 'lucide-react'

export default function AdminDashboard() {
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['adminDashboard'],
    queryFn: getDashboardStats,
    refetchInterval: 30000, // Refresh every 30 seconds
  })

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    )
  }

  const stats = [
    {
      label: 'Total Users',
      value: dashboard?.stats.totalUsers || 0,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      label: 'Organizations',
      value: dashboard?.stats.totalOrganizations || 0,
      icon: Building2,
      color: 'bg-purple-500',
    },
    {
      label: 'Projects',
      value: dashboard?.stats.totalProjects || 0,
      icon: FolderKanban,
      color: 'bg-green-500',
    },
    {
      label: 'Total Tasks',
      value: dashboard?.stats.totalTasks || 0,
      icon: ListTodo,
      color: 'bg-orange-500',
    },
  ]

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Overview of your TaskMan system</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="text-white" size={24} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Active Project */}
        {dashboard?.activeProject && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="text-green-600" size={24} />
              <h2 className="text-xl font-bold text-gray-900">Active Project</h2>
            </div>
            <div className="space-y-2">
              <p className="text-lg font-semibold text-gray-900">
                {dashboard.activeProject.name}
              </p>
              {dashboard.activeProject.description && (
                <p className="text-gray-600">{dashboard.activeProject.description}</p>
              )}
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>Tasks: {dashboard.activeProject._count?.tasks || 0}</span>
                <span>•</span>
                <span>
                  Started:{' '}
                  {new Date(dashboard.activeProject.actualStartTime).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}

        {!dashboard?.activeProject && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <p className="text-yellow-800 font-medium">No active project</p>
            <p className="text-yellow-700 text-sm mt-1">
              Create and activate a project to start competition between organizations.
            </p>
          </div>
        )}

        {/* Recent Users */}
        {dashboard?.recentUsers && dashboard.recentUsers.length > 0 && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Recent Users</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {dashboard.recentUsers.map((user) => (
                <div key={user.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{user.username}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                    <div className="text-right">
                      {user.organization && (
                        <p className="text-sm font-medium text-gray-900">
                          {user.organization.name}
                        </p>
                      )}
                      <p className="text-xs text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
