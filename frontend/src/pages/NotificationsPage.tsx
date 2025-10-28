import { useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { 
  Bell, 
  Check, 
  Trash2, 
  Calendar, 
  FileText, 
  CreditCard, 
  AlertCircle,
  Info,
  CheckCircle,
  Filter
} from 'lucide-react'

type NotificationType = 'all' | 'case' | 'payment' | 'document' | 'system'

interface Notification {
  id: number
  type: 'case' | 'payment' | 'document' | 'system'
  title: string
  message: string
  date: string
  read: boolean
  priority: 'low' | 'medium' | 'high'
}

export default function NotificationsPage() {
  const { user } = useAuthStore()
  const [selectedType, setSelectedType] = useState<NotificationType>('all')
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      type: 'case',
      title: 'Duruşma Tarihi Yaklaşıyor',
      message: '2024/123 numaralı davanızın duruşması 28 Ekim 2024 tarihinde Ankara 5. Asliye Hukuk Mahkemesinde yapılacaktır.',
      date: '2024-10-25T10:30:00',
      read: false,
      priority: 'high'
    },
    {
      id: 2,
      type: 'payment',
      title: 'Ödeme Vadesi Yaklaşıyor',
      message: '5.000 TL tutarındaki dava masrafları ödemesi 05 Kasım 2024 tarihinde ödenmelidir.',
      date: '2024-10-24T15:00:00',
      read: false,
      priority: 'high'
    },
    {
      id: 3,
      type: 'document',
      title: 'Yeni Belge Yüklendi',
      message: 'Bilirkişi raporu dosyanıza yüklendi. Belgeyi inceleyebilirsiniz.',
      date: '2024-10-23T14:20:00',
      read: true,
      priority: 'medium'
    },
    {
      id: 4,
      type: 'case',
      title: 'Dava Durumu Güncellendi',
      message: '2024/98 numaralı davanız tamamlandı olarak işaretlendi.',
      date: '2024-10-22T11:00:00',
      read: true,
      priority: 'medium'
    },
    {
      id: 5,
      type: 'system',
      title: 'Güvenlik Uyarısı',
      message: 'Şifrenizi son 90 gün içinde değiştirmediniz. Güvenliğiniz için şifrenizi değiştirmenizi öneririz.',
      date: '2024-10-20T09:00:00',
      read: false,
      priority: 'low'
    },
    {
      id: 6,
      type: 'payment',
      title: 'Ödeme Alındı',
      message: '15.000 TL tutarındaki ilk vekalet ücreti ödemesi başarıyla alınmıştır. Faturanız hazırlanmıştır.',
      date: '2024-10-15T16:45:00',
      read: true,
      priority: 'low'
    },
    {
      id: 7,
      type: 'document',
      title: 'İmza Bekleniyor',
      message: 'Vekalet sözleşmesi belgesi imzanızı bekliyor. Lütfen en kısa sürede imzalayınız.',
      date: '2024-10-14T10:00:00',
      read: false,
      priority: 'high'
    },
    {
      id: 8,
      type: 'case',
      title: 'Duruşma Tutanağı',
      message: '20 Ekim 2024 tarihli duruşmanın tutanağı dosyanıza eklendi.',
      date: '2024-10-21T13:30:00',
      read: true,
      priority: 'low'
    }
  ])

  const filteredNotifications = notifications.filter(notif => {
    if (selectedType === 'all') return true
    return notif.type === selectedType
  })

  const unreadCount = notifications.filter(n => !n.read).length

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ))
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })))
  }

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter(n => n.id !== id))
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'case':
        return <FileText className="text-blue-600" size={20} />
      case 'payment':
        return <CreditCard className="text-green-600" size={20} />
      case 'document':
        return <FileText className="text-purple-600" size={20} />
      case 'system':
        return <Info className="text-gray-600" size={20} />
      default:
        return <Bell className="text-gray-600" size={20} />
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <span className="px-2 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded-full">Acil</span>
      case 'medium':
        return <span className="px-2 py-1 text-xs font-semibold text-yellow-700 bg-yellow-100 rounded-full">Orta</span>
      case 'low':
        return <span className="px-2 py-1 text-xs font-semibold text-gray-700 bg-gray-100 rounded-full">Düşük</span>
      default:
        return null
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return 'Bugün ' + date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
    } else if (diffDays === 1) {
      return 'Dün ' + date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
    } else if (diffDays < 7) {
      return diffDays + ' gün önce'
    } else {
      return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
    }
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bildirimler</h1>
          <p className="text-gray-600">
            {unreadCount} okunmamış bildiriminiz var
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <CheckCircle size={18} />
            Tümünü Okundu İşaretle
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl shadow-sm mb-6 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px overflow-x-auto">
            <button
              onClick={() => setSelectedType('all')}
              className={`py-4 px-6 border-b-2 font-medium text-sm whitespace-nowrap ${
                selectedType === 'all'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Filter className="inline mr-2" size={16} />
              Tümü ({notifications.length})
            </button>
            <button
              onClick={() => setSelectedType('case')}
              className={`py-4 px-6 border-b-2 font-medium text-sm whitespace-nowrap ${
                selectedType === 'case'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FileText className="inline mr-2" size={16} />
              Dava ({notifications.filter(n => n.type === 'case').length})
            </button>
            <button
              onClick={() => setSelectedType('payment')}
              className={`py-4 px-6 border-b-2 font-medium text-sm whitespace-nowrap ${
                selectedType === 'payment'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <CreditCard className="inline mr-2" size={16} />
              Ödeme ({notifications.filter(n => n.type === 'payment').length})
            </button>
            <button
              onClick={() => setSelectedType('document')}
              className={`py-4 px-6 border-b-2 font-medium text-sm whitespace-nowrap ${
                selectedType === 'document'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FileText className="inline mr-2" size={16} />
              Belge ({notifications.filter(n => n.type === 'document').length})
            </button>
            <button
              onClick={() => setSelectedType('system')}
              className={`py-4 px-6 border-b-2 font-medium text-sm whitespace-nowrap ${
                selectedType === 'system'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Info className="inline mr-2" size={16} />
              Sistem ({notifications.filter(n => n.type === 'system').length})
            </button>
          </nav>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Bell className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Bildirim Yok</h3>
            <p className="text-gray-500">Seçili kategoride bildirim bulunmamaktadır.</p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white rounded-xl shadow-sm p-6 transition-all hover:shadow-md ${
                !notification.read ? 'border-l-4 border-blue-600' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 p-3 bg-gray-50 rounded-lg">
                  {getIcon(notification.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {notification.title}
                      </h3>
                      {getPriorityBadge(notification.priority)}
                    </div>
                    {!notification.read && (
                      <span className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2"></span>
                    )}
                  </div>
                  
                  <p className="text-gray-700 mb-3">{notification.message}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar size={14} className="mr-2" />
                      {formatDate(notification.date)}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="inline-flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Check size={16} />
                          Okundu İşaretle
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="inline-flex items-center gap-1 px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                        Sil
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Info Box */}
      {filteredNotifications.length > 0 && (
        <div className="mt-8 bg-gray-50 border border-gray-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-gray-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Bildirim Ayarları</h3>
              <p className="text-sm text-gray-700">
                Bildirim tercihlerinizi profil sayfasından düzenleyebilirsiniz. 
                E-posta ve SMS bildirimleri için ayarlarınızı kontrol edin.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
