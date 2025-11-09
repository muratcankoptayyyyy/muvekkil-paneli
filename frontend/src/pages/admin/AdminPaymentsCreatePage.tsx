import { useState } from 'react'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import api from '../../services/api'
import { CreditCard, AlertCircle, DollarSign } from 'lucide-react'

export default function AdminPaymentsCreatePage() {
  const [clientId, setClientId] = useState('')
  const [caseId, setCaseId] = useState('')
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState('TRY')
  const [description, setDescription] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const queryClient = useQueryClient()

  const { data: clients } = useQuery({
    queryKey: ['admin-clients-for-payment'],
    queryFn: async () => {
      const response = await api.get('/admin/clients')
      return response.data
    },
  })

  const { data: cases } = useQuery({
    queryKey: ['admin-cases-for-payment', clientId],
    queryFn: async () => {
      if (!clientId) return { items: [] }
      const response = await api.get(`/admin/cases?client_id=${clientId}`)
      return response.data
    },
    enabled: !!clientId,
  })

  const createPaymentMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/payments/create', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      alert('Ödeme talebi oluşturuldu')
      // Reset form
      setClientId('')
      setCaseId('')
      setAmount('')
      setDescription('')
      setPaymentMethod('')
    },
    onError: (error: any) => {
      alert(error.response?.data?.detail || 'Oluşturma başarısız')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!clientId || !amount || !description) {
      alert('Lütfen zorunlu alanları doldurun')
      return
    }

    createPaymentMutation.mutate({
      client_id: clientId,
      case_id: caseId || undefined,
      amount: parseFloat(amount),
      currency,
      description,
      method: paymentMethod || undefined,
    })
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Ödeme Talebi Oluştur</h1>
        <p className="text-gray-600">Müvekkil için ödeme talebi oluşturun</p>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Müvekkil Seçimi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Müvekkil <span className="text-red-500">*</span>
              </label>
              <select
                value={clientId}
                onChange={(e) => {
                  setClientId(e.target.value)
                  setCaseId('') // Reset case when client changes
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Müvekkil seçin</option>
                {clients?.items?.map((client: any) => (
                  <option key={client.id} value={client.id}>
                    {client.name} ({client.email})
                  </option>
                ))}
              </select>
            </div>

            {/* Dava Seçimi (Opsiyonel) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dava (Opsiyonel)
              </label>
              <select
                value={caseId}
                onChange={(e) => setCaseId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={!clientId}
              >
                <option value="">Dava seçin (genel ödeme için boş bırakın)</option>
                {cases?.items?.map((caseItem: any) => (
                  <option key={caseItem.id} value={caseItem.id}>
                    {caseItem.case_number} - {caseItem.title}
                  </option>
                ))}
              </select>
              {!clientId && (
                <p className="mt-1 text-sm text-gray-500">
                  Önce müvekkil seçin
                </p>
              )}
            </div>

            {/* Tutar */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tutar <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign className="text-gray-400" size={20} />
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-10 pr-20 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                  required
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 font-medium">{currency}</span>
                </div>
              </div>
            </div>

            {/* Para Birimi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Para Birimi
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="TRY">TRY (₺)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>

            {/* Açıklama */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Açıklama <span className="text-red-500">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Örn: Avukatlık ücreti, Bilirkişi masrafı, Dava harç bedeli..."
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                Ödemenin ne için olduğunu açıklayın
              </p>
            </div>

            {/* Ödeme Yöntemi (Opsiyonel) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ödeme Yöntemi (Opsiyonel)
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Seçin</option>
                <option value="bank_transfer">Banka Havalesi</option>
                <option value="credit_card">Kredi Kartı</option>
                <option value="cash">Nakit</option>
                <option value="check">Çek</option>
              </select>
            </div>

            {/* Bilgilendirme */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertCircle className="text-blue-600 flex-shrink-0" size={20} />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Bilgilendirme:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Ödeme talebi oluşturulduğunda müvekkil bilgilendirilir</li>
                    <li>Müvekkil kendi panelinden ödeme durumunu takip edebilir</li>
                    <li>Ödeme durumu güncellendiğinde sistem otomatik kayıt tutar</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Gönder Butonu */}
            <button
              type="submit"
              disabled={createPaymentMutation.isPending}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
            >
              <CreditCard size={20} />
              {createPaymentMutation.isPending ? 'Oluşturuluyor...' : 'Ödeme Talebi Oluştur'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
