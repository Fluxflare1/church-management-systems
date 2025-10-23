import logging
from django.conf import settings
from django.template import Template, Context
from apps.integrations.services import EmailService, SMSService, WhatsAppService
from apps.communications.services import InAppNotificationService

logger = logging.getLogger(__name__)

class GuestCommunicationService:
    def __init__(self):
        self.email_service = EmailService()
        self.sms_service = SMSService()
        self.whatsapp_service = WhatsAppService()
        self.in_app_service = InAppNotificationService()
    
    def send_communication(self, guest, communication_type, template, context_data, sent_by, is_automated=False):
        """Send communication to guest based on their preferences"""
        try:
            # Render template with context
            template_obj = Template(template)
            context = Context(context_data)
            rendered_content = template_obj.render(context)
            
            communication = None
            
            if communication_type == 'email' and guest.prefers_email:
                communication = self._send_email(guest, rendered_content, context_data.get('subject', ''))
            
            elif communication_type == 'sms' and guest.prefers_sms:
                communication = self._send_sms(guest, rendered_content)
            
            elif communication_type == 'whatsapp' and guest.prefers_whatsapp:
                communication = self._send_whatsapp(guest, rendered_content)
            
            elif communication_type == 'in_app' and guest.prefers_in_app:
                communication = self._send_in_app(guest, rendered_content, context_data.get('subject', ''))
            
            # Log communication in database
            if communication:
                from ..models import GuestCommunication
                GuestCommunication.objects.create(
                    guest=guest,
                    communication_type=communication_type,
                    subject=context_data.get('subject', ''),
                    message=rendered_content,
                    sent_by=sent_by,
                    is_automated=is_automated,
                    template_used=template[:100]  # Store first 100 chars of template
                )
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to send {communication_type} to guest {guest.id}: {str(e)}")
            return False
    
    def _send_email(self, guest, content, subject):
        return self.email_service.send_email(
            to_email=guest.user.email,
            subject=subject,
            html_content=content,
            context={'guest': guest}
        )
    
    def _send_sms(self, guest, content):
        if guest.user.phone_number:
            return self.sms_service.send_sms(
                to_phone=guest.user.phone_number,
                message=content
            )
        return None
    
    def _send_whatsapp(self, guest, content):
        if guest.user.phone_number:
            return self.whatsapp_service.send_message(
                to_phone=guest.user.phone_number,
                message=content
            )
        return None
    
    def _send_in_app(self, guest, content, title):
        return self.in_app_service.send_notification(
            user=guest.user,
            title=title,
            message=content,
            notification_type='guest_follow_up'
        )
