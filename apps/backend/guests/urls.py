from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import GuestProfileViewSet, GuestVisitViewSet, GuestCommunicationViewSet, FollowUpTaskViewSet

router = DefaultRouter()
router.register(r'profiles', GuestProfileViewSet, basename='guest-profiles')
router.register(r'visits', GuestVisitViewSet, basename='guest-visits')
router.register(r'communications', GuestCommunicationViewSet, basename='guest-communications')
router.register(r'follow-up-tasks', FollowUpTaskViewSet, basename='follow-up-tasks')

urlpatterns = [
    path('', include(router.urls)),
]
