from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'members', views.MemberViewSet, basename='member')
router.register(r'welfare-cases', views.WelfareCaseViewSet, basename='welfare-case')
router.register(r'families', views.FamilyViewSet, basename='family')
router.register(r'ministry-participation', views.MinistryParticipationViewSet, basename='ministry-participation')
router.register(r'engagement', views.MemberEngagementViewSet, basename='engagement')

urlpatterns = [
    path('', include(router.urls)),
]

# Additional custom URLs
urlpatterns += [
    path('reports/member-engagement/', views.MemberViewSet.as_view({'get': 'engagement_report'}), name='member-engagement-report'),
    path('reports/welfare-dashboard/', views.WelfareCaseViewSet.as_view({'get': 'dashboard_stats'}), name='welfare-dashboard-stats'),
]
