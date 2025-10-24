from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()

class CommunicationChannel(models.Model):
    CHANNEL_TYPES = (
        ('email', 'Email'),
        ('sms', 'SMS'),
        ('whatsapp', 'WhatsApp'),
        ('push', 'Push Notification'),
        ('in_app', 'In-App Message'),
        ('announcement', 'Announcement'),
    )
    
    name = models.CharField(max_length=100)
    channel_type = models.CharField(max_length=20, choices=CHANNEL_TYPES)
    is_active = models.BooleanField(default=True)
    config = models.JSONField(default=dict)  # API keys, settings
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'communication_channels'

    def __str__(self):
        return f"{self.name} ({self.channel_type})"

class MessageTemplate(models.Model):
    TEMPLATE_TYPES = (
        ('welcome', 'Welcome'),
        ('follow_up', 'Follow-up'),
        ('event', 'Event'),
        ('giving', 'Giving'),
        ('welfare', 'Welfare'),  # Changed from pastoral to welfare
        ('system', 'System'),
    )
    
    name = models.CharField(max_length=200)
    template_type = models.CharField(max_length=20, choices=TEMPLATE_TYPES)
    subject = models.CharField(max_length=255, blank=True)
    content = models.TextField()
    variables = models.JSONField(default=list)  # ['{name}', '{branch}']
    channel = models.ForeignKey(CommunicationChannel, on_delete=models.CASCADE)
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'message_templates'
        ordering = ['-created_at']

    def __str__(self):
        return self.name

class MessageCampaign(models.Model):
    CAMPAIGN_STATUS = (
        ('draft', 'Draft'),
        ('scheduled', 'Scheduled'),
        ('processing', 'Processing'),
        ('sent', 'Sent'),
        ('cancelled', 'Cancelled'),
    )
    
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    template = models.ForeignKey(MessageTemplate, on_delete=models.CASCADE)
    audience_filter = models.JSONField(default=dict)  # Segmentation criteria
    schedule_type = models.CharField(max_length=20, choices=(
        ('immediate', 'Immediate'),
        ('scheduled', 'Scheduled'),
        ('recurring', 'Recurring'),
    ))
    scheduled_for = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=CAMPAIGN_STATUS, default='draft')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'message_campaigns'
        ordering = ['-created_at']

class Message(models.Model):
    MESSAGE_STATUS = (
        ('queued', 'Queued'),
        ('sent', 'Sent'),
        ('delivered', 'Delivered'),
        ('read', 'Read'),
        ('failed', 'Failed'),
    )
    
    MESSAGE_TYPES = (
        ('outbound', 'Outbound'),
        ('inbound', 'Inbound'),
        ('announcement', 'Announcement'),
    )
    
    campaign = models.ForeignKey(MessageCampaign, null=True, blank=True, on_delete=models.SET_NULL)
    template = models.ForeignKey(MessageTemplate, on_delete=models.CASCADE)
    channel = models.ForeignKey(CommunicationChannel, on_delete=models.CASCADE)
    message_type = models.CharField(max_length=20, choices=MESSAGE_TYPES, default='outbound')
    
    # Sender/Receiver
    from_user = models.ForeignKey(User, related_name='sent_messages', on_delete=models.CASCADE)
    to_user = models.ForeignKey(User, related_name='received_messages', null=True, blank=True, on_delete=models.CASCADE)
    to_group = models.ForeignKey('groups.Group', null=True, blank=True, on_delete=models.CASCADE)
    
    # Content
    subject = models.CharField(max_length=255, blank=True)
    content = models.TextField()
    variables_used = models.JSONField(default=dict)
    
    # Delivery
    status = models.CharField(max_length=20, choices=MESSAGE_STATUS, default='queued')
    sent_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    read_at = models.DateTimeField(null=True, blank=True)
    
    # Analytics
    open_count = models.IntegerField(default=0)
    click_count = models.IntegerField(default=0)
    error_message = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'messages'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'sent_at']),
            models.Index(fields=['to_user', 'created_at']),
        ]

class Conversation(models.Model):
    participants = models.ManyToManyField(User, through='ConversationParticipant')
    subject = models.CharField(max_length=255)
    last_message_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'conversations'
        ordering = ['-last_message_at']

class ConversationParticipant(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE)
    is_active = models.BooleanField(default=True)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'conversation_participants'
        unique_together = ['user', 'conversation']

class ConversationMessage(models.Model):
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    read_by = models.ManyToManyField(User, through='MessageReadReceipt', related_name='read_messages')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'conversation_messages'
        ordering = ['created_at']

class MessageReadReceipt(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    message = models.ForeignKey(ConversationMessage, on_delete=models.CASCADE)
    read_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'message_read_receipts'
        unique_together = ['user', 'message']

class UserCommunicationPreference(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    channel = models.ForeignKey(CommunicationChannel, on_delete=models.CASCADE)
    is_enabled = models.BooleanField(default=True)
    opt_in_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'user_communication_preferences'
        unique_together = ['user', 'channel']
