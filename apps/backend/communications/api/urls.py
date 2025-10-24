from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *
from .advanced_views import AdvancedAudienceViewSet, AnalyticsViewSet


router = DefaultRouter()
router.register(r'channels', CommunicationChannelViewSet, basename='channel')
router.register(r'templates', MessageTemplateViewSet, basename='template')
router.register(r'campaigns', MessageCampaignViewSet, basename='campaign')
router.register(r'messages', MessageViewSet, basename='message')
router.register(r'conversations', ConversationViewSet, basename='conversation')
router.register(r'preferences', UserCommunicationPreferenceViewSet, basename='preference')
router.register(r'advanced/audience', AdvancedAudienceViewSet, basename='advanced-audience')
router.register(r'analytics', AnalyticsViewSet, basename='analytics')


urlpatterns = [
    path('', include(router.urls)),
    path('send-message/', CommunicationAPIView.as_view(), name='send-message'),
]





