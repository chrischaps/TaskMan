import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, LogOut, ChevronDown } from 'lucide-react'
import { useUserStore } from '../stores/userStore'

export default function UserMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { user, clearUser } = useUserStore()

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleLogout = () => {
    clearUser()
    navigate('/login')
  }

  const handleProfile = () => {
    setIsOpen(false)
    navigate('/profile')
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

  if (!user) return null

  return (
    <div className="relative" ref={menuRef}>
      {/* User Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white hover:bg-gray-50 border-2 border-gray-300 rounded-lg px-3 py-2 transition-colors"
      >
        {/* Avatar */}
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
          {getInitials(user.username)}
        </div>

        {/* Username */}
        <span className="font-medium text-gray-700 hidden sm:block">{user.username}</span>

        {/* Chevron */}
        <ChevronDown
          size={16}
          className={`text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-gray-200">
            <p className="font-semibold text-gray-900">{user.username}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
            <div className="mt-2 flex items-center gap-2 text-xs text-gray-600">
              <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                Level {user.level}
              </span>
              <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                {user.tokenBalance} tokens
              </span>
            </div>
          </div>

          {/* Menu Items */}
          <button
            onClick={handleProfile}
            className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-3 text-gray-700 transition-colors"
          >
            <User size={18} />
            <span>Profile</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 hover:bg-red-50 flex items-center gap-3 text-red-600 transition-colors"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  )
}
