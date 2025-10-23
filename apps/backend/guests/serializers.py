from rest_framework import serializers
from .models import GuestProfile, GuestVisit, GuestCommunication, FollowUpTask, AutomatedWorkflow, WorkflowStep
from apps.churches.serializers import BranchSerializer
from apps.authentication.serializers import UserSerializer

class GuestProfileSerializer(serializers.ModelSerializer):
    branch = BranchSerializer(read_only=True)
    branch_id = serializers.IntegerField(write_only=True)
    user = UserSerializer(read_only=True)
    follow_up_agent = UserSerializer(read_only=True)
    follow_up_agent_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    
    class Meta:
        model = GuestProfile
        fields = [
            'id', 'user', 'branch', 'branch_id', 'source', 'first_visit_date', 
            'last_visit_date', 'total_visits', 'status', 'follow_up_agent', 'follow_up_agent_id',
            'prefers_email', 'prefers_sms', 'prefers_whatsapp', 'prefers_in_app',
            'interested_salvation', 'interested_baptism', 'interested_membership', 'interested_volunteering',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class GuestVisitSerializer(serializers.ModelSerializer):
    branch = BranchSerializer(read_only=True)
    branch_id = serializers.IntegerField(write_only=True)
    checked_in_by = UserSerializer(read_only=True)
    
    class Meta:
        model = GuestVisit
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class GuestCommunicationSerializer(serializers.ModelSerializer):
    guest = GuestProfileSerializer(read_only=True)
    sent_by = UserSerializer(read_only=True)
    
    class Meta:
        model = GuestCommunication
        fields = '__all__'
        read_only_fields = ['id', 'sent_at', 'created_at', 'updated_at']

class FollowUpTaskSerializer(serializers.ModelSerializer):
    guest = GuestProfileSerializer(read_only=True)
    assigned_to = UserSerializer(read_only=True)
    guest_id = serializers.IntegerField(write_only=True)
    assigned_to_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = FollowUpTask
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class WorkflowStepSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkflowStep
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class AutomatedWorkflowSerializer(serializers.ModelSerializer):
    steps = WorkflowStepSerializer(many=True, read_only=True)
    branch = BranchSerializer(read_only=True)
    
    class Meta:
        model = AutomatedWorkflow
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class ConnectCardSubmissionSerializer(serializers.Serializer):
    # Personal Information
    first_name = serializers.CharField(max_length=100)
    last_name = serializers.CharField(max_length=100)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=20, required=False)
    
    # Visit Information
    branch_id = serializers.IntegerField()
    visit_date = serializers.DateField()
    how_heard = serializers.CharField(max_length=100)
    is_first_visit = serializers.BooleanField(default=True)
    
    # Spiritual Interests
    interested_salvation = serializers.BooleanField(default=False)
    interested_baptism = serializers.BooleanField(default=False)
    interested_membership = serializers.BooleanField(default=False)
    interested_volunteering = serializers.BooleanField(default=False)
    
    # Communication Preferences
    prefers_email = serializers.BooleanField(default=True)
    prefers_sms = serializers.BooleanField(default=False)
    prefers_whatsapp = serializers.BooleanField(default=True)
    prefers_in_app = serializers.BooleanField(default=True)
    
    # Optional
    prayer_request = serializers.CharField(required=False, allow_blank=True)
    notes = serializers.CharField(required=False, allow_blank=True)
