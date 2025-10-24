'use client';

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

interface Notification {
  id: string;
  type: 'welfare_update' | 'attendance' | 'announcement' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  action_url?: string;
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // In a real app, this would connect to a WebSocket or use Server-Sent Events
    loadNotifications();
    
    // Poll for new notifications (replace with WebSocket in production)
    const interval = setInterval(loadNotifications, 30000); // Every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      // This would call your notifications API
      // const response = await fetch('/api/notifications/');
      // const data = await response.json();
      
      // Mock data for demonstration
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'welfare_update',
          title: 'Welfare Case Update',
          message: 'Your support request has been assigned to a welfare officer',
          timestamp: new Date().toISOString(),
          read: false,
          action_url: '/member/welfare'
        },
        {
          id: '2',
          type: 'attendance',
          title: 'Attendance Recorded',
          message: 'Your attendance for Sunday service has been recorded',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          read: true
        }
      ];
      
      setNotifications(mockNotifications);
      setUnreadCount(mockNotifications.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      // await fetch(`/api/notifications/${notificationId}/read/`, { method: 'POST' });
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      // await fetch('/api/notifications/read-all/', { method: 'POST' });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'welfare_update':
        return '🆘';
      case 'attendance':
        return '📊';
      case 'announcement':
        return '📢';
      default:
        return 'ℹ️';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between p-2 border-b">
          <div className="font-semibold">Notifications</div>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              Mark all read
            </Button>
          )}
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No notifications
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`p-3 border-b last:border-b-0 cursor-pointer ${!notification.read ? 'bg-blue-50' : ''}`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex gap-3 w-full">
                  <div className="text-lg">{getNotificationIcon(notification.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">
                      {notification.title}
                    </div>
                    <div className="text-xs text-gray-600 truncate">
                      {notification.message}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(notification.timestamp).toLocaleDateString()} • 
                      {new Date(notification.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                  )}
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>
        
        <div className="p-2 border-t">
          <Button variant="ghost" size="sm" className="w-full" asChild>
            <a href="/member/notifications">View All Notifications</a>
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
