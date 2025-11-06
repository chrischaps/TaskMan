import { useState } from 'react'
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import type { TaskTemplate } from '../types/admin'

interface TaskTemplateBuilderProps {
  templates: TaskTemplate[]
  onChange: (templates: TaskTemplate[]) => void
}

const TASK_TYPES = [
  { value: 'sort_list', label: 'Sort List', category: 'sorting' },
  { value: 'color_match', label: 'Color Match', category: 'visual' },
  { value: 'arithmetic', label: 'Arithmetic', category: 'math' },
  { value: 'group_separation', label: 'Group Separation', category: 'organization' },
  { value: 'defragmentation', label: 'Defragmentation', category: 'organization' },
]

export function TaskTemplateBuilder({ templates, onChange }: TaskTemplateBuilderProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)
  const [newTemplate, setNewTemplate] = useState<Partial<TaskTemplate>>({
    type: 'sort_list',
    category: 'sorting',
    title: '',
    description: '',
    tokenReward: 100,
    difficulty: 2,
    estimatedTime: 300,
  })

  const handleAddTemplate = () => {
    if (!newTemplate.title || !newTemplate.type) {
      return
    }

    // Create default data and solution based on task type
    const defaultData = getDefaultData(newTemplate.type)
    const defaultSolution = getDefaultSolution(newTemplate.type)

    const template: TaskTemplate = {
      type: newTemplate.type!,
      category: newTemplate.category || 'general',
      title: newTemplate.title,
      description: newTemplate.description,
      data: defaultData,
      solution: defaultSolution,
      tokenReward: newTemplate.tokenReward || 100,
      difficulty: newTemplate.difficulty,
      estimatedTime: newTemplate.estimatedTime,
    }

    onChange([...templates, template])
    setNewTemplate({
      type: 'sort_list',
      category: 'sorting',
      title: '',
      description: '',
      tokenReward: 100,
      difficulty: 2,
      estimatedTime: 300,
    })
    setExpandedIndex(templates.length)
  }

  const handleRemoveTemplate = (index: number) => {
    onChange(templates.filter((_, i) => i !== index))
    if (expandedIndex === index) {
      setExpandedIndex(null)
    }
  }

  const handleUpdateTemplate = (index: number, updates: Partial<TaskTemplate>) => {
    const updated = templates.map((t, i) => (i === index ? { ...t, ...updates } : t))
    onChange(updated)
  }

  const getDefaultData = (type: string): any => {
    switch (type) {
      case 'sort_list':
        return { items: [5, 2, 8, 1, 9] }
      case 'color_match':
        return { target: '#FF5733', options: ['#FF5733', '#33FF57', '#3357FF'] }
      case 'arithmetic':
        return { operation: 'add', operands: [15, 27] }
      case 'group_separation':
        return { items: ['apple', 'dog', 'banana', 'cat'], groups: ['fruits', 'animals'] }
      case 'defragmentation':
        return { blocks: [1, 0, 1, 0, 1], size: 5 }
      default:
        return {}
    }
  }

  const getDefaultSolution = (type: string): any => {
    switch (type) {
      case 'sort_list':
        return { items: [1, 2, 5, 8, 9] }
      case 'color_match':
        return { selected: '#FF5733' }
      case 'arithmetic':
        return { result: 42 }
      case 'group_separation':
        return { fruits: ['apple', 'banana'], animals: ['dog', 'cat'] }
      case 'defragmentation':
        return { blocks: [1, 1, 1, 0, 0] }
      default:
        return {}
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Task Templates ({templates.length})</h3>
      </div>

      {/* Existing Templates */}
      {templates.length > 0 && (
        <div className="space-y-2">
          {templates.map((template, index) => (
            <div key={index} className="border border-gray-300 rounded-lg overflow-hidden">
              <div
                className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100"
                onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-600">#{index + 1}</span>
                  <div>
                    <p className="font-semibold text-gray-900">{template.title}</p>
                    <p className="text-sm text-gray-600">
                      {TASK_TYPES.find((t) => t.value === template.type)?.label} • {template.tokenReward} tokens
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemoveTemplate(index)
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                  {expandedIndex === index ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </div>

              {expandedIndex === index && (
                <div className="p-4 border-t border-gray-300 space-y-4 bg-white">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Task Type</label>
                      <select
                        value={template.type}
                        onChange={(e) => {
                          const taskType = TASK_TYPES.find((t) => t.value === e.target.value)
                          handleUpdateTemplate(index, {
                            type: e.target.value,
                            category: taskType?.category || 'general',
                            data: getDefaultData(e.target.value),
                            solution: getDefaultSolution(e.target.value),
                          })
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        {TASK_TYPES.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Token Reward</label>
                      <input
                        type="number"
                        value={template.tokenReward}
                        onChange={(e) => handleUpdateTemplate(index, { tokenReward: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        min="1"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      value={template.title}
                      onChange={(e) => handleUpdateTemplate(index, { title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={template.description || ''}
                      onChange={(e) => handleUpdateTemplate(index, { description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty (1-5)</label>
                      <input
                        type="number"
                        value={template.difficulty || 2}
                        onChange={(e) => handleUpdateTemplate(index, { difficulty: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        min="1"
                        max="5"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Est. Time (seconds)</label>
                      <input
                        type="number"
                        value={template.estimatedTime || 300}
                        onChange={(e) => handleUpdateTemplate(index, { estimatedTime: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        min="1"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Task Data (JSON)</label>
                    <textarea
                      value={JSON.stringify(template.data, null, 2)}
                      onChange={(e) => {
                        try {
                          const data = JSON.parse(e.target.value)
                          handleUpdateTemplate(index, { data })
                        } catch {
                          // Invalid JSON, ignore
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                      rows={4}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Solution (JSON)</label>
                    <textarea
                      value={JSON.stringify(template.solution, null, 2)}
                      onChange={(e) => {
                        try {
                          const solution = JSON.parse(e.target.value)
                          handleUpdateTemplate(index, { solution })
                        } catch {
                          // Invalid JSON, ignore
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                      rows={4}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add New Template Form */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-4">Add New Task Template</h4>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Task Type</label>
              <select
                value={newTemplate.type}
                onChange={(e) => {
                  const taskType = TASK_TYPES.find((t) => t.value === e.target.value)
                  setNewTemplate({
                    ...newTemplate,
                    type: e.target.value,
                    category: taskType?.category || 'general',
                  })
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                {TASK_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Token Reward</label>
              <input
                type="number"
                value={newTemplate.tokenReward}
                onChange={(e) => setNewTemplate({ ...newTemplate, tokenReward: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                min="1"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              value={newTemplate.title}
              onChange={(e) => setNewTemplate({ ...newTemplate, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="e.g., Sort Numbers 1-10"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={newTemplate.description}
              onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              rows={2}
              placeholder="Optional task instructions..."
            />
          </div>

          <button
            onClick={handleAddTemplate}
            disabled={!newTemplate.title}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            <Plus size={18} />
            Add Task Template
          </button>
        </div>
      </div>

      {templates.length === 0 && (
        <p className="text-center text-gray-500 text-sm py-4">
          No task templates yet. Add at least one task template to create the project.
        </p>
      )}
    </div>
  )
}
