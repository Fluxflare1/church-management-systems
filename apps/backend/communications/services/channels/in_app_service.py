from ...models import Message

class InAppMessageService:
    """In-app message service - stores messages for user retrieval"""
    
    def send(self, message: Message) -> dict:
        """Store in-app message for user retrieval"""
        try:
            # For in-app messages, we simply mark as delivered
            # since they're stored in the database and retrieved via API
            return {
                'status': 'delivered',  # Immediate delivery for in-app
                'provider_id': f'in_app_{message.id}',
                'status_code': 200
            }
            
        except Exception as e:
            return {
                'status': 'failed',
                'error': str(e)
            }
