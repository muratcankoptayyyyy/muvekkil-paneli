import { useState, useEffect } from 'react'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import api from '../../services/api'
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react'

export default function AdminDocumentsUploadPage() {
  const [searchParams] = useSearchParams()
  const initialCaseId = searchParams.get('case_id') || ''
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [caseId, setCaseId] = useState(initialCaseId)
  const [documentType, setDocumentType] = useState('other')
  const [isVisibleToClient, setIsVisibleToClient] = useState(true)
  const [uploadProgress, setUploadProgress] = useState(0)
  const queryClient = useQueryClient()

  // Update caseId if URL param changes
  useEffect(() => {
    const urlCaseId = searchParams.get('case_id')
    if (urlCaseId) {
      setCaseId(urlCaseId)
    }
  }, [searchParams])

  const { data: cases } = useQuery({
    queryKey: ['admin-cases-for-upload'],
    queryFn: async () => {
      const response = await api.get('/admin/cases')
      return response.data
    },
  })

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await api.post('/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          )
          setUploadProgress(percentCompleted)
        },
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
      alert('Evrak başarıyla yüklendi')
      setSelectedFile(null)
      setCaseId('')
      setUploadProgress(0)
    },
    onError: (error: any) => {
      alert(error.response?.data?.detail || 'Yükleme başarısız')
      setUploadProgress(0)
    },
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      
      // Dosya boyutu kontrolü (10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('Dosya boyutu 10MB\'dan küçük olmalıdır')
        return
      }

      // Dosya tipi kontrolü
      const allowedExtensions = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'xlsx', 'xls', 'txt']
      const extension = file.name.split('.').pop()?.toLowerCase()
      
      if (!extension || !allowedExtensions.includes(extension)) {
        alert('Desteklenen formatlar: PDF, DOC, DOCX, JPG, JPEG, PNG, XLSX, XLS, TXT')
        return
      }

      setSelectedFile(file)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedFile || !caseId) {
      alert('Lütfen dosya ve dava seçin')
      return
    }

    const formData = new FormData()
    formData.append('file', selectedFile)
    formData.append('case_id', caseId)
    formData.append('document_type', documentType)
    formData.append('is_visible_to_client', String(isVisibleToClient))

    uploadMutation.mutate(formData)
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Evrak Yükle</h1>
        <p className="text-gray-600">Dosyalara evrak ekleyin</p>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Dosya Seçimi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dosya
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-400 transition-colors">
                <div className="space-y-1 text-center">
                  {selectedFile ? (
                    <div className="flex items-center gap-3 text-green-600">
                      <CheckCircle size={24} />
                      <span className="text-sm font-medium">{selectedFile.name}</span>
                      <span className="text-xs text-gray-500">
                        ({(selectedFile.size / 1024).toFixed(2)} KB)
                      </span>
                    </div>
                  ) : (
                    <>
                      <FileText className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500">
                          <span>Dosya seçin</span>
                          <input
                            type="file"
                            className="sr-only"
                            onChange={handleFileChange}
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx,.xls,.txt"
                          />
                        </label>
                        <p className="pl-1">veya sürükleyip bırakın</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PDF, DOC, DOCX, JPG, PNG, XLSX, XLS, TXT (max 10MB)
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Dava Seçimi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dava
              </label>
              <select
                value={caseId}
                onChange={(e) => setCaseId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Dava seçin</option>
                {cases?.items?.map((caseItem: any) => (
                  <option key={caseItem.id} value={caseItem.id}>
                    {caseItem.case_number} - {caseItem.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Evrak Tipi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Evrak Tipi
              </label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="dilekce">Dilekçe</option>
                <option value="karar">Karar</option>
                <option value="zabıt">Zabıt</option>
                <option value="belge">Belge</option>
                <option value="rapor">Rapor</option>
                <option value="other">Diğer</option>
              </select>
            </div>

            {/* Görünürlük */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="visibility"
                checked={isVisibleToClient}
                onChange={(e) => setIsVisibleToClient(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="visibility" className="text-sm font-medium text-gray-700">
                Müvekkile göster
              </label>
            </div>

            {/* Uyarı */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertCircle className="text-blue-600 flex-shrink-0" size={20} />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Bilgilendirme:</p>
                  <p>
                    Müvekkile gösterme seçeneği kapalıysa, sadece ofis personeli bu
                    evrakı görebilir. Müvekkil panelinde görünmez.
                  </p>
                </div>
              </div>
            </div>

            {/* Yükleme Progress Bar */}
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            )}

            {/* Gönder Butonu */}
            <button
              type="submit"
              disabled={uploadMutation.isPending || !selectedFile || !caseId}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
            >
              <Upload size={20} />
              {uploadMutation.isPending ? 'Yükleniyor...' : 'Evrak Yükle'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
