import firebase_admin
from firebase_admin import messaging
from firebase_admin.exceptions import FirebaseError
from django.conf import settings
import logging
from ...models import Message

logger = logging.getLogger(__name__)

class PushNotificationService:
    """Push notification service using Firebase Cloud Messaging"""
    
    def __init__(self):
        try:
            # Initialize Firebase app if not already initialized
            if not firebase_admin._apps:
                cred = firebase_admin.credentials.Certificate(
                    settings.FIREBASE_CREDENTIALS_PATH
                )
                firebase_admin.initialize_app(cred)
        except Exception as e:
            logger.error(f"Firebase initialization failed: {str(e)}")
    
    def send(self, message: Message) -> dict:
        """Send push notification via FCM"""
        try:
            # Get user's FCM tokens
            fcm_tokens = self._get_user_fcm_tokens(message.to_user)
            
            if not fcm_tokens:
                return {'status': 'failed', 'error': 'User has no FCM tokens'}
            
            # Create notification message
            notification = messaging.Notification(
                title=message.subject or "THOGMi Notification",
                body=message.content[:100] + '...' if len(message.content) > 100 else message.content
            )
            
            # Send to all user devices
            results = []
            for token in fcm_tokens:
                result = self._send_to_token(token, notification, message)
                results.append(result)
            
            # Check if any were successful
            successful_sends = [r for r in results if r.get('success')]
            
            if successful_sends:
                return {
                    'status': 'sent',
                    'provider_id': f'fcm_batch_{message.id}',
                    'successful_sends': len(successful_sends),
                    'total_attempts': len(results)
                }
            else:
                return {
                    'status': 'failed',
                    'error': 'All FCM sends failed',
                    'details': results
                }
            
        except Exception as e:
            logger.error(f"FCM sending failed for message {message.id}: {str(e)}")
            return {
                'status': 'failed',
                'error': str(e)
            }
    
    def _get_user_fcm_tokens(self, user):
        """Get FCM tokens for a user from their profile"""
        try:
            # Assuming user profile has FCM tokens stored
            if hasattr(user, 'profile') and hasattr(user.profile, 'fcm_tokens'):
                return user.profile.fcm_tokens.all()  # Assuming a related model for tokens
            return []
        except Exception as e:
            logger.error(f"Error getting FCM tokens for user {user.id}: {str(e)}")
            return []
    
    def _send_to_token(self, token, notification, message):
        """Send notification to a specific FCM token"""
        try:
            fcm_message = messaging.Message(
                notification=notification,
                token=token.token,  # Assuming token is a string
                data={
                    'message_id': str(message.id),
                    'type': 'church_notification',
                    'click_action': 'FLUTTER_NOTIFICATION_CLICK'
                }
            )
            
            response = messaging.send(fcm_message)
            
            return {
                'success': True,
                'message_id': response,
                'token': token.token[:10] + '...'  # Log partial token for security
            }
            
        except FirebaseError as e:
            logger.error(f"FCM send failed for token {token.token[:10]}...: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'token': token.token[:10] + '...'
            }
    
    def subscribe_to_topic(self, tokens, topic):
        """Subscribe devices to a topic for broadcast messages"""
        try:
            response = messaging.subscribe_to_topic(tokens, topic)
            return {
                'success_count': response.success_count,
                'failure_count': response.failure_count,
                'errors': response.errors
            }
        except Exception as e:
            logger.error(f"Topic subscription failed: {str(e)}")
            return {'error': str(e)}
    
    def send_to_topic(self, topic, notification, data=None):
        """Send notification to a topic"""
        try:
            message = messaging.Message(
                notification=notification,
                topic=topic,
                data=data or {}
            )
            
            response = messaging.send(message)
            return {'success': True, 'message_id': response}
            
        except Exception as e:
            logger.error(f"Topic send failed: {str(e)}")
            return {'success': False, 'error': str(e)}
