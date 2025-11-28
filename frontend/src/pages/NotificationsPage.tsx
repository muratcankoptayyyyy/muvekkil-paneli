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
  Filter,
  Gavel
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationService, Notification } from '../services/notification'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

type NotificationFilterType = 'all' | 'case_update' | 'payment_update' | 'document_upload' | 'system'

export default function NotificationsPage() {
  const { user: _user } = useAuthStore()
  const queryClient = useQueryClient()
  const [selectedType, setSelectedType] = useState<NotificationFilterType>('all')

  // Bildirimleri getir
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', 'all'],
    queryFn: () => notificationService.getAll(0, 100), // Daha fazla getir
  })

  // Okundu olarak işaretle
  const markAsReadMutation = useMutation({
    mutationFn: notificationService.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] })
    },
  })

  // Tümünü okundu olarak işaretle
  const markAllAsReadMutation = useMutation({
    mutationFn: notificationService.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] })
    },
  })

  const filteredNotifications = notifications.filter(notif => {
    if (selectedType === 'all') return true
    return notif.notification_type === selectedType
  })

  const unreadCount = notifications.filter(n => !n.is_read).length

  const getIcon = (type: string) => {
    switch (type) {
      case 'case_update':
        return <Gavel className="text-blue-600" size={20} />
      case 'payment_update':
        return <CreditCard className="text-green-600" size={20} />
      case 'document_upload':
        return <FileText className="text-orange-600" size={20} />
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
            onClick={() => markAllAsReadMutation.mutate()}
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
              onClick={() => setSelectedType('case_update')}
              className={`py-4 px-6 border-b-2 font-medium text-sm whitespace-nowrap ${
                selectedType === 'case_update'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Gavel className="inline mr-2" size={16} />
              Dava ({notifications.filter(n => n.notification_type === 'case_update').length})
            </button>
            <button
              onClick={() => setSelectedType('payment_update')}
              className={`py-4 px-6 border-b-2 font-medium text-sm whitespace-nowrap ${
                selectedType === 'payment_update'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <CreditCard className="inline mr-2" size={16} />
              Ödeme ({notifications.filter(n => n.notification_type === 'payment_update').length})
            </button>
            <button
              onClick={() => setSelectedType('document_upload')}
              className={`py-4 px-6 border-b-2 font-medium text-sm whitespace-nowrap ${
                selectedType === 'document_upload'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FileText className="inline mr-2" size={16} />
              Belge ({notifications.filter(n => n.notification_type === 'document_upload').length})
            </button>
          </nav>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12">Yükleniyor...</div>
        ) : filteredNotifications.length === 0 ? (
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
                !notification.is_read ? 'border-l-4 border-blue-600' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 p-3 bg-gray-50 rounded-lg">
                  {getIcon(notification.notification_type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {notification.title}
                      </h3>
                      {getPriorityBadge(notification.priority)}
                    </div>
                    {!notification.is_read && (
                      <span className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2"></span>
                    )}
                  </div>
                  
                  <p className="text-gray-700 mb-3">{notification.message}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar size={14} className="mr-2" />
                      {format(new Date(notification.created_at), 'd MMMM yyyy HH:mm', { locale: tr })}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {!notification.is_read && (
                        <button
                          onClick={() => markAsReadMutation.mutate(notification.id)}
                          className="inline-flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Check size={16} />
                          Okundu İşaretle
                        </button>
                      )}
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
