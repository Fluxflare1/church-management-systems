from django.test import TestCase
from django.contrib.auth.models import User
from members.models import Member, Family, WelfareCase, MemberEngagement
from churches.models import Branch
from django.utils import timezone

class MemberModelTest(TestCase):
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testmember', 
            email='test@example.com',
            first_name='John',
            last_name='Doe'
        )
        self.branch = Branch.objects.create(
            name='Test Branch',
            code='TEST'
        )
        self.member = Member.objects.create(
            user=self.user,
            branch=self.branch,
            member_id='TEST20240001',
            marital_status='single',
            occupation='Engineer',
            membership_date=timezone.now().date()
        )
    
    def test_member_creation(self):
        """Test member creation and basic properties"""
        self.assertEqual(self.member.user.get_full_name(), 'John Doe')
        self.assertEqual(self.member.member_id, 'TEST20240001')
        self.assertEqual(self.member.membership_status, 'active')
        self.assertTrue(self.member.is_active_member)
    
    def test_age_calculation(self):
        """Test age calculation from date of birth"""
        from datetime import date
        self.member.date_of_birth = date(1990, 1, 1)
        self.member.save()
        
        # Note: This test might need adjustment based on current date
        self.assertIsNotNone(self.member.age)
    
    def test_engagement_creation(self):
        """Test automatic engagement record creation"""
        engagement = MemberEngagement.objects.get(member=self.member)
        self.assertIsNotNone(engagement)
        self.assertEqual(engagement.engagement_score, 0.0)

class WelfareCaseModelTest(TestCase):
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testmember', 
            email='test@example.com',
            first_name='John',
            last_name='Doe'
        )
        self.branch = Branch.objects.create(
            name='Test Branch',
            code='TEST'
        )
        self.member = Member.objects.create(
            user=self.user,
            branch=self.branch,
            member_id='TEST20240001'
        )
        self.welfare_case = WelfareCase.objects.create(
            member=self.member,
            case_type='financial',
            title='Test Welfare Case',
            description='Test description',
            urgency='medium'
        )
    
    def test_welfare_case_creation(self):
        """Test welfare case creation"""
        self.assertEqual(self.welfare_case.title, 'Test Welfare Case')
        self.assertEqual(self.welfare_case.status, 'open')
        self.assertEqual(self.welfare_case.member, self.member)
    
    def test_overdue_calculation(self):
        """Test overdue case calculation"""
        # Case with past target date should be overdue
        self.welfare_case.target_resolution_date = timezone.now().date() - timezone.timedelta(days=1)
        self.welfare_case.save()
        
        self.assertTrue(self.welfare_case.is_overdue)
        
        # Case with future target date should not be overdue
        self.welfare_case.target_resolution_date = timezone.now().date() + timezone.timedelta(days=1)
        self.welfare_case.save()
        
        self.assertFalse(self.welfare_case.is_overdue)

class FamilyModelTest(TestCase):
    
    def setUp(self):
        self.family = Family.objects.create(
            family_id='FAM001',
            family_name='Test Family',
            address='123 Test Street'
        )
    
    def test_family_creation(self):
        """Test family creation"""
        self.assertEqual(self.family.family_id, 'FAM001')
        self.assertEqual(self.family.family_name, 'Test Family')
        self.assertEqual(self.family.member_count, 0)
