from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Member, Family, WelfareCase, WelfareUpdate, MemberEngagement, MinistryParticipation
from churches.serializers import BranchSerializer
from groups.serializers import MinistrySerializer

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email', 'username']

class FamilySerializer(serializers.ModelSerializer):
    member_count = serializers.SerializerMethodField()
    primary_contact_name = serializers.SerializerMethodField()

    class Meta:
        model = Family
        fields = [
            'id', 'family_id', 'family_name', 'primary_contact', 
            'primary_contact_name', 'address', 'member_count', 
            'created_at', 'updated_at'
        ]

    def get_member_count(self, obj):
        return obj.members.count()

    def get_primary_contact_name(self, obj):
        if obj.primary_contact:
            return obj.primary_contact.user.get_full_name()
        return None

class MemberEngagementSerializer(serializers.ModelSerializer):
    class Meta:
        model = MemberEngagement
        fields = [
            'attendance_streak', 'monthly_attendance_rate', 'last_attendance_date',
            'ministry_involvement', 'event_participation', 'last_communication',
            'communication_response_rate', 'giving_consistency', 'engagement_score',
            'engagement_tier', 'updated_at'
        ]

class MemberSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    branch = BranchSerializer(read_only=True)
    family = FamilySerializer(read_only=True)
    engagement = MemberEngagementSerializer(read_only=True)
    age = serializers.ReadOnlyField()
    is_active_member = serializers.ReadOnlyField()
    
    # Related counts
    welfare_cases_count = serializers.SerializerMethodField()
    active_ministries_count = serializers.SerializerMethodField()

    class Meta:
        model = Member
        fields = [
            'id', 'member_id', 'user', 'branch', 'marital_status', 'occupation',
            'education_level', 'skills', 'date_of_birth', 'age', 'salvation_date',
            'baptism_date', 'membership_date', 'spiritual_gifts', 'family',
            'family_role', 'welfare_category', 'special_needs', 'welfare_notes',
            'relationship_manager', 'membership_status', 'is_active_member',
            'welfare_cases_count', 'active_ministries_count', 'engagement',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def get_welfare_cases_count(self, obj):
        return obj.welfare_cases.count()

    def get_active_ministries_count(self, obj):
        return obj.ministry_participation.filter(is_active=True).count()

class MemberCreateSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(write_only=True)
    branch_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Member
        fields = [
            'user_id', 'branch_id', 'member_id', 'marital_status', 'occupation',
            'education_level', 'skills', 'date_of_birth', 'salvation_date',
            'baptism_date', 'membership_date', 'spiritual_gifts', 'welfare_category',
            'special_needs'
        ]

    def validate_user_id(self, value):
        try:
            User.objects.get(id=value)
        except User.DoesNotExist:
            raise serializers.ValidationError("User does not exist")
        return value

    def validate_branch_id(self, value):
        try:
            Branch.objects.get(id=value)
        except Branch.DoesNotExist:
            raise serializers.ValidationError("Branch does not exist")
        return value

    def create(self, validated_data):
        user_id = validated_data.pop('user_id')
        branch_id = validated_data.pop('branch_id')
        
        user = User.objects.get(id=user_id)
        branch = Branch.objects.get(id=branch_id)
        
        member = Member.objects.create(
            user=user,
            branch=branch,
            **validated_data
        )
        
        # Create engagement record
        MemberEngagement.objects.create(member=member)
        
        return member

class WelfareUpdateSerializer(serializers.ModelSerializer):
    officer_name = serializers.SerializerMethodField()

    class Meta:
        model = WelfareUpdate
        fields = [
            'id', 'officer', 'officer_name', 'update_notes', 'action_taken',
            'next_steps', 'created_at'
        ]
        read_only_fields = ['created_at']

    def get_officer_name(self, obj):
        return obj.officer.get_full_name()

class WelfareCaseSerializer(serializers.ModelSerializer):
    member_name = serializers.SerializerMethodField()
    assigned_officer_name = serializers.SerializerMethodField()
    updates = WelfareUpdateSerializer(many=True, read_only=True)
    is_overdue = serializers.ReadOnlyField()
    days_open = serializers.ReadOnlyField()

    class Meta:
        model = WelfareCase
        fields = [
            'id', 'member', 'member_name', 'case_type', 'title', 'description',
            'urgency', 'assigned_officer', 'assigned_officer_name', 'status',
            'resolution_notes', 'reported_date', 'last_updated', 
            'target_resolution_date', 'resolved_date', 'is_overdue', 'days_open',
            'updates'
        ]
        read_only_fields = ['reported_date', 'last_updated']

    def get_member_name(self, obj):
        return obj.member.user.get_full_name()

    def get_assigned_officer_name(self, obj):
        if obj.assigned_officer:
            return obj.assigned_officer.get_full_name()
        return None

class WelfareCaseCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = WelfareCase
        fields = [
            'member', 'case_type', 'title', 'description', 'urgency',
            'target_resolution_date'
        ]

    def create(self, validated_data):
        welfare_case = WelfareCase.objects.create(**validated_data)
        return welfare_case

class MinistryParticipationSerializer(serializers.ModelSerializer):
    member_name = serializers.SerializerMethodField()
    ministry_details = MinistrySerializer(source='ministry', read_only=True)

    class Meta:
        model = MinistryParticipation
        fields = [
            'id', 'member', 'member_name', 'ministry', 'ministry_details', 'role',
            'start_date', 'end_date', 'is_active', 'notes'
        ]

    def get_member_name(self, obj):
        return obj.member.user.get_full_name()
