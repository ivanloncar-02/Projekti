import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { apiRequest } from '@/services/api';
import { toast } from 'sonner';

interface Notification {
  id: string;
  studentName: string;
  action: string;
  timestamp: string;
  internshipId: string;
  studentId: string;
  isRead: boolean;
}

export const NotificationBell: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchNotifications();

    // Poll for new notifications every 30 seconds
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await apiRequest<{
        notifications: Notification[];
        unreadCount: number;
      }>('/api/notifications/unread', {
        method: 'GET',
      });

      setNotifications(response.notifications || []);
      setUnreadCount(response.unreadCount || 0);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await apiRequest(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
      });

      // Update local state
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      toast.error('Greška pri ažuriranju obavijesti');
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }

    // Navigate to relevant page
    navigate(`/mentor/academic/students/${notification.studentId}/report`);
    setIsOpen(false);
  };

  const getRelativeTime = (timestamp: string): string => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - notificationTime.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Upravo sada';
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `Prije ${diffInMinutes} min`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `Prije ${diffInHours} ${diffInHours === 1 ? 'sat' : diffInHours < 5 ? 'sata' : 'sati'}`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    return `Prije ${diffInDays} ${diffInDays === 1 ? 'dan' : 'dana'}`;
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
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
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="font-semibold">Obavijesti</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {notifications.length === 0 ? (
          <div className="py-8 text-center text-sm text-gray-500">
            Nema novih obavijesti
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`cursor-pointer p-3 ${
                  !notification.isRead ? 'bg-blue-50 hover:bg-blue-100' : ''
                }`}
              >
                <div className="flex flex-col gap-1 w-full">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium">{notification.studentName}</p>
                    {!notification.isRead && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-1 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{notification.action}</p>
                  <p className="text-xs text-gray-400">
                    {getRelativeTime(notification.timestamp)}
                  </p>
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        )}

        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                navigate('/notifications');
                setIsOpen(false);
              }}
              className="text-center text-sm text-blue-600 cursor-pointer justify-center"
            >
              Prikaži sve obavijesti
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
