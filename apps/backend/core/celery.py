import os
from celery import Celery
from celery.schedules import crontab

# Set the default Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.development')

app = Celery('core')

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Load task modules from all registered Django apps.
app.autodiscover_tasks()

@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')



# Add to CELERY_BEAT_SCHEDULE
app.conf.beat_schedule = {
    # ... existing schedules ...
    
    'process-scheduled-messages': {
        'task': 'communications.tasks.process_scheduled_messages',
        'schedule': crontab(minute='*/5'),  # Every 5 minutes
    },
    'cleanup-old-messages': {
        'task': 'communications.tasks.cleanup_old_messages',
        'schedule': crontab(hour=2, minute=0),  # Daily at 2 AM
    },
}
