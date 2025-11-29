import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '../services/api'
import { useAuthStore } from '../store/authStore'
import { LogIn } from 'lucide-react'
import AnimatedBackground from '../components/AnimatedBackground'

export default function LoginPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [show2FA, setShow2FA] = useState(false)
  const [otpCode, setOtpCode] = useState('')

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
      if (error.response?.status === 401 && error.response?.data?.detail === "2FA code required") {
        setShow2FA(true)
      } else {
        alert(error.response?.data?.detail || 'Giriş başarısız')
      }
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    loginMutation.mutate({ email: username, password, otp_code: otpCode })
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: 'linear-gradient(to bottom right, #457c7d, #548c8d)' }}>
      <AnimatedBackground />

      <div className="max-w-md w-full relative z-10">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ backgroundColor: '#548c8d' }}>
              <LogIn className="text-white" size={32} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {show2FA ? '2FA Doğrulama' : 'Hoş Geldiniz'}
            </h1>
            <p className="text-gray-600">
              {show2FA ? 'Lütfen doğrulama kodunu giriniz' : 'Müvekkil paneli giriş'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!show2FA ? (
              <>
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
              </>
            ) : (
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                  Doğrulama Kodu
                </label>
                <input
                  id="otp"
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none transition text-center text-2xl tracking-widest"
                  onFocus={(e) => e.target.style.borderColor = '#548c8d'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  placeholder="000000"
                  maxLength={6}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full text-white py-3 rounded-lg font-semibold transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              style={{ backgroundColor: loginMutation.isPending ? '#9ca3af' : '#548c8d' }}
              onMouseEnter={(e) => !loginMutation.isPending && (e.currentTarget.style.backgroundColor = '#3d6566')}
              onMouseLeave={(e) => !loginMutation.isPending && (e.currentTarget.style.backgroundColor = '#548c8d')}
            >
              {loginMutation.isPending ? 'Giriş yapılıyor...' : (show2FA ? 'Doğrula' : 'Giriş Yap')}
            </button>
            
            {show2FA && (
              <button
                type="button"
                onClick={() => setShow2FA(false)}
                className="w-full text-gray-600 text-sm hover:underline"
              >
                Geri Dön
              </button>
            )}
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p>Kullanıcı adı ve şifrenizi avukatınızdan alabilirsiniz.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
