from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from .models import User

class AuthFlowTests(APITestCase):
    def setUp(self):
        self.register_url = reverse('authentication:register')
        self.login_url = reverse('authentication:login')
        self.profile_url = reverse('authentication:profile')
        
        self.valid_user_data = {
            'email': 'test@thogmi.org',
            'password': 'testpass123',
            'password_confirm': 'testpass123',
            'first_name': 'John',
            'last_name': 'Doe',
            'user_type': 'member',
            'phone_number': '+1234567890'
        }

    def test_user_registration(self):
        response = self.client.post(self.register_url, self.valid_user_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(email='test@thogmi.org').exists())

    def test_user_login(self):
        # First register user
        self.client.post(self.register_url, self.valid_user_data)
        
        # Then login
        login_data = {
            'email': 'test@thogmi.org',
            'password': 'testpass123'
        }
        response = self.client.post(self.login_url, login_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('tokens', response.data)

    def test_protected_route_access(self):
        # Register and login
        self.client.post(self.register_url, self.valid_user_data)
        login_data = {
            'email': 'test@thogmi.org',
            'password': 'testpass123'
        }
        login_response = self.client.post(self.login_url, login_data)
        token = login_response.data['tokens']['access']
        
        # Access protected route
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
