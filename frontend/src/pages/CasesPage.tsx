import { useQuery } from '@tanstack/react-query'
import api from '../services/api'
import { FileText, Calendar, Scale } from 'lucide-react'
import type { Case } from '../types'

export default function CasesPage() {
  const { data: casesData, isLoading } = useQuery({
    queryKey: ['cases'],
    queryFn: async () => {
      const response = await api.get<{ cases: Case[]; total: number }>('/cases')
      return response.data
    },
  })

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-700',
      in_progress: 'bg-blue-100 text-blue-700',
      waiting_court: 'bg-purple-100 text-purple-700',
      completed: 'bg-green-100 text-green-700',
      archived: 'bg-gray-100 text-gray-700',
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
  }

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      pending: 'Beklemede',
      in_progress: 'Devam Ediyor',
      waiting_court: 'Mahkeme Bekliyor',
      completed: 'Tamamlandı',
      archived: 'Arşivlendi',
    }
    return texts[status] || status
  }

  const getCaseTypeText = (type: string) => {
    const types: Record<string, string> = {
      civil: 'Hukuk',
      criminal: 'Ceza',
      commercial: 'Ticaret',
      labor: 'İş',
      administrative: 'İdare',
      execution: 'İcra',
      other: 'Diğer',
    }
    return types[type] || type
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Yükleniyor...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dosyalarım
          </h1>
          <p className="text-gray-600">
            Tüm dava ve dosyalarınızı buradan takip edebilirsiniz
          </p>
        </div>
        <div className="text-sm text-gray-600">
          Toplam: {casesData?.total || 0} dosya
        </div>
      </div>

      {casesData?.cases && casesData.cases.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {casesData.cases.map((caseItem) => (
            <div
              key={caseItem.id}
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <FileText className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {caseItem.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Dosya No: {caseItem.case_number}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(caseItem.status)}`}>
                  {getStatusText(caseItem.status)}
                </span>
              </div>

              {caseItem.description && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {caseItem.description}
                </p>
              )}

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Scale size={16} />
                  <span>Tür: {getCaseTypeText(caseItem.case_type)}</span>
                </div>
                
                {caseItem.court_name && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <FileText size={16} />
                    <span>{caseItem.court_name}</span>
                  </div>
                )}

                {caseItem.next_hearing_date && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar size={16} />
                    <span>
                      Sonraki Duruşma: {new Date(caseItem.next_hearing_date).toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold">
                  Detayları Görüntüle
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="text-gray-400" size={32} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Henüz dosya bulunmuyor
          </h3>
          <p className="text-gray-600">
            Avukatınız tarafından dosyalarınız eklendiğinde burada görüntülenecektir.
          </p>
        </div>
      )}
    </div>
  )
}
