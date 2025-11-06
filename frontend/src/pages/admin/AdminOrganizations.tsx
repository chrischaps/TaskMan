import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AdminLayout } from '../../components/AdminLayout'
import { getAllOrganizations } from '../../services/organizationService'
import {
  createOrganization,
  updateOrganization,
  deleteOrganization,
} from '../../services/adminService'
import { useUIStore } from '../../stores/uiStore'
import { Plus, Edit2, Trash2, Users, CheckCircle2 } from 'lucide-react'

export default function AdminOrganizations() {
  const queryClient = useQueryClient()
  const addNotification = useUIStore((state) => state.addNotification)
  const [isCreating, setIsCreating] = useState(false)
  const [editingOrg, setEditingOrg] = useState<string | null>(null)
  const [newOrg, setNewOrg] = useState({ name: '', description: '' })
  const [editForm, setEditForm] = useState({ name: '', description: '' })

  const { data: organizations, isLoading } = useQuery({
    queryKey: ['organizations'],
    queryFn: getAllOrganizations,
    refetchInterval: 30000,
  })

  const createMutation = useMutation({
    mutationFn: createOrganization,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] })
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] })
      addNotification({
        type: 'success',
        message: 'Organization created successfully!',
      })
      setIsCreating(false)
      setNewOrg({ name: '', description: '' })
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        message: error.response?.data?.message || 'Failed to create organization',
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string; description?: string } }) =>
      updateOrganization(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] })
      addNotification({
        type: 'success',
        message: 'Organization updated successfully!',
      })
      setEditingOrg(null)
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        message: error.response?.data?.message || 'Failed to update organization',
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteOrganization,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] })
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] })
      addNotification({
        type: 'success',
        message: 'Organization deleted successfully!',
      })
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        message: error.response?.data?.message || 'Failed to delete organization',
      })
    },
  })

  const handleCreate = () => {
    if (!newOrg.name.trim()) {
      addNotification({ type: 'error', message: 'Organization name is required' })
      return
    }
    createMutation.mutate(newOrg)
  }

  const handleUpdate = (id: string) => {
    if (!editForm.name.trim()) {
      addNotification({ type: 'error', message: 'Organization name is required' })
      return
    }
    updateMutation.mutate({ id, data: editForm })
  }

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Delete "${name}"? This can only be done if the organization has no users.`)) {
      deleteMutation.mutate(id)
    }
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Organizations</h1>
            <p className="text-gray-600 mt-1">Manage competing teams and groups</p>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            New Organization
          </button>
        </div>

        {/* Create Modal */}
        {isCreating && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">Create Organization</h2>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Organization Name *
                  </label>
                  <input
                    type="text"
                    value={newOrg.name}
                    onChange={(e) => setNewOrg({ ...newOrg, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Team Gamma"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newOrg.description}
                    onChange={(e) => setNewOrg({ ...newOrg, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Optional description..."
                  />
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
                <button
                  onClick={() => {
                    setIsCreating(false)
                    setNewOrg({ name: '', description: '' })
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={createMutation.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                >
                  {createMutation.isPending ? 'Creating...' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Organizations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {organizations?.map((org) => (
            <div key={org.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
              {editingOrg === org.id ? (
                // Edit Mode
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdate(org.id)}
                      disabled={updateMutation.isPending}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400"
                    >
                      <CheckCircle2 size={16} />
                      Save
                    </button>
                    <button
                      onClick={() => setEditingOrg(null)}
                      className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // View Mode
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{org.name}</h3>
                      {org.description && (
                        <p className="text-sm text-gray-600">{org.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-6 mb-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="text-blue-600" size={18} />
                      <span className="font-semibold text-gray-900">
                        {org._count?.users || 0}
                      </span>
                      <span className="text-gray-600">members</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingOrg(org.id)
                        setEditForm({
                          name: org.name,
                          description: org.description || '',
                        })
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Edit2 size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(org.id, org.name)}
                      disabled={deleteMutation.isPending}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:bg-gray-400 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {organizations?.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No organizations</h3>
            <p className="mt-1 text-gray-500">
              Create organizations to group users into competing teams.
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
