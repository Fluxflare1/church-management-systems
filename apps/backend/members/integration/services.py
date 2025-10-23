from django.utils import timezone
from django.db import transaction
import logging
from members.models import Member, MemberEngagement
from members.services import MemberService, EngagementCalculator

logger = logging.getLogger(__name__)

class CmasIntegrationService:
    """
    Service for integrating with Church Member Acquisition System
    """
    
    @transaction.atomic
    def process_member_conversion(self, guest_data, conversion_data):
        """
        Process guest to member conversion from CMAS
        """
        try:
            member_service = MemberService()
            
            # Create member from guest data
            member = member_service.create_member_from_guest(
                guest_data, 
                conversion_data.get('member_data', {})
            )
            
            # Update CMAS with conversion
            self._update_cmas_conversion_status(guest_data['id'], member.id, 'converted')
            
            # Trigger onboarding workflow
            self._trigger_member_onboarding(member, conversion_data)
            
            logger.info(f"Successfully converted guest {guest_data['id']} to member {member.member_id}")
            return member
            
        except Exception as e:
            logger.error(f"Error processing member conversion for guest {guest_data.get('id')}: {str(e)}")
            self._update_cmas_conversion_status(guest_data['id'], None, 'failed', str(e))
            raise
    
    def sync_member_engagement_to_cmas(self, member_id):
        """
        Sync member engagement data back to CMAS for analytics
        """
        try:
            member = Member.objects.get(id=member_id)
            engagement = member.engagement
            
            engagement_data = {
                'member_id': member.id,
                'engagement_score': engagement.engagement_score,
                'engagement_tier': engagement.engagement_tier,
                'attendance_streak': engagement.attendance_streak,
                'monthly_attendance_rate': engagement.monthly_attendance_rate,
                'last_communication': engagement.last_communication.isoformat() if engagement.last_communication else None,
                'updated_at': timezone.now().isoformat()
            }
            
            # Send to CMAS analytics
            self._send_to_cmas_analytics('member_engagement', engagement_data)
            
            logger.info(f"Synced engagement data for member {member.member_id} to CMAS")
            
        except Exception as e:
            logger.error(f"Error syncing engagement data for member {member_id}: {str(e)}")
    
    def _update_cmas_conversion_status(self, guest_id, member_id, status, error_message=None):
        """
        Update CMAS with conversion status
        """
        # This would call your CMAS API
        try:
            # Example API call - replace with actual CMAS endpoint
            # requests.post(f'{CMAS_BASE_URL}/api/conversions/{guest_id}/', {
            #     'member_id': member_id,
            #     'status': status,
            #     'error_message': error_message,
            #     'converted_at': timezone.now().isoformat() if status == 'converted' else None
            # })
            pass
        except Exception as e:
            logger.error(f"Error updating CMAS conversion status: {str(e)}")
    
    def _trigger_member_onboarding(self, member, conversion_data):
        """
        Trigger member onboarding workflow
        """
        try:
            # Assign relationship manager based on branch and capacity
            self._assign_relationship_manager(member)
            
            # Enroll in discipleship pathway if specified
            if conversion_data.get('discipleship_pathway'):
                self._enroll_in_discipleship_pathway(member, conversion_data['discipleship_pathway'])
            
            # Send welcome communication
            self._send_welcome_communication(member)
            
        except Exception as e:
            logger.error(f"Error triggering onboarding for member {member.member_id}: {str(e)}")
    
    def _assign_relationship_manager(self, member):
        """
        Automatically assign relationship manager
        """
        from django.contrib.auth.models import User
        from django.db.models import Count
        
        # Find available relationship manager in the same branch
        available_managers = User.objects.filter(
            groups__name='Relationship Managers',
            managed_branch=member.branch
        ).annotate(
            member_count=Count('managed_members')
        ).order_by('member_count')
        
        if available_managers.exists():
            manager = available_managers.first()
            member.relationship_manager = manager
            member.save()
    
    def _enroll_in_discipleship_pathway(self, member, pathway_name):
        """
        Enroll member in discipleship pathway
        """
        # This would integrate with your discipleship system
        try:
            # Example: Create pathway enrollment
            pass
        except Exception as e:
            logger.error(f"Error enrolling member {member.member_id} in pathway {pathway_name}: {str(e)}")
    
    def _send_welcome_communication(self, member):
        """
        Send welcome communication to new member
        """
        # This would integrate with your communications module
        try:
            # Example: Send welcome email/SMS
            pass
        except Exception as e:
            logger.error(f"Error sending welcome communication to {member.member_id}: {str(e)}")
    
    def _send_to_cmas_analytics(self, event_type, data):
        """
        Send data to CMAS analytics
        """
        # This would call your CMAS analytics API
        try:
            # Example API call
            # requests.post(f'{CMAS_BASE_URL}/api/analytics/events/', {
            #     'event_type': event_type,
            #     'data': data,
            #     'timestamp': timezone.now().isoformat()
            # })
            pass
        except Exception as e:
            logger.error(f"Error sending analytics to CMAS: {str(e)}")

class GuestManagementIntegrationService:
    """
    Service for integrating with Guest Management system
    """
    
    def get_guest_history_for_member(self, member_id):
        """
        Get complete guest history for a member
        """
        try:
            # This would call your Guest Management API
            # response = requests.get(f'{GUEST_MGMT_URL}/api/guests/member-history/{member_id}/')
            # return response.json()
            
            # Mock response for now
            return {
                'guest_visits': [],
                'first_visit_date': None,
                'last_visit_date': None,
                'total_visits': 0,
                'conversion_date': timezone.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error fetching guest history for member {member_id}: {str(e)}")
            return None
    
    def sync_member_attendance(self, member_id, attendance_data):
        """
        Sync attendance data from guest system to member engagement
        """
        try:
            member = Member.objects.get(id=member_id)
            engagement, created = MemberEngagement.objects.get_or_create(member=member)
            
            # Update attendance metrics
            engagement.last_attendance_date = attendance_data.get('last_attendance_date')
            engagement.attendance_streak = attendance_data.get('attendance_streak', 0)
            engagement.monthly_attendance_rate = attendance_data.get('monthly_attendance_rate', 0)
            
            # Recalculate engagement score
            calculator = EngagementCalculator()
            calculator.calculate_engagement_score(member)
            
            logger.info(f"Synced attendance data for member {member.member_id}")
            
        except Exception as e:
            logger.error(f"Error syncing attendance for member {member_id}: {str(e)}")
