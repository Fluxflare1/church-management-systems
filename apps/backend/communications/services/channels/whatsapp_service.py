from twilio.rest import Client
from django.conf import settings
import logging
from ...models import Message

logger = logging.getLogger(__name__)

class WhatsAppChannelService:
    """Enhanced WhatsApp delivery service using Twilio with template support"""
    
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
            
            # Check if this is a template message (contains variables)
            if message.variables_used and len(message.variables_used) > 0:
                return self._send_template_message(message, to_whatsapp)
            else:
                return self._send_text_message(message, to_whatsapp)
            
        except Exception as e:
            logger.error(f"WhatsApp sending failed for message {message.id}: {str(e)}")
            return {
                'status': 'failed',
                'error': str(e)
            }
    
    def _send_text_message(self, message: Message, to_whatsapp: str) -> dict:
        """Send regular text WhatsApp message"""
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
    
    def _send_template_message(self, message: Message, to_whatsapp: str) -> dict:
        """Send WhatsApp template message with variables"""
        # For WhatsApp templates, you need pre-approved templates in Twilio
        # This is a simplified implementation
        template_name = "church_announcement"  # This should be configured per template
        
        # Convert variables to WhatsApp template format
        template_variables = self._format_template_variables(message.variables_used)
        
        twilio_message = self.client.messages.create(
            from_=self.whatsapp_number,
            to=to_whatsapp,
            content_sid=settings.WHATSAPP_TEMPLATES.get(template_name, ''),  # Template SID from Twilio
            content_variables=json.dumps(template_variables)
        )
        
        return {
            'status': 'sent',
            'provider_id': twilio_message.sid,
            'status_code': 200
        }
    
    def _format_template_variables(self, variables: dict) -> dict:
        """Format variables for WhatsApp template"""
        formatted = {}
        for key, value in variables.items():
            formatted[key] = str(value)
        return formatted
    
    def get_template_approval_status(self, template_name: str) -> dict:
        """Check approval status of WhatsApp templates"""
        # This would integrate with Twilio's template API
        # For now, return mock status
        return {
            'template_name': template_name,
            'status': 'approved',  # or 'pending', 'rejected'
            'category': 'UTILITY'
        }
