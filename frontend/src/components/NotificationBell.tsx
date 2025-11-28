import { Fragment, useState, useEffect } from 'react';
import { Popover, Transition } from '@headlessui/react';
import { Bell, Check, FileText, Gavel, CreditCard, Info } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService, Notification } from '../services/notification';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

export default function NotificationBell() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  // Bildirimleri getir
  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationService.getAll(0, 10),
    refetchInterval: 30000, // 30 saniyede bir yenile
  });

  // Okunmamış sayısını getir
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['unreadCount'],
    queryFn: notificationService.getUnreadCount,
    refetchInterval: 30000,
  });

  // Okundu olarak işaretle
  const markAsReadMutation = useMutation({
    mutationFn: notificationService.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
    },
  });

  // Tümünü okundu olarak işaretle
  const markAllAsReadMutation = useMutation({
    mutationFn: notificationService.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
    },
  });

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markAsReadMutation.mutate(notification.id);
    }
    
    if (notification.link) {
      navigate(notification.link);
      setIsOpen(false); // Dropdown'ı kapat
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'case_update':
        return <Gavel className="h-5 w-5 text-blue-500" />;
      case 'document_upload':
        return <FileText className="h-5 w-5 text-orange-500" />;
      case 'payment_update':
        return <CreditCard className="h-5 w-5 text-green-500" />;
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <Popover className="relative">
      {({ open }) => {
        // Popover state'ini senkronize et (manuel kapatma için)
        useEffect(() => {
          setIsOpen(open);
        }, [open]);

        return (
          <>
            <Popover.Button className="relative p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded-full">
              <span className="sr-only">Bildirimleri görüntüle</span>
              <Bell className="h-6 w-6" aria-hidden="true" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 block h-4 w-4 rounded-full bg-red-500 text-xs text-white text-center leading-4 font-bold ring-2 ring-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Popover.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-1"
            >
              <Popover.Panel className="absolute right-0 z-10 mt-2 w-80 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:w-96">
                <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="text-sm font-semibold text-gray-900">Bildirimler</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => markAllAsReadMutation.mutate()}
                      className="text-xs text-indigo-600 hover:text-indigo-500 font-medium"
                    >
                      Tümünü Okundu İşaretle
                    </button>
                  )}
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-6 text-center text-sm text-gray-500">
                      Henüz bildiriminiz yok.
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                            !notification.is_read ? 'bg-blue-50/50' : ''
                          }`}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 mt-1">
                              {getIcon(notification.notification_type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium ${!notification.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                                {notification.title}
                              </p>
                              <p className="text-sm text-gray-500 line-clamp-2 mt-0.5">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {format(new Date(notification.created_at), 'd MMMM HH:mm', { locale: tr })}
                              </p>
                            </div>
                            {!notification.is_read && (
                              <div className="flex-shrink-0 self-center">
                                <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 text-center">
                  <button 
                    className="text-xs text-gray-500 hover:text-gray-700 font-medium"
                    onClick={() => navigate('/notifications')} // İleride tüm bildirimler sayfası yapılabilir
                  >
                    Tümünü Gör
                  </button>
                </div>
              </Popover.Panel>
            </Transition>
          </>
        );
      }}
    </Popover>
  );
}
