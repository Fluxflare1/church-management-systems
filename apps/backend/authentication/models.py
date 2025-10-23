from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
from .managers import CustomUserManager

class User(AbstractUser):
    # Base user types
    USER_TYPE_CHOICES = (
        ('guest', 'Guest'),
        ('member', 'Member'),
        ('staff', 'Staff'),
        ('admin', 'Admin'),
    )
    
    # Core fields
    user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES, default='guest')
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    profile_picture = models.ImageField(upload_to='profiles/', blank=True, null=True)
    
    # Branch association
    branch = models.ForeignKey(
        'churches.Branch', 
        on_delete=models.SET_NULL, 
        blank=True, 
        null=True,
        related_name='users'
    )
    
    # Status fields
    is_verified = models.BooleanField(default=False)
    verification_token = models.CharField(max_length=100, blank=True, null=True)
    verification_sent_at = models.DateTimeField(blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    objects = CustomUserManager()
    
    class Meta:
        db_table = 'users'
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['user_type']),
            models.Index(fields=['branch']),
        ]
    
    def __str__(self):
        return f"{self.email} ({self.user_type})"
    
    def generate_verification_token(self):
        import secrets
        self.verification_token = secrets.token_urlsafe(32)
        self.verification_sent_at = timezone.now()
        self.save()
    
    def verify_user(self, token):
        if self.verification_token == token:
            self.is_verified = True
            self.verification_token = None
            self.save()
            return True
        return False

class UserProfile(models.Model):
    user = models.OneToOneField(
        User, 
        on_delete=models.CASCADE, 
        related_name='profile'
    )
    
    # Personal information
    marital_status = models.CharField(
        max_length=20,
        choices=[
            ('single', 'Single'),
            ('married', 'Married'),
            ('divorced', 'Divorced'),
            ('widowed', 'Widowed'),
        ],
        blank=True,
        null=True
    )
    occupation = models.CharField(max_length=100, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    emergency_contact = models.CharField(max_length=100, blank=True, null=True)
    emergency_phone = models.CharField(max_length=20, blank=True, null=True)
    
    # Spiritual information
    date_saved = models.DateField(blank=True, null=True)
    date_baptized = models.DateField(blank=True, null=True)
    spiritual_gifts = models.JSONField(default=list, blank=True)
    
    # Preferences
    communication_preferences = models.JSONField(default=dict, blank=True)
    
    class Meta:
        db_table = 'user_profiles'
    
    def __str__(self):
        return f"Profile for {self.user.email}"
