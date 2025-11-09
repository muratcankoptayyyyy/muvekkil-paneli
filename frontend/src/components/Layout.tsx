import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { LogOut, FileText, Home, Bell, CreditCard, User, Users, Briefcase, Upload, DollarSign, LayoutDashboard } from 'lucide-react'
import AnimatedBackground from './AnimatedBackground'

export default function Layout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isAdmin = user?.user_type === 'admin' || user?.user_type === 'lawyer'
  const isAdminRoute = location.pathname.startsWith('/admin')

  return (
    <div className="min-h-screen relative" style={{ background: 'linear-gradient(to bottom right, #457c7d, #548c8d)' }}>
      <AnimatedBackground />
      
      {/* Header */}
      <header className="bg-white shadow-sm relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-gray-900">
                Koptay {isAdminRoute ? 'Ofis Paneli' : 'Müvekkil Paneli'}
              </h1>
              {isAdmin && (
                <div className="flex gap-2">
                  <Link
                    to="/admin/dashboard"
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      isAdminRoute
                        ? 'text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    style={isAdminRoute ? { backgroundColor: '#548c8d' } : undefined}
                  >
                    Ofis Paneli
                  </Link>
                  <Link
                    to="/dashboard"
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      !isAdminRoute
                        ? 'text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    style={!isAdminRoute ? { backgroundColor: '#548c8d' } : undefined}
                  >
                    Müvekkil Görünümü
                  </Link>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700">{user?.full_name}</span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
              >
                <LogOut size={18} />
                Çıkış
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex relative z-10">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-sm min-h-[calc(100vh-4rem)]">
          <nav className="p-4 space-y-2">
            {isAdminRoute ? (
              /* Admin Menu */
              <>
                <Link
                  to="/admin/dashboard"
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg transition-colors"
                  style={{ 
                    backgroundColor: location.pathname === '/admin/dashboard' ? '#548c8d' : 'transparent',
                    color: location.pathname === '/admin/dashboard' ? 'white' : '#374151'
                  }}
                  onMouseEnter={(e) => {
                    if (location.pathname !== '/admin/dashboard') {
                      e.currentTarget.style.backgroundColor = '#f0fdfa'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (location.pathname !== '/admin/dashboard') {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }
                  }}
                >
                  <LayoutDashboard size={20} />
                  <span>Dashboard</span>
                </Link>
                
                <Link
                  to="/admin/clients"
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg transition-colors"
                  style={{ 
                    backgroundColor: location.pathname === '/admin/clients' ? '#548c8d' : 'transparent',
                    color: location.pathname === '/admin/clients' ? 'white' : '#374151'
                  }}
                  onMouseEnter={(e) => {
                    if (location.pathname !== '/admin/clients') {
                      e.currentTarget.style.backgroundColor = '#f0fdfa'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (location.pathname !== '/admin/clients') {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }
                  }}
                >
                  <Users size={20} />
                  <span>Müvekkiller</span>
                </Link>
                
                <Link
                  to="/admin/cases"
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg transition-colors"
                  style={{ 
                    backgroundColor: location.pathname === '/admin/cases' ? '#548c8d' : 'transparent',
                    color: location.pathname === '/admin/cases' ? 'white' : '#374151'
                  }}
                  onMouseEnter={(e) => {
                    if (location.pathname !== '/admin/cases') {
                      e.currentTarget.style.backgroundColor = '#f0fdfa'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (location.pathname !== '/admin/cases') {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }
                  }}
                >
                  <Briefcase size={20} />
                  <span>Tüm Dosyalar</span>
                </Link>
                
                <Link
                  to="/admin/documents/upload"
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg transition-colors"
                  style={{ 
                    backgroundColor: location.pathname === '/admin/documents/upload' ? '#548c8d' : 'transparent',
                    color: location.pathname === '/admin/documents/upload' ? 'white' : '#374151'
                  }}
                  onMouseEnter={(e) => {
                    if (location.pathname !== '/admin/documents/upload') {
                      e.currentTarget.style.backgroundColor = '#f0fdfa'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (location.pathname !== '/admin/documents/upload') {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }
                  }}
                >
                  <Upload size={20} />
                  <span>Evrak Yükle</span>
                </Link>
                
                <Link
                  to="/admin/payments/create"
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg transition-colors"
                  style={{ 
                    backgroundColor: location.pathname === '/admin/payments/create' ? '#548c8d' : 'transparent',
                    color: location.pathname === '/admin/payments/create' ? 'white' : '#374151'
                  }}
                  onMouseEnter={(e) => {
                    if (location.pathname !== '/admin/payments/create') {
                      e.currentTarget.style.backgroundColor = '#f0fdfa'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (location.pathname !== '/admin/payments/create') {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }
                  }}
                >
                  <DollarSign size={20} />
                  <span>Ödeme Talebi</span>
                </Link>
              </>
            ) : (
              /* Client Menu */
              <>
                <Link
                  to="/dashboard"
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Home size={20} />
                  <span>Ana Sayfa</span>
                </Link>
                
                <Link
                  to="/cases"
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <FileText size={20} />
                  <span>Dosyalarım</span>
                </Link>
                
                <Link
                  to="/documents"
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <FileText size={20} />
                  <span>Evraklarım</span>
                </Link>
                
                <Link
                  to="/payments"
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <CreditCard size={20} />
                  <span>Ödemeler</span>
                </Link>
                
                <Link
                  to="/notifications"
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Bell size={20} />
                  <span>Bildirimler</span>
                </Link>
                
                <Link
                  to="/profile"
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <User size={20} />
                  <span>Profilim</span>
                </Link>
              </>
            )}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
