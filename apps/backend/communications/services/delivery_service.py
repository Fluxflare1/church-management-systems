from django.conf import settings
from ..models import Message
from .channels.email_service import EmailChannelService
from .channels.sms_service import SMSChannelService
from .channels.whatsapp_service import WhatsAppChannelService
from .channels.push_service import PushNotificationService
from .channels.in_app_service import InAppMessageService

class DeliveryService:
    """Main delivery service that routes messages to appropriate channels"""
    
    def __init__(self):
        self.channel_services = {
            'email': EmailChannelService(),
            'sms': SMSChannelService(),
            'whatsapp': WhatsAppChannelService(),
            'push': PushNotificationService(),
            'in_app': InAppMessageService(),
        }
    
    def send_message(self, message: Message) -> dict:
        """Send message through appropriate channel"""
        channel_type = message.channel.channel_type
        
        if channel_type not in self.channel_services:
            return {
                'status': 'failed',
                'error': f'Unsupported channel type: {channel_type}'
            }
        
        try:
            service = self.channel_services[channel_type]
            result = service.send(message)
            
            # Log delivery attempt
            self._log_delivery_attempt(message, result)
            
            return result
            
        except Exception as e:
            return {
                'status': 'failed',
                'error': str(e)
            }
    
    def _log_delivery_attempt(self, message: Message, result: dict):
        """Log delivery attempt for analytics"""
        # You can implement detailed logging here
        pass
    
    def get_channel_status(self, channel_type: str) -> dict:
        """Get status of a specific channel"""
        if channel_type not in self.channel_services:
            return {'status': 'unavailable', 'error': 'Channel not configured'}
        
        try:
            # Basic health check - you can implement more sophisticated checks
            service = self.channel_services[channel_type]
            return {'status': 'active'}
        except Exception as e:
            return {'status': 'error', 'error': str(e)}
