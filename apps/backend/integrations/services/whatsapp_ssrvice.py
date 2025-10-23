import logging
import requests
from django.conf import settings
from datetime import datetime

logger = logging.getLogger(__name__)

class WhatsAppService:
    def __init__(self):
        self.access_token = getattr(settings, 'WHATSAPP_ACCESS_TOKEN', '')
        self.phone_number_id = getattr(settings, 'WHATSAPP_PHONE_NUMBER_ID', '')
        self.api_version = getattr(settings, 'WHATSAPP_API_VERSION', 'v18.0')
        self.base_url = f"https://graph.facebook.com/{self.api_version}/{self.phone_number_id}"
    
    def send_message(self, to_phone: str, message: str, message_type: str = "text") -> dict:
        """
        Send WhatsApp message using Facebook Graph API
        Returns: { 'success': bool, 'message_id': str, 'error': str }
        """
        try:
            if not self.access_token or not self.phone_number_id:
                return {'success': False, 'error': 'WhatsApp service not configured'}
            
            # Format phone number (remove + and any spaces)
            formatted_phone = to_phone.replace('+', '').replace(' ', '')
            
            headers = {
                'Authorization': f'Bearer {self.access_token}',
                'Content-Type': 'application/json'
            }
            
            payload = {
                "messaging_product": "whatsapp",
                "to": formatted_phone,
                "type": message_type,
            }
            
            if message_type == "text":
                payload["text"] = {"body": message}
            elif message_type == "template":
                # For predefined templates
                payload["template"] = message
            else:
                return {'success': False, 'error': f'Unsupported message type: {message_type}'}
            
            response = requests.post(
                f"{self.base_url}/messages",
                headers=headers,
                json=payload,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                message_id = result.get('messages', [{}])[0].get('id')
                
                logger.info(f"WhatsApp message sent to {to_phone}, ID: {message_id}")
                
                return {
                    'success': True,
                    'message_id': message_id,
                    'response': result
                }
            else:
                error_msg = f"HTTP {response.status_code}: {response.text}"
                logger.error(f"WhatsApp API error for {to_phone}: {error_msg}")
                return {'success': False, 'error': error_msg}
                
        except requests.exceptions.RequestException as e:
            logger.error(f"WhatsApp request error for {to_phone}: {str(e)}")
            return {'success': False, 'error': f'Network error: {str(e)}'}
        except Exception as e:
            logger.error(f"Unexpected WhatsApp error for {to_phone}: {str(e)}")
            return {'success': False, 'error': 'Failed to send WhatsApp message'}
    
    def send_template_message(self, to_phone: str, template_name: str, parameters: list = None) -> dict:
        """Send a predefined WhatsApp template message"""
        try:
            formatted_phone = to_phone.replace('+', '').replace(' ', '')
            
            headers = {
                'Authorization': f'Bearer {self.access_token}',
                'Content-Type': 'application/json'
            }
            
            template_data = {
                "name": template_name,
                "language": {"code": "en"}
            }
            
            if parameters:
                template_data["components"] = [{
                    "type": "body",
                    "parameters": parameters
                }]
            
            payload = {
                "messaging_product": "whatsapp",
                "to": formatted_phone,
                "type": "template",
                "template": template_data
            }
            
            response = requests.post(
                f"{self.base_url}/messages",
                headers=headers,
                json=payload,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                return {'success': True, 'message_id': result.get('messages', [{}])[0].get('id')}
            else:
                return {'success': False, 'error': f"HTTP {response.status_code}: {response.text}"}
                
        except Exception as e:
            logger.error(f"WhatsApp template error for {to_phone}: {str(e)}")
            return {'success': False, 'error': str(e)}
