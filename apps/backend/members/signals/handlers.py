from django.db.models.signals import post_save, pre_save, m2m_changed
from django.dispatch import receiver
from django.utils import timezone
from django.contrib.auth.models import User
from members.models import Member, WelfareCase, MemberEngagement, MinistryParticipation
from members.services import EngagementCalculator
from members.integration.services import CmasIntegrationService
import logging

logger = logging.getLogger(__name__)

@receiver(post_save, sender=Member)
def handle_member_creation(sender, instance, created, **kwargs):
    """
    Handle member creation and updates
    """
    if created:
        # New member created - initialize engagement record
        MemberEngagement.objects.get_or_create(member=instance)
        logger.info(f"Created engagement record for new member {instance.member_id}")
        
        # Sync to CMAS if this is a conversion from guest
        if hasattr(instance, '_from_guest_conversion'):
            cmas_service = CmasIntegrationService()
            cmas_service.sync_member_engagement_to_cmas(instance.id)
    
    else:
        # Member updated - recalculate engagement score
        calculator = EngagementCalculator()
        calculator.calculate_engagement_score(instance)

@receiver(post_save, sender=WelfareCase)
def handle_welfare_case_update(sender, instance, created, **kwargs):
    """
    Handle welfare case creation and updates
    """
    if created:
        # New case created - trigger notifications
        logger.info(f"New welfare case created: {instance.title} for {instance.member.member_id}")
        
        # Send notification to assigned officer if any
        if instance.assigned_officer:
            _send_welfare_assignment_notification(instance)
    
    else:
        # Case updated - check for status changes
        if instance.tracker.has_changed('status'):
            logger.info(f"Welfare case {instance.id} status changed to {instance.status}")
            
            # Trigger notifications based on status change
            _handle_welfare_status_change(instance)

@receiver(post_save, sender=MinistryParticipation)
def handle_ministry_participation(sender, instance, created, **kwargs):
    """
    Handle ministry participation changes
    """
    if created or instance.tracker.has_changed('is_active'):
        # Recalculate engagement score when ministry participation changes
        calculator = EngagementCalculator()
        calculator.calculate_engagement_score(instance.member)

@receiver(m2m_changed, sender=Member.skills.through)
def handle_skills_update(sender, instance, action, **kwargs):
    """
    Handle member skills updates
    """
    if action in ['post_add', 'post_remove', 'post_clear']:
        # Skills updated - this might affect ministry matching
        logger.info(f"Skills updated for member {instance.member_id}")

def _send_welfare_assignment_notification(welfare_case):
    """
    Send notification for welfare case assignment
    """
    # This would integrate with your notifications system
    try:
        # Example: Send email/SMS to assigned officer
        message = f"You have been assigned a new welfare case: {welfare_case.title}"
        # notifications.send_notification(welfare_case.assigned_officer, 'welfare_assignment', message)
        logger.info(f"Sent welfare assignment notification for case {welfare_case.id}")
    except Exception as e:
        logger.error(f"Error sending welfare assignment notification: {str(e)}")

def _handle_welfare_status_change(welfare_case):
    """
    Handle welfare case status changes
    """
    try:
        if welfare_case.status == 'resolved':
            # Case resolved - send resolution notification
            _send_resolution_notification(welfare_case)
        
        elif welfare_case.status == 'escalated':
            # Case escalated - notify supervisors
            _send_escalation_notification(welfare_case)
            
    except Exception as e:
        logger.error(f"Error handling welfare status change: {str(e)}")

def _send_resolution_notification(welfare_case):
    """
    Send notification when welfare case is resolved
    """
    try:
        message = f"Your welfare case '{welfare_case.title}' has been resolved."
        # notifications.send_notification(welfare_case.member.user, 'welfare_resolved', message)
        logger.info(f"Sent resolution notification for case {welfare_case.id}")
    except Exception as e:
        logger.error(f"Error sending resolution notification: {str(e)}")

def _send_escalation_notification(welfare_case):
    """
    Send notification when welfare case is escalated
    """
    try:
        # Notify branch manager and platform admins
        message = f"Welfare case '{welfare_case.title}' has been escalated and requires attention."
        # notifications.send_notification_to_group('Branch Managers', 'welfare_escalated', message)
        logger.info(f"Sent escalation notification for case {welfare_case.id}")
    except Exception as e:
        logger.error(f"Error sending escalation notification: {str(e)}")
