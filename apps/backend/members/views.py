from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count, Avg, F, ExpressionWrapper, DurationField
from django.utils import timezone
from datetime import timedelta
import logging

from .models import Member, Family, WelfareCase, WelfareUpdate, MemberEngagement, MinistryParticipation
from .serializers import (
    MemberSerializer, MemberCreateSerializer, FamilySerializer,
    WelfareCaseSerializer, WelfareCaseCreateSerializer, WelfareUpdateSerializer,
    MinistryParticipationSerializer, MemberEngagementSerializer
)
from .filters import MemberFilter, WelfareCaseFilter
from .permissions import MemberPermissions, WelfareCasePermissions

logger = logging.getLogger(__name__)

class MemberViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, MemberPermissions]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = MemberFilter
    search_fields = ['user__first_name', 'user__last_name', 'user__email', 'member_id']
    ordering_fields = ['user__first_name', 'user__last_name', 'membership_date', 'created_at']
    ordering = ['user__first_name']

    def get_queryset(self):
        user = self.request.user
        
        # Platform admins can see all members
        if user.groups.filter(name='Platform Admins').exists():
            return Member.objects.select_related(
                'user', 'branch', 'family', 'relationship_manager'
            ).prefetch_related('welfare_cases', 'ministry_participation', 'engagement')
        
        # Branch managers can see members in their branch
        elif user.groups.filter(name='Branch Managers').exists():
            branch = getattr(user, 'managed_branch', None)
            if branch:
                return Member.objects.filter(branch=branch).select_related(
                    'user', 'branch', 'family', 'relationship_manager'
                ).prefetch_related('welfare_cases', 'ministry_participation', 'engagement')
        
        # Relationship managers can see their assigned members
        elif user.groups.filter(name='Relationship Managers').exists():
            return Member.objects.filter(relationship_manager=user).select_related(
                'user', 'branch', 'family'
            ).prefetch_related('welfare_cases', 'ministry_participation', 'engagement')
        
        # Members can only see themselves
        elif hasattr(user, 'member_profile'):
            return Member.objects.filter(user=user).select_related(
                'user', 'branch', 'family'
            ).prefetch_related('welfare_cases', 'ministry_participation', 'engagement')
        
        return Member.objects.none()

    def get_serializer_class(self):
        if self.action == 'create':
            return MemberCreateSerializer
        return MemberSerializer

    def perform_create(self, serializer):
        """Auto-generate member ID if not provided"""
        member_data = serializer.validated_data
        if not member_data.get('member_id'):
            # Generate member ID: BRANCH_CODE + YEAR + SEQUENCE
            branch = member_data['branch']
            year = timezone.now().year
            last_member = Member.objects.filter(
                branch=branch,
                member_id__startswith=f"{branch.code}{year}"
            ).order_by('-member_id').first()
            
            if last_member:
                sequence = int(last_member.member_id[-4:]) + 1
            else:
                sequence = 1
                
            member_id = f"{branch.code}{year}{sequence:04d}"
            serializer.validated_data['member_id'] = member_id
        
        member = serializer.save()
        
        # Log member creation
        logger.info(f"New member created: {member.member_id} by {self.request.user}")

    @action(detail=True, methods=['post'])
    def update_welfare_status(self, request, pk=None):
        """Update member's welfare category and notes"""
        member = self.get_object()
        welfare_category = request.data.get('welfare_category')
        welfare_notes = request.data.get('welfare_notes', '')
        special_needs = request.data.get('special_needs', [])
        
        if welfare_category:
            valid_categories = [choice[0] for choice in Member.WELFARE_CATEGORIES]
            if welfare_category not in valid_categories:
                return Response(
                    {'error': 'Invalid welfare category'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            member.welfare_category = welfare_category
        
        member.welfare_notes = welfare_notes
        member.special_needs = special_needs
        member.save()
        
        serializer = self.get_serializer(member)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def assign_relationship_manager(self, request, pk=None):
        """Assign or change relationship manager"""
        member = self.get_object()
        manager_id = request.data.get('relationship_manager_id')
        
        try:
            from django.contrib.auth.models import User
            manager = User.objects.get(id=manager_id)
            if not manager.groups.filter(name__in=['Relationship Managers', 'Branch Managers']).exists():
                return Response(
                    {'error': 'User is not a relationship manager'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            member.relationship_manager = manager
            member.save()
            
            # Log assignment
            logger.info(f"Relationship manager {manager} assigned to member {member.member_id}")
            
            serializer = self.get_serializer(member)
            return Response(serializer.data)
            
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['post'])
    def update_membership_status(self, request, pk=None):
        """Update member's membership status"""
        member = self.get_object()
        new_status = request.data.get('membership_status')
        
        valid_statuses = [choice[0] for choice in Member.MEMBERSHIP_STATUS]
        if new_status not in valid_statuses:
            return Response(
                {'error': 'Invalid membership status'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        member.membership_status = new_status
        member.save()
        
        # Log status change
        logger.info(f"Member {member.member_id} status changed to {new_status}")
        
        serializer = self.get_serializer(member)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def engagement_report(self, request):
        """Generate engagement analytics for members"""
        queryset = self.get_queryset()
        
        # Basic engagement stats
        total_members = queryset.count()
        active_members = queryset.filter(membership_status='active').count()
        
        engagement_stats = queryset.aggregate(
            avg_engagement_score=Avg('engagement__engagement_score'),
            high_engagement=Count('id', filter=Q(engagement__engagement_tier='high')),
            medium_engagement=Count('id', filter=Q(engagement__engagement_tier='medium')),
            low_engagement=Count('id', filter=Q(engagement__engagement_tier='low')),
            inactive_engagement=Count('id', filter=Q(engagement__engagement_tier='inactive')),
        )
        
        # Welfare cases summary
        welfare_summary = {
            'total_cases': WelfareCase.objects.filter(member__in=queryset).count(),
            'open_cases': WelfareCase.objects.filter(member__in=queryset, status__in=['open', 'in_progress']).count(),
            'overdue_cases': WelfareCase.objects.filter(
                member__in=queryset, 
                status__in=['open', 'in_progress'],
                target_resolution_date__lt=timezone.now().date()
            ).count(),
        }
        
        # Membership status breakdown
        status_breakdown = list(queryset.values('membership_status').annotate(count=Count('id')))
        
        # Welfare category breakdown
        welfare_breakdown = list(queryset.values('welfare_category').annotate(count=Count('id')))
        
        return Response({
            'total_members': total_members,
            'active_members': active_members,
            'engagement_stats': engagement_stats,
            'welfare_summary': welfare_summary,
            'status_breakdown': status_breakdown,
            'welfare_breakdown': welfare_breakdown,
        })

    @action(detail=True, methods=['get'])
    def welfare_cases(self, request, pk=None):
        """Get all welfare cases for a member"""
        member = self.get_object()
        cases = WelfareCase.objects.filter(member=member).select_related('assigned_officer').prefetch_related('updates').order_by('-reported_date')
        serializer = WelfareCaseSerializer(cases, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def ministry_participation(self, request, pk=None):
        """Get ministry participation for a member"""
        member = self.get_object()
        participation = MinistryParticipation.objects.filter(member=member).select_related('ministry')
        serializer = MinistryParticipationSerializer(participation, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def add_ministry_participation(self, request, pk=None):
        """Add ministry participation for a member"""
        member = self.get_object()
        
        ministry_id = request.data.get('ministry_id')
        role = request.data.get('role', 'member')
        
        try:
            from groups.models import Ministry
            ministry = Ministry.objects.get(id=ministry_id)
            
            participation, created = MinistryParticipation.objects.get_or_create(
                member=member,
                ministry=ministry,
                defaults={
                    'role': role,
                    'notes': request.data.get('notes', '')
                }
            )
            
            if not created:
                participation.role = role
                participation.notes = request.data.get('notes', '')
                participation.is_active = True
                participation.save()
            
            serializer = MinistryParticipationSerializer(participation)
            return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
            
        except Ministry.DoesNotExist:
            return Response(
                {'error': 'Ministry not found'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['get'])
    def inactive_members(self, request):
        """Get members who haven't attended in a while"""
        cutoff_date = timezone.now().date() - timedelta(days=60)  # 2 months
        
        queryset = self.get_queryset().filter(
            membership_status='active',
            engagement__last_attendance_date__lt=cutoff_date
        ).select_related('engagement')
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def birthday_celebration(self, request):
        """Get members with birthdays this month"""
        current_month = timezone.now().month
        
        queryset = self.get_queryset().filter(
            date_of_birth__month=current_month,
            membership_status='active'
        )
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

class WelfareCaseViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, WelfareCasePermissions]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = WelfareCaseFilter
    search_fields = ['title', 'member__user__first_name', 'member__user__last_name', 'member__member_id']
    ordering_fields = ['reported_date', 'urgency', 'status', 'target_resolution_date']
    ordering = ['-reported_date']
    
    def get_queryset(self):
        user = self.request.user
        
        if user.groups.filter(name='Platform Admins').exists():
            return WelfareCase.objects.select_related('member', 'assigned_officer').prefetch_related('updates')
        
        elif user.groups.filter(name='Branch Managers').exists():
            branch = getattr(user, 'managed_branch', None)
            if branch:
                return WelfareCase.objects.filter(member__branch=branch).select_related('member', 'assigned_officer').prefetch_related('updates')
        
        elif user.groups.filter(name__in=['Relationship Managers', 'Welfare Officers']).exists():
            return WelfareCase.objects.filter(
                Q(assigned_officer=user) | Q(member__relationship_manager=user)
            ).select_related('member', 'assigned_officer').prefetch_related('updates')
        
        return WelfareCase.objects.none()

    def get_serializer_class(self):
        if self.action == 'create':
            return WelfareCaseCreateSerializer
        return WelfareCaseSerializer

    def perform_create(self, serializer):
        welfare_case = serializer.save()
        
        # Log case creation
        logger.info(f"New welfare case created: {welfare_case.title} for member {welfare_case.member.member_id}")

    @action(detail=True, methods=['post'])
    def assign_officer(self, request, pk=None):
        """Assign welfare officer to case"""
        case = self.get_object()
        officer_id = request.data.get('officer_id')
        
        try:
            from django.contrib.auth.models import User
            officer = User.objects.get(id=officer_id)
            if not officer.groups.filter(name__in=['Welfare Officers', 'Relationship Managers']).exists():
                return Response(
                    {'error': 'User is not a welfare officer'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            case.assigned_officer = officer
            case.save()
            
            # Log assignment
            logger.info(f"Welfare officer {officer} assigned to case {case.title}")
            
            serializer = self.get_serializer(case)
            return Response(serializer.data)
            
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """Update case status and add update notes"""
        case = self.get_object()
        new_status = request.data.get('status')
        resolution_notes = request.data.get('resolution_notes', '')
        
        valid_statuses = [choice[0] for choice in WelfareCase.CASE_STATUS]
        if new_status not in valid_statuses:
            return Response(
                {'error': 'Invalid status'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        case.status = new_status
        if new_status == 'resolved':
            case.resolved_date = timezone.now()
        case.resolution_notes = resolution_notes
        case.save()
        
        # Create update record
        if 'update_notes' in request.data:
            WelfareUpdate.objects.create(
                welfare_case=case,
                officer=request.user,
                update_notes=request.data['update_notes'],
                action_taken=request.data.get('action_taken', ''),
                next_steps=request.data.get('next_steps', ''),
            )
        
        # Log status change
        logger.info(f"Welfare case {case.title} status changed to {new_status}")
        
        serializer = self.get_serializer(case)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def add_update(self, request, pk=None):
        """Add an update to welfare case"""
        case = self.get_object()
        
        serializer = WelfareUpdateSerializer(data=request.data)
        if serializer.is_valid():
            update = serializer.save(welfare_case=case, officer=request.user)
            
            # Log update
            logger.info(f"Update added to welfare case {case.title} by {request.user}")
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        """Get welfare dashboard statistics"""
        queryset = self.get_queryset()
        
        # Calculate overdue cases
        overdue_cases = queryset.filter(
            status__in=['open', 'in_progress'],
            target_resolution_date__lt=timezone.now().date()
        ).count()
        
        stats = {
            'total_cases': queryset.count(),
            'open_cases': queryset.filter(status__in=['open', 'in_progress']).count(),
            'resolved_cases': queryset.filter(status='resolved').count(),
            'overdue_cases': overdue_cases,
            'cases_by_type': list(queryset.values('case_type').annotate(count=Count('id')).order_by('-count')),
            'cases_by_urgency': list(queryset.values('urgency').annotate(count=Count('id')).order_by('-count')),
            'cases_by_status': list(queryset.values('status').annotate(count=Count('id')).order_by('-count')),
        }
        
        return Response(stats)

    @action(detail=False, methods=['get'])
    def urgent_cases(self, request):
        """Get urgent welfare cases that need immediate attention"""
        queryset = self.get_queryset().filter(
            status__in=['open', 'in_progress'],
            urgency__in=['high', 'critical']
        ).order_by('urgency', 'target_resolution_date')
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

class FamilyViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Family.objects.all().prefetch_related('members')
    serializer_class = FamilySerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['family_name', 'family_id']
    
    @action(detail=True, methods=['get'])
    def members(self, request, pk=None):
        """Get all members in a family"""
        family = self.get_object()
        members = family.members.all().select_related('user', 'branch')
        serializer = MemberSerializer(members, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def add_member(self, request, pk=None):
        """Add a member to family"""
        family = self.get_object()
        member_id = request.data.get('member_id')
        
        try:
            member = Member.objects.get(id=member_id)
            member.family = family
            member.save()
            
            serializer = MemberSerializer(member)
            return Response(serializer.data)
            
        except Member.DoesNotExist:
            return Response(
                {'error': 'Member not found'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['post'])
    def set_primary_contact(self, request, pk=None):
        """Set primary contact for family"""
        family = self.get_object()
        member_id = request.data.get('member_id')
        
        try:
            member = Member.objects.get(id=member_id, family=family)
            family.primary_contact = member
            family.save()
            
            serializer = FamilySerializer(family)
            return Response(serializer.data)
            
        except Member.DoesNotExist:
            return Response(
                {'error': 'Member not found in this family'},
                status=status.HTTP_404_NOT_FOUND
            )

class MinistryParticipationViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = MinistryParticipation.objects.select_related('member', 'ministry')
    serializer_class = MinistryParticipationSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['ministry', 'role', 'is_active']
    search_fields = ['member__user__first_name', 'member__user__last_name', 'ministry__name']
    
    @action(detail=False, methods=['get'])
    def by_ministry(self, request):
        """Get all participants for a specific ministry"""
        ministry_id = request.query_params.get('ministry_id')
        if ministry_id:
            participation = self.get_queryset().filter(ministry_id=ministry_id, is_active=True)
            serializer = self.get_serializer(participation, many=True)
            return Response(serializer.data)
        return Response([])

    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """Deactivate ministry participation"""
        participation = self.get_object()
        participation.is_active = False
        participation.end_date = timezone.now().date()
        participation.save()
        
        serializer = self.get_serializer(participation)
        return Response(serializer.data)

class MemberEngagementViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = MemberEngagement.objects.select_related('member')
    serializer_class = MemberEngagementSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['engagement_tier']
    
    @action(detail=False, methods=['get'])
    def recalculate_scores(self, request):
        """Recalculate engagement scores for all members"""
        from .services import EngagementCalculator
        
        calculator = EngagementCalculator()
        updated_count = calculator.recalculate_all_engagement_scores()
        
        return Response({
            'message': f'Engagement scores recalculated for {updated_count} members',
            'updated_count': updated_count
        })
