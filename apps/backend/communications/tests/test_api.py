from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from django.urls import reverse

from communications.models import CommunicationChannel, MessageTemplate

User = get_user_model()

class CommunicationAPITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='admin@thogmi.org',
            password='testpass123',
            is_staff=True
        )
        self.client.force_authenticate(user=self.user)
        
        self.channel = CommunicationChannel.objects.create(
            name='Test Channel',
            channel_type='email',
            is_active=True
        )
        
        self.template = MessageTemplate.objects.create(
            name='Test Template',
            template_type='welcome',
            subject='Test Subject',
            content='Test Content',
            channel=self.channel,
            created_by=self.user
        )
    
    def test_template_list(self):
        url = reverse('template-list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
    
    def test_template_creation(self):
        url = reverse('template-list')
        data = {
            'name': 'New Template',
            'template_type': 'welcome',
            'subject': 'Welcome {name}',
            'content': 'Hello {name}, welcome!',
            'channel': self.channel.id
        }
        
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], 'New Template')
    
    def test_preference_management(self):
        url = reverse('preference-list')
        
        # Get current preferences
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Update preferences
        update_data = {
            'preferences': {
                'email': {'is_enabled': False}
            }
        }
        response = self.client.post(url, update_data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data['preferences']['email']['is_enabled'])
