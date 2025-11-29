import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { casesApi } from '../services/api'
import CaseTimeline from '../components/CaseTimeline'
import { ArrowLeft, Calendar, FileText, Scale, Building } from 'lucide-react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

export default function CaseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const caseId = parseInt(id || '0')

  const { data: caseData, isLoading: isCaseLoading } = useQuery({
    queryKey: ['case', caseId],
    queryFn: () => casesApi.getCase(caseId),
    enabled: !!caseId,
  })

  const { data: timelineEvents, isLoading: isTimelineLoading } = useQuery({
    queryKey: ['case-timeline', caseId],
    queryFn: () => casesApi.getCaseTimeline(caseId),
    enabled: !!caseId,
  })

  if (isCaseLoading || isTimelineLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Yükleniyor...</div>
      </div>
    )
  }

  if (!caseData) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Dosya Bulunamadı</h2>
        <button
          onClick={() => navigate('/cases')}
          className="mt-4 text-blue-600 hover:text-blue-800"
        >
          Dosyalara Dön
        </button>
      </div>
    )
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/cases')}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{caseData.title}</h1>
          <p className="text-gray-600">Dosya No: {caseData.case_number}</p>
        </div>
      </div>

      {/* Case Info Card */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Scale className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Dava Türü</p>
              <p className="font-medium text-gray-900">{getCaseTypeText(caseData.case_type)}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Building className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Mahkeme</p>
              <p className="font-medium text-gray-900">{caseData.court_name || '-'}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <FileText className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Dosya Durumu</p>
              <p className="font-medium text-gray-900">{getStatusText(caseData.status)}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-orange-50 rounded-lg">
              <Calendar className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Sonraki Duruşma</p>
              <p className="font-medium text-gray-900">
                {caseData.next_hearing_date 
                  ? format(new Date(caseData.next_hearing_date), 'd MMMM yyyy', { locale: tr })
                  : '-'}
              </p>
            </div>
          </div>
        </div>

        {caseData.description && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Açıklama</h3>
            <p className="text-gray-600">{caseData.description}</p>
          </div>
        )}
      </div>

      {/* Timeline Section */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-6">Dava Süreci</h2>
        <CaseTimeline 
          stages={caseData.stages || []} 
          events={timelineEvents || []} 
        />
      </div>
    </div>
  )
}