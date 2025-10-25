import { useAuthStore } from '../store/authStore'
import { FileText, CreditCard, Bell, TrendingUp } from 'lucide-react'

export default function DashboardPage() {
  const { user } = useAuthStore()

  const stats = [
    {
      title: 'Aktif Dosyalar',
      value: '3',
      icon: FileText,
      color: 'bg-blue-500',
    },
    {
      title: 'Bekleyen Ödemeler',
      value: '1',
      icon: CreditCard,
      color: 'bg-green-500',
    },
    {
      title: 'Yeni Bildirimler',
      value: '5',
      icon: Bell,
      color: 'bg-yellow-500',
    },
    {
      title: 'Toplam Dosya',
      value: '12',
      icon: TrendingUp,
      color: 'bg-purple-500',
    },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Hoş Geldiniz, {user?.full_name}
        </h1>
        <p className="text-gray-600">
          Müvekkil panelinize genel bakış
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="text-white" size={24} />
              </div>
              <span className="text-3xl font-bold text-gray-900">
                {stat.value}
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">
              {stat.title}
            </h3>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Cases */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Son Dosyalar
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-semibold text-gray-900">
                  Dava No: 2024/123
                </h3>
                <p className="text-sm text-gray-600">İş Hukuku</p>
              </div>
              <span className="px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full">
                Devam Ediyor
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-semibold text-gray-900">
                  Dava No: 2024/98
                </h3>
                <p className="text-sm text-gray-600">Ticaret Hukuku</p>
              </div>
              <span className="px-3 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full">
                Tamamlandı
              </span>
            </div>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Yaklaşan Etkinlikler
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="bg-blue-600 text-white rounded-lg p-2 text-center min-w-[60px]">
                <div className="text-2xl font-bold">28</div>
                <div className="text-xs">Ekim</div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  Duruşma
                </h3>
                <p className="text-sm text-gray-600">
                  Ankara 5. Asliye Hukuk Mahkemesi
                </p>
                <p className="text-xs text-gray-500 mt-1">Saat: 10:00</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="bg-green-600 text-white rounded-lg p-2 text-center min-w-[60px]">
                <div className="text-2xl font-bold">05</div>
                <div className="text-xs">Kasım</div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  Bilirkişi Raporu
                </h3>
                <p className="text-sm text-gray-600">
                  Rapor teslim tarihi
                </p>
                <p className="text-xs text-gray-500 mt-1">Son tarih</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
