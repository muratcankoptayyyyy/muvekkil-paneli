import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import CasesPage from './pages/CasesPage'
import DocumentsPage from './pages/DocumentsPage'
import PaymentsPage from './pages/PaymentsPage'
import NotificationsPage from './pages/NotificationsPage'
import ProfilePage from './pages/ProfilePage'
import Layout from './components/Layout'

// Admin pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminClientsPage from './pages/admin/AdminClientsPage'
import AdminCasesPage from './pages/admin/AdminCasesPage'
import AdminCaseCreatePage from './pages/admin/AdminCaseCreatePage'
import AdminDocumentsUploadPage from './pages/admin/AdminDocumentsUploadPage'
import AdminPaymentsCreatePage from './pages/admin/AdminPaymentsCreatePage'

function App() {
  const { isAuthenticated, user } = useAuthStore()

  const isAdmin = user?.user_type === 'admin' || user?.user_type === 'lawyer'

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />

      {/* Admin routes */}
      {isAdmin && (
        <Route element={<Layout />}>
          <Route
            path="/admin/dashboard"
            element={isAuthenticated ? <AdminDashboardPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/admin/clients"
            element={isAuthenticated ? <AdminClientsPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/admin/cases"
            element={isAuthenticated ? <AdminCasesPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/admin/cases/new"
            element={isAuthenticated ? <AdminCaseCreatePage /> : <Navigate to="/login" />}
          />
          <Route
            path="/admin/documents/upload"
            element={isAuthenticated ? <AdminDocumentsUploadPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/admin/payments/create"
            element={isAuthenticated ? <AdminPaymentsCreatePage /> : <Navigate to="/login" />}
          />
        </Route>
      )}

      {/* Client routes */}
      <Route element={<Layout />}>
        <Route
          path="/dashboard"
          element={isAuthenticated ? <DashboardPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/cases"
          element={isAuthenticated ? <CasesPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/documents"
          element={isAuthenticated ? <DocumentsPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/payments"
          element={isAuthenticated ? <PaymentsPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/notifications"
          element={isAuthenticated ? <NotificationsPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/profile"
          element={isAuthenticated ? <ProfilePage /> : <Navigate to="/login" />}
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
