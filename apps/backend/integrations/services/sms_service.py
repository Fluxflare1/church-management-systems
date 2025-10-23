import logging
from django.conf import settings
from twilio.rest import Client
from twilio.base.exceptions import TwilioRestException

logger = logging.getLogger(__name__)

class SMSService:
    def __init__(self):
        self.client = Client(
            getattr(settings, 'TWILIO_ACCOUNT_SID', ''),
            getattr(settings, 'TWILIO_AUTH_TOKEN', '')
        )
        self.phone_number = getattr(settings, 'TWILIO_PHONE_NUMBER', '')
    
    def send_sms(self, to_phone: str, message: str, from_phone: str = None) -> dict:
        """
        Send SMS using Twilio
        Returns: { 'success': bool, 'message_id': str, 'error': str }
        """
        try:
            if not self._validate_phone_number(to_phone):
                return {'success': False, 'error': 'Invalid phone number format'}
            
            from_phone = from_phone or self.phone_number
            
            # Send SMS via Twilio
            twilio_message = self.client.messages.create(
                body=message,
                from_=from_phone,
                to=to_phone
            )
            
            logger.info(f"SMS sent to {to_phone}, SID: {twilio_message.sid}")
            
            return {
                'success': True,
                'message_id': twilio_message.sid,
                'status': twilio_message.status
            }
            
        except TwilioRestException as e:
            logger.error(f"Twilio SMS error for {to_phone}: {str(e)}")
            return {'success': False, 'error': str(e)}
        except Exception as e:
            logger.error(f"Unexpected SMS error for {to_phone}: {str(e)}")
            return {'success': False, 'error': 'Failed to send SMS'}
    
    def _validate_phone_number(self, phone: str) -> bool:
        """Basic phone number validation"""
        # Remove any non-digit characters except +
        cleaned = ''.join(c for c in phone if c.isdigit() or c == '+')
        return len(cleaned) >= 10 and len(cleaned) <= 15
    
    def get_message_status(self, message_sid: str) -> dict:
        """Check delivery status of a sent message"""
        try:
            message = self.client.messages(message_sid).fetch()
            return {
                'status': message.status,
                'error_code': message.error_code,
                'error_message': message.error_message,
                'date_created': message.date_created,
                'date_sent': message.date_sent
            }
        except TwilioRestException as e:
            logger.error(f"Failed to get status for {message_sid}: {str(e)}")
            return {'error': str(e)}
