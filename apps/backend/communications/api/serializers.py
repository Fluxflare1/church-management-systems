from rest_framework import serializers
from ..models import (
    CommunicationChannel, MessageTemplate, MessageCampaign, 
    Message, Conversation, ConversationMessage, UserCommunicationPreference
)

class CommunicationChannelSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommunicationChannel
        fields = ['id', 'name', 'channel_type', 'is_active', 'created_at']

class MessageTemplateSerializer(serializers.ModelSerializer):
    channel_name = serializers.CharField(source='channel.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = MessageTemplate
        fields = [
            'id', 'name', 'template_type', 'subject', 'content', 
            'variables', 'channel', 'channel_name', 'is_active',
            'created_by', 'created_by_name', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_by', 'variables']

class MessageCampaignSerializer(serializers.ModelSerializer):
    template_name = serializers.CharField(source='template.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    audience_count = serializers.SerializerMethodField()
    
    class Meta:
        model = MessageCampaign
        fields = [
            'id', 'name', 'description', 'template', 'template_name',
            'audience_filter', 'schedule_type', 'scheduled_for', 'status',
            'created_by', 'created_by_name', 'audience_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_by', 'status']
    
    def get_audience_count(self, obj):
        from ..services.audience_service import AudienceService
        return AudienceService.get_audience_count(obj.audience_filter)

class MessageSerializer(serializers.ModelSerializer):
    channel_name = serializers.CharField(source='channel.name', read_only=True)
    from_user_name = serializers.CharField(source='from_user.get_full_name', read_only=True)
    to_user_name = serializers.CharField(source='to_user.get_full_name', read_only=True)
    
    class Meta:
        model = Message
        fields = [
            'id', 'campaign', 'template', 'channel', 'channel_name',
            'message_type', 'from_user', 'from_user_name', 'to_user', 'to_user_name',
            'to_group', 'subject', 'content', 'variables_used', 'status',
            'sent_at', 'delivered_at', 'read_at', 'open_count', 'click_count',
            'error_message', 'created_at', 'updated_at'
        ]
        read_only_fields = ['sent_at', 'delivered_at', 'read_at']

class ConversationSerializer(serializers.ModelSerializer):
    participant_count = serializers.SerializerMethodField()
    last_message_preview = serializers.SerializerMethodField()
    
    class Meta:
        model = Conversation
        fields = [
            'id', 'subject', 'participant_count', 'last_message_preview',
            'last_message_at', 'created_at'
        ]
    
    def get_participant_count(self, obj):
        return obj.participants.count()
    
    def get_last_message_preview(self, obj):
        last_message = obj.messages.last()
        if last_message:
            return last_message.content[:100] + '...' if len(last_message.content) > 100 else last_message.content
        return ''

class ConversationMessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.get_full_name', read_only=True)
    is_read = serializers.SerializerMethodField()
    
    class Meta:
        model = ConversationMessage
        fields = [
            'id', 'conversation', 'sender', 'sender_name', 'content',
            'is_read', 'created_at'
        ]
    
    def get_is_read(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.read_by.filter(id=request.user.id).exists()
        return False

class UserCommunicationPreferenceSerializer(serializers.ModelSerializer):
    channel_name = serializers.CharField(source='channel.name', read_only=True)
    channel_type = serializers.CharField(source='channel.channel_type', read_only=True)
    
    class Meta:
        model = UserCommunicationPreference
        fields = ['id', 'user', 'channel', 'channel_name', 'channel_type', 'is_enabled', 'opt_in_date']

class SendMessageSerializer(serializers.Serializer):
    template_id = serializers.IntegerField()
    audience_filters = serializers.JSONField()
    schedule_type = serializers.ChoiceField(choices=[('immediate', 'Immediate'), ('scheduled', 'Scheduled')])
    scheduled_for = serializers.DateTimeField(required=False)

class CampaignSendSerializer(serializers.Serializer):
    send_now = serializers.BooleanField(default=False)
