import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '../../services/api'
import { Search, Users, Building2, User, Eye, Plus } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

export default function AdminClientsPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [userType, setUserType] = useState<string>('')

  const { data: clients, isLoading } = useQuery({
    queryKey: ['admin-clients', search, userType],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (userType) params.append('user_type', userType)
      
      const response = await api.get(`/admin/clients?${params}`)
      // Backend returns list directly, not paginated object with items
      return Array.isArray(response.data) ? response.data : response.data.items || []
    },
  })

  const getUserTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      individual: 'Bireysel',
      corporate: 'Kurumsal',
      admin: 'Yönetici',
      lawyer: 'Avukat',
    }
    return labels[type] || type
  }

  const getUserTypeIcon = (type: string) => {
    return type === 'corporate' ? Building2 : User
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Müvekkiller</h1>
          <p className="text-gray-600">Tüm müvekkilleri görüntüle ve yönet</p>
        </div>
        <button
          onClick={() => navigate('/admin/clients/new')}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Yeni Müvekkil Ekle
        </button>
      </div>

      {/* Filtreler */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="İsim, email, TC Kimlik veya Vergi No ile ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={userType}
            onChange={(e) => setUserType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tüm Tipler</option>
            <option value="individual">Bireysel</option>
            <option value="corporate">Kurumsal</option>
          </select>
        </div>
      </div>

      {/* Müvekkil Listesi */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Müvekkil
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tip
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İletişim
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kimlik/Vergi No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clients?.map((client: any) => {
                const TypeIcon = getUserTypeIcon(client.user_type)
                return (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <TypeIcon className="text-blue-600" size={20} />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {client.full_name || client.company_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {client.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {getUserTypeLabel(client.user_type)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{client.email}</div>
                      <div className="text-sm text-gray-500">{client.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {client.tc_kimlik || client.tax_number || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        to={`/admin/clients/${client.id}`}
                        className="text-blue-600 hover:text-blue-900 inline-flex items-center gap-1"
                      >
                        <Eye size={16} />
                        Detay
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {clients?.length === 0 && (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Müvekkil bulunamadı
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Arama kriterlerinizi değiştirerek tekrar deneyin
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
