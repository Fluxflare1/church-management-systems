from django.contrib import admin
from .models import (
    CommunicationChannel, MessageTemplate, MessageCampaign, 
    Message, Conversation, ConversationMessage, UserCommunicationPreference
)

@admin.register(CommunicationChannel)
class CommunicationChannelAdmin(admin.ModelAdmin):
    list_display = ['name', 'channel_type', 'is_active', 'created_at']
    list_filter = ['channel_type', 'is_active']
    search_fields = ['name']

@admin.register(MessageTemplate)
class MessageTemplateAdmin(admin.ModelAdmin):
    list_display = ['name', 'template_type', 'channel', 'is_active', 'created_at']
    list_filter = ['template_type', 'channel', 'is_active']
    search_fields = ['name', 'content']
    readonly_fields = ['variables', 'created_by']

@admin.register(MessageCampaign)
class MessageCampaignAdmin(admin.ModelAdmin):
    list_display = ['name', 'template', 'schedule_type', 'status', 'created_at']
    list_filter = ['schedule_type', 'status', 'template__channel']
    search_fields = ['name', 'description']
    readonly_fields = ['created_by']

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['id', 'channel', 'to_user', 'status', 'sent_at', 'created_at']
    list_filter = ['channel', 'status', 'message_type']
    search_fields = ['to_user__email', 'content']
    readonly_fields = ['sent_at', 'delivered_at', 'read_at']

@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ['subject', 'last_message_at', 'created_at']
    search_fields = ['subject']

@admin.register(ConversationMessage)
class ConversationMessageAdmin(admin.ModelAdmin):
    list_display = ['conversation', 'sender', 'created_at']
    list_filter = ['created_at']
    search_fields = ['content']

@admin.register(UserCommunicationPreference)
class UserCommunicationPreferenceAdmin(admin.ModelAdmin):
    list_display = ['user', 'channel', 'is_enabled', 'opt_in_date']
    list_filter = ['channel', 'is_enabled']
    search_fields = ['user__email']
