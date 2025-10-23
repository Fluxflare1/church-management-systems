from django.utils import timezone
from django.db.models import Q, Count, Avg
from datetime import timedelta, datetime
import logging
from .models import Member, MemberEngagement, WelfareCase

logger = logging.getLogger(__name__)

class EngagementCalculator:
    """
    Service class for calculating and updating member engagement scores
    """
    
    def __init__(self):
        self.weights = {
            'attendance': 0.35,
            'ministry_participation': 0.25,
            'communication': 0.20,
            'giving': 0.20,
        }
    
    def calculate_engagement_score(self, member):
        """
        Calculate engagement score for a member (0-100)
        """
        try:
            engagement, created = MemberEngagement.objects.get_or_create(member=member)
            
            attendance_score = self._calculate_attendance_score(member, engagement)
            ministry_score = self._calculate_ministry_score(member, engagement)
            communication_score = self._calculate_communication_score(member, engagement)
            giving_score = self._calculate_giving_score(member, engagement)
            
            # Calculate weighted total score
            total_score = (
                attendance_score * self.weights['attendance'] +
                ministry_score * self.weights['ministry_participation'] +
                communication_score * self.weights['communication'] +
                giving_score * self.weights['giving']
            )
            
            # Update engagement record
            engagement.engagement_score = round(total_score, 2)
            engagement.engagement_tier = self._determine_engagement_tier(total_score)
            engagement.save()
            
            logger.info(f"Engagement score calculated for {member.member_id}: {total_score}")
            
            return total_score
            
        except Exception as e:
            logger.error(f"Error calculating engagement score for {member.member_id}: {str(e)}")
            return 0
    
    def _calculate_attendance_score(self, member, engagement):
        """
        Calculate attendance-based score (0-100)
        """
        # Use monthly attendance rate directly (already 0-100)
        attendance_score = engagement.monthly_attendance_rate or 0
        
        # Bonus for attendance streak
        streak_bonus = min(engagement.attendance_streak * 2, 20)  # Max 20 bonus points
        
        return min(attendance_score + streak_bonus, 100)
    
    def _calculate_ministry_score(self, member, engagement):
        """
        Calculate ministry participation score (0-100)
        """
        active_ministries = member.ministry_participation.filter(is_active=True).count()
        
        # Base score for participation
        if active_ministries == 0:
            base_score = 0
        elif active_ministries == 1:
            base_score = 60
        elif active_ministries == 2:
            base_score = 80
        else:
            base_score = 100
        
        # Role bonus
        leadership_roles = member.ministry_participation.filter(
            is_active=True, 
            role__in=['leader', 'coordinator', 'head']
        ).count()
        
        role_bonus = leadership_roles * 10
        
        return min(base_score + role_bonus, 100)
    
    def _calculate_communication_score(self, member, engagement):
        """
        Calculate communication engagement score (0-100)
        """
        # Use communication response rate directly
        communication_score = engagement.communication_response_rate or 0
        
        # Recency bonus - more recent communication gets higher score
        if engagement.last_communication:
            days_since_communication = (timezone.now() - engagement.last_communication).days
            if days_since_communication <= 7:
                recency_bonus = 20
            elif days_since_communication <= 30:
                recency_bonus = 10
            else:
                recency_bonus = 0
        else:
            recency_bonus = 0
        
        return min(communication_score + recency_bonus, 100)
    
    def _calculate_giving_score(self, member, engagement):
        """
        Calculate giving consistency score (0-100)
        """
        # Use giving consistency directly (0-100)
        return engagement.giving_consistency or 0
    
    def _determine_engagement_tier(self, score):
        """
        Determine engagement tier based on score
        """
        if score >= 80:
            return 'high'
        elif score >= 50:
            return 'medium'
        elif score >= 20:
            return 'low'
        else:
            return 'inactive'
    
    def recalculate_all_engagement_scores(self):
        """
        Recalculate engagement scores for all active members
        """
        active_members = Member.objects.filter(membership_status='active')
        updated_count = 0
        
        for member in active_members:
            try:
                self.calculate_engagement_score(member)
                updated_count += 1
            except Exception as e:
                logger.error(f"Error recalculating score for {member.member_id}: {str(e)}")
                continue
        
        logger.info(f"Engagement scores recalculated for {updated_count} members")
        return updated_count

class WelfareService:
    """
    Service class for welfare case management and automation
    """
    
    def create_welfare_case(self, member, case_data, created_by=None):
        """
        Create a new welfare case with proper validation
        """
        try:
            welfare_case = WelfareCase.objects.create(
                member=member,
                **case_data
            )
            
            # Log creation
            logger.info(f"Welfare case created: {welfare_case.title} for {member.member_id}")
            
            # Trigger notifications
            self._notify_assignment(welfare_case)
            
            return welfare_case
            
        except Exception as e:
            logger.error(f"Error creating welfare case for {member.member_id}: {str(e)}")
            raise
    
    def assign_welfare_officer(self, welfare_case, officer):
        """
        Assign welfare officer to a case
        """
        try:
            welfare_case.assigned_officer = officer
            welfare_case.save()
            
            # Log assignment
            logger.info(f"Welfare officer {officer} assigned to case {welfare_case.title}")
            
            # Notify officer
            self._notify_officer_assignment(welfare_case, officer)
            
            return welfare_case
            
        except Exception as e:
            logger.error(f"Error assigning officer to case {welfare_case.id}: {str(e)}")
            raise
    
    def escalate_case(self, welfare_case, reason, escalated_by):
        """
        Escalate a welfare case
        """
        try:
            welfare_case.status = 'escalated'
            welfare_case.save()
            
            # Create update note
            from .models import WelfareUpdate
            WelfareUpdate.objects.create(
                welfare_case=welfare_case,
                officer=escalated_by,
                update_notes=f"Case escalated: {reason}",
                action_taken="Case escalated to higher authority"
            )
            
            # Notify appropriate personnel
            self._notify_escalation(welfare_case, reason)
            
            logger.info(f"Welfare case {welfare_case.title} escalated by {escalated_by}")
            
            return welfare_case
            
        except Exception as e:
            logger.error(f"Error escalating case {welfare_case.id}: {str(e)}")
            raise
    
    def get_overdue_cases(self, branch=None):
        """
        Get overdue welfare cases
        """
        queryset = WelfareCase.objects.filter(
            status__in=['open', 'in_progress'],
            target_resolution_date__lt=timezone.now().date()
        )
        
        if branch:
            queryset = queryset.filter(member__branch=branch)
        
        return queryset.select_related('member', 'assigned_officer')
    
    def _notify_assignment(self, welfare_case):
        """
        Notify relevant parties about new welfare case assignment
        """
        # This would integrate with your communications module
        # For now, we'll just log it
        logger.info(f"Notification: New welfare case assigned - {welfare_case.title}")
    
    def _notify_officer_assignment(self, welfare_case, officer):
        """
        Notify officer about their assignment
        """
        logger.info(f"Notification: Officer {officer} assigned to case {welfare_case.title}")
    
    def _notify_escalation(self, welfare_case, reason):
        """
        Notify about case escalation
        """
        logger.info(f"Notification: Case {welfare_case.title} escalated - {reason}")

class MemberService:
    """
    Service class for member management operations
    """
    
    def create_member_from_guest(self, guest, membership_data=None):
        """
        Create a member profile from a guest record
        """
        from guests.models import Guest
        
        try:
            if not isinstance(guest, Guest):
                raise ValueError("Provided object is not a Guest instance")
            
            # Generate member ID
            member_id = self._generate_member_id(guest.primary_branch)
            
            # Create member profile
            member_data = {
                'user': guest.user,
                'branch': guest.primary_branch,
                'member_id': member_id,
                'membership_date': timezone.now().date(),
                'welfare_category': self._determine_initial_welfare_category(guest),
            }
            
            if membership_data:
                member_data.update(membership_data)
            
            member = Member.objects.create(**member_data)
            
            # Create engagement record
            MemberEngagement.objects.create(member=member)
            
            # Update guest record
            guest.converted_to_member = True
            guest.member_conversion_date = timezone.now()
            guest.save()
            
            logger.info(f"Member created from guest: {member.member_id}")
            
            return member
            
        except Exception as e:
            logger.error(f"Error creating member from guest {guest.id}: {str(e)}")
            raise
    
    def deactivate_member(self, member, reason, deactivated_by):
        """
        Deactivate a member account
        """
        try:
            member.membership_status = 'inactive'
            member.save()
            
            # Log deactivation
            logger.info(f"Member {member.member_id} deactivated by {deactivated_by}. Reason: {reason}")
            
            # Deactivate ministry participations
            member.ministry_participation.filter(is_active=True).update(
                is_active=False,
                end_date=timezone.now().date()
            )
            
            return member
            
        except Exception as e:
            logger.error(f"Error deactivating member {member.member_id}: {str(e)}")
            raise
    
    def transfer_member(self, member, new_branch, transferred_by):
        """
        Transfer member to a different branch
        """
        try:
            old_branch = member.branch
            
            member.branch = new_branch
            member.membership_status = 'transferred'
            member.save()
            
            # Log transfer
            logger.info(f"Member {member.member_id} transferred from {old_branch} to {new_branch} by {transferred_by}")
            
            return member
            
        except Exception as e:
            logger.error(f"Error transferring member {member.member_id}: {str(e)}")
            raise
    
    def _generate_member_id(self, branch):
        """
        Generate unique member ID
        """
        year = timezone.now().year
        last_member = Member.objects.filter(
            branch=branch,
            member_id__startswith=f"{branch.code}{year}"
        ).order_by('-member_id').first()
        
        if last_member:
            sequence = int(last_member.member_id[-4:]) + 1
        else:
            sequence = 1
            
        return f"{branch.code}{year}{sequence:04d}"
    
    def _determine_initial_welfare_category(self, guest):
        """
        Determine initial welfare category based on guest data
        """
        # This could be based on guest form data, demographics, etc.
        # For now, default to 'none'
        return 'none'
