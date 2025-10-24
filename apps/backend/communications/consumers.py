import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model

User = get_user_model()

class ChatConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer for real-time messaging"""
    
    async def connect(self):
        self.user = self.scope["user"]
        
        if self.user.is_anonymous:
            await self.close()
            return
        
        self.conversation_id = self.scope['url_route']['kwargs']['conversation_id']
        self.room_group_name = f'chat_{self.conversation_id}'
        
        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
        
        # Send conversation history
        await self.send_conversation_history()
    
    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
    
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message_type = text_data_json.get('type', 'chat_message')
        
        if message_type == 'chat_message':
            await self.handle_chat_message(text_data_json)
        elif message_type == 'typing':
            await self.handle_typing_indicator(text_data_json)
        elif message_type == 'read_receipt':
            await self.handle_read_receipt(text_data_json)
    
    async def handle_chat_message(self, data):
        message = data['message']
        
        # Save message to database
        saved_message = await self.save_message(message)
        
        # Send message to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': {
                    'id': saved_message.id,
                    'content': saved_message.content,
                    'sender': {
                        'id': self.user.id,
                        'name': self.user.get_full_name() or self.user.email
                    },
                    'timestamp': saved_message.created_at.isoformat(),
                }
            }
        )
    
    async def handle_typing_indicator(self, data):
        is_typing = data['is_typing']
        
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'typing_indicator',
                'user': {
                    'id': self.user.id,
                    'name': self.user.get_full_name() or self.user.email
                },
                'is_typing': is_typing
            }
        )
    
    async def handle_read_receipt(self, data):
        message_id = data['message_id']
        
        # Mark message as read
        await self.mark_message_as_read(message_id)
        
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'read_receipt',
                'message_id': message_id,
                'user': {
                    'id': self.user.id,
                    'name': self.user.get_full_name() or self.user.email
                }
            }
        )
    
    async def chat_message(self, event):
        """Receive message from room group"""
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'message': event['message']
        }))
    
    async def typing_indicator(self, event):
        """Receive typing indicator from room group"""
        await self.send(text_data=json.dumps({
            'type': 'typing_indicator',
            'user': event['user'],
            'is_typing': event['is_typing']
        }))
    
    async def read_receipt(self, event):
        """Receive read receipt from room group"""
        await self.send(text_data=json.dumps({
            'type': 'read_receipt',
            'message_id': event['message_id'],
            'user': event['user']
        }))
    
    async def send_conversation_history(self):
        """Send conversation history to connected client"""
        messages = await self.get_conversation_messages()
        
        await self.send(text_data=json.dumps({
            'type': 'conversation_history',
            'messages': messages
        }))
    
    @database_sync_to_async
    def save_message(self, content):
        """Save message to database"""
        from .models import Conversation, ConversationMessage
        
        conversation = Conversation.objects.get(id=self.conversation_id)
        message = ConversationMessage.objects.create(
            conversation=conversation,
            sender=self.user,
            content=content
        )
        return message
    
    @database_sync_to_async
    def get_conversation_messages(self):
        """Get conversation messages from database"""
        from .models import Conversation, ConversationMessage
        from .api.serializers import ConversationMessageSerializer
        
        conversation = Conversation.objects.get(id=self.conversation_id)
        messages = conversation.messages.all().order_by('created_at')[:50]  # Last 50 messages
        
        serializer = ConversationMessageSerializer(messages, many=True)
        return serializer.data
    
    @database_sync_to_async
    def mark_message_as_read(self, message_id):
        """Mark message as read by current user"""
        from .models import ConversationMessage, MessageReadReceipt
        
        message = ConversationMessage.objects.get(id=message_id)
        receipt, created = MessageReadReceipt.objects.get_or_create(
            user=self.user,
            message=message
        )
        return receipt
