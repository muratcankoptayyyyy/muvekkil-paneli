import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { adminApi } from '../../services/api'
import { ArrowLeft, Save, User, Building, CreditCard, MapPin } from 'lucide-react'

export default function AdminClientCreatePage() {
  const navigate = useNavigate()
  const [userType, setUserType] = useState<'individual' | 'corporate'>('individual')
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [createdUser, setCreatedUser] = useState<{ 
    email: string; 
    temp_password: string;
    tc_kimlik?: string;
    tax_number?: string;
  } | null>(null)

  const createClientMutation = useMutation({
    mutationFn: adminApi.createClient,
    onSuccess: (data) => {
      setCreatedUser({
        email: data.user.email,
        temp_password: data.temp_password,
        tc_kimlik: data.user.tc_kimlik,
        tax_number: data.user.tax_number
      })
      setShowSuccessModal(true)
    },
    onError: (error: any) => {
      alert('Hata: ' + (error.response?.data?.detail || 'Bir hata oluştu'))
    }
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const getOptionalValue = (key: string) => {
      const value = formData.get(key) as string
      return value ? value : undefined
    }

    const data = {
      email: getOptionalValue('email'),
      full_name: formData.get('full_name') as string,
      phone: getOptionalValue('phone'),
      user_type: userType,
      tc_kimlik: getOptionalValue('tc_kimlik'),
      tax_number: getOptionalValue('tax_number'),
      company_name: getOptionalValue('company_name'),
      address: getOptionalValue('address'),
      bank_account_info: getOptionalValue('bank_account_info'),
    }

    createClientMutation.mutate(data as any)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/clients')}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Yeni Müvekkil Ekle</h1>
          <p className="text-gray-600">Sisteme yeni bir müvekkil kaydı oluşturun</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setUserType('individual')}
              className={`flex-1 py-3 px-4 rounded-lg border-2 flex items-center justify-center gap-2 transition-all ${
                userType === 'individual'
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-600'
              }`}
            >
              <User size={20} />
              <span className="font-medium">Bireysel Müvekkil</span>
            </button>
            <button
              type="button"
              onClick={() => setUserType('corporate')}
              className={`flex-1 py-3 px-4 rounded-lg border-2 flex items-center justify-center gap-2 transition-all ${
                userType === 'corporate'
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-600'
              }`}
            >
              <Building size={20} />
              <span className="font-medium">Kurumsal Müvekkil</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                {userType === 'individual' ? 'Ad Soyad' : 'Yetkili Adı Soyadı'}
              </label>
              <input
                name="full_name"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Örn: Ahmet Yılmaz"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">E-posta Adresi</label>
              <input
                name="email"
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="ornek@email.com (Opsiyonel)"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Telefon Numarası</label>
              <input
                name="phone"
                type="tel"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="05XX XXX XX XX (Opsiyonel)"
              />
            </div>

            {userType === 'individual' ? (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">TC Kimlik No</label>
                <input
                  name="tc_kimlik"
                  maxLength={11}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="11 haneli TC Kimlik No"
                />
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Şirket Ünvanı</label>
                  <input
                    name="company_name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Şirket tam ünvanı"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Vergi Kimlik No</label>
                  <input
                    name="tax_number"
                    maxLength={10}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="10 haneli Vergi No"
                  />
                </div>
              </>
            )}

            <div className="col-span-full space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <MapPin size={16} />
                Adres Bilgileri
              </label>
              <textarea
                name="address"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Tam adres..."
              />
            </div>

            <div className="col-span-full space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <CreditCard size={16} />
                Banka Hesap Bilgileri
              </label>
              <textarea
                name="bank_account_info"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Banka Adı, IBAN vb."
              />
            </div>
          </div>

          <div className="flex justify-end pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={createClientMutation.isPending}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Save size={20} />
              {createClientMutation.isPending ? 'Kaydediliyor...' : 'Müvekkili Kaydet'}
            </button>
          </div>
        </form>
      </div>

      {/* Success Modal */}
      {showSuccessModal && createdUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Müvekkil Oluşturuldu!</h3>
              <p className="text-gray-600 mt-2">
                Müvekkil hesabı başarıyla oluşturuldu. Lütfen aşağıdaki giriş bilgilerini müvekkil ile paylaşın.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 space-y-3 mb-6 border border-gray-200">
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Kullanıcı Adı (Giriş İçin)</p>
                <p className="font-mono text-lg text-gray-900 select-all">
                  {createdUser.email.startsWith('no-email-') 
                    ? (createdUser.tc_kimlik || createdUser.tax_number || 'TC/Vergi No ile giriş yapınız') 
                    : createdUser.email}
                </p>
                {createdUser.email.startsWith('no-email-') && (
                  <p className="text-xs text-amber-600 mt-1">
                    *E-posta girilmediği için TC Kimlik veya Vergi No ile giriş yapılmalıdır.
                  </p>
                )}
              </div>
              <div className="pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500 uppercase font-semibold">Geçici Şifre</p>
                <p className="font-mono text-lg text-blue-600 font-bold select-all">{createdUser.temp_password}</p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  const username = createdUser.email.startsWith('no-email-') 
                    ? (createdUser.tc_kimlik || createdUser.tax_number || 'TC/Vergi No') 
                    : createdUser.email
                  
                  navigator.clipboard.writeText(
                    `Müvekkil Paneli Giriş Bilgileri:\nKullanıcı Adı: ${username}\nŞifre: ${createdUser.temp_password}\nPanel Adresi: ${window.location.origin}`
                  )
                  alert('Bilgiler kopyalandı!')
                }}
                className="w-full py-2 px-4 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                Bilgileri Kopyala
              </button>
              <button
                onClick={() => {
                  setShowSuccessModal(false)
                  navigate('/admin/clients')
                }}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Tamam, Listeye Dön
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
