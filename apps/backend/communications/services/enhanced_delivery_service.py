from django.conf import settings
import logging
from typing import Dict, Any

from ..models import Message
from .delivery_service import DeliveryService
from .preference_service import PreferenceService

logger = logging.getLogger(__name__)

class EnhancedDeliveryService(DeliveryService):
    """Enhanced delivery service with preference checking and optimization"""
    
    def __init__(self):
        super().__init__()
        self.preference_service = PreferenceService()
    
    def send_message(self, message: Message) -> Dict[str, Any]:
        """Send message with preference checking"""
        # Check if user can receive this type of message
        if not self.preference_service.can_receive_messages(message.to_user, message.channel.channel_type):
            logger.info(f"User {message.to_user.id} has opted out of {message.channel.channel_type} messages")
            return {
                'status': 'cancelled',
                'reason': 'user_opt_out'
            }
        
        # Check global rate limiting
        if not self._check_rate_limits(message):
            return {
                'status': 'cancelled',
                'reason': 'rate_limited'
            }
        
        # Proceed with normal delivery
        return super().send_message(message)
    
    def send_bulk_with_preferences(self, messages: List[Message]) -> Dict[str, Any]:
        """Send bulk messages with preference filtering"""
        try:
            # Filter messages based on user preferences
            eligible_messages = []
            opted_out_count = 0
            
            for message in messages:
                if self.preference_service.can_receive_messages(message.to_user, message.channel.channel_type):
                    eligible_messages.append(message)
                else:
                    opted_out_count += 1
            
            # Send eligible messages
            results = {
                'total_messages': len(messages),
                'eligible_messages': len(eligible_messages),
                'opted_out': opted_out_count,
                'sent': 0,
                'failed': 0,
                'details': []
            }
            
            for message in eligible_messages:
                try:
                    result = self.send_message(message)
                    results['details'].append({
                        'message_id': message.id,
                        'status': result['status'],
                        'user_id': message.to_user.id
                    })
                    
                    if result['status'] == 'sent':
                        results['sent'] += 1
                    else:
                        results['failed'] += 1
                        
                except Exception as e:
                    logger.error(f"Error sending message {message.id}: {str(e)}")
                    results['failed'] += 1
                    results['details'].append({
                        'message_id': message.id,
                        'status': 'error',
                        'error': str(e)
                    })
            
            return results
            
        except Exception as e:
            logger.error(f"Error in bulk send with preferences: {str(e)}")
            return {'status': 'error', 'error': str(e)}
    
    def _check_rate_limits(self, message: Message) -> bool:
        """Check rate limiting for message sending"""
        # Implement rate limiting logic here
        # This could be based on:
        # - Messages per hour/day
        # - Recipient-specific limits
        # - Channel-specific limits
        
        # For now, return True (no rate limiting)
        return True
    
    def optimize_delivery_time(self, message: Message) -> Dict[str, Any]:
        """Calculate optimal delivery time based on user behavior"""
        # This would analyze user engagement patterns to find best send times
        # For now, return immediate delivery
        return {
            'optimal_time': None,  # Immediate
            'confidence': 0.0,
            'reason': 'immediate_delivery'
        }
