from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone

from communications.models import CommunicationChannel, MessageTemplate, UserCommunicationPreference
from communications.services.template_service import TemplateService
from communications.services.audience_service import AudienceService
from communications.services.preference_service import PreferenceService
from communications.services.enhanced_delivery_service import EnhancedDeliveryService

User = get_user_model()

class TemplateServiceTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@thogmi.org',
            password='testpass123'
        )
        self.channel = CommunicationChannel.objects.create(
            name='Test Email',
            channel_type='email',
            is_active=True
        )
    
    def test_template_creation(self):
        service = TemplateService()
        template_data = {
            'name': 'Test Template',
            'template_type': 'welcome',
            'subject': 'Welcome {name} to THOGMi',
            'content': 'Hello {name}, welcome to our church family!',
            'channel_id': self.channel.id
        }
        
        template = service.create_template(template_data, self.user)
        
        self.assertEqual(template.name, 'Test Template')
        self.assertIn('name', template.variables)
    
    def test_template_rendering(self):
        template = MessageTemplate.objects.create(
            name='Test Template',
            template_type='welcome',
            subject='Welcome {name}',
            content='Hello {name}, from {branch}',
            channel=self.channel,
            created_by=self.user,
            variables=['name', 'branch']
        )
        
        service = TemplateService()
        context = {'name': 'John', 'branch': 'Main Campus'}
        rendered = service.render_template(template, context)
        
        self.assertEqual(rendered['subject'], 'Welcome John')
        self.assertEqual(rendered['content'], 'Hello John, from Main Campus')

class PreferenceServiceTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@thogmi.org',
            password='testpass123'
        )
        self.email_channel = CommunicationChannel.objects.create(
            name='Email',
            channel_type='email',
            is_active=True
        )
        self.sms_channel = CommunicationChannel.objects.create(
            name='SMS',
            channel_type='sms',
            is_active=True
        )
    
    def test_preference_management(self):
        service = PreferenceService()
        
        # Update preferences
        preferences_data = {
            'preferences': {
                'email': {'is_enabled': True},
                'sms': {'is_enabled': False}
            }
        }
        
        result = service.update_user_preferences(self.user, preferences_data)
        
        self.assertEqual(result['user_id'], self.user.id)
        self.assertTrue(result['results']['email']['is_enabled'])
        self.assertFalse(result['results']['sms']['is_enabled'])
    
    def test_eligibility_checking(self):
        service = PreferenceService()
        
        # User should be eligible by default
        self.assertTrue(service.can_receive_messages(self.user, 'email'))
        
        # Opt out and check again
        UserCommunicationPreference.objects.create(
            user=self.user,
            channel=self.email_channel,
            is_enabled=False
        )
        
        self.assertFalse(service.can_receive_messages(self.user, 'email'))

class AudienceServiceTests(TestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(email='user1@thogmi.org', password='test123')
        self.user2 = User.objects.create_user(email='user2@thogmi.org', password='test123')
    
    def test_basic_segmentation(self):
        service = AudienceService()
        
        # Test empty filters (should return all users)
        users = service.segment_users({})
        self.assertEqual(users.count(), 2)
    
    def test_advanced_segmentation(self):
        from communications.services.advanced_audience_service import AdvancedAudienceService
        service = AdvancedAudienceService()
        
        # Test with behavioral filters
        users = service.segment_by_behavior({'attendance_frequency': 'regular'})
        # This would depend on your user profile structure
        self.assertIsNotNone(users)
