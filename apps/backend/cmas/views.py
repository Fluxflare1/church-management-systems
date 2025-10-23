from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q, Count, Avg
from django.utils import timezone
from datetime import timedelta
from .models import (
    GrowthCampaign, OutreachChannel, SpiritualDecision, 
    DiscipleshipPathway, PathwayEnrollment, KPI, AnalyticsDashboard
)
from .serializers import (
    GrowthCampaignSerializer, OutreachChannelSerializer, SpiritualDecisionSerializer,
    DiscipleshipPathwaySerializer, PathwayEnrollmentSerializer, KPISerializer,
    AnalyticsDashboardSerializer
)
from .services.analytics_engine import CMASAnalyticsEngine
from apps.guests.models import GuestProfile

class GrowthCampaignViewSet(viewsets.ModelViewSet):
    serializer_class = GrowthCampaignSerializer
    queryset = GrowthCampaign.objects.select_related(
        'branch', 'campaign_lead'
    ).prefetch_related('team_members').all()
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by user's access level
        user = self.request.user
        if hasattr(user, 'branch'):
            queryset = queryset.filter(branch=user.branch)
        elif hasattr(user, 'managed_branches'):
            queryset = queryset.filter(branch__in=user.managed_branches.all())
        
        # Additional filters
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        campaign_type = self.request.query_params.get('type')
        if campaign_type:
            queryset = queryset.filter(campaign_type=campaign_type)
        
        return queryset
    
    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Activate a campaign"""
        campaign = self.get_object()
        campaign.status = 'active'
        campaign.save()
        
        return Response({'status': 'campaign activated'})
    
    @action(detail=True, methods=['post'])
    def pause(self, request, pk=None):
        """Pause a campaign"""
        campaign = self.get_object()
        campaign.status = 'paused'
        campaign.save()
        
        return Response({'status': 'campaign paused'})
    
    @action(detail=True, methods=['get'])
    def performance(self, request, pk=None):
        """Get detailed performance metrics for a campaign"""
        campaign = self.get_object()
        analytics_engine = CMASAnalyticsEngine(branch=campaign.branch)
        
        performance_data = {
            'campaign': GrowthCampaignSerializer(campaign).data,
            'funnel_analysis': analytics_engine.get_funnel_analysis(campaign.id),
            'guest_acquisition': self._get_campaign_guest_acquisition(campaign),
            'channel_performance': self._get_channel_performance(campaign),
        }
        
        return Response(performance_data)
    
    def _get_campaign_guest_acquisition(self, campaign):
        """Get guest acquisition data for campaign period"""
        guests = GuestProfile.objects.filter(
            branch=campaign.branch,
            first_visit_date__range=[campaign.start_date, campaign.end_date or timezone.now().date()]
        )
        
        return {
            'total_guests': guests.count(),
            'new_guests': guests.filter(total_visits=1).count(),
            'returning_guests': guests.filter(total_visits__gt=1).count(),
            'by_week': list(guests.extra({
                'week': "EXTRACT(WEEK FROM first_visit_date)"
            }).values('week').annotate(count=Count('id')).order_by('week'))
        }
    
    def _get_channel_performance(self, campaign):
        """Get performance data for campaign channels"""
        channels = campaign.channels.all()
        return OutreachChannelSerializer(channels, many=True).data

class SpiritualDecisionViewSet(viewsets.ModelViewSet):
    serializer_class = SpiritualDecisionSerializer
    queryset = SpiritualDecision.objects.select_related(
        'guest', 'guest__user', 'follow_up_agent'
    ).all()
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        user = self.request.user
        if hasattr(user, 'branch'):
            queryset = queryset.filter(guest__branch=user.branch)
        elif hasattr(user, 'managed_branches'):
            queryset = queryset.filter(guest__branch__in=user.managed_branches.all())
        
        # Filter by decision type
        decision_type = self.request.query_params.get('type')
        if decision_type:
            queryset = queryset.filter(decision_type=decision_type)
        
        # Filter by follow-up status
        follow_up_status = self.request.query_params.get('follow_up')
        if follow_up_status == 'completed':
            queryset = queryset.filter(follow_up_completed=True)
        elif follow_up_status == 'pending':
            queryset = queryset.filter(follow_up_completed=False)
        
        return queryset
    
    @action(detail=True, methods=['post'])
    def complete_follow_up(self, request, pk=None):
        """Mark spiritual decision follow-up as completed"""
        decision = self.get_object()
        decision.follow_up_completed = True
        decision.follow_up_agent = request.user
        decision.follow_up_notes = request.data.get('notes', '')
        decision.save()
        
        return Response({'status': 'follow-up completed'})

class CMASAnalyticsViewSet(viewsets.ViewSet):
    """Analytics endpoints for CMAS"""
    
    @action(detail=False, methods=['get'])
    def growth_metrics(self, request):
        """Get comprehensive growth metrics"""
        branch = None
        if hasattr(request.user, 'branch'):
            branch = request.user.branch
        
        analytics_engine = CMASAnalyticsEngine(branch=branch)
        period_days = int(request.query_params.get('days', 30))
        
        metrics = analytics_engine.get_growth_metrics(period_days)
        return Response(metrics)
    
    @action(detail=False, methods=['get'])
    def funnel_analysis(self, request):
        """Get conversion funnel analysis"""
        branch = None
        if hasattr(request.user, 'branch'):
            branch = request.user.branch
        
        campaign_id = request.query_params.get('campaign_id')
        analytics_engine = CMASAnalyticsEngine(branch=branch)
        
        funnel_data = analytics_engine.get_funnel_analysis(campaign_id)
        return Response(funnel_data)
    
    @action(detail=False, methods=['get'])
    def campaign_performance(self, request):
        """Get performance data for all campaigns"""
        branch = None
        if hasattr(request.user, 'branch'):
            branch = request.user.branch
        
        analytics_engine = CMASAnalyticsEngine(branch=branch)
        performance_data = analytics_engine.get_campaign_performance()
        
        return Response(performance_data)
    
    @action(detail=False, methods=['get'])
    def trends(self, request):
        """Get trend analysis data"""
        branch = None
        if hasattr(request.user, 'branch'):
            branch = request.user.branch
        
        period = request.query_params.get('period', 'weekly')
        weeks = int(request.query_params.get('weeks', 12))
        
        analytics_engine = CMASAnalyticsEngine(branch=branch)
        trend_data = analytics_engine.get_trend_analysis(period, weeks)
        
        return Response(trend_data)

# Additional view sets for DiscipleshipPathway, PathwayEnrollment, KPI, etc.
class DiscipleshipPathwayViewSet(viewsets.ModelViewSet):
    serializer_class = DiscipleshipPathwaySerializer
    queryset = DiscipleshipPathway.objects.select_related('branch').all()

class PathwayEnrollmentViewSet(viewsets.ModelViewSet):
    serializer_class = PathwayEnrollmentSerializer
    queryset = PathwayEnrollment.objects.select_related('pathway', 'user', 'mentor').all()

class KPIViewSet(viewsets.ModelViewSet):
    serializer_class = KPISerializer
    queryset = KPI.objects.all()
