from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
router.register(r'channels', CommunicationChannelViewSet, basename='channel')
router.register(r'templates', MessageTemplateViewSet, basename='template')
router.register(r'campaigns', MessageCampaignViewSet, basename='campaign')
router.register(r'messages', MessageViewSet, basename='message')
router.register(r'conversations', ConversationViewSet, basename='conversation')
router.register(r'preferences', UserCommunicationPreferenceViewSet, basename='preference')

urlpatterns = [
    path('', include(router.urls)),
    path('send-message/', CommunicationAPIView.as_view(), name='send-message'),
]
