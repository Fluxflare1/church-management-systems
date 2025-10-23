from .base import *

# Development-specific settings
DEBUG = True

# Additional allowed hosts for development
ALLOWED_HOSTS += ['0.0.0.0', 'backend']

# More permissive CORS for development
CORS_ALLOW_ALL_ORIGINS = True

# Console email backend for development
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# Logging configuration for development
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
}
