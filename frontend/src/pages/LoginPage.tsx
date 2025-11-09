import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '../services/api'
import { useAuthStore } from '../store/authStore'
import { LogIn } from 'lucide-react'

export default function LoginPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setAuth(data.user, data.access_token)
      
      // Role-based redirect
      if (data.user.user_type === 'admin' || data.user.user_type === 'lawyer') {
        navigate('/admin/dashboard')
      } else {
        navigate('/dashboard')
      }
    },
    onError: (error: any) => {
      alert(error.response?.data?.detail || 'Giriş başarısız')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    loginMutation.mutate({ email: username, password })
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: 'linear-gradient(to bottom right, #457c7d, #548c8d)' }}>
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        {/* Spinning circles */}
        <div className="absolute w-64 h-64 border-4 border-white rounded-full top-10 -left-32 animate-spin" style={{ animationDuration: '20s' }}></div>
        <div className="absolute w-96 h-96 border-4 border-white rounded-full top-40 right-20" style={{ animation: 'spin 15s linear infinite reverse' }}></div>
        <div className="absolute w-48 h-48 border-4 border-white rounded-full bottom-20 left-1/4" style={{ animation: 'float 6s ease-in-out infinite' }}></div>
        <div className="absolute w-72 h-72 border-4 border-white rounded-full bottom-40 right-1/3 animate-pulse" style={{ animationDuration: '4s' }}></div>
        
        {/* Hexagon patterns */}
        <svg className="absolute top-1/4 left-1/3 w-32 h-32" style={{ animation: 'float 8s ease-in-out infinite' }} viewBox="0 0 100 100">
          <polygon points="50,10 90,30 90,70 50,90 10,70 10,30" fill="none" stroke="white" strokeWidth="2"/>
        </svg>
        <svg className="absolute bottom-1/3 right-1/4 w-24 h-24 animate-spin" style={{ animationDuration: '25s' }} viewBox="0 0 100 100">
          <polygon points="50,10 90,30 90,70 50,90 10,70 10,30" fill="none" stroke="white" strokeWidth="2"/>
        </svg>
        
        {/* Diagonal lines */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute w-1 h-full bg-white opacity-10 transform rotate-45 -translate-x-32" style={{ animation: 'slideRight 8s linear infinite' }}></div>
          <div className="absolute w-1 h-full bg-white opacity-10 transform rotate-45 translate-x-32" style={{ animation: 'slideRight 8s linear infinite', animationDelay: '2s' }}></div>
          <div className="absolute w-1 h-full bg-white opacity-10 transform rotate-45 translate-x-96" style={{ animation: 'slideRight 8s linear infinite', animationDelay: '4s' }}></div>
        </div>
      </div>

      <div className="max-w-md w-full relative z-10">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ backgroundColor: '#548c8d' }}>
              <LogIn className="text-white" size={32} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Hoş Geldiniz
            </h1>
            <p className="text-gray-600">
              Müvekkil panelinize giriş yapın
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Kullanıcı Adı
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none transition"
                onFocus={(e) => e.target.style.borderColor = '#548c8d'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                placeholder="TC Kimlik No, Vergi No veya Email"
              />
              <p className="mt-1 text-xs text-gray-500">
                TC Kimlik No, Vergi No veya Email ile giriş yapabilirsiniz
              </p>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Şifre
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none transition"
                onFocus={(e) => e.target.style.borderColor = '#548c8d'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full text-white py-3 rounded-lg font-semibold transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              style={{ backgroundColor: loginMutation.isPending ? '#9ca3af' : '#548c8d' }}
              onMouseEnter={(e) => !loginMutation.isPending && (e.currentTarget.style.backgroundColor = '#3d6566')}
              onMouseLeave={(e) => !loginMutation.isPending && (e.currentTarget.style.backgroundColor = '#548c8d')}
            >
              {loginMutation.isPending ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p>Kullanıcı adı ve şifrenizi avukatınızdan alabilirsiniz.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
