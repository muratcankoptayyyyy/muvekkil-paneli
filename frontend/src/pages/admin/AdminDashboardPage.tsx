import { useQuery } from '@tanstack/react-query'
import api from '../../services/api'
import { Users, Briefcase, FileText, CreditCard, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function AdminDashboardPage() {
  const { data: stats } = useQuery({
    queryKey: ['admin-statistics'],
    queryFn: async () => {
      const response = await api.get('/admin/statistics')
      return response.data
    },
  })

  const statCards = [
    {
      title: 'Toplam Müvekkil',
      value: stats?.total_clients || 0,
      icon: Users,
      color: 'bg-blue-500',
      link: '/admin/clients',
    },
    {
      title: 'Toplam Dosya',
      value: stats?.total_cases || 0,
      icon: Briefcase,
      color: 'bg-green-500',
      link: '/admin/cases',
    },
    {
      title: 'Aktif Dosyalar',
      value: stats?.active_cases || 0,
      icon: TrendingUp,
      color: 'bg-purple-500',
      link: '/admin/cases?status=active',
    },
    {
      title: 'Bekleyen Ödemeler',
      value: stats?.pending_payments || 0,
      icon: CreditCard,
      color: 'bg-orange-500',
      link: '/admin/payments?status=pending',
    },
    {
      title: 'Toplam Evrak',
      value: stats?.total_documents || 0,
      icon: FileText,
      color: 'bg-indigo-500',
      link: '/admin/documents',
    },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Ofis Yönetim Paneli
        </h1>
        <p className="text-gray-600">
          Tüm dosyalar, müvekkiller ve ödemeleri buradan yönetebilirsiniz
        </p>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Link
              key={stat.title}
              to={stat.link}
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="text-white" size={24} />
                </div>
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-1">
                {stat.title}
              </h3>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            </Link>
          )
        })}
      </div>

      {/* Hızlı İşlemler */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/admin/cases/new"
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-sm p-6 text-white hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-4 rounded-lg">
              <Briefcase size={32} />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1">Yeni Dosya Aç</h3>
              <p className="text-blue-100 text-sm">Müvekkil için dosya oluştur</p>
            </div>
          </div>
        </Link>

        <Link
          to="/admin/payments/create"
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-sm p-6 text-white hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-4 rounded-lg">
              <CreditCard size={32} />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1">Ödeme Talebi Oluştur</h3>
              <p className="text-green-100 text-sm">Avukatlık/bilirkişi ücreti ekle</p>
            </div>
          </div>
        </Link>

        <Link
          to="/admin/documents/upload"
          className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-sm p-6 text-white hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-4 rounded-lg">
              <FileText size={32} />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1">Evrak Yükle</h3>
              <p className="text-purple-100 text-sm">Dosyaya evrak ekle</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}
