from django.contrib.auth import get_user_model
from django.db.models import Q, Count, F, ExpressionWrapper, DurationField
from django.utils import timezone
from datetime import timedelta
from typing import List, Dict, Any
import logging

from .audience_service import AudienceService

User = get_user_model()
logger = logging.getLogger(__name__)

class AdvancedAudienceService(AudienceService):
    """Enhanced audience service with advanced segmentation capabilities"""
    
    def __init__(self):
        super().__init__()
    
    def segment_by_behavior(self, behavior_filters: Dict[str, Any]) -> List[User]:
        """Segment users based on behavioral patterns"""
        queryset = User.objects.filter(is_active=True)
        
        # Attendance patterns
        if behavior_filters.get('attendance_frequency'):
            freq = behavior_filters['attendance_frequency']
            if freq == 'regular':
                queryset = queryset.filter(profile__attendance_count__gte=4)  # At least 4 times/month
            elif freq == 'occasional':
                queryset = queryset.filter(
                    profile__attendance_count__gte=1,
                    profile__attendance_count__lt=4
                )
            elif freq == 'inactive':
                queryset = queryset.filter(
                    profile__last_attendance__lt=timezone.now() - timedelta(days=30)
                )
        
        # Giving patterns
        if behavior_filters.get('giving_pattern'):
            pattern = behavior_filters['giving_pattern']
            if pattern == 'regular_giver':
                queryset = queryset.filter(profile__is_regular_giver=True)
            elif pattern == 'one_time_giver':
                queryset = queryset.filter(
                    profile__total_given__gt=0,
                    profile__is_regular_giver=False
                )
        
        # Engagement level
        if behavior_filters.get('engagement_level'):
            level = behavior_filters['engagement_level']
            if level == 'high':
                queryset = queryset.filter(
                    Q(profile__attendance_count__gte=8) |
                    Q(profile__is_volunteer=True) |
                    Q(groups__isnull=False)
                ).distinct()
            elif level == 'medium':
                queryset = queryset.filter(
                    profile__attendance_count__gte=2,
                    profile__attendance_count__lt=8
                )
        
        # Spiritual milestones
        if behavior_filters.get('has_milestones'):
            milestones = behavior_filters['has_milestones']
            if 'baptism' in milestones:
                queryset = queryset.filter(profile__is_baptized=True)
            if 'membership' in milestones:
                queryset = queryset.filter(profile__is_member=True)
            if 'serving' in milestones:
                queryset = queryset.filter(profile__is_serving=True)
        
        return queryset.distinct()
    
    def segment_by_demographics(self, demographic_filters: Dict[str, Any]) -> List[User]:
        """Segment users based on demographic data"""
        queryset = User.objects.filter(is_active=True)
        
        # Age groups
        if demographic_filters.get('age_groups'):
            age_conditions = Q()
            for age_group in demographic_filters['age_groups']:
                if age_group == 'youth':
                    age_conditions |= Q(profile__age__lt=30)
                elif age_group == 'adults':
                    age_conditions |= Q(profile__age__gte=30, profile__age__lt=60)
                elif age_group == 'seniors':
                    age_conditions |= Q(profile__age__gte=60)
            queryset = queryset.filter(age_conditions)
        
        # Geographic location
        if demographic_filters.get('locations'):
            location_conditions = Q()
            for location in demographic_filters['locations']:
                location_conditions |= Q(profile__location__icontains=location)
            queryset = queryset.filter(location_conditions)
        
        # Family status
        if demographic_filters.get('family_status'):
            status = demographic_filters['family_status']
            if status == 'single':
                queryset = queryset.filter(profile__marital_status='single')
            elif status == 'married':
                queryset = queryset.filter(profile__marital_status='married')
            elif status == 'parents':
                queryset = queryset.filter(profile__has_children=True)
        
        return queryset.distinct()
    
    def segment_by_interactions(self, interaction_filters: Dict[str, Any]) -> List[User]:
        """Segment users based on communication interactions"""
        queryset = User.objects.filter(is_active=True)
        
        # Email engagement
        if interaction_filters.get('email_engagement'):
            engagement = interaction_filters['email_engagement']
            if engagement == 'high':
                queryset = queryset.filter(
                    received_messages__channel__channel_type='email',
                    received_messages__open_count__gte=3
                )
            elif engagement == 'low':
                queryset = queryset.filter(
                    received_messages__channel__channel_type='email',
                    received_messages__open_count=0
                )
        
        # Response rate
        if interaction_filters.get('response_rate'):
            rate = interaction_filters['response_rate']
            # Users who responded to messages (for 1-on-1 communications)
            responders = User.objects.annotate(
                response_rate=Count('received_messages', filter=Q(
                    received_messages__read_at__isnull=False
                )) * 100 / Count('received_messages')
            ).filter(response_rate__gte=rate)
            queryset = queryset.filter(id__in=responders)
        
        return queryset.distinct()
    
    def create_smart_segment(self, segment_rules: Dict[str, Any]) -> List[User]:
        """Create smart segments using multiple criteria"""
        queryset = User.objects.filter(is_active=True)
        
        # Combine different segmentation types
        if segment_rules.get('behavioral'):
            behavioral_users = self.segment_by_behavior(segment_rules['behavioral'])
            queryset = queryset.filter(id__in=behavioral_users.values_list('id', flat=True))
        
        if segment_rules.get('demographic'):
            demographic_users = self.segment_by_demographics(segment_rules['demographic'])
            queryset = queryset.filter(id__in=demographic_users.values_list('id', flat=True))
        
        if segment_rules.get('interaction'):
            interaction_users = self.segment_by_interactions(segment_rules['interaction'])
            queryset = queryset.filter(id__in=interaction_users.values_list('id', flat=True))
        
        # Custom SQL-like conditions
        if segment_rules.get('custom_sql'):
            # This would be implemented based on specific needs
            pass
        
        return queryset.distinct()
    
    def get_segment_analytics(self, segment_filters: Dict[str, Any]) -> Dict[str, Any]:
        """Get analytics for a segment"""
        segment_users = self.segment_users(segment_filters)
        
        analytics = {
            'total_users': segment_users.count(),
            'demographics': {
                'age_groups': self._get_age_distribution(segment_users),
                'locations': self._get_location_distribution(segment_users),
            },
            'engagement_metrics': {
                'average_attendance': self._get_average_attendance(segment_users),
                'response_rate': self._get_response_rate(segment_users),
            }
        }
        
        return analytics
    
    def _get_age_distribution(self, users):
        """Calculate age distribution for segment"""
        # Implementation depends on your user profile structure
        return {}
    
    def _get_location_distribution(self, users):
        """Calculate location distribution for segment"""
        return {}
    
    def _get_average_attendance(self, users):
        """Calculate average attendance for segment"""
        return 0
    
    def _get_response_rate(self, users):
        """Calculate average response rate for segment"""
        return 0
