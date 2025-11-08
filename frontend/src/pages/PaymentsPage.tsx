import { useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { CreditCard, Calendar, CheckCircle, Clock, AlertCircle, Download, DollarSign } from 'lucide-react'

export default function PaymentsPage() {
  const { user: _user } = useAuthStore()
  const [selectedTab, setSelectedTab] = useState<'all' | 'pending' | 'completed'>('all')

  const payments = [
    {
      id: 1,
      caseNumber: '2024/123',
      description: 'İlk Vekalet Ücreti',
      amount: 15000,
      dueDate: '2024-10-30',
      paidDate: '2024-10-15',
      status: 'paid',
      invoiceUrl: '#'
    },
    {
      id: 2,
      caseNumber: '2024/98',
      description: 'Dava Masrafları',
      amount: 5000,
      dueDate: '2024-11-05',
      paidDate: null,
      status: 'pending',
      invoiceUrl: null
    },
    {
      id: 3,
      caseNumber: '2024/156',
      description: 'Bilirkişi Ücreti',
      amount: 3500,
      dueDate: '2024-11-15',
      paidDate: null,
      status: 'pending',
      invoiceUrl: null
    },
    {
      id: 4,
      caseNumber: '2024/123',
      description: 'İkinci Taksit',
      amount: 10000,
      dueDate: '2024-12-01',
      paidDate: null,
      status: 'upcoming',
      invoiceUrl: null
    },
    {
      id: 5,
      caseNumber: '2023/456',
      description: 'Sonuç Vekalet Ücreti',
      amount: 20000,
      dueDate: '2024-09-20',
      paidDate: '2024-09-18',
      status: 'paid',
      invoiceUrl: '#'
    },
  ]

  const filteredPayments = payments.filter(payment => {
    if (selectedTab === 'pending') return payment.status === 'pending'
    if (selectedTab === 'completed') return payment.status === 'paid'
    return true
  })

  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0)
  const paidAmount = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0)
  const pendingAmount = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full">
            <CheckCircle size={14} />
            Ödendi
          </span>
        )
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-yellow-700 bg-yellow-100 rounded-full">
            <Clock size={14} />
            Bekliyor
          </span>
        )
      case 'upcoming':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full">
            <Calendar size={14} />
            Yaklaşan
          </span>
        )
      default:
        return null
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Ödemeler</h1>
        <p className="text-gray-600">Ödeme geçmişinizi ve yaklaşan ödemelerinizi görüntüleyin</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Toplam Tutar</span>
            <DollarSign className="text-blue-500" size={20} />
          </div>
          <p className="text-3xl font-bold text-gray-900">₺{totalAmount.toLocaleString('tr-TR')}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Ödenen</span>
            <CheckCircle className="text-green-500" size={20} />
          </div>
          <p className="text-3xl font-bold text-gray-900">₺{paidAmount.toLocaleString('tr-TR')}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Bekleyen</span>
            <AlertCircle className="text-yellow-500" size={20} />
          </div>
          <p className="text-3xl font-bold text-gray-900">₺{pendingAmount.toLocaleString('tr-TR')}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setSelectedTab('all')}
              className={`py-4 px-6 border-b-2 font-medium text-sm ${
                selectedTab === 'all'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Tümü ({payments.length})
            </button>
            <button
              onClick={() => setSelectedTab('pending')}
              className={`py-4 px-6 border-b-2 font-medium text-sm ${
                selectedTab === 'pending'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Bekleyen ({payments.filter(p => p.status === 'pending').length})
            </button>
            <button
              onClick={() => setSelectedTab('completed')}
              className={`py-4 px-6 border-b-2 font-medium text-sm ${
                selectedTab === 'completed'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Tamamlanan ({payments.filter(p => p.status === 'paid').length})
            </button>
          </nav>
        </div>
      </div>

      {/* Payments List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dosya No / Açıklama
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tutar
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vade Tarihi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ödeme Tarihi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{payment.caseNumber}</div>
                      <div className="text-sm text-gray-500">{payment.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">
                      ₺{payment.amount.toLocaleString('tr-TR')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Calendar size={14} className="mr-2 text-gray-400" />
                      {new Date(payment.dueDate).toLocaleDateString('tr-TR')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {payment.paidDate ? (
                      <div className="flex items-center">
                        <CheckCircle size={14} className="mr-2 text-green-500" />
                        {new Date(payment.paidDate).toLocaleDateString('tr-TR')}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(payment.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {payment.status === 'paid' && payment.invoiceUrl && (
                      <button className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium">
                        <Download size={16} />
                        Fatura
                      </button>
                    )}
                    {payment.status === 'pending' && (
                      <button className="inline-flex items-center gap-1 text-green-600 hover:text-green-800 font-medium">
                        <CreditCard size={16} />
                        Öde
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPayments.length === 0 && (
          <div className="text-center py-12">
            <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Ödeme bulunamadı</h3>
            <p className="mt-1 text-sm text-gray-500">Seçili kategoride ödeme bulunmamaktadır.</p>
          </div>
        )}
      </div>

      {/* Payment Info */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">Ödeme Bilgileri</h3>
            <div className="text-sm text-blue-800 space-y-1">
              <p>• Ödemelerinizi banka havalesi veya kredi kartı ile yapabilirsiniz.</p>
              <p>• Ödeme yaptıktan sonra dekontunuzu avukatınıza iletmeyi unutmayın.</p>
              <p>• Faturalarınızı "İndir" butonuna tıklayarak indirebilirsiniz.</p>
              <p>• Ödeme planınız hakkında detaylı bilgi için avukatınızla iletişime geçin.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
