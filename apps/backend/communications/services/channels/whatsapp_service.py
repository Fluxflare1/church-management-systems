from twilio.rest import Client
from django.conf import settings
from ...models import Message

class WhatsAppChannelService:
    """WhatsApp delivery service using Twilio"""
    
    def __init__(self):
        self.client = Client(
            settings.COMMUNICATION_SETTINGS['TWILIO_ACCOUNT_SID'],
            settings.COMMUNICATION_SETTINGS['TWILIO_AUTH_TOKEN']
        )
        self.whatsapp_number = f"whatsapp:{settings.COMMUNICATION_SETTINGS['TWILIO_WHATSAPP_NUMBER']}"
    
    def send(self, message: Message) -> dict:
        """Send WhatsApp message via Twilio"""
        try:
            # Ensure user has a phone number
            if not hasattr(message.to_user, 'profile') or not message.to_user.profile.phone:
                return {'status': 'failed', 'error': 'User has no phone number'}
            
            to_whatsapp = f"whatsapp:{message.to_user.profile.phone}"
            
            twilio_message = self.client.messages.create(
                body=message.content,
                from_=self.whatsapp_number,
                to=to_whatsapp
            )
            
            return {
                'status': 'sent',
                'provider_id': twilio_message.sid,
                'status_code': 200
            }
            
        except Exception as e:
            return {
                'status': 'failed',
                'error': str(e)
            }
