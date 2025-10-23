import logging
from django.conf import settings
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from apps.communications.models import Notification

logger = logging.getLogger(__name__)

class InAppNotificationService:
    def __init__(self):
        self.channel_layer = get_channel_layer()
    
    def send_notification(self, user, title: str, message: str, 
                         notification_type: str = 'info', data: dict = None) -> dict:
        """
        Send in-app notification to user
        Returns: { 'success': bool, 'notification_id': int, 'error': str }
        """
        try:
            # Save notification to database
            notification = Notification.objects.create(
                user=user,
                title=title,
                message=message,
                notification_type=notification_type,
                data=data or {}
            )
            
            # Send real-time notification via WebSocket
            self._send_real_time_notification(user, notification)
            
            logger.info(f"In-app notification sent to user {user.id}: {title}")
            
            return {
                'success': True,
                'notification_id': notification.id
            }
            
        except Exception as e:
            logger.error(f"In-app notification error for user {user.id}: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def _send_real_time_notification(self, user, notification):
        """Send real-time notification via WebSocket"""
        try:
            async_to_sync(self.channel_layer.group_send)(
                f"user_{user.id}",
                {
                    'type': 'send_notification',
                    'notification': {
                        'id': notification.id,
                        'title': notification.title,
                        'message': notification.message,
                        'type': notification.notification_type,
                        'data': notification.data,
                        'created_at': notification.created_at.isoformat(),
                        'is_read': notification.is_read
                    }
                }
            )
        except Exception as e:
            logger.warning(f"Real-time notification failed for user {user.id}: {str(e)}")
            # Non-critical error - notification is still saved in database
    
    def mark_as_read(self, notification_id: int, user_id: int) -> bool:
        """Mark notification as read"""
        try:
            notification = Notification.objects.get(id=notification_id, user_id=user_id)
            notification.is_read = True
            notification.save()
            return True
        except Notification.DoesNotExist:
            return False
    
    def get_unread_count(self, user_id: int) -> int:
        """Get count of unread notifications for user"""
        return Notification.objects.filter(user_id=user_id, is_read=False).count()
