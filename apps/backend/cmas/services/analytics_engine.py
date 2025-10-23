import logging
from django.db.models import Count, Q, F, ExpressionWrapper, FloatField
from django.db.models.functions import TruncWeek, TruncMonth
from django.utils import timezone
from datetime import timedelta
from apps.guests.models import GuestProfile, GuestVisit
from apps.members.models import MemberProfile
from .models import SpiritualDecision, GrowthCampaign, OutreachChannel

logger = logging.getLogger(__name__)

class CMASAnalyticsEngine:
    """Advanced analytics engine for Church Member Acquisition System"""
    
    def __init__(self, branch=None):
        self.branch = branch
    
    def get_growth_metrics(self, period_days=30):
        """Get comprehensive growth metrics for the specified period"""
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=period_days)
        
        # Base querysets
        guest_queryset = GuestProfile.objects.all()
        visit_queryset = GuestVisit.objects.all()
        decision_queryset = SpiritualDecision.objects.all()
        
        if self.branch:
            guest_queryset = guest_queryset.filter(branch=self.branch)
            visit_queryset = visit_queryset.filter(branch=self.branch)
            decision_queryset = decision_queryset.filter(guest__branch=self.branch)
        
        # Calculate metrics
        new_guests = guest_queryset.filter(
            first_visit_date__range=[start_date, end_date]
        ).count()
        
        returning_guests = guest_queryset.filter(
            last_visit_date__range=[start_date, end_date],
            total_visits__gt=1
        ).count()
        
        total_visits = visit_queryset.filter(
            visit_date__range=[start_date, end_date]
        ).count()
        
        spiritual_decisions = decision_queryset.filter(
            decision_date__range=[start_date, end_date]
        ).count()
        
        # Conversion rate (guests to members)
        guests_became_members = guest_queryset.filter(
            status='converted',
            updated_at__date__range=[start_date, end_date]
        ).count()
        
        conversion_rate = 0
        if new_guests > 0:
            conversion_rate = (guests_became_members / new_guests) * 100
        
        return {
            'period': f'{period_days} days',
            'start_date': start_date,
            'end_date': end_date,
            'new_guests': new_guests,
            'returning_guests': returning_guests,
            'total_visits': total_visits,
            'spiritual_decisions': spiritual_decisions,
            'guests_became_members': guests_became_members,
            'conversion_rate': round(conversion_rate, 2),
            'average_visits_per_guest': round(total_visits / max(new_guests, 1), 1)
        }
    
    def get_funnel_analysis(self, campaign_id=None):
        """Analyze guest conversion funnel"""
        funnel_data = {
            'awareness': 0,    # Heard about church
            'interest': 0,     # Expressed interest
            'visit': 0,        # First visit
            'engagement': 0,   # Multiple visits
            'decision': 0,     # Spiritual decision
            'membership': 0,   # Became member
        }
        
        base_queryset = GuestProfile.objects.all()
        if self.branch:
            base_queryset = base_queryset.filter(branch=self.branch)
        
        if campaign_id:
            # Filter by campaign if specified
            campaign = GrowthCampaign.objects.get(id=campaign_id)
            start_date = campaign.start_date
            base_queryset = base_queryset.filter(first_visit_date__gte=start_date)
        
        # Calculate funnel stages
        funnel_data['awareness'] = base_queryset.count()
        funnel_data['interest'] = base_queryset.exclude(source='').count()
        funnel_data['visit'] = base_queryset.filter(total_visits__gte=1).count()
        funnel_data['engagement'] = base_queryset.filter(total_visits__gte=2).count()
        funnel_data['decision'] = SpiritualDecision.objects.filter(
            guest__in=base_queryset
        ).count()
        funnel_data['membership'] = base_queryset.filter(status='converted').count()
        
        # Calculate conversion rates between stages
        conversion_rates = {}
        stages = list(funnel_data.keys())
        for i in range(len(stages) - 1):
            current_stage = funnel_data[stages[i]]
            next_stage = funnel_data[stages[i + 1]]
            
            if current_stage > 0:
                rate = (next_stage / current_stage) * 100
                conversion_rates[f'{stages[i]}_to_{stages[i+1]}'] = round(rate, 2)
            else:
                conversion_rates[f'{stages[i]}_to_{stages[i+1]}'] = 0
        
        return {
            'funnel_stages': funnel_data,
            'conversion_rates': conversion_rates,
            'total_funnel_conversion': round(
                (funnel_data['membership'] / max(funnel_data['awareness'], 1)) * 100, 2
            )
        }
    
    def get_campaign_performance(self):
        """Get performance metrics for all campaigns"""
        campaigns = GrowthCampaign.objects.all()
        if self.branch:
            campaigns = campaigns.filter(branch=self.branch)
        
        campaign_data = []
        for campaign in campaigns:
            # Calculate campaign-specific metrics
            campaign_guests = GuestProfile.objects.filter(
                branch=campaign.branch,
                first_visit_date__range=[campaign.start_date, campaign.end_date or timezone.now().date()]
            )
            
            campaign_conversions = SpiritualDecision.objects.filter(
                guest__in=campaign_guests,
                decision_date__range=[campaign.start_date, campaign.end_date or timezone.now().date()]
            )
            
            performance_data = {
                'campaign': campaign.name,
                'target_guests': campaign.target_guests,
                'actual_guests': campaign_guests.count(),
                'target_conversions': campaign.target_conversions,
                'actual_conversions': campaign_conversions.count(),
                'budget': float(campaign.budget) if campaign.budget else 0,
                'status': campaign.status,
                'roi': self._calculate_campaign_roi(campaign, campaign_guests.count())
            }
            
            campaign_data.append(performance_data)
        
        return campaign_data
    
    def _calculate_campaign_roi(self, campaign, guest_count):
        """Calculate Return on Investment for a campaign"""
        if not campaign.budget or campaign.budget == 0:
            return 0
        
        # Simple ROI: cost per guest acquisition
        cost_per_guest = float(campaign.budget) / max(guest_count, 1)
        
        # More sophisticated ROI could factor in:
        # - Lifetime value of a member
        # - Spiritual impact metrics
        # - Community engagement value
        
        return round(cost_per_guest, 2)
    
    def get_trend_analysis(self, period='weekly', weeks=12):
        """Get trend data for key metrics over time"""
        end_date = timezone.now()
        
        if period == 'weekly':
            start_date = end_date - timedelta(weeks=weeks)
            trunc_func = TruncWeek
        else:  # monthly
            start_date = end_date - timedelta(weeks=weeks*4)
            trunc_func = TruncMonth
        
        # Guest trends
        guest_trends = (
            GuestProfile.objects
            .filter(created_at__range=[start_date, end_date])
            .annotate(period=trunc_func('created_at'))
            .values('period')
            .annotate(count=Count('id'))
            .order_by('period')
        )
        
        # Visit trends
        visit_trends = (
            GuestVisit.objects
            .filter(visit_date__range=[start_date.date(), end_date.date()])
            .annotate(period=trunc_func('visit_date'))
            .values('period')
            .annotate(count=Count('id'))
            .order_by('period')
        )
        
        # Decision trends
        decision_trends = (
            SpiritualDecision.objects
            .filter(decision_date__range=[start_date.date(), end_date.date()])
            .annotate(period=trunc_func('decision_date'))
            .values('period')
            .annotate(count=Count('id'))
            .order_by('period')
        )
        
        return {
            'guest_trends': list(guest_trends),
            'visit_trends': list(visit_trends),
            'decision_trends': list(decision_trends),
            'period': period,
            'weeks': weeks
        }
