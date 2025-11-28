import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../services/api'
import { Briefcase, Save, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function AdminCaseCreatePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  
  const [formData, setFormData] = useState({
    title: '',
    case_number: '',
    case_type: 'civil',
    client_id: '',
    description: '',
    court_name: '',
    file_number: '',
    next_hearing_date: '',
  })

  // Müvekkilleri getir
  const { data: clientsData, isLoading: isLoadingClients } = useQuery({
    queryKey: ['admin-clients-list'],
    queryFn: async () => {
      // Tüm müvekkilleri getirmek için limit artırılabilir veya pagination yönetilebilir
      // Şimdilik basitçe listeliyoruz
      const response = await api.get('/admin/clients?limit=100')
      return response.data
    },
  })

  const createCaseMutation = useMutation({
    mutationFn: (data: any) => api.post('/cases/', data), // /admin/cases yerine /cases/ kullanılıyor (backend router yapısına göre)
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-cases'] })
      alert('Dosya başarıyla oluşturuldu. Evrak yükleme sayfasına yönlendiriliyorsunuz.')
      // Redirect to document upload page with the new case ID
      navigate(`/admin/documents/upload?case_id=${data.data.id}`)
    },
    onError: (error: any) => {
      alert(error.response?.data?.detail || 'Dosya oluşturulurken bir hata oluştu')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Boş client_id kontrolü
    if (!formData.client_id) {
      alert('Lütfen bir müvekkil seçin')
      return
    }

    const payload = {
      ...formData,
      client_id: parseInt(formData.client_id),
      next_hearing_date: formData.next_hearing_date ? new Date(formData.next_hearing_date).toISOString() : null
    }

    createCaseMutation.mutate(payload)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div>
      <div className="mb-8">
        <Link to="/admin/cases" className="text-gray-500 hover:text-gray-700 flex items-center gap-2 mb-4">
          <ArrowLeft size={20} />
          Dosyalara Dön
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Yeni Dosya Oluştur</h1>
        <p className="text-gray-600">Müvekkil için yeni bir dava dosyası açın</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-8 max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Temel Bilgiler */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dosya Başlığı *
              </label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="Örn: Tazminat Davası"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dosya Numarası (Sistem) *
              </label>
              <input
                type="text"
                name="case_number"
                required
                value={formData.case_number}
                onChange={handleChange}
                placeholder="Örn: 2024/001"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Müvekkil ve Tip Seçimi */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Müvekkil Seçimi *
              </label>
              <select
                name="client_id"
                required
                value={formData.client_id}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Müvekkil Seçin</option>
                {isLoadingClients ? (
                  <option disabled>Yükleniyor...</option>
                ) : (
                  clientsData?.items?.map((client: any) => (
                    <option key={client.id} value={client.id}>
                      {client.name} ({client.email})
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dava Tipi *
              </label>
              <select
                name="case_type"
                required
                value={formData.case_type}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="civil">Hukuk</option>
                <option value="criminal">Ceza</option>
                <option value="commercial">Ticaret</option>
                <option value="labor">İş Hukuku</option>
                <option value="administrative">İdare</option>
                <option value="execution">İcra</option>
                <option value="family">Aile</option>
                <option value="other">Diğer</option>
              </select>
            </div>
          </div>

          {/* Mahkeme Bilgileri */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mahkeme Adı
              </label>
              <input
                type="text"
                name="court_name"
                value={formData.court_name}
                onChange={handleChange}
                placeholder="Örn: İstanbul 1. Asliye Hukuk"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Esas No
              </label>
              <input
                type="text"
                name="file_number"
                value={formData.file_number}
                onChange={handleChange}
                placeholder="Örn: 2023/123"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Tarih ve Açıklama */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sonraki Duruşma Tarihi
            </label>
            <input
              type="datetime-local"
              name="next_hearing_date"
              value={formData.next_hearing_date}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Açıklama
            </label>
            <textarea
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="Dosya hakkında notlar..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={createCaseMutation.isPending}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:bg-blue-400"
            >
              <Save size={20} />
              {createCaseMutation.isPending ? 'Oluşturuluyor...' : 'Dosyayı Oluştur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
