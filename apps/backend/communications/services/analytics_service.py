from django.db.models import Count, Avg, Q, F
from django.utils import timezone
from datetime import timedelta, datetime
from typing import Dict, List, Any
import logging

from ..models import Message, MessageCampaign, CommunicationChannel

logger = logging.getLogger(__name__)

class AnalyticsService:
    """Advanced analytics service for communication metrics"""
    
    def __init__(self):
        pass
    
    def get_campaign_performance(self, campaign_id: int) -> Dict[str, Any]:
        """Get detailed performance metrics for a campaign"""
        try:
            campaign = MessageCampaign.objects.get(id=campaign_id)
            messages = Message.objects.filter(campaign=campaign)
            
            total_messages = messages.count()
            sent_messages = messages.filter(status='sent').count()
            delivered_messages = messages.filter(status='delivered').count()
            read_messages = messages.filter(status='read').count()
            failed_messages = messages.filter(status='failed').count()
            
            # Engagement metrics
            total_opens = messages.aggregate(total_opens=Sum('open_count'))['total_opens'] or 0
            total_clicks = messages.aggregate(total_clicks=Sum('click_count'))['total_clicks'] or 0
            
            # Calculate rates
            delivery_rate = (delivered_messages / total_messages * 100) if total_messages > 0 else 0
            read_rate = (read_messages / total_messages * 100) if total_messages > 0 else 0
            open_rate = (total_opens / total_messages) if total_messages > 0 else 0
            click_rate = (total_clicks / total_messages) if total_messages > 0 else 0
            
            # Time-based analysis
            time_to_first_open = self._get_time_to_first_open(messages)
            peak_engagement_time = self._get_peak_engagement_time(messages)
            
            return {
                'campaign_id': campaign_id,
                'campaign_name': campaign.name,
                'overview': {
                    'total_messages': total_messages,
                    'sent': sent_messages,
                    'delivered': delivered_messages,
                    'read': read_messages,
                    'failed': failed_messages,
                },
                'rates': {
                    'delivery_rate': round(delivery_rate, 2),
                    'read_rate': round(read_rate, 2),
                    'open_rate': round(open_rate, 2),
                    'click_rate': round(click_rate, 2),
                },
                'engagement': {
                    'total_opens': total_opens,
                    'total_clicks': total_clicks,
                    'time_to_first_open': time_to_first_open,
                    'peak_engagement_time': peak_engagement_time,
                },
                'audience_breakdown': self._get_audience_breakdown(messages),
            }
            
        except MessageCampaign.DoesNotExist:
            logger.error(f"Campaign {campaign_id} not found for analytics")
            return {'error': 'Campaign not found'}
    
    def get_channel_performance(self, days: int = 30) -> Dict[str, Any]:
        """Get performance metrics by channel"""
        start_date = timezone.now() - timedelta(days=days)
        
        channel_data = []
        channels = CommunicationChannel.objects.filter(is_active=True)
        
        for channel in channels:
            messages = Message.objects.filter(
                channel=channel,
                created_at__gte=start_date
            )
            
            total_messages = messages.count()
            successful_messages = messages.filter(status__in=['sent', 'delivered', 'read']).count()
            failed_messages = messages.filter(status='failed').count()
            
            success_rate = (successful_messages / total_messages * 100) if total_messages > 0 else 0
            
            # Cost analysis (if applicable)
            cost_per_message = self._calculate_channel_cost(channel)
            total_cost = total_messages * cost_per_message
            
            channel_data.append({
                'channel_id': channel.id,
                'channel_name': channel.name,
                'channel_type': channel.channel_type,
                'metrics': {
                    'total_messages': total_messages,
                    'successful': successful_messages,
                    'failed': failed_messages,
                    'success_rate': round(success_rate, 2),
                },
                'cost': {
                    'cost_per_message': cost_per_message,
                    'total_cost': total_cost,
                }
            })
        
        return {
            'period': f"Last {days} days",
            'channels': channel_data,
            'summary': self._get_channel_summary(channel_data),
        }
    
    def get_engagement_trends(self, days: int = 90) -> Dict[str, Any]:
        """Get engagement trends over time"""
        end_date = timezone.now()
        start_date = end_date - timedelta(days=days)
        
        # Daily engagement data
        daily_data = []
        current_date = start_date
        
        while current_date <= end_date:
            next_date = current_date + timedelta(days=1)
            
            day_messages = Message.objects.filter(
                created_at__gte=current_date,
                created_at__lt=next_date
            )
            
            day_metrics = {
                'date': current_date.date().isoformat(),
                'total_messages': day_messages.count(),
                'opened_messages': day_messages.filter(open_count__gt=0).count(),
                'clicked_messages': day_messages.filter(click_count__gt=0).count(),
                'response_rate': self._calculate_daily_response_rate(day_messages),
            }
            
            daily_data.append(day_metrics)
            current_date = next_date
        
        return {
            'period': f"Last {days} days",
            'daily_metrics': daily_data,
            'trend_analysis': self._analyze_engagement_trends(daily_data),
        }
    
    def get_audience_insights(self, segment_filters: Dict[str, Any] = None) -> Dict[str, Any]:
        """Get insights about audience communication preferences"""
        from .advanced_audience_service import AdvancedAudienceService
        
        audience_service = AdvancedAudienceService()
        
        if segment_filters:
            users = audience_service.segment_users(segment_filters)
        else:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            users = User.objects.filter(is_active=True)
        
        # Channel preferences
        channel_preferences = {}
        for channel in CommunicationChannel.objects.filter(is_active=True):
            preference_count = users.filter(
                usercommunicationpreference__channel=channel,
                usercommunicationpreference__is_enabled=True
            ).count()
            channel_preferences[channel.channel_type] = {
                'count': preference_count,
                'percentage': (preference_count / users.count() * 100) if users.count() > 0 else 0
            }
        
        # Response patterns
        responsive_users = users.filter(
            received_messages__read_at__isnull=False
        ).distinct().count()
        
        response_rate = (responsive_users / users.count() * 100) if users.count() > 0 else 0
        
        return {
            'audience_size': users.count(),
            'channel_preferences': channel_preferences,
            'engagement_metrics': {
                'responsive_users': responsive_users,
                'response_rate': round(response_rate, 2),
            },
            'recommendations': self._generate_audience_recommendations(users),
        }
    
    def _get_time_to_first_open(self, messages):
        """Calculate average time to first open"""
        # Implementation depends on your tracking setup
        return "N/A"
    
    def _get_peak_engagement_time(self, messages):
        """Identify peak engagement times"""
        # Group by hour of day and find peak
        return "N/A"
    
    def _get_audience_breakdown(self, messages):
        """Break down audience by segments"""
        # Implementation for audience segmentation analysis
        return {}
    
    def _calculate_channel_cost(self, channel):
        """Calculate cost per message for a channel"""
        # This would integrate with your billing system
        cost_map = {
            'email': 0.001,  # $0.001 per email
            'sms': 0.05,     # $0.05 per SMS
            'whatsapp': 0.01, # $0.01 per WhatsApp message
            'push': 0.0001,  # $0.0001 per push
            'in_app': 0,     # Free
        }
        return cost_map.get(channel.channel_type, 0)
    
    def _get_channel_summary(self, channel_data):
        """Generate summary of channel performance"""
        total_messages = sum(channel['metrics']['total_messages'] for channel in channel_data)
        total_cost = sum(channel['cost']['total_cost'] for channel in channel_data)
        
        return {
            'total_messages': total_messages,
            'total_cost': total_cost,
            'average_cost_per_message': total_cost / total_messages if total_messages > 0 else 0,
            'most_effective_channel': max(channel_data, key=lambda x: x['metrics']['success_rate']) if channel_data else None,
        }
    
    def _calculate_daily_response_rate(self, day_messages):
        """Calculate response rate for a specific day"""
        total_messages = day_messages.count()
        responded_messages = day_messages.filter(read_at__isnull=False).count()
        return (responded_messages / total_messages * 100) if total_messages > 0 else 0
    
    def _analyze_engagement_trends(self, daily_data):
        """Analyze trends in engagement data"""
        if not daily_data:
            return {}
        
        # Simple trend analysis
        recent_week = daily_data[-7:]
        previous_week = daily_data[-14:-7] if len(daily_data) >= 14 else []
        
        recent_avg = sum(day['total_messages'] for day in recent_week) / len(recent_week) if recent_week else 0
        previous_avg = sum(day['total_messages'] for day in previous_week) / len(previous_week) if previous_week else 0
        
        trend = "stable"
        if previous_avg > 0:
            change = ((recent_avg - previous_avg) / previous_avg) * 100
            if change > 10:
                trend = "increasing"
            elif change < -10:
                trend = "decreasing"
        
        return {
            'trend': trend,
            'recent_week_avg': recent_avg,
            'change_percentage': ((recent_avg - previous_avg) / previous_avg * 100) if previous_avg > 0 else 0,
        }
    
    def _generate_audience_recommendations(self, users):
        """Generate communication recommendations based on audience analysis"""
        recommendations = []
        
        # Sample recommendations
        if users.count() < 100:
            recommendations.append("Consider personalized 1-on-1 communication for better engagement")
        
        # Add more sophisticated recommendations based on your analytics
        
        return recommendations
