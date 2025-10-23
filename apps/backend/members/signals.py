from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import Member, WelfareCase
from .services import EngagementCalculator

@receiver(post_save, sender=User)
def create_member_profile(sender, instance, created, **kwargs):
    """
    Create member profile when a user is created (if applicable)
    This would be triggered when CMAS converts a guest to member
    """
    if created and hasattr(instance, 'guest_profile'):
        # This user came from guest conversion
        from .services import MemberService
        member_service = MemberService()
        
        try:
            member_service.create_member_from_guest(instance.guest_profile)
        except Exception as e:
            # Log error but don't crash
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error creating member from guest: {str(e)}")

@receiver(post_save, sender=WelfareCase)
def handle_welfare_case_update(sender, instance, created, **kwargs):
    """
    Handle welfare case updates and trigger notifications
    """
    if created:
        # New case created - could trigger notifications here
        pass
    else:
        # Case updated - could trigger follow-up notifications
        pass

@receiver(pre_save, sender=Member)
def validate_member_data(sender, instance, **kwargs):
    """
    Validate member data before saving
    """
    if instance.date_of_birth:
        from django.utils import timezone
        if instance.date_of_birth > timezone.now().date():
            raise ValueError("Date of birth cannot be in the future")
