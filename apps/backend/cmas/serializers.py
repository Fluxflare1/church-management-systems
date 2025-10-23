from rest_framework import serializers
from .models import (
    GrowthCampaign, OutreachChannel, ConversionFunnel, FunnelStage,
    SpiritualDecision, DiscipleshipPathway, PathwayEnrollment, KPI, AnalyticsDashboard
)
from apps.churches.serializers import BranchSerializer
from apps.authentication.serializers import UserSerializer
from apps.guests.serializers import GuestProfileSerializer

class GrowthCampaignSerializer(serializers.ModelSerializer):
    branch = BranchSerializer(read_only=True)
    branch_id = serializers.IntegerField(write_only=True)
    campaign_lead = UserSerializer(read_only=True)
    campaign_lead_id = serializers.IntegerField(write_only=True)
    team_members = UserSerializer(many=True, read_only=True)
    team_member_ids = serializers.ListField(
        child=serializers.IntegerField(), write_only=True, required=False
    )
    
    # Calculated fields
    completion_rate = serializers.SerializerMethodField()
    days_remaining = serializers.SerializerMethodField()
    roi = serializers.SerializerMethodField()
    
    class Meta:
        model = GrowthCampaign
        fields = [
            'id', 'name', 'campaign_type', 'branch', 'branch_id', 'status',
            'description', 'target_audience', 'budget', 'start_date', 'end_date',
            'target_guests', 'target_conversions', 'actual_guests', 'actual_conversions',
            'campaign_lead', 'campaign_lead_id', 'team_members', 'team_member_ids',
            'completion_rate', 'days_remaining', 'roi', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_completion_rate(self, obj):
        if obj.target_guests > 0:
            return (obj.actual_guests / obj.target_guests) * 100
        return 0
    
    def get_days_remaining(self, obj):
        from django.utils import timezone
        if obj.end_date:
            remaining = (obj.end_date - timezone.now().date()).days
            return max(0, remaining)
        return None
    
    def get_roi(self, obj):
        if obj.budget and obj.budget > 0 and obj.actual_conversions > 0:
            # Simple ROI calculation - cost per conversion
            return float(obj.budget / obj.actual_conversions)
        return 0

class OutreachChannelSerializer(serializers.ModelSerializer):
    campaign = GrowthCampaignSerializer(read_only=True)
    campaign_id = serializers.IntegerField(write_only=True)
    
    # Performance metrics
    cost_per_conversion = serializers.SerializerMethodField()
    engagement_rate = serializers.SerializerMethodField()
    
    class Meta:
        model = OutreachChannel
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_cost_per_conversion(self, obj):
        if obj.conversions > 0 and obj.cost > 0:
            return float(obj.cost / obj.conversions)
        return 0
    
    def get_engagement_rate(self, obj):
        if obj.reach > 0:
            return (obj.engagements / obj.reach) * 100
        return 0

class SpiritualDecisionSerializer(serializers.ModelSerializer):
    guest = GuestProfileSerializer(read_only=True)
    guest_id = serializers.IntegerField(write_only=True)
    follow_up_agent = UserSerializer(read_only=True)
    
    class Meta:
        model = SpiritualDecision
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class DiscipleshipPathwaySerializer(serializers.ModelSerializer):
    branch = BranchSerializer(read_only=True)
    branch_id = serializers.IntegerField(write_only=True)
    
    # Statistics
    active_enrollments = serializers.SerializerMethodField()
    completion_rate = serializers.SerializerMethodField()
    
    class Meta:
        model = DiscipleshipPathway
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_active_enrollments(self, obj):
        return obj.enrollments.filter(status='active').count()
    
    def get_completion_rate(self, obj):
        total_enrollments = obj.enrollments.count()
        if total_enrollments > 0:
            completed = obj.enrollments.filter(status='completed').count()
            return (completed / total_enrollments) * 100
        return 0

class PathwayEnrollmentSerializer(serializers.ModelSerializer):
    pathway = DiscipleshipPathwaySerializer(read_only=True)
    pathway_id = serializers.IntegerField(write_only=True)
    user = UserSerializer(read_only=True)
    user_id = serializers.IntegerField(write_only=True)
    mentor = UserSerializer(read_only=True)
    
    class Meta:
        model = PathwayEnrollment
        fields = '__all__'
        read_only_fields = ['id', 'enrolled_date', 'created_at', 'updated_at']

class KPISerializer(serializers.ModelSerializer):
    achievement_percentage = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    
    class Meta:
        model = KPI
        fields = '__all__'
        read_only_fields = ['id', 'last_calculated']
    
    def get_achievement_percentage(self, obj):
        if obj.target_value > 0:
            return (obj.current_value / obj.target_value) * 100
        return 0
    
    def get_status(self, obj):
        achievement = self.get_achievement_percentage(obj)
        if achievement >= 100:
            return 'exceeded'
        elif achievement >= 80:
            return 'on_track'
        elif achievement >= 50:
            return 'needs_attention'
        else:
            return 'at_risk'

class AnalyticsDashboardSerializer(serializers.ModelSerializer):
    branch = BranchSerializer(read_only=True)
    
    class Meta:
        model = AnalyticsDashboard
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']
