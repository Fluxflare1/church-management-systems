"""
Integration configuration for Member Relationship Management module
"""

# CMAS Integration Settings
CMAS_CONFIG = {
    'BASE_URL': 'https://cmas.thogmi.org/api',
    'API_KEY': 'your-cmas-api-key',
    'WEBHOOK_SECRET': 'your-webhook-secret',
    'ENABLED': True,
}

# Guest Management Integration
GUEST_MANAGEMENT_CONFIG = {
    'BASE_URL': 'https://api.thogmi.org/guests',
    'SYNC_ATTENDANCE': True,
    'SYNC_CONVERSIONS': True,
}

# Communications Integration
COMMUNICATIONS_CONFIG = {
    'EMAIL_ENABLED': True,
    'SMS_ENABLED': True,
    'PUSH_NOTIFICATIONS': True,
    'TEMPLATES': {
        'MEMBER_WELCOME': 'member_welcome_email',
        'WELFARE_ASSIGNMENT': 'welfare_assignment_notification',
        'ENGAGEMENT_ALERT': 'engagement_alert_notification',
    }
}

# Attendance System Integration
ATTENDANCE_CONFIG = {
    'SYNC_ENABLED': True,
    'AUTO_CALCULATE_ENGAGEMENT': True,
    'CHECKIN_METHODS': ['qr_code', 'manual', 'mobile_app'],
}

# Payment System Integration
PAYMENT_CONFIG = {
    'SYNC_GIVING_RECORDS': True,
    'CALCULATE_CONSISTENCY': True,
    'PROVIDERS': ['paystack', 'stripe'],
}

# Webhook endpoints for real-time updates
WEBHOOK_ENDPOINTS = {
    'MEMBER_CREATED': '/webhooks/members/created/',
    'WELFARE_CASE_UPDATED': '/webhooks/welfare/updated/',
    'ATTENDANCE_RECORDED': '/webhooks/attendance/recorded/',
    'ENGAGEMENT_UPDATED': '/webhooks/engagement/updated/',
}
