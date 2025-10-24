import sendgrid
from sendgrid.helpers.mail import Mail, From, To, Subject, PlainTextContent, HtmlContent
from django.conf import settings
from ...models import Message

class EmailChannelService:
    """Email delivery service using SendGrid"""
    
    def __init__(self):
        self.sg = sendgrid.SendGridAPIClient(settings.COMMUNICATION_SETTINGS['SENDGRID_API_KEY'])
        self.from_email = From(settings.COMMUNICATION_SETTINGS['DEFAULT_FROM_EMAIL'], "THOGMi Communications")
    
    def send(self, message: Message) -> Dict[str, Any]:
        """Send email via SendGrid"""
        try:
            # Create SendGrid mail object
            to_email = To(message.to_user.email)
            subject = Subject(message.subject)
            
            # Create both HTML and plain text content
            html_content = HtmlContent(message.content)
            plain_content = PlainTextContent(message.plain_content if hasattr(message, 'plain_content') else message.content)
            
            # Build email
            email = Mail(
                from_email=self.from_email,
                to_emails=to_email,
                subject=subject,
                html_content=html_content,
                plain_text_content=plain_content
            )
            
            # Send email
            response = self.sg.send(email)
            
            return {
                'status': 'sent' if response.status_code in [200, 201, 202] else 'failed',
                'provider_id': response.headers.get('X-Message-Id', ''),
                'status_code': response.status_code
            }
            
        except Exception as e:
            return {
                'status': 'failed',
                'error': str(e)
            }
