import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, UserPlus, FileText, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { NotificationType, type Notification } from '@/types';
import { apiRequest } from '@/services/api';
import { toast } from 'sonner';

const POLLING_INTERVAL = 15000; // 15 seconds for better real-time experience

export function NotificationBell() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const previousUnreadCount = useRef<number>(0);
  const isFirstLoad = useRef(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await apiRequest<Notification[]>('/api/notifications', {
        method: 'GET',
      });

      const newUnreadCount = response.filter(n => !n.isRead).length;

      // Show toast for new notifications (not on first load)
      if (!isFirstLoad.current && newUnreadCount > previousUnreadCount.current) {
        const latestNotification = response.find(n => !n.isRead);

        if (latestNotification) {
          toast.info(latestNotification.title, {
            description: latestNotification.message,
            action: latestNotification.relatedUrl ? {
              label: 'Pogledaj',
              onClick: () => navigate(latestNotification.relatedUrl!),
            } : undefined,
          });
        }
      }

      previousUnreadCount.current = newUnreadCount;
      isFirstLoad.current = false;
      setNotifications(response);
      localStorage.setItem('lastNotificationCheck', new Date().toISOString());
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, [navigate]);

  useEffect(() => {
    setIsLoading(true);
    fetchNotifications().finally(() => setIsLoading(false));

    // Set up polling for real-time updates
    const interval = setInterval(() => {
      fetchNotifications();
    }, POLLING_INTERVAL);

    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAllAsRead = async () => {
    try {
      await apiRequest('/api/notifications/mark-all-read', {
        method: 'POST',
      });
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
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
    }

    if (notification.relatedUrl) {
      navigate(notification.relatedUrl);
    }
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.STUDENT_ASSIGNED:
        return <UserPlus className="h-4 w-4 text-blue-600" />;
      case NotificationType.DIARY_ENTRY_SUBMITTED:
        return <FileText className="h-4 w-4 text-green-600" />;
      case NotificationType.FINAL_REPORT_SUBMITTED:
        return <CheckCircle className="h-4 w-4 text-purple-600" />;
      case NotificationType.APPLICATION_STATUS:
        return <Bell className="h-4 w-4 text-orange-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRelativeTime = (dateString: string): string => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'upravo sada';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `prije ${minutes} min`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      if (hours === 1) return 'prije 1 sat';
      if (hours < 5) return `prije ${hours} sata`;
      return `prije ${hours} sati`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      if (days === 1) return 'prije 1 dan';
      return `prije ${days} dana`;
    } else {
      const weeks = Math.floor(diffInSeconds / 604800);
      if (weeks === 1) return 'prije 1 tjedan';
      return `prije ${weeks} tjedana`;
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const displayNotifications = notifications.slice(0, 5); // Max 5 in dropdown

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Obavijesti</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-xs text-blue-600 hover:text-blue-700 hover:bg-transparent"
              onClick={markAllAsRead}
            >
              Označi sve kao pročitano
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {isLoading ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Učitavanje...
          </div>
        ) : displayNotifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Nema obavijesti
          </div>
        ) : (
          <>
            {displayNotifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`cursor-pointer p-3 ${!notification.isRead ? 'bg-blue-50 hover:bg-blue-100' : ''}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex gap-3 w-full">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between">
                      <p className={`text-sm font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                        {notification.title}
                      </p>
                      {!notification.isRead && (
                        <div className="h-2 w-2 rounded-full bg-blue-600 ml-2 mt-1.5 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400">
                      {getRelativeTime(notification.createdAt)}
                    </p>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}

            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer text-center text-sm text-blue-600 hover:text-blue-700 justify-center"
              onClick={() => navigate('/notifications')}
            >
              Prikaži sve obavijesti
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
