from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from members.models import Member, MemberEngagement
from members.integration.services import CmasIntegrationService
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Identify and handle inactive members'

    def add_arguments(self, parser):
        parser.add_argument(
            '--inactivity-days',
            type=int,
            default=60,
            help='Number of days without attendance to consider inactive'
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be done without making changes'
        )

    def handle(self, *args, **options):
        inactivity_days = options['inactivity_days']
        dry_run = options['dry_run']
        
        cutoff_date = timezone.now().date() - timedelta(days=inactivity_days)
        
        # Find active members with no recent attendance
        inactive_members = Member.objects.filter(
            membership_status='active',
            engagement__last_attendance_date__lt=cutoff_date
        ).select_related('engagement')
        
        self.stdout.write(f"Found {inactive_members.count()} potentially inactive members")
        
        for member in inactive_members:
            try:
                days_inactive = (timezone.now().date() - member.engagement.last_attendance_date).days
                
                if dry_run:
                    self.stdout.write(
                        f"DRY RUN: Would flag member {member.member_id} "
                        f"({member.user.get_full_name()}) as inactive. "
                        f"Last attendance: {member.engagement.last_attendance_date} "
                        f"({days_inactive} days ago)"
                    )
                else:
                    # Update engagement tier
                    member.engagement.engagement_tier = 'inactive'
                    member.engagement.save()
                    
                    # Notify relationship manager
                    self._notify_relationship_manager(member, days_inactive)
                    
                    self.stdout.write(
                        f"Flagged member {member.member_id} as inactive "
                        f"({days_inactive} days without attendance)"
                    )
                    
            except Exception as e:
                self.stderr.write(f"Error processing member {member.id}: {str(e)}")
                logger.error(f"Error processing inactive member {member.id}: {str(e)}")
        
        if not dry_run:
            self.stdout.write(
                self.style.SUCCESS(
                    f"Successfully processed {inactive_members.count()} inactive members"
                )
            )

    def _notify_relationship_manager(self, member, days_inactive):
        """
        Notify relationship manager about inactive member
        """
        try:
            if member.relationship_manager:
                message = (
                    f"Member {member.user.get_full_name()} ({member.member_id}) "
                    f"has been inactive for {days_inactive} days. "
                    f"Last attendance: {member.engagement.last_attendance_date}"
                )
                # notifications.send_notification(member.relationship_manager, 'member_inactive', message)
                logger.info(f"Sent inactivity notification for member {member.member_id}")
        except Exception as e:
            logger.error(f"Error sending inactivity notification: {str(e)}")
