from django.apps import AppConfig

class CommunicationsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'communications'
    verbose_name = 'Communications Hub'
    
    def ready(self):
        try:
            import communications.signals  # noqa F401
        except ImportError:
            pass
