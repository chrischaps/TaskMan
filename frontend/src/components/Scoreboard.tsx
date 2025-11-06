import { Trophy } from 'lucide-react'
import type { OrganizationScoreboard } from '../types/organization'

interface ScoreboardProps {
  scoreboard: OrganizationScoreboard[]
  isLoading?: boolean
  compact?: boolean
}

export default function Scoreboard({ scoreboard, isLoading, compact = false }: ScoreboardProps) {
  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 ${compact ? 'text-sm' : ''}`}>
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span className="text-gray-600">Loading scoreboard...</span>
      </div>
    )
  }

  if (!scoreboard || scoreboard.length === 0) {
    return null
  }

  if (compact) {
    // Compact view for header
    return (
      <div className="flex items-center gap-4">
        {scoreboard.map((org, index) => {
          const isFirst = index === 0
          const medalColor = isFirst
            ? 'text-yellow-500'
            : index === 1
              ? 'text-gray-400'
              : 'text-orange-600'

          return (
            <div
              key={org.organizationId}
              className="flex items-center gap-2"
            >
              {index < 3 && (
                <Trophy size={16} className={medalColor} />
              )}
              <span className="text-sm font-semibold text-gray-900">
                {org.organizationName}
              </span>
              <span className={`text-sm font-bold ${isFirst ? 'text-green-600' : 'text-gray-600'}`}>
                {org.completionPercentage}%
              </span>
            </div>
          )
        })}
      </div>
    )
  }

  // Full view for separate scoreboard page/section
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="text-yellow-500" size={24} />
        <h2 className="text-2xl font-bold text-gray-900">Organization Scoreboard</h2>
      </div>

      <div className="space-y-3">
        {scoreboard.map((org, index) => {
          const isFirst = index === 0
          const medalColor = isFirst
            ? 'text-yellow-500'
            : index === 1
              ? 'text-gray-400'
              : index === 2
                ? 'text-orange-600'
                : 'text-gray-300'

          return (
            <div
              key={org.organizationId}
              className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                isFirst
                  ? 'border-yellow-300 bg-yellow-50'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                {index < 3 && (
                  <Trophy size={24} className={medalColor} />
                )}
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-gray-500">#{index + 1}</span>
                  <span className="text-lg font-semibold text-gray-900">
                    {org.organizationName}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-sm text-gray-600">Progress</div>
                  <div className="text-lg font-bold text-gray-900">
                    {org.completedTasks}/{org.totalTasks} tasks
                  </div>
                </div>

                <div className="w-32">
                  <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`absolute inset-y-0 left-0 ${
                        isFirst
                          ? 'bg-green-500'
                          : 'bg-blue-500'
                      } transition-all duration-500`}
                      style={{ width: `${org.completionPercentage}%` }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-gray-900">
                      {org.completionPercentage}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
