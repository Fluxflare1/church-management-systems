from django.apps import AppConfig

class MembersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'members'
    verbose_name = 'Member Relationship Management'
    
    def ready(self):
        # Import signals
        try:
            from . import signals
        except ImportError:
            pass
