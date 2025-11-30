import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import LoginPage from './pages/LoginPage'
import ChangePasswordPage from './pages/ChangePasswordPage'
import DashboardPage from './pages/DashboardPage'
import CasesPage from './pages/CasesPage'
import CaseDetailPage from './pages/CaseDetailPage'
import DocumentsPage from './pages/DocumentsPage'
import PaymentsPage from './pages/PaymentsPage'
import NotificationsPage from './pages/NotificationsPage'
import ProfilePage from './pages/ProfilePage'
import Layout from './components/Layout'

// Admin pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminClientsPage from './pages/admin/AdminClientsPage'
import AdminClientCreatePage from './pages/admin/AdminClientCreatePage'
import AdminCasesPage from './pages/admin/AdminCasesPage'
import AdminCaseCreatePage from './pages/admin/AdminCaseCreatePage'
import AdminDocumentsUploadPage from './pages/admin/AdminDocumentsUploadPage'
import AdminPaymentsCreatePage from './pages/admin/AdminPaymentsCreatePage'

// Protected Route component that checks for password change requirement
function ProtectedRoute({ children, redirectTo = '/login' }: { children: React.ReactNode, redirectTo?: string }) {
  const { isAuthenticated, user } = useAuthStore()
  
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} />
  }
  
  // If user must change password, redirect to change password page
  if (user?.must_change_password) {
    return <Navigate to="/change-password" />
  }
  
  return <>{children}</>
}

function App() {
  const { isAuthenticated, user } = useAuthStore()

  const isAdmin = user?.user_type === 'admin' || user?.user_type === 'lawyer'

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      
      {/* Change password route - accessible only when authenticated */}
      <Route 
        path="/change-password" 
        element={isAuthenticated ? <ChangePasswordPage /> : <Navigate to="/login" />} 
      />

      {/* Admin routes */}
      {isAdmin && (
        <Route element={<Layout />}>
          <Route
            path="/admin/dashboard"
            element={<ProtectedRoute><AdminDashboardPage /></ProtectedRoute>}
          />
          <Route
            path="/admin/clients"
            element={<ProtectedRoute><AdminClientsPage /></ProtectedRoute>}
          />
          <Route
            path="/admin/clients/new"
            element={<ProtectedRoute><AdminClientCreatePage /></ProtectedRoute>}
          />
          <Route
            path="/admin/cases"
            element={<ProtectedRoute><AdminCasesPage /></ProtectedRoute>}
          />
          <Route
            path="/admin/cases/new"
            element={<ProtectedRoute><AdminCaseCreatePage /></ProtectedRoute>}
          />
          <Route
            path="/admin/documents/upload"
            element={<ProtectedRoute><AdminDocumentsUploadPage /></ProtectedRoute>}
          />
          <Route
            path="/admin/payments/create"
            element={<ProtectedRoute><AdminPaymentsCreatePage /></ProtectedRoute>}
          />
        </Route>
      )}

      {/* Client routes */}
      <Route element={<Layout />}>
        <Route
          path="/dashboard"
          element={<ProtectedRoute><DashboardPage /></ProtectedRoute>}
        />
        <Route
          path="/cases"
          element={<ProtectedRoute><CasesPage /></ProtectedRoute>}
        />
        <Route
          path="/cases/:id"
          element={<ProtectedRoute><CaseDetailPage /></ProtectedRoute>}
        />
        <Route
          path="/documents"
          element={<ProtectedRoute><DocumentsPage /></ProtectedRoute>}
        />
        <Route
          path="/payments"
          element={<ProtectedRoute><PaymentsPage /></ProtectedRoute>}
        />
        <Route
          path="/notifications"
          element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>}
        />
        <Route
          path="/profile"
          element={<ProtectedRoute><ProfilePage /></ProtectedRoute>}
        />
      </Route>

      {/* Default redirect */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            isAdmin ? <Navigate to="/admin/dashboard" /> : <Navigate to="/dashboard" />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
    </Routes>
  )
}

export default App
