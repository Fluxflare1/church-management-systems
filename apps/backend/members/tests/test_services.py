from django.test import TestCase
from django.contrib.auth.models import User
from members.models import Member, MemberEngagement
from churches.models import Branch
from members.services import EngagementCalculator, MemberService
from members.integration.services import CmasIntegrationService

class EngagementCalculatorTest(TestCase):
    
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
        self.engagement = MemberEngagement.objects.create(
            member=self.member,
            monthly_attendance_rate=80.0,
            attendance_streak=4,
            communication_response_rate=75.0,
            giving_consistency=90.0
        )
        self.calculator = EngagementCalculator()
    
    def test_engagement_score_calculation(self):
        """Test engagement score calculation"""
        score = self.calculator.calculate_engagement_score(self.member)
        
        self.assertGreaterEqual(score, 0)
        self.assertLessEqual(score, 100)
        self.assertEqual(self.engagement.engagement_score, score)
    
    def test_engagement_tier_determination(self):
        """Test engagement tier determination"""
        # Test high engagement
        self.engagement.engagement_score = 85
        self.engagement.save()
        tier = self.calculator._determine_engagement_tier(85)
        self.assertEqual(tier, 'high')
        
        # Test medium engagement
        tier = self.calculator._determine_engagement_tier(65)
        self.assertEqual(tier, 'medium')
        
        # Test low engagement
        tier = self.calculator._determine_engagement_tier(35)
        self.assertEqual(tier, 'low')
        
        # Test inactive
        tier = self.calculator._determine_engagement_tier(15)
        self.assertEqual(tier, 'inactive')

class MemberServiceTest(TestCase):
    
    def setUp(self):
        self.service = MemberService()
        self.branch = Branch.objects.create(
            name='Test Branch',
            code='TEST'
        )
    
    def test_member_id_generation(self):
        """Test automatic member ID generation"""
        # This would test the member ID generation logic
        # You might need to mock the database queries
        pass
