import logging
from django.conf import settings
from django.core.mail import send_mail, EmailMultiAlternatives
from django.template import Template, Context
import sendgrid
from sendgrid.helpers.mail import Mail, Content, To, From, HtmlContent

logger = logging.getLogger(__name__)

class EmailService:
    def __init__(self):
        self.use_sendgrid = getattr(settings, 'USE_SENDGRID', False)
        self.from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@thogmi.org')
        self.from_name = getattr(settings, 'DEFAULT_FROM_NAME', 'THOGMi Church')
        
        if self.use_sendgrid:
            self.sg_client = sendgrid.SendGridAPIClient(
                getattr(settings, 'SENDGRID_API_KEY', '')
            )
    
    def send_email(self, to_email: str, subject: str, html_content: str = None, 
                  text_content: str = None, context: dict = None) -> dict:
        """
        Send email using Django SMTP or SendGrid
        Returns: { 'success': bool, 'message_id': str, 'error': str }
        """
        try:
            if self.use_sendgrid:
                return self._send_via_sendgrid(to_email, subject, html_content, text_content)
            else:
                return self._send_via_smtp(to_email, subject, html_content, text_content)
                
        except Exception as e:
            logger.error(f"Email sending error to {to_email}: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def _send_via_sendgrid(self, to_email: str, subject: str, html_content: str, text_content: str) -> dict:
        """Send email using SendGrid API"""
        try:
            from_email = From(self.from_email, self.from_name)
            to_email = To(to_email)
            
            # Use HTML content if provided, otherwise text
            if html_content:
                content = HtmlContent(html_content)
            else:
                content = Content("text/plain", text_content or subject)
            
            mail = Mail(from_email, to_email, subject, content)
            
            response = self.sg_client.client.mail.send.post(request_body=mail.get())
            
            if response.status_code in [200, 202]:
                logger.info(f"SendGrid email sent to {to_email}, Status: {response.status_code}")
                return {
                    'success': True,
                    'message_id': response.headers.get('X-Message-Id', ''),
                    'status_code': response.status_code
                }
            else:
                error_msg = f"SendGrid HTTP {response.status_code}: {response.body}"
                logger.error(f"SendGrid error: {error_msg}")
                return {'success': False, 'error': error_msg}
                
        except Exception as e:
            logger.error(f"SendGrid API error: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def _send_via_smtp(self, to_email: str, subject: str, html_content: str, text_content: str) -> dict:
        """Send email using Django SMTP backend"""
        try:
            if html_content:
                # Send both HTML and text versions
                email = EmailMultiAlternatives(
                    subject=subject,
                    body=text_content or "Please view this email in an HTML-compatible client.",
                    from_email=self.from_email,
                    to=[to_email]
                )
                email.attach_alternative(html_content, "text/html")
                result = email.send()
            else:
                result = send_mail(
                    subject=subject,
                    message=text_content or subject,
                    from_email=self.from_email,
                    recipient_list=[to_email],
                    fail_silently=False
                )
            
            logger.info(f"SMTP email sent to {to_email}, Result: {result}")
            return {'success': True, 'message_id': f'smtp_{to_email}_{subject}'}
            
        except Exception as e:
            logger.error(f"SMTP email error to {to_email}: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def send_bulk_emails(self, email_list: list, subject: str, template: str, context_data: dict) -> dict:
        """Send bulk emails to multiple recipients"""
        results = {
            'total': len(email_list),
            'successful': 0,
            'failed': 0,
            'errors': []
        }
        
        for email_data in email_list:
            to_email = email_data.get('email')
            personal_context = {**context_data, **email_data}
            
            # Render template with personal context
            try:
                template_obj = Template(template)
                context = Context(personal_context)
                rendered_content = template_obj.render(context)
                
                result = self.send_email(
                    to_email=to_email,
                    subject=subject,
                    html_content=rendered_content
                )
                
                if result['success']:
                    results['successful'] += 1
                else:
                    results['failed'] += 1
                    results['errors'].append({
                        'email': to_email,
                        'error': result['error']
                    })
                    
            except Exception as e:
                results['failed'] += 1
                results['errors'].append({
                    'email': to_email,
                    'error': str(e)
                })
        
        return results
