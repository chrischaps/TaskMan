import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AdminLayout } from '../../components/AdminLayout'
import {
  getAdminProjects,
  createProject,
  deleteProject,
  activateProject,
  completeProject,
} from '../../services/adminService'
import type { TaskTemplate, AdminProject } from '../../types/admin'
import { useUserStore } from '../../stores/userStore'
import { useUIStore } from '../../stores/uiStore'
import {
  Plus,
  Trash2,
  Play,
  CheckCircle,
  Calendar,
  Clock,
  FileText,
} from 'lucide-react'
import { TaskTemplateBuilder } from '../../components/TaskTemplateBuilder'

export default function AdminProjects() {
  const queryClient = useQueryClient()
  const { user } = useUserStore()
  const addNotification = useUIStore((state) => state.addNotification)
  const [isCreating, setIsCreating] = useState(false)
  const [autoGenCount, setAutoGenCount] = useState<number>(5)

  // New project form state
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    scheduledStartTime: '',
    taskTemplates: [] as TaskTemplate[],
  })

  const { data: projects, isLoading } = useQuery({
    queryKey: ['adminProjects'],
    queryFn: getAdminProjects,
    refetchInterval: 30000,
  })

  const createMutation = useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProjects'] })
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] })
      addNotification({
        type: 'success',
        message: 'Project created successfully!',
      })
      setIsCreating(false)
      setNewProject({
        name: '',
        description: '',
        scheduledStartTime: '',
        taskTemplates: [],
      })
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        message: error.response?.data?.message || 'Failed to create project',
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProjects'] })
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] })
      addNotification({
        type: 'success',
        message: 'Project deleted successfully!',
      })
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        message: error.response?.data?.message || 'Failed to delete project',
      })
    },
  })

  const activateMutation = useMutation({
    mutationFn: (projectId: string) => activateProject(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProjects'] })
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] })
      addNotification({
        type: 'success',
        message: 'Project activated! Tasks duplicated to all organizations.',
      })
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        message: error.response?.data?.message || 'Failed to activate project',
      })
    },
  })

  const completeMutation = useMutation({
    mutationFn: completeProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProjects'] })
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] })
      addNotification({
        type: 'success',
        message: 'Project marked as completed!',
      })
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        message: error.response?.data?.message || 'Failed to complete project',
      })
    },
  })

  const generateRandomTasks = (count: number) => {
    const taskTypes = [
      { value: 'sort_list', label: 'Sort List', category: 'sorting' },
      { value: 'color_match', label: 'Color Match', category: 'visual' },
      { value: 'arithmetic', label: 'Arithmetic', category: 'math' },
      { value: 'group_separation', label: 'Group Separation', category: 'organization' },
      { value: 'defragmentation', label: 'Defragmentation', category: 'organization' },
    ]

    const getDefaultData = (type: string, difficulty: number): any => {
      switch (type) {
        case 'sort_list':
          const length = 5 + Math.floor(Math.random() * 5)
          const nums = Array.from({ length }, () => Math.floor(Math.random() * 100))
          return {
            items: nums.map(String),
            sortCriteria: 'numerical' as const
          }
        case 'color_match':
          const colors = [
            { r: 255, g: 87, b: 51 },   // Red-Orange
            { r: 51, g: 255, b: 87 },   // Green
            { r: 51, g: 87, b: 255 },   // Blue
            { r: 243, g: 51, b: 255 },  // Purple
            { r: 51, g: 255, b: 243 },  // Cyan
            { r: 255, g: 199, b: 51 },  // Yellow
          ]
          const targetColor = colors[Math.floor(Math.random() * colors.length)]
          return { targetColor }
        case 'arithmetic':
          const a = Math.floor(Math.random() * 50) + 1
          const b = Math.floor(Math.random() * 50) + 1
          const c = Math.floor(Math.random() * 20) + 1
          const expression = difficulty === 1
            ? `${a} + ${b}`
            : difficulty === 2
              ? `(${a} * ${c}) + ${b}`
              : `(${a} * ${c}) + ${b} - ${Math.floor(Math.random() * 30)}`
          const correctAnswer = eval(expression)
          return { expression, correctAnswer }
        case 'group_separation':
          const shapes = ['circle', 'square', 'triangle', 'rectangle']
          const groupColors = ['red', 'blue', 'green', 'yellow']
          const sizes = ['small', 'medium', 'large']
          const groupBy = ['shape', 'color', 'size'][Math.floor(Math.random() * 3)]

          const groupValues = groupBy === 'shape' ? shapes.slice(0, 3)
            : groupBy === 'color' ? groupColors.slice(0, 3)
            : sizes

          const items = []
          let idCounter = 0
          for (const value of groupValues) {
            for (let i = 0; i < 3; i++) {
              items.push({
                id: `item-${idCounter++}`,
                attributes: {
                  [groupBy]: value,
                  ...(groupBy !== 'shape' && { shape: shapes[Math.floor(Math.random() * shapes.length)] }),
                  ...(groupBy !== 'color' && { color: groupColors[Math.floor(Math.random() * groupColors.length)] }),
                  ...(groupBy !== 'size' && { size: sizes[Math.floor(Math.random() * sizes.length)] })
                }
              })
            }
          }

          // Shuffle items
          for (let i = items.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [items[i], items[j]] = [items[j], items[i]]
          }

          return { items, groupBy }
        case 'defragmentation':
          const rows = 3 + Math.floor(Math.random() * 3)
          const cols = 4 + Math.floor(Math.random() * 3)
          const blockTypes = ['R', 'G', 'B', 'Y']
          const grid: string[][] = []

          for (let r = 0; r < rows; r++) {
            const row: string[] = []
            for (let c = 0; c < cols; c++) {
              row.push(Math.random() > 0.3 ? blockTypes[Math.floor(Math.random() * blockTypes.length)] : '.')
            }
            grid.push(row)
          }

          return { grid, rows, cols }
        default:
          return {}
      }
    }

    const getDefaultSolution = (type: string, data: any): any => {
      switch (type) {
        case 'sort_list':
          const sorted = [...data.items].sort((a: string, b: string) => {
            if (data.sortCriteria === 'numerical') {
              return parseFloat(a) - parseFloat(b)
            }
            return a.localeCompare(b)
          })
          return { sortedItems: sorted }
        case 'color_match':
          return { submittedColor: data.targetColor }
        case 'arithmetic':
          return { answer: data.correctAnswer }
        case 'group_separation':
          const groups: Record<string, string[]> = {}
          for (const item of data.items) {
            const groupKey = item.attributes[data.groupBy]
            if (!groups[groupKey]) {
              groups[groupKey] = []
            }
            groups[groupKey].push(item.id)
          }
          return { groups }
        case 'defragmentation':
          // Collect all non-empty blocks
          const blocks: { value: string; row: number; col: number }[] = []
          for (let r = 0; r < data.rows; r++) {
            for (let c = 0; c < data.cols; c++) {
              if (data.grid[r][c] !== '.') {
                blocks.push({ value: data.grid[r][c], row: r, col: c })
              }
            }
          }

          // Sort by value to group same types
          blocks.sort((a, b) => a.value.localeCompare(b.value))

          // Create solution grid with blocks compacted to top-left
          const solutionGrid: string[][] = Array(data.rows).fill(null).map(() => Array(data.cols).fill('.'))
          let idx = 0
          for (let r = 0; r < data.rows && idx < blocks.length; r++) {
            for (let c = 0; c < data.cols && idx < blocks.length; c++) {
              solutionGrid[r][c] = blocks[idx].value
              idx++
            }
          }

          return { grid: solutionGrid, moveCount: 0 }
        default:
          return {}
      }
    }

    const generatedTasks: TaskTemplate[] = []

    for (let i = 0; i < count; i++) {
      const taskType = taskTypes[Math.floor(Math.random() * taskTypes.length)]
      const difficulty = Math.floor(Math.random() * 5) + 1
      const tokenReward = 50 + (difficulty * 20) + Math.floor(Math.random() * 50)
      const estimatedTime = 120 + (difficulty * 60) + Math.floor(Math.random() * 180)

      const data = getDefaultData(taskType.value, difficulty)
      const solution = getDefaultSolution(taskType.value, data)

      generatedTasks.push({
        type: taskType.value,
        category: taskType.category,
        title: `${taskType.label} Challenge ${i + 1}`,
        description: `Complete this ${taskType.label.toLowerCase()} task to earn tokens.`,
        data,
        solution,
        tokenReward,
        difficulty,
        estimatedTime,
      })
    }

    return generatedTasks
  }

  const handleAutoGenerate = () => {
    if (autoGenCount < 1 || autoGenCount > 100) {
      addNotification({
        type: 'error',
        message: 'Please enter a number between 1 and 100',
      })
      return
    }

    const generated = generateRandomTasks(autoGenCount)
    setNewProject({ ...newProject, taskTemplates: [...newProject.taskTemplates, ...generated] })
    addNotification({
      type: 'success',
      message: `Generated ${autoGenCount} random tasks!`,
    })
  }

  const handleCreateProject = () => {
    if (!newProject.name || newProject.taskTemplates.length === 0) {
      addNotification({
        type: 'error',
        message: 'Project name and at least one task template required',
      })
      return
    }

    createMutation.mutate(newProject)
  }


  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      scheduled: 'bg-blue-100 text-blue-800',
      active: 'bg-green-100 text-green-800',
      completed: 'bg-purple-100 text-purple-800',
    }
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status] || styles.draft}`}>
        {status.toUpperCase()}
      </span>
    )
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
            <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
            <p className="text-gray-600 mt-1">Manage competitive task projects</p>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            Create Project
          </button>
        </div>

        {/* Create Project Modal */}
        {isCreating && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
                <h2 className="text-2xl font-bold text-gray-900">Create New Project</h2>
              </div>

              <div className="p-6 space-y-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Project Name *
                    </label>
                    <input
                      type="text"
                      value={newProject.name}
                      onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Weekly Challenge #1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={newProject.description}
                      onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                      placeholder="Optional description of the project..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Scheduled Start Time (Optional)
                    </label>
                    <input
                      type="datetime-local"
                      value={newProject.scheduledStartTime}
                      onChange={(e) => setNewProject({ ...newProject, scheduledStartTime: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Auto-Generate Tasks */}
                <div className="border-2 border-dashed border-blue-300 rounded-lg p-4 bg-blue-50">
                  <h4 className="font-semibold text-gray-900 mb-3">Quick Generate Tasks</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Automatically generate random task templates to quickly populate your project.
                  </p>
                  <div className="flex items-end gap-3">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Number of Tasks
                      </label>
                      <input
                        type="number"
                        value={autoGenCount}
                        onChange={(e) => setAutoGenCount(parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min="1"
                        max="100"
                        placeholder="e.g., 10"
                      />
                    </div>
                    <button
                      onClick={handleAutoGenerate}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors whitespace-nowrap"
                    >
                      Generate Tasks
                    </button>
                  </div>
                </div>

                {/* Task Template Builder */}
                <TaskTemplateBuilder
                  templates={newProject.taskTemplates}
                  onChange={(templates) => setNewProject({ ...newProject, taskTemplates: templates })}
                />
              </div>

              <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3 sticky bottom-0 bg-white">
                <button
                  onClick={() => {
                    setIsCreating(false)
                    setNewProject({
                      name: '',
                      description: '',
                      scheduledStartTime: '',
                      taskTemplates: [],
                    })
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateProject}
                  disabled={createMutation.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                >
                  {createMutation.isPending ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Projects List */}
        <div className="grid grid-cols-1 gap-6">
          {projects && projects.length === 0 && (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No projects yet</h3>
              <p className="mt-1 text-gray-500">
                Create your first project to start organizing tasks.
              </p>
            </div>
          )}

          {projects?.map((project) => (
            <div key={project.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{project.name}</h3>
                      {getStatusBadge(project.status)}
                    </div>
                    {project.description && (
                      <p className="text-gray-600 text-sm">{project.description}</p>
                    )}
                  </div>
                </div>

                {/* Project Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-gray-500 font-medium">Tasks</p>
                    <p className="text-gray-900 font-semibold">{project._count?.tasks || 0}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 font-medium">Created</p>
                    <p className="text-gray-900">{new Date(project.createdAt).toLocaleDateString()}</p>
                  </div>
                  {project.scheduledStartTime && (
                    <div>
                      <p className="text-gray-500 font-medium flex items-center gap-1">
                        <Calendar size={14} /> Scheduled
                      </p>
                      <p className="text-gray-900">{new Date(project.scheduledStartTime).toLocaleString()}</p>
                    </div>
                  )}
                  {project.actualStartTime && (
                    <div>
                      <p className="text-gray-500 font-medium flex items-center gap-1">
                        <Clock size={14} /> Started
                      </p>
                      <p className="text-gray-900">{new Date(project.actualStartTime).toLocaleString()}</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  {project.status === 'draft' && (
                    <button
                      onClick={() => activateMutation.mutate(project.id)}
                      disabled={activateMutation.isPending}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                    >
                      <Play size={16} />
                      {activateMutation.isPending ? 'Activating...' : 'Activate'}
                    </button>
                  )}

                  {project.status === 'active' && (
                    <button
                      onClick={() => completeMutation.mutate(project.id)}
                      disabled={completeMutation.isPending}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:bg-gray-400 transition-colors"
                    >
                      <CheckCircle size={16} />
                      Complete
                    </button>
                  )}

                  {project.status !== 'active' && (
                    <button
                      onClick={() => {
                        if (confirm('Delete this project and all associated tasks?')) {
                          deleteMutation.mutate(project.id)
                        }
                      }}
                      disabled={deleteMutation.isPending}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:bg-gray-400 transition-colors"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}
