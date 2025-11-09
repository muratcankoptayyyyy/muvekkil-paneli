import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../services/api'
import { Search, Briefcase, Plus, Edit2, Trash2, Eye } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function AdminCasesPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [caseType, setCaseType] = useState('')
  const queryClient = useQueryClient()

  const { data: cases, isLoading } = useQuery({
    queryKey: ['admin-cases', search, status, caseType],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (status) params.append('status', status)
      if (caseType) params.append('case_type', caseType)
      
      const response = await api.get(`/admin/cases?${params}`)
      return response.data
    },
  })

  const deleteCaseMutation = useMutation({
    mutationFn: (caseId: string) => api.delete(`/admin/cases/${caseId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-cases'] })
      alert('Dosya silindi')
    },
  })

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
      archived: 'bg-blue-100 text-blue-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      active: 'Aktif',
      closed: 'Kapalı',
      pending: 'Beklemede',
      archived: 'Arşivlenmiş',
    }
    return labels[status] || status
  }

  const getCaseTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      civil: 'Hukuk',
      criminal: 'Ceza',
      commercial: 'Ticaret',
      family: 'Aile',
      labor: 'İş Hukuku',
      administrative: 'İdare',
      execution: 'İcra',
      other: 'Diğer',
    }
    return labels[type] || type
  }

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dosyalar</h1>
          <p className="text-gray-600">Tüm davaları görüntüle ve yönet</p>
        </div>
        <Link
          to="/admin/cases/new"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
        >
          <Plus size={20} />
          Yeni Dosya
        </Link>
      </div>

      {/* Filtreler */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Dosya numarası veya başlık ile ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tüm Durumlar</option>
            <option value="active">Aktif</option>
            <option value="pending">Beklemede</option>
            <option value="closed">Kapalı</option>
            <option value="archived">Arşivlenmiş</option>
          </select>

          <select
            value={caseType}
            onChange={(e) => setCaseType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tüm Tipler</option>
            <option value="civil">Hukuk</option>
            <option value="criminal">Ceza</option>
            <option value="commercial">Ticaret</option>
            <option value="family">Aile</option>
            <option value="labor">İş Hukuku</option>
            <option value="administrative">İdare</option>
            <option value="execution">İcra</option>
            <option value="other">Diğer</option>
          </select>
        </div>
      </div>

      {/* Dosya Listesi */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {cases?.items?.map((caseItem: any) => (
            <div
              key={caseItem.id}
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Briefcase className="text-blue-600" size={20} />
                    <h3 className="text-lg font-semibold text-gray-900">
                      {caseItem.title}
                    </h3>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        caseItem.status
                      )}`}
                    >
                      {getStatusLabel(caseItem.status)}
                    </span>
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                      {getCaseTypeLabel(caseItem.case_type)}
                    </span>
                  </div>

                  <p className="text-gray-600 text-sm mb-3">{caseItem.description}</p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Dosya No:</span>
                      <p className="font-medium">{caseItem.case_number}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Mahkeme:</span>
                      <p className="font-medium">{caseItem.court || '-'}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Esas No:</span>
                      <p className="font-medium">{caseItem.esas_no || '-'}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Duruşma:</span>
                      <p className="font-medium">
                        {caseItem.next_hearing
                          ? new Date(caseItem.next_hearing).toLocaleDateString('tr-TR')
                          : '-'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <Link
                    to={`/cases/${caseItem.id}`}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Detay"
                  >
                    <Eye size={18} />
                  </Link>
                  <Link
                    to={`/admin/cases/${caseItem.id}/edit`}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Düzenle"
                  >
                    <Edit2 size={18} />
                  </Link>
                  <button
                    onClick={() => {
                      if (confirm('Bu dosyayı silmek istediğinizden emin misiniz?')) {
                        deleteCaseMutation.mutate(caseItem.id)
                      }
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Sil"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {cases?.items?.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm">
              <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Dosya bulunamadı
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Yeni dosya oluşturmak için yukarıdaki butonu kullanın
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
