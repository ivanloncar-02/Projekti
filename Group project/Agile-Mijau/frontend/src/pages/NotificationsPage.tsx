import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCircle, AlertCircle, FileText, UserPlus, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { NotificationType, type Notification } from '@/types';
import { apiRequest } from '@/services/api';
import { toast } from 'sonner';

export const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await apiRequest<Notification[]>('/api/notifications', {
        method: 'GET',
      });
      setNotifications(response);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Greška pri učitavanju obavijesti');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (notification: Notification) => {
    if (notification.isRead) return;

    try {
      await apiRequest(`/api/notifications/${notification.id}/read`, {
        method: 'PATCH',
      });
      setNotifications(notifications.map(n =>
        n.id === notification.id ? { ...n, isRead: true } : n
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiRequest('/api/notifications/mark-all-read', {
        method: 'POST',
      });
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      toast.success('Sve obavijesti označene kao pročitane');
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Greška pri označavanju obavijesti');
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    await markAsRead(notification);
    if (notification.relatedUrl) {
      navigate(notification.relatedUrl);
    }
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.APPLICATION_RECEIVED:
        return <UserPlus className="h-5 w-5 text-blue-600" />;
      case NotificationType.APPLICATION_APPROVED:
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case NotificationType.APPLICATION_REJECTED:
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case NotificationType.DIARY_ENTRY_SUBMITTED:
      case NotificationType.DIARY_ENTRY_APPROVED:
        return <FileText className="h-5 w-5 text-purple-600" />;
      case NotificationType.FINAL_REPORT_SUBMITTED:
        return <FileText className="h-5 w-5 text-indigo-600" />;
      case NotificationType.INTERNSHIP_GRADED:
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'upravo sada';
    if (diffMins < 60) return `prije ${diffMins} min`;
    if (diffHours < 24) return `prije ${diffHours}h`;
    if (diffDays < 7) return `prije ${diffDays}d`;
    return date.toLocaleDateString('hr-HR');
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Učitavanje...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Obavijesti</h1>
              <p className="text-gray-600 mt-1">
                {unreadCount > 0 ? `${unreadCount} nepročitanih obavijesti` : 'Sve obavijesti su pročitane'}
              </p>
            </div>
            {unreadCount > 0 && (
              <Button variant="outline" onClick={markAllAsRead}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Označi sve kao pročitano
              </Button>
            )}
          </div>

          {notifications.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <Bell className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Nema obavijesti</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Ovdje ćete vidjeti obavijesti o aktivnostima vezanim za vaš račun.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    !notification.isRead ? 'border-l-4 border-l-blue-500 bg-blue-50/30' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <CardContent className="py-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`text-sm font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                            {notification.title}
                          </p>
                          <div className="flex items-center gap-2 ml-4">
                            {!notification.isRead && (
                              <Badge variant="default" className="bg-blue-100 text-blue-800 text-xs">
                                Novo
                              </Badge>
                            )}
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {getRelativeTime(notification.createdAt)}
                            </span>
                          </div>
                        </div>
                        <p className={`text-sm mt-1 ${!notification.isRead ? 'text-gray-700' : 'text-gray-500'}`}>
                          {notification.message}
                        </p>
                        {notification.relatedUrl && (
                          <p className="text-xs text-blue-600 mt-2 hover:underline">
                            Klikni za više detalja
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
