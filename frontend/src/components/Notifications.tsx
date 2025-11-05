import { useEffect } from 'react'
import { useUIStore } from '../stores/uiStore'

export default function Notifications() {
  const { notifications, removeNotification } = useUIStore()

  // Auto-remove notifications after 5 seconds
  useEffect(() => {
    notifications.forEach((notif) => {
      const timer = setTimeout(() => {
        removeNotification(notif.id)
      }, notif.duration || 5000)

      return () => clearTimeout(timer)
    })
  }, [notifications, removeNotification])

  if (notifications.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notif) => (
        <div
          key={notif.id}
          className={`p-4 rounded-lg shadow-lg flex justify-between items-start animate-slide-in ${
            notif.type === 'success'
              ? 'bg-green-100 text-green-800 border border-green-200'
              : notif.type === 'error'
              ? 'bg-red-100 text-red-800 border border-red-200'
              : notif.type === 'info'
              ? 'bg-blue-100 text-blue-800 border border-blue-200'
              : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
          }`}
        >
          <span className="text-sm font-medium flex-1">{notif.message}</span>
          <button
            onClick={() => removeNotification(notif.id)}
            className="ml-3 text-lg font-bold leading-none hover:opacity-70"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}
