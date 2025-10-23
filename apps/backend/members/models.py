from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator
from churches.models import Branch

class Family(models.Model):
    """Family unit for grouping members"""
    family_id = models.CharField(max_length=20, unique=True)
    family_name = models.CharField(max_length=100)
    primary_contact = models.ForeignKey('Member', on_delete=models.SET_NULL, null=True, related_name='primary_family')
    address = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.family_name} ({self.family_id})"

class Member(models.Model):
    MARITAL_STATUS = [
        ('single', 'Single'),
        ('married', 'Married'),
        ('divorced', 'Divorced'),
        ('widowed', 'Widowed'),
        ('separated', 'Separated'),
    ]

    WELFARE_CATEGORIES = [
        ('none', 'No Special Needs'),
        ('pwd', 'Person with Disability'),
        ('widow', 'Widow/Widower'),
        ('senior', 'Senior Citizen'),
        ('orphan', 'Orphan'),
        ('medical', 'Medical Needs'),
        ('financial', 'Financial Assistance'),
        ('housing', 'Housing Needs'),
        ('employment', 'Employment Support'),
    ]

    MEMBERSHIP_STATUS = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('transferred', 'Transferred'),
        ('deceased', 'Deceased'),
    ]

    # Core Identity
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='member_profile')
    member_id = models.CharField(max_length=20, unique=True)
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name='members')
    
    # Personal Information
    marital_status = models.CharField(max_length=20, choices=MARITAL_STATUS, blank=True)
    occupation = models.CharField(max_length=100, blank=True)
    education_level = models.CharField(max_length=50, blank=True)
    skills = models.JSONField(default=list, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    
    # Spiritual Journey
    salvation_date = models.DateField(null=True, blank=True)
    baptism_date = models.DateField(null=True, blank=True)
    membership_date = models.DateField(default=timezone.now)
    spiritual_gifts = models.JSONField(default=list, blank=True)
    
    # Family Connections
    family = models.ForeignKey(Family, on_delete=models.SET_NULL, null=True, blank=True, related_name='members')
    family_role = models.CharField(max_length=50, blank=True)
    
    # Welfare Classification
    welfare_category = models.CharField(max_length=50, choices=WELFARE_CATEGORIES, default='none')
    special_needs = models.JSONField(default=list, blank=True)
    welfare_notes = models.TextField(blank=True)
    
    # Relationship Management
    relationship_manager = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='managed_members',
        limit_choices_to={'groups__name__in': ['Relationship Managers', 'Branch Managers']}
    )
    membership_status = models.CharField(max_length=20, choices=MEMBERSHIP_STATUS, default='active')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'members_member'
        ordering = ['member_id']
        indexes = [
            models.Index(fields=['member_id']),
            models.Index(fields=['branch', 'membership_status']),
            models.Index(fields=['welfare_category']),
        ]

    def __str__(self):
        return f"{self.user.get_full_name()} ({self.member_id})"

    @property
    def age(self):
        if self.date_of_birth:
            today = timezone.now().date()
            return today.year - self.date_of_birth.year - (
                (today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day)
            )
        return None

    @property
    def is_active_member(self):
        return self.membership_status == 'active'

class WelfareCase(models.Model):
    CASE_TYPES = [
        ('financial', 'Financial Assistance'),
        ('medical', 'Medical Support'),
        ('housing', 'Housing Needs'),
        ('employment', 'Employment Support'),
        ('counseling', 'Counseling'),
        ('prayer', 'Prayer Support'),
        ('education', 'Educational Support'),
        ('other', 'Other'),
    ]

    CASE_STATUS = [
        ('open', 'Open'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
        ('escalated', 'Escalated'),
        ('closed', 'Closed'),
    ]

    URGENCY_LEVELS = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]

    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='welfare_cases')
    case_type = models.CharField(max_length=20, choices=CASE_TYPES)
    title = models.CharField(max_length=200)
    description = models.TextField()
    urgency = models.CharField(max_length=20, choices=URGENCY_LEVELS, default='medium')
    
    # Assignment & Tracking
    assigned_officer = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='assigned_welfare_cases',
        limit_choices_to={'groups__name__in': ['Welfare Officers', 'Relationship Managers']}
    )
    status = models.CharField(max_length=20, choices=CASE_STATUS, default='open')
    resolution_notes = models.TextField(blank=True)
    
    # Timelines
    reported_date = models.DateTimeField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now=True)
    target_resolution_date = models.DateField(null=True, blank=True)
    resolved_date = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'members_welfare_case'
        ordering = ['-reported_date']
        indexes = [
            models.Index(fields=['member', 'status']),
            models.Index(fields=['case_type', 'urgency']),
            models.Index(fields=['assigned_officer', 'status']),
        ]

    def __str__(self):
        return f"{self.title} - {self.member.user.get_full_name()}"

    @property
    def is_overdue(self):
        if self.target_resolution_date and self.status in ['open', 'in_progress']:
            return timezone.now().date() > self.target_resolution_date
        return False

    @property
    def days_open(self):
        return (timezone.now() - self.reported_date).days

class WelfareUpdate(models.Model):
    """Track updates and follow-ups on welfare cases"""
    welfare_case = models.ForeignKey(WelfareCase, on_delete=models.CASCADE, related_name='updates')
    officer = models.ForeignKey(User, on_delete=models.CASCADE)
    update_notes = models.TextField()
    action_taken = models.TextField(blank=True)
    next_steps = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'members_welfare_update'
        ordering = ['-created_at']

    def __str__(self):
        return f"Update for {self.welfare_case.title} - {self.created_at.strftime('%Y-%m-%d')}"

class MemberEngagement(models.Model):
    """Track member engagement metrics"""
    member = models.OneToOneField(Member, on_delete=models.CASCADE, related_name='engagement')
    
    # Attendance Metrics
    attendance_streak = models.IntegerField(default=0)
    monthly_attendance_rate = models.FloatField(
        default=0.0,
        validators=[MinValueValidator(0.0), MaxValueValidator(100.0)]
    )
    last_attendance_date = models.DateField(null=True, blank=True)
    
    # Participation Metrics
    ministry_involvement = models.JSONField(default=dict, blank=True)
    event_participation = models.JSONField(default=dict, blank=True)
    
    # Communication Engagement
    last_communication = models.DateTimeField(null=True, blank=True)
    communication_response_rate = models.FloatField(
        default=0.0,
        validators=[MinValueValidator(0.0), MaxValueValidator(100.0)]
    )
    
    # Giving Engagement
    giving_consistency = models.FloatField(
        default=0.0,
        validators=[MinValueValidator(0.0), MaxValueValidator(100.0)]
    )
    
    # Calculated Engagement Score (0-100)
    engagement_score = models.FloatField(
        default=0.0,
        validators=[MinValueValidator(0.0), MaxValueValidator(100.0)]
    )
    
    engagement_tier = models.CharField(
        max_length=20,
        choices=[
            ('high', 'High Engagement'),
            ('medium', 'Medium Engagement'),
            ('low', 'Low Engagement'),
            ('inactive', 'Inactive'),
        ],
        default='medium'
    )
    
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'members_member_engagement'

    def __str__(self):
        return f"Engagement - {self.member.user.get_full_name()}"

class MinistryParticipation(models.Model):
    """Track member involvement in ministries/departments"""
    ROLES = [
        ('member', 'Member'),
        ('volunteer', 'Volunteer'),
        ('leader', 'Leader'),
        ('coordinator', 'Coordinator'),
        ('head', 'Department Head'),
    ]

    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='ministry_participation')
    ministry = models.ForeignKey('groups.Ministry', on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=ROLES, default='member')
    start_date = models.DateField(default=timezone.now)
    end_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    
    notes = models.TextField(blank=True)
    
    class Meta:
        db_table = 'members_ministry_participation'
        unique_together = ['member', 'ministry']
        indexes = [
            models.Index(fields=['member', 'is_active']),
            models.Index(fields=['ministry', 'role']),
        ]

    def __str__(self):
        return f"{self.member.user.get_full_name()} - {self.ministry.name} ({self.role})"
