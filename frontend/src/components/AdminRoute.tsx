import { Navigate } from 'react-router-dom'
import { useUserStore } from '../stores/userStore'

interface AdminRouteProps {
  children: React.ReactNode
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { user, isAuthenticated } = useUserStore()

  console.log('[AdminRoute] Authentication check:', {
    isAuthenticated,
    user: user ? {
      id: user.id,
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin,
    } : null,
  })

  // If not authenticated, redirect to login
  if (!isAuthenticated || !user) {
    console.log('[AdminRoute] User not authenticated, redirecting to login')
    return <Navigate to="/login" replace />
  }

  // If not admin, redirect to dashboard
  if (!user.isAdmin) {
    console.log('[AdminRoute] User is not admin, redirecting to dashboard. isAdmin:', user.isAdmin)
    return <Navigate to="/dashboard" replace />
  }

  // User is admin, render the admin content
  console.log('[AdminRoute] User is admin, rendering admin content')
  return <>{children}</>
}
