from twilio.rest import Client
from django.conf import settings
from ...models import Message

class SMSChannelService:
    """SMS delivery service using Twilio"""
    
    def __init__(self):
        self.client = Client(
            settings.COMMUNICATION_SETTINGS['TWILIO_ACCOUNT_SID'],
            settings.COMMUNICATION_SETTINGS['TWILIO_AUTH_TOKEN']
        )
    
    def send(self, message: Message) -> Dict[str, Any]:
        """Send SMS via Twilio"""
        try:
            # Ensure user has a phone number
            if not message.to_user.profile.phone:
                return {'status': 'failed', 'error': 'User has no phone number'}
            
            twilio_message = self.client.messages.create(
                body=message.content,
                from_=settings.TWILIO_PHONE_NUMBER,  # Make sure this is set in settings
                to=message.to_user.profile.phone
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
