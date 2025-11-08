import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useUserStore } from './stores/userStore'
import './index.css'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import TaskBoard from './pages/TaskBoard'
import TutorialTaskList from './pages/TutorialTaskList'
import TaskBoardBacklog from './pages/TaskBoardBacklog'
import TaskExecution from './pages/TaskExecution'
import TestTasks from './pages/TestTasks'
import Notifications from './components/Notifications'
import { AdminRoute } from './components/AdminRoute'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminProjects from './pages/admin/AdminProjects'
import AdminOrganizations from './pages/admin/AdminOrganizations'
import AdminUsers from './pages/admin/AdminUsers'
import AdminTasks from './pages/admin/AdminTasks'

// Create a client with default options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30, // 30 seconds
      refetchOnWindowFocus: true,
      retry: 1,
    },
  },
})

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useUserStore()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

// Public route wrapper (redirect to dashboard if already logged in)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useUserStore()
  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" replace />
}

// Smart task board router (tutorial or backlog based on user progress)
function TaskBoardRouter() {
  const { user } = useUserStore()

  // If tutorial is not completed, show tutorial
  if (user && !user.tutorialCompleted) {
    return <TutorialTaskList />
  }

  // Otherwise show the backlog view
  return <TaskBoardBacklog />
}

createRoot(document.getElementById('root')!).render(
  // Disabled StrictMode due to double-mount issues with task acceptance
  // TODO: Re-enable once we have proper idempotent task acceptance
  // <StrictMode>
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <Notifications />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <TaskBoardRouter />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tasks/tutorial"
          element={
            <ProtectedRoute>
              <TutorialTaskList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tasks/backlog"
          element={
            <ProtectedRoute>
              <TaskBoardBacklog />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tasks/grid"
          element={
            <ProtectedRoute>
              <TaskBoard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tasks/:taskId"
          element={
            <ProtectedRoute>
              <TaskExecution />
            </ProtectedRoute>
          }
        />
        <Route path="/test-tasks" element={<TestTasks />} />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/projects"
          element={
            <AdminRoute>
              <AdminProjects />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/organizations"
          element={
            <AdminRoute>
              <AdminOrganizations />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <AdminUsers />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/tasks"
          element={
            <AdminRoute>
              <AdminTasks />
            </AdminRoute>
          }
        />
      </Routes>
    </BrowserRouter>
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>
  // </StrictMode>,
)
