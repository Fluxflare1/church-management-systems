from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
import logging

from communications.models import Message, MessageCampaign
from communications.tasks import cleanup_old_messages

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Clean up old communication data and perform maintenance tasks'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--days',
            type=int,
            default=365,
            help='Clean messages older than this many days (default: 365)'
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be deleted without actually deleting'
        )
        parser.add_argument(
            '--archive',
            action='store_true',
            help='Archive instead of delete (if archiving is implemented)'
        )
    
    def handle(self, *args, **options):
        days = options['days']
        dry_run = options['dry_run']
        archive = options['archive']
        
        self.stdout.write(f"Starting communication cleanup (days: {days}, dry-run: {dry_run})")
        
        # Calculate cutoff date
        cutoff_date = timezone.now() - timedelta(days=days)
        
        # Find old messages
        old_messages = Message.objects.filter(
            created_at__lte=cutoff_date,
            status__in=['sent', 'delivered', 'read', 'failed']
        )
        
        # Find old campaigns
        old_campaigns = MessageCampaign.objects.filter(
            created_at__lte=cutoff_date,
            status__in=['sent', 'cancelled']
        )
        
        if dry_run:
            self.stdout.write(
                self.style.WARNING(
                    f"DRY RUN: Would delete {old_messages.count()} messages and "
                    f"{old_campaigns.count()} campaigns older than {days} days"
                )
            )
            
            # Show sample of what would be deleted
            if old_messages.exists():
                self.stdout.write("Sample messages that would be deleted:")
                for msg in old_messages[:5]:
                    self.stdout.write(f"  - Message {msg.id} to {msg.to_user} ({msg.status})")
            
            return
        
        # Perform actual cleanup
        try:
            # Delete messages
            messages_count = old_messages.count()
            old_messages.delete()
            
            # Delete campaigns (this will cascade to related messages)
            campaigns_count = old_campaigns.count()
            old_campaigns.delete()
            
            self.stdout.write(
                self.style.SUCCESS(
                    f"Successfully deleted {messages_count} messages and "
                    f"{campaigns_count} campaigns older than {days} days"
                )
            )
            
            # Also trigger the async cleanup task for comprehensive cleanup
            cleanup_old_messages.delay(days)
            
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f"Error during cleanup: {str(e)}")
            )
            logger.error(f"Communication cleanup failed: {str(e)}")
