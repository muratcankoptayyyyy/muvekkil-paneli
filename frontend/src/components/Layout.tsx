import { useState } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { LogOut, FileText, Home, Bell, CreditCard, User, Users, Briefcase, Upload, DollarSign, LayoutDashboard, Menu, X } from 'lucide-react'
import AnimatedBackground from './AnimatedBackground'
import NotificationBell from './NotificationBell'

export default function Layout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isAdmin = user?.user_type === 'admin' || user?.user_type === 'lawyer'
  const isAdminRoute = location.pathname.startsWith('/admin')

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)

  return (
    <div className="min-h-screen relative bg-gray-50">
      
      {/* Header */}
      <header className="bg-brand-600 shadow-md relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button 
                onClick={toggleSidebar}
                className="p-2 rounded-md text-brand-100 hover:text-white hover:bg-brand-500 md:hidden"
              >
                {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              
              <h1 className="text-xl font-bold text-white truncate">
                Koptay {isAdminRoute ? 'Ofis Paneli' : 'Müvekkil Paneli'}
              </h1>
              
              {isAdmin && (
                <div className="hidden md:flex gap-2">
                  <Link
                    to="/admin/dashboard"
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      isAdminRoute
                        ? 'bg-white text-brand-600 shadow-sm'
                        : 'bg-brand-700 text-brand-100 hover:bg-brand-500 hover:text-white'
                    }`}
                  >
                    Ofis Paneli
                  </Link>
                  <Link
                    to="/dashboard"
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      !isAdminRoute
                        ? 'bg-white text-brand-600 shadow-sm'
                        : 'bg-brand-700 text-brand-100 hover:bg-brand-500 hover:text-white'
                    }`}
                  >
                    Müvekkil Görünümü
                  </Link>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2 md:gap-4">
              <NotificationBell />
              <span className="hidden md:inline text-sm text-white/90">{user?.full_name}</span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-sm text-brand-100 hover:text-white rounded-lg hover:bg-brand-500 transition-colors"
              >
                <LogOut size={18} />
                <span className="hidden md:inline">Çıkış</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex relative z-10 min-h-[calc(100vh-4rem)]">
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside 
          className={`
            fixed md:static inset-y-0 left-0 z-40
            w-64 bg-brand-700 shadow-xl transform transition-transform duration-300 ease-in-out
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            md:translate-x-0 md:h-auto h-full
          `}
        >
          <nav className="p-4 space-y-2 h-full overflow-y-auto">
            {/* Mobile Admin Toggle */}
            {isAdmin && (
              <div className="md:hidden mb-6 p-4 bg-brand-800 rounded-xl space-y-2">
                <p className="text-xs font-semibold text-brand-200 uppercase mb-2">Görünüm Değiştir</p>
                <Link
                  to="/admin/dashboard"
                  onClick={() => setIsSidebarOpen(false)}
                  className={`block w-full px-3 py-2 rounded-lg text-sm font-medium text-center transition-colors ${
                    isAdminRoute
                      ? 'bg-white text-brand-600'
                      : 'bg-brand-600 text-white border border-brand-500'
                  }`}
                >
                  Ofis Paneli
                </Link>
                <Link
                  to="/dashboard"
                  onClick={() => setIsSidebarOpen(false)}
                  className={`block w-full px-3 py-2 rounded-lg text-sm font-medium text-center transition-colors ${
                    !isAdminRoute
                      ? 'bg-white text-brand-600'
                      : 'bg-brand-600 text-white border border-brand-500'
                  }`}
                >
                  Müvekkil Görünümü
                </Link>
              </div>
            )}

            {isAdminRoute ? (
              /* Admin Menu */
              <>
                <Link
                  to="/admin/dashboard"
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    location.pathname === '/admin/dashboard' 
                      ? 'bg-brand-800 text-white shadow-sm' 
                      : 'text-brand-100 hover:bg-brand-600 hover:text-white'
                  }`}
                >
                  <LayoutDashboard size={20} />
                  <span>Dashboard</span>
                </Link>
                
                <Link
                  to="/admin/clients"
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    location.pathname === '/admin/clients' 
                      ? 'bg-brand-800 text-white shadow-sm' 
                      : 'text-brand-100 hover:bg-brand-600 hover:text-white'
                  }`}
                >
                  <Users size={20} />
                  <span>Müvekkiller</span>
                </Link>
                
                <Link
                  to="/admin/cases"
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    location.pathname === '/admin/cases' 
                      ? 'bg-brand-800 text-white shadow-sm' 
                      : 'text-brand-100 hover:bg-brand-600 hover:text-white'
                  }`}
                >
                  <Briefcase size={20} />
                  <span>Tüm Dosyalar</span>
                </Link>
                
                <Link
                  to="/admin/documents/upload"
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    location.pathname === '/admin/documents/upload' 
                      ? 'bg-brand-800 text-white shadow-sm' 
                      : 'text-brand-100 hover:bg-brand-600 hover:text-white'
                  }`}
                >
                  <Upload size={20} />
                  <span>Evrak Yükle</span>
                </Link>
                
                <Link
                  to="/admin/payments/create"
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    location.pathname === '/admin/payments/create' 
                      ? 'bg-brand-800 text-white shadow-sm' 
                      : 'text-brand-100 hover:bg-brand-600 hover:text-white'
                  }`}
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
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    location.pathname === '/dashboard'
                      ? 'bg-brand-800 text-white shadow-sm'
                      : 'text-brand-100 hover:bg-brand-600 hover:text-white'
                  }`}
                >
                  <Home size={20} />
                  <span>Ana Sayfa</span>
                </Link>
                
                <Link
                  to="/cases"
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    location.pathname === '/cases'
                      ? 'bg-brand-800 text-white shadow-sm'
                      : 'text-brand-100 hover:bg-brand-600 hover:text-white'
                  }`}
                >
                  <Briefcase size={20} />
                  <span>Dosyalarım</span>
                </Link>
                
                <Link
                  to="/documents"
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    location.pathname === '/documents'
                      ? 'bg-brand-800 text-white shadow-sm'
                      : 'text-brand-100 hover:bg-brand-600 hover:text-white'
                  }`}
                >
                  <FileText size={20} />
                  <span>Evraklarım</span>
                </Link>
                
                <Link
                  to="/payments"
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    location.pathname === '/payments'
                      ? 'bg-brand-800 text-white shadow-sm'
                      : 'text-brand-100 hover:bg-brand-600 hover:text-white'
                  }`}
                >
                  <CreditCard size={20} />
                  <span>Ödemeler</span>
                </Link>
                
                <Link
                  to="/notifications"
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    location.pathname === '/notifications'
                      ? 'bg-brand-800 text-white shadow-sm'
                      : 'text-brand-100 hover:bg-brand-600 hover:text-white'
                  }`}
                >
                  <Bell size={20} />
                  <span>Bildirimler</span>
                </Link>
                
                <Link
                  to="/profile"
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    location.pathname === '/profile'
                      ? 'bg-brand-800 text-white shadow-sm'
                      : 'text-brand-100 hover:bg-brand-600 hover:text-white'
                  }`}
                >
                  <User size={20} />
                  <span>Profilim</span>
                </Link>
              </>
            )}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
