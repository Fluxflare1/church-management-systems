import logging
from celery import shared_task
from django.db.models import Q
from django.template import Template, Context
from .communication_service import GuestCommunicationService
from ..models import GuestProfile

logger = logging.getLogger(__name__)

class BulkOperationsService:
    def __init__(self):
        self.communication_service = GuestCommunicationService()
    
    def send_bulk_communications(self, guest_ids, communication_type, template, subject="", sent_by=None):
        """Send bulk communications to multiple guests"""
        results = {
            'total': len(guest_ids),
            'successful': 0,
            'failed': 0,
            'errors': []
        }
        
        guests = GuestProfile.objects.filter(id__in=guest_ids).select_related('user')
        
        for guest in guests:
            try:
                # Prepare context for template
                context_data = {
                    'guest_name': f"{guest.user.first_name} {guest.user.last_name}",
                    'branch_name': guest.branch.name,
                    'first_visit_date': guest.first_visit_date,
                    'total_visits': guest.total_visits,
                }
                
                success = self.communication_service.send_communication(
                    guest=guest,
                    communication_type=communication_type,
                    template=template,
                    context_data=context_data,
                    sent_by=sent_by,
                    is_automated=False
                )
                
                if success:
                    results['successful'] += 1
                else:
                    results['failed'] += 1
                    results['errors'].append({
                        'guest_id': guest.id,
                        'guest_name': f"{guest.user.first_name} {guest.user.last_name}",
                        'error': 'Failed to send communication'
                    })
                    
            except Exception as e:
                results['failed'] += 1
                results['errors'].append({
                    'guest_id': guest.id,
                    'guest_name': f"{guest.user.first_name} {guest.user.last_name}",
                    'error': str(e)
                })
        
        return results
    
    def create_bulk_tasks(self, guest_ids, task_data, assigned_to=None):
        """Create bulk follow-up tasks for multiple guests"""
        from ..models import FollowUpTask
        
        tasks_created = 0
        
        for guest_id in guest_ids:
            try:
                guest = GuestProfile.objects.get(id=guest_id)
                
                FollowUpTask.objects.create(
                    guest=guest,
                    assigned_to=assigned_to or guest.follow_up_agent,
                    title=task_data.get('title', 'Follow-up Task'),
                    description=task_data.get('description', ''),
                    due_date=task_data.get('due_date'),
                    priority=task_data.get('priority', 1)
                )
                
                tasks_created += 1
                
            except Exception as e:
                logger.error(f"Failed to create task for guest {guest_id}: {str(e)}")
        
        return tasks_created

@shared_task
def bulk_sms_reminder(guest_ids, message_template, sent_by_id):
    """Celery task for sending bulk SMS reminders"""
    from django.contrib.auth import get_user_model
    User = get_user_model()
    
    try:
        sent_by = User.objects.get(id=sent_by_id)
        service = BulkOperationsService()
        
        results = service.send_bulk_communications(
            guest_ids=guest_ids,
            communication_type='sms',
            template=message_template,
            sent_by=sent_by
        )
        
        logger.info(f"Bulk SMS completed: {results['successful']} successful, {results['failed']} failed")
        return results
        
    except Exception as e:
        logger.error(f"Bulk SMS task failed: {str(e)}")
        return {'success': False, 'error': str(e)}
