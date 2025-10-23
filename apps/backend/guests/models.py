from django.db import models
from django.contrib.auth import get_user_model
from core.models import BaseModel, Branch

User = get_user_model()

class GuestProfile(BaseModel):
    GUEST_STATUS = (
        ('new', 'New Guest'),
        ('contacted', 'Contacted'),
        ('visited', 'Visited Multiple Times'),
        ('converting', 'Considering Membership'),
        ('converted', 'Became Member'),
        ('inactive', 'No Longer Visiting')
    )
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='guest_profile')
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name='guests')
    source = models.CharField(max_length=100, help_text="How they heard about us")
    first_visit_date = models.DateField()
    last_visit_date = models.DateField(null=True, blank=True)
    total_visits = models.PositiveIntegerField(default=1)
    status = models.CharField(max_length=20, choices=GUEST_STATUS, default='new')
    follow_up_agent = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_guests')
    
    # Communication preferences
    prefers_email = models.BooleanField(default=True)
    prefers_sms = models.BooleanField(default=False)
    prefers_whatsapp = models.BooleanField(default=True)
    prefers_in_app = models.BooleanField(default=True)
    
    # Spiritual interests
    interested_salvation = models.BooleanField(default=False)
    interested_baptism = models.BooleanField(default=False)
    interested_membership = models.BooleanField(default=False)
    interested_volunteering = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'guests_profiles'

class GuestVisit(BaseModel):
    guest = models.ForeignKey(GuestProfile, on_delete=models.CASCADE, related_name='visits')
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE)
    visit_date = models.DateField()
    service_type = models.CharField(max_length=50)  # 'sunday_service', 'bible_study', etc.
    notes = models.TextField(blank=True)
    checked_in_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    
    class Meta:
        db_table = 'guests_visits'
        ordering = ['-visit_date']

class GuestCommunication(BaseModel):
    COMMUNICATION_TYPES = (
        ('email', 'Email'),
        ('sms', 'SMS'),
        ('whatsapp', 'WhatsApp'),
        ('in_app', 'In-App'),
        ('phone_call', 'Phone Call'),
        ('in_person', 'In Person')
    )
    
    guest = models.ForeignKey(GuestProfile, on_delete=models.CASCADE, related_name='communications')
    communication_type = models.CharField(max_length=20, choices=COMMUNICATION_TYPES)
    subject = models.CharField(max_length=200, blank=True)
    message = models.TextField()
    sent_at = models.DateTimeField(auto_now_add=True)
    sent_by = models.ForeignKey(User, on_delete=models.CASCADE)
    is_automated = models.BooleanField(default=False)
    template_used = models.CharField(max_length=100, blank=True)
    
    class Meta:
        db_table = 'guests_communications'
        ordering = ['-sent_at']

class FollowUpTask(BaseModel):
    TASK_STATUS = (
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled')
    )
    
    guest = models.ForeignKey(GuestProfile, on_delete=models.CASCADE, related_name='follow_up_tasks')
    assigned_to = models.ForeignKey(User, on_delete=models.CASCADE, related_name='follow_up_tasks')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    due_date = models.DateTimeField()
    status = models.CharField(max_length=20, choices=TASK_STATUS, default='pending')
    priority = models.PositiveIntegerField(default=1, help_text="1=Lowest, 5=Highest")
    
    class Meta:
        db_table = 'guests_follow_up_tasks'
        ordering = ['priority', 'due_date']

class AutomatedWorkflow(BaseModel):
    TRIGGER_TYPES = (
        ('new_guest', 'New Guest Registration'),
        ('first_visit', 'First Visit'),
        ('second_visit', 'Second Visit'),
        ('no_visit_30_days', 'No Visit in 30 Days'),
        ('birthday', 'Guest Birthday'),
        ('spiritual_interest', 'Spiritual Interest Expressed')
    )
    
    name = models.CharField(max_length=100)
    trigger_type = models.CharField(max_length=50, choices=TRIGGER_TYPES)
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    delay_hours = models.PositiveIntegerField(default=0, help_text="Hours after trigger to execute")
    
    class Meta:
        db_table = 'guests_automated_workflows'

class WorkflowStep(BaseModel):
    workflow = models.ForeignKey(AutomatedWorkflow, on_delete=models.CASCADE, related_name='steps')
    step_order = models.PositiveIntegerField()
    action_type = models.CharField(max_length=50, choices=(
        ('send_email', 'Send Email'),
        ('send_sms', 'Send SMS'),
        ('send_whatsapp', 'Send WhatsApp'),
        ('send_in_app', 'Send In-App Message'),
        ('create_task', 'Create Follow-up Task')
    ))
    template = models.TextField(help_text="Message template with {{ variables }}")
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    
    class Meta:
        db_table = 'guests_workflow_steps'
        ordering = ['step_order']
