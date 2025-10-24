from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone

from ..services.advanced_audience_service import AdvancedAudienceService
from ..services.analytics_service import AnalyticsService

class AdvancedAudienceViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['post'])
    def smart_segment(self, request):
        """Create smart audience segments"""
        segment_rules = request.data.get('rules', {})
        
        audience_service = AdvancedAudienceService()
        users = audience_service.create_smart_segment(segment_rules)
        
        return Response({
            'segment_size': users.count(),
            'users': [{'id': user.id, 'name': user.get_full_name()} for user in users[:100]]  # Limit response
        })
    
    @action(detail=False, methods=['post'])
    def segment_analytics(self, request):
        """Get analytics for a segment"""
        segment_filters = request.data.get('filters', {})
        
        audience_service = AdvancedAudienceService()
        analytics = audience_service.get_segment_analytics(segment_filters)
        
        return Response(analytics)

class AnalyticsViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def campaign_performance(self, request):
        """Get campaign performance analytics"""
        campaign_id = request.query_params.get('campaign_id')
        
        if not campaign_id:
            return Response(
                {'error': 'campaign_id parameter is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        analytics_service = AnalyticsService()
        performance_data = analytics_service.get_campaign_performance(int(campaign_id))
        
        return Response(performance_data)
    
    @action(detail=False, methods=['get'])
    def channel_performance(self, request):
        """Get channel performance analytics"""
        days = int(request.query_params.get('days', 30))
        
        analytics_service = AnalyticsService()
        channel_data = analytics_service.get_channel_performance(days)
        
        return Response(channel_data)
    
    @action(detail=False, methods=['get'])
    def engagement_trends(self, request):
        """Get engagement trends over time"""
        days = int(request.query_params.get('days', 90))
        
        analytics_service = AnalyticsService()
        trends = analytics_service.get_engagement_trends(days)
        
        return Response(trends)
    
    @action(detail=False, methods=['post'])
    def audience_insights(self, request):
        """Get audience communication insights"""
        segment_filters = request.data.get('filters')
        
        analytics_service = AnalyticsService()
        insights = analytics_service.get_audience_insights(segment_filters)
        
        return Response(insights)
