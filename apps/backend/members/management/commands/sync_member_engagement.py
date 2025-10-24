from django.core.management.base import BaseCommand
from django.utils import timezone
from members.services import EngagementCalculator
from members.models import Member
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Recalculate engagement scores for all members'

    def add_arguments(self, parser):
        parser.add_argument(
            '--batch-size',
            type=int,
            default=100,
            help='Number of members to process in each batch'
        )
        parser.add_argument(
            '--members',
            nargs='+',
            type=int,
            help='Specific member IDs to process'
        )
        parser.add_argument(
            '--branch',
            type=int,
            help='Process members from specific branch only'
        )

    def handle(self, *args, **options):
        batch_size = options['batch_size']
        specific_members = options['members']
        branch_id = options['branch']
        
        calculator = EngagementCalculator()
        
        if specific_members:
            members = Member.objects.filter(id__in=specific_members, membership_status='active')
        elif branch_id:
            members = Member.objects.filter(branch_id=branch_id, membership_status='active')
        else:
            members = Member.objects.filter(membership_status='active')
        
        total_members = members.count()
        processed = 0
        
        self.stdout.write(f"Starting engagement score recalculation for {total_members} members...")
        
        for i in range(0, total_members, batch_size):
            batch = members[i:i + batch_size]
            
            for member in batch:
                try:
                    calculator.calculate_engagement_score(member)
                    processed += 1
                    
                    if processed % 10 == 0:
                        self.stdout.write(f"Processed {processed}/{total_members} members...")
                        
                except Exception as e:
                    self.stderr.write(f"Error processing member {member.id}: {str(e)}")
                    logger.error(f"Error processing member {member.id}: {str(e)}")
        
        self.stdout.write(
            self.style.SUCCESS(
                f"Successfully recalculated engagement scores for {processed}/{total_members} members"
            )
        )
