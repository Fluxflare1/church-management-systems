import logging
from celery import shared_task
from django.utils import timezone
from django.db import transaction
from .models import Message, MessageCampaign
from .services.delivery_service import DeliveryService
from .services.audience_service import AudienceService
from .services.template_service import TemplateService

logger = logging.getLogger(__name__)

@shared_task(bind=True, max_retries=3)
def send_single_message(self, message_id):
    """Send a single message asynchronously"""
    try:
        with transaction.atomic():
            message = Message.objects.select_for_update().get(id=message_id)
            
            # Skip if already sent or failed
            if message.status in ['sent', 'delivered', 'read']:
                return f"Message {message_id} already {message.status}"
            
            # Get delivery service and send
            delivery_service = DeliveryService()
            result = delivery_service.send_message(message)
            
            # Update message status
            message.status = result['status']
            if result['status'] == 'sent':
                message.sent_at = timezone.now()
            elif result['status'] == 'failed':
                message.error_message = result.get('error', '')
                # Retry logic
                try:
                    self.retry(countdown=60 * 2 ** self.request.retries)
                except self.MaxRetriesExceededError:
                    logger.error(f"Failed to send message {message_id} after retries")
            
            message.save()
            
        return f"Message {message_id} processed with status: {result['status']}"
        
    except Message.DoesNotExist:
        logger.error(f"Message {message_id} not found")
        return f"Message {message_id} not found"
    except Exception as e:
        logger.error(f"Unexpected error sending message {message_id}: {str(e)}")
        raise self.retry(exc=e, countdown=60)

@shared_task
def process_campaign(campaign_id):
    """Process all messages in a campaign"""
    try:
        campaign = MessageCampaign.objects.get(id=campaign_id)
        
        # Update campaign status
        campaign.status = 'processing'
        campaign.save()
        
        # Get audience based on filters
        audience = AudienceService.segment_users(campaign.audience_filter)
        
        # Create messages for each user
        messages_created = 0
        for user in audience:
            try:
                # Render template for this user
                context = {
                    'name': user.get_full_name() or user.email.split('@')[0],
                    'email': user.email,
                    'branch': getattr(user.profile.branch, 'name', 'THOGMi') if hasattr(user, 'profile') else 'THOGMi'
                }
                
                rendered = TemplateService.render_template(campaign.template, context)
                
                # Create message
                message = Message.objects.create(
                    campaign=campaign,
                    template=campaign.template,
                    channel=campaign.template.channel,
                    from_user=campaign.created_by,
                    to_user=user,
                    subject=rendered['subject'],
                    content=rendered['content'],
                    variables_used=rendered['variables_used'],
                    status='queued'
                )
                
                # Schedule message for sending
                if campaign.schedule_type == 'immediate':
                    send_single_message.delay(message.id)
                elif campaign.schedule_type == 'scheduled' and campaign.scheduled_for:
                    send_single_message.apply_async((message.id,), eta=campaign.scheduled_for)
                
                messages_created += 1
                
            except Exception as e:
                logger.error(f"Failed to create message for user {user.id} in campaign {campaign_id}: {str(e)}")
                continue
        
        # Update campaign status
        campaign.status = 'sent'
        campaign.save()
        
        return f"Campaign {campaign_id} processed: {messages_created} messages created"
        
    except MessageCampaign.DoesNotExist:
        logger.error(f"Campaign {campaign_id} not found")
        return f"Campaign {campaign_id} not found"
    except Exception as e:
        logger.error(f"Unexpected error processing campaign {campaign_id}: {str(e)}")
        # Update campaign status to failed
        try:
            campaign.status = 'failed'
            campaign.save()
        except:
            pass
        raise

@shared_task
def process_scheduled_messages():
    """Process messages scheduled for current time"""
    try:
        scheduled_messages = Message.objects.filter(
            status='queued',
            campaign__scheduled_for__lte=timezone.now(),
            campaign__schedule_type='scheduled'
        )
        
        processed_count = 0
        for message in scheduled_messages:
            send_single_message.delay(message.id)
            processed_count += 1
        
        logger.info(f"Processed {processed_count} scheduled messages")
        return f"Processed {processed_count} scheduled messages"
        
    except Exception as e:
        logger.error(f"Error processing scheduled messages: {str(e)}")
        raise

@shared_task
def cleanup_old_messages(days_old=365):
    """Archive old messages for performance"""
    from datetime import timedelta
    try:
        cutoff_date = timezone.now() - timedelta(days=days_old)
        
        # Archive old messages (you might want to move to different storage)
        old_messages = Message.objects.filter(
            sent_at__lte=cutoff_date,
            status__in=['sent', 'delivered', 'read', 'failed']
        )
        
        count = old_messages.count()
        # Here you would implement your archiving logic
        # For now, we'll just log
        logger.info(f"Found {count} messages older than {days_old} days for archiving")
        
        return f"Found {count} messages for archiving"
        
    except Exception as e:
        logger.error(f"Error cleaning up old messages: {str(e)}")
        raise

@shared_task
def send_bulk_announcement(template_id, audience_filters, sender_id):
    """Send bulk announcement to segmented audience"""
    from django.contrib.auth import get_user_model
    User = get_user_model()
    
    try:
        sender = User.objects.get(id=sender_id)
        template = MessageTemplate.objects.get(id=template_id)
        
        audience = AudienceService.segment_users(audience_filters)
        
        sent_count = 0
        for user in audience:
            try:
                # Create context for template rendering
                context = {
                    'name': user.get_full_name() or user.email.split('@')[0],
                    'email': user.email,
                }
                
                rendered = TemplateService.render_template(template, context)
                
                # Create and send message
                message = Message.objects.create(
                    template=template,
                    channel=template.channel,
                    from_user=sender,
                    to_user=user,
                    subject=rendered['subject'],
                    content=rendered['content'],
                    variables_used=rendered['variables_used'],
                    status='queued',
                    message_type='announcement'
                )
                
                send_single_message.delay(message.id)
                sent_count += 1
                
            except Exception as e:
                logger.error(f"Failed to send announcement to user {user.id}: {str(e)}")
                continue
        
        return f"Bulk announcement sent to {sent_count} users"
        
    except Exception as e:
        logger.error(f"Error sending bulk announcement: {str(e)}")
        raise
