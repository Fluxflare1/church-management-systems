from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from django.utils import timezone

from ..models import (
    CommunicationChannel, MessageTemplate, MessageCampaign, 
    Message, Conversation, ConversationMessage, UserCommunicationPreference
)
from .serializers import *
from ..services.template_service import TemplateService
from ..tasks import process_campaign, send_bulk_announcement

class CommunicationChannelViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = CommunicationChannel.objects.filter(is_active=True)
    serializer_class = CommunicationChannelSerializer
    permission_classes = [IsAuthenticated]

class MessageTemplateViewSet(viewsets.ModelViewSet):
    serializer_class = MessageTemplateSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return MessageTemplate.objects.filter(created_by=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class MessageCampaignViewSet(viewsets.ModelViewSet):
    serializer_class = MessageCampaignSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return MessageCampaign.objects.filter(created_by=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def send(self, request, pk=None):
        campaign = self.get_object()
        serializer = CampaignSendSerializer(data=request.data)
        
        if serializer.is_valid():
            if campaign.status != 'draft':
                return Response(
                    {'error': 'Campaign can only be sent from draft status'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Process campaign asynchronously
            process_campaign.delay(campaign.id)
            
            return Response({'status': 'Campaign queued for processing'})
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class MessageViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Users can see messages they sent or received
        return Message.objects.filter(
            models.Q(from_user=self.request.user) | 
            models.Q(to_user=self.request.user)
        ).distinct()

class ConversationViewSet(viewsets.ModelViewSet):
    serializer_class = ConversationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Conversation.objects.filter(participants=self.request.user)
    
    @action(detail=True, methods=['get'])
    def messages(self, request, pk=None):
        conversation = self.get_object()
        messages = conversation.messages.all()
        serializer = ConversationMessageSerializer(
            messages, many=True, context={'request': request}
        )
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def send_message(self, request, pk=None):
        conversation = self.get_object()
        content = request.data.get('content')
        
        if not content:
            return Response(
                {'error': 'Content is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        message = ConversationMessage.objects.create(
            conversation=conversation,
            sender=request.user,
            content=content
        )
        
        serializer = ConversationMessageSerializer(message, context={'request': request})
        return Response(serializer.data)

class UserCommunicationPreferenceViewSet(viewsets.ModelViewSet):
    serializer_class = UserCommunicationPreferenceSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return UserCommunicationPreference.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class CommunicationAPIView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = SendMessageSerializer(data=request.data)
        
        if serializer.is_valid():
            data = serializer.validated_data
            
            try:
                template = MessageTemplate.objects.get(id=data['template_id'])
                
                if data['schedule_type'] == 'immediate':
                    # Send immediately
                    send_bulk_announcement.delay(
                        template.id,
                        data['audience_filters'],
                        request.user.id
                    )
                    return Response({'status': 'Messages queued for immediate sending'})
                
                else:
                    # Schedule for later
                    # Create a campaign for scheduled sending
                    campaign = MessageCampaign.objects.create(
                        name=f"Scheduled Announcement - {timezone.now()}",
                        template=template,
                        audience_filter=data['audience_filters'],
                        schedule_type='scheduled',
                        scheduled_for=data['scheduled_for'],
                        status='scheduled',
                        created_by=request.user
                    )
                    
                    return Response({
                        'status': 'Campaign scheduled',
                        'campaign_id': campaign.id
                    })
                    
            except MessageTemplate.DoesNotExist:
                return Response(
                    {'error': 'Template not found'}, 
                    status=status.HTTP_404_NOT_FOUND
                )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
