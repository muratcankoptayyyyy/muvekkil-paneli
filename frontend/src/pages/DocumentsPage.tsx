import { FileText, Download, Eye } from 'lucide-react'

export default function DocumentsPage() {
  // Mock data - will be replaced with real API call
  const documents = [
    {
      id: 1,
      original_filename: 'Dilekcemiz_2024.pdf',
      document_type: 'petition',
      file_size: 245678,
      uploaded_at: '2024-10-20T10:30:00',
      case_id: 1,
    },
    {
      id: 2,
      original_filename: 'Sozlesme_Taslagi.pdf',
      document_type: 'contract',
      file_size: 512340,
      uploaded_at: '2024-10-18T14:20:00',
      case_id: 1,
    },
    {
      id: 3,
      original_filename: 'Mahkeme_Karari.pdf',
      document_type: 'decision',
      file_size: 189456,
      uploaded_at: '2024-10-15T09:15:00',
      case_id: 2,
    },
  ]

  const getDocumentTypeText = (type: string) => {
    const types: Record<string, string> = {
      contract: 'Sözleşme',
      petition: 'Dilekçe',
      decision: 'Karar',
      evidence: 'Delil',
      correspondence: 'Yazışma',
      invoice: 'Fatura',
      other: 'Diğer',
    }
    return types[type] || type
  }

  const getDocumentTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      contract: 'bg-blue-100 text-blue-700',
      petition: 'bg-purple-100 text-purple-700',
      decision: 'bg-green-100 text-green-700',
      evidence: 'bg-yellow-100 text-yellow-700',
      correspondence: 'bg-pink-100 text-pink-700',
      invoice: 'bg-orange-100 text-orange-700',
      other: 'bg-gray-100 text-gray-700',
    }
    return colors[type] || 'bg-gray-100 text-gray-700'
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Evraklarım
        </h1>
        <p className="text-gray-600">
          Dosyalarınıza ait tüm evraklar
        </p>
      </div>

      {documents.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dosya Adı
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tür
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Boyut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tarih
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="bg-blue-100 p-2 rounded-lg mr-3">
                        <FileText className="text-blue-600" size={20} />
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {doc.original_filename}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getDocumentTypeColor(doc.document_type)}`}>
                      {getDocumentTypeText(doc.document_type)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {formatFileSize(doc.file_size)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(doc.uploaded_at).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-700 mr-4">
                      <Eye size={18} />
                    </button>
                    <button className="text-green-600 hover:text-green-700">
                      <Download size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="text-gray-400" size={32} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Henüz evrak bulunmuyor
          </h3>
          <p className="text-gray-600">
            Dosyalarınıza ait evraklar yüklendiğinde burada görüntülenecektir.
          </p>
        </div>
      )}
    </div>
  )
}
