from celery import shared_task
from django.utils import timezone
from datetime import timedelta
from ..models import GuestProfile, AutomatedWorkflow, FollowUpTask
from .communication_service import GuestCommunicationService

class WorkflowEngine:
    def __init__(self):
        self.communication_service = GuestCommunicationService()
    
    def trigger_workflow(self, guest, trigger_type):
        """Trigger automated workflows for a guest based on event"""
        try:
            # Get active workflows for this trigger type and branch
            workflows = AutomatedWorkflow.objects.filter(
                trigger_type=trigger_type,
                is_active=True
            ).filter(
                models.Q(branch=guest.branch) | models.Q(branch__isnull=True)
            )
            
            for workflow in workflows:
                self._execute_workflow(workflow, guest, trigger_type)
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to trigger workflow for guest {guest.id}: {str(e)}")
            return False
    
    def _execute_workflow(self, workflow, guest, trigger_type):
        """Execute all steps in a workflow"""
        steps = workflow.steps.all().order_by('step_order')
        
        for step in steps:
            # Calculate execution time with delay
            execute_at = timezone.now() + timedelta(hours=workflow.delay_hours + step.step_order)
            
            # Schedule the step execution
            self._execute_workflow_step.apply_async(
                args=[step.id, guest.id, trigger_type],
                eta=execute_at
            )
    
    @shared_task
    def _execute_workflow_step(step_id, guest_id, trigger_type):
        """Celery task to execute a single workflow step"""
        try:
            from ..models import WorkflowStep, GuestProfile
            
            step = WorkflowStep.objects.get(id=step_id)
            guest = GuestProfile.objects.get(id=guest_id)
            
            # Prepare template context
            context = {
                'guest': guest,
                'guest_name': f"{guest.user.first_name} {guest.user.last_name}",
                'branch_name': guest.branch.name,
                'trigger_type': trigger_type,
                'current_date': timezone.now().strftime("%B %d, %Y")
            }
            
            if step.action_type.startswith('send_'):
                # Send communication
                communication_type = step.action_type.replace('send_', '')
                self.communication_service.send_communication(
                    guest=guest,
                    communication_type=communication_type,
                    template=step.template,
                    context_data=context,
                    sent_by=step.assigned_to if step.assigned_to else guest.branch.primary_pastor,
                    is_automated=True
                )
            
            elif step.action_type == 'create_task':
                # Create follow-up task
                template_obj = Template(step.template)
                rendered_content = template_obj.render(Context(context))
                
                FollowUpTask.objects.create(
                    guest=guest,
                    assigned_to=step.assigned_to,
                    title=rendered_content.split('\n')[0][:200],  # First line as title
                    description=rendered_content,
                    due_date=timezone.now() + timedelta(days=1)
                )
                
        except Exception as e:
            logger.error(f"Failed to execute workflow step {step_id}: {str(e)}")

# Celery task for processing new guest registrations
@shared_task
def process_new_guest_registration(guest_id):
    """Process new guest registration and trigger workflows"""
    try:
        guest = GuestProfile.objects.get(id=guest_id)
        workflow_engine = WorkflowEngine()
        workflow_engine.trigger_workflow(guest, 'new_guest')
        
        logger.info(f"Processed new guest registration for {guest.user.email}")
        
    except GuestProfile.DoesNotExist:
        logger.error(f"Guest profile {guest_id} not found")
