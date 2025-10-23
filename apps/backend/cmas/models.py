from django.db import models
from django.contrib.auth import get_user_model
from core.models import BaseModel, Branch

User = get_user_model()

class GrowthCampaign(BaseModel):
    CAMPAIGN_TYPES = (
        ('outreach', 'Outreach Campaign'),
        ('revival', 'Revival Campaign'),
        ('membership', 'Membership Drive'),
        ('special_event', 'Special Event'),
        ('digital_ads', 'Digital Advertising')
    )
    
    CAMPAIGN_STATUS = (
        ('draft', 'Draft'),
        ('active', 'Active'),
        ('paused', 'Paused'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled')
    )
    
    name = models.CharField(max_length=200)
    campaign_type = models.CharField(max_length=50, choices=CAMPAIGN_TYPES)
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name='growth_campaigns')
    status = models.CharField(max_length=20, choices=CAMPAIGN_STATUS, default='draft')
    
    # Campaign details
    description = models.TextField(blank=True)
    target_audience = models.JSONField(default=dict, help_text="Targeting criteria")
    budget = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    
    # Goals and metrics
    target_guests = models.PositiveIntegerField(default=0)
    target_conversions = models.PositiveIntegerField(default=0)
    actual_guests = models.PositiveIntegerField(default=0)
    actual_conversions = models.PositiveIntegerField(default=0)
    
    # Campaign team
    campaign_lead = models.ForeignKey(User, on_delete=models.CASCADE, related_name='led_campaigns')
    team_members = models.ManyToManyField(User, related_name='campaign_teams', blank=True)
    
    class Meta:
        db_table = 'cmas_growth_campaigns'
        ordering = ['-created_at']

class OutreachChannel(BaseModel):
    CHANNEL_TYPES = (
        ('social_media', 'Social Media'),
        ('digital_ads', 'Digital Ads'),
        ('print_media', 'Print Media'),
        ('radio_tv', 'Radio/TV'),
        ('word_of_mouth', 'Word of Mouth'),
        ('community_event', 'Community Event'),
        ('direct_mail', 'Direct Mail')
    )
    
    campaign = models.ForeignKey(GrowthCampaign, on_delete=models.CASCADE, related_name='channels')
    channel_type = models.CharField(max_length=50, choices=CHANNEL_TYPES)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    
    # Channel performance
    reach = models.PositiveIntegerField(default=0, help_text="Estimated reach")
    cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    engagements = models.PositiveIntegerField(default=0)
    conversions = models.PositiveIntegerField(default=0)
    
    # Configuration
    is_active = models.BooleanField(default=True)
    configuration = models.JSONField(default=dict, help_text="Channel-specific settings")
    
    class Meta:
        db_table = 'cmas_outreach_channels'

class ConversionFunnel(BaseModel):
    campaign = models.ForeignKey(GrowthCampaign, on_delete=models.CASCADE, related_name='funnels')
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    
    # Funnel stages
    stages = models.JSONField(default=list, help_text="Funnel stage definitions")
    
    # Performance metrics
    total_entered = models.PositiveIntegerField(default=0)
    total_completed = models.PositiveIntegerField(default=0)
    average_duration = models.DurationField(null=True, blank=True)
    
    class Meta:
        db_table = 'cmas_conversion_funnels'

class FunnelStage(BaseModel):
    funnel = models.ForeignKey(ConversionFunnel, on_delete=models.CASCADE, related_name='stage_data')
    stage_name = models.CharField(max_length=100)
    stage_order = models.PositiveIntegerField()
    
    # Stage metrics
    entries = models.PositiveIntegerField(default=0)
    completions = models.PositiveIntegerField(default=0)
    drop_offs = models.PositiveIntegerField(default=0)
    
    # Conversion rates
    conversion_rate = models.FloatField(default=0.0)
    time_in_stage = models.DurationField(null=True, blank=True)
    
    class Meta:
        db_table = 'cmas_funnel_stages'
        ordering = ['stage_order']

class SpiritualDecision(BaseModel):
    DECISION_TYPES = (
        ('salvation', 'Salvation Decision'),
        ('baptism', 'Baptism Decision'),
        ('membership', 'Membership Decision'),
        ('rededication', 'Rededication'),
        ('calling', 'Ministry Calling')
    )
    
    guest = models.ForeignKey('guests.GuestProfile', on_delete=models.CASCADE, related_name='spiritual_decisions')
    decision_type = models.CharField(max_length=50, choices=DECISION_TYPES)
    decision_date = models.DateField()
    notes = models.TextField(blank=True)
    
    # Follow-up status
    follow_up_completed = models.BooleanField(default=False)
    follow_up_agent = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    follow_up_notes = models.TextField(blank=True)
    
    # Next steps
    next_step = models.CharField(max_length=200, blank=True)
    next_step_date = models.DateField(null=True, blank=True)
    
    class Meta:
        db_table = 'cmas_spiritual_decisions'
        ordering = ['-decision_date']

class DiscipleshipPathway(BaseModel):
    PATHWAY_TYPES = (
        ('new_believer', 'New Believer'),
        ('membership', 'Church Membership'),
        ('leader_training', 'Leader Training'),
        ('ministry_training', 'Ministry Training')
    )
    
    name = models.CharField(max_length=200)
    pathway_type = models.CharField(max_length=50, choices=PATHWAY_TYPES)
    description = models.TextField(blank=True)
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name='discipleship_pathways')
    
    # Pathway structure
    stages = models.JSONField(default=list, help_text="Pathway stages with requirements")
    duration_weeks = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'cmas_discipleship_pathways'

class PathwayEnrollment(BaseModel):
    ENROLLMENT_STATUS = (
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('paused', 'Paused'),
        ('dropped', 'Dropped Out')
    )
    
    pathway = models.ForeignKey(DiscipleshipPathway, on_delete=models.CASCADE, related_name='enrollments')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='pathway_enrollments')
    status = models.CharField(max_length=20, choices=ENROLLMENT_STATUS, default='active')
    enrolled_date = models.DateField(auto_now_add=True)
    completed_date = models.DateField(null=True, blank=True)
    
    # Progress tracking
    current_stage = models.PositiveIntegerField(default=0)
    progress_percentage = models.FloatField(default=0.0)
    milestones_completed = models.JSONField(default=list)
    
    # Mentorship
    mentor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='mentored_enrollments')
    
    class Meta:
        db_table = 'cmas_pathway_enrollments'
        unique_together = ['pathway', 'user']

class KPI(models.Model):
    KPI_TYPES = (
        ('guest_acquisition', 'Guest Acquisition'),
        ('conversion', 'Conversion'),
        ('retention', 'Retention'),
        ('engagement', 'Engagement'),
        ('spiritual_growth', 'Spiritual Growth')
    )
    
    name = models.CharField(max_length=200)
    kpi_type = models.CharField(max_length=50, choices=KPI_TYPES)
    description = models.TextField(blank=True)
    
    # Measurement
    target_value = models.FloatField()
    current_value = models.FloatField(default=0)
    measurement_unit = models.CharField(max_length=50)
    calculation_formula = models.TextField(help_text="Formula for calculating this KPI")
    
    # Timeframe
    timeframe = models.CharField(max_length=50, help_text="e.g., weekly, monthly, quarterly")
    last_calculated = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'cmas_kpis'

class AnalyticsDashboard(BaseModel):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name='analytics_dashboards')
    
    # Dashboard configuration
    widgets = models.JSONField(default=list, help_text="Dashboard widget configurations")
    is_public = models.BooleanField(default=False)
    refresh_interval = models.PositiveIntegerField(default=60, help_text="Refresh interval in minutes")
    
    class Meta:
        db_table = 'cmas_analytics_dashboards'
