from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count, Avg
from django.utils import timezone
from datetime import timedelta

from .models import Member, Family, WelfareCase, WelfareUpdate, MemberEngagement, MinistryParticipation
from .serializers import (
    MemberSerializer, MemberCreateSerializer, FamilySerializer,
    WelfareCaseSerializer, WelfareCaseCreateSerializer, WelfareUpdateSerializer,
    MinistryParticipationSerializer, MemberEngagementSerializer
)
from .filters import MemberFilter, WelfareCaseFilter
from .permissions import MemberPermissions, WelfareCasePermissions

class MemberViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, MemberPermissions]
    filter_backends = [DjangoFilterBackend]
    filterset_class = MemberFilter
    
    def get_queryset(self):
        user = self.request.user
        
        # Platform admins can see all members
        if user.groups.filter(name='Platform Admins').exists():
            return Member.objects.select_related(
                'user', 'branch', 'family', 'relationship_manager'
            ).prefetch_related('welfare_cases', 'ministry_participation')
        
        # Branch managers can see members in their branch
        elif user.groups.filter(name='Branch Managers').exists():
            branch = getattr(user, 'managed_branch', None)
            if branch:
                return Member.objects.filter(branch=branch).select_related(
                    'user', 'branch', 'family', 'relationship_manager'
                )
        
        # Relationship managers can see their assigned members
        elif user.groups.filter(name='Relationship Managers').exists():
            return Member.objects.filter(relationship_manager=user).select_related(
                'user', 'branch', 'family'
            )
        
        # Members can only see themselves
        elif hasattr(user, 'member_profile'):
            return Member.objects.filter(user=user).select_related(
                'user', 'branch', 'family'
            )
        
        return Member.objects.none()

    def get_serializer_class(self):
        if self.action == 'create':
            return MemberCreateSerializer
        return MemberSerializer

    @action(detail=True, methods=['post'])
    def update_welfare_status(self, request, pk=None):
        """Update member's welfare category and notes"""
        member = self.get_object()
        welfare_category = request.data.get('welfare_category')
        welfare_notes = request.data.get('welfare_notes', '')
        special_needs = request.data.get('special_needs', [])
        
        if welfare_category:
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
            
            serializer = self.get_serializer(member)
            return Response(serializer.data)
            
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )

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
            low_engagement=Count('id', filter=Q(engagement__engagement_tier='low')),
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
        
        return Response({
            'total_members': total_members,
            'active_members': active_members,
            'engagement_stats': engagement_stats,
            'welfare_summary': welfare_summary,
        })

    @action(detail=True, methods=['get'])
    def welfare_cases(self, request, pk=None):
        """Get all welfare cases for a member"""
        member = self.get_object()
        cases = WelfareCase.objects.filter(member=member).order_by('-reported_date')
        serializer = WelfareCaseSerializer(cases, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def ministry_participation(self, request, pk=None):
        """Get ministry participation for a member"""
        member = self.get_object()
        participation = MinistryParticipation.objects.filter(member=member).select_related('ministry')
        serializer = MinistryParticipationSerializer(participation, many=True)
        return Response(serializer.data)

class WelfareCaseViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, WelfareCasePermissions]
    filter_backends = [DjangoFilterBackend]
    filterset_class = WelfareCaseFilter
    
    def get_queryset(self):
        user = self.request.user
        
        if user.groups.filter(name='Platform Admins').exists():
            return WelfareCase.objects.select_related('member', 'assigned_officer')
        
        elif user.groups.filter(name='Branch Managers').exists():
            branch = getattr(user, 'managed_branch', None)
            if branch:
                return WelfareCase.objects.filter(member__branch=branch).select_related('member', 'assigned_officer')
        
        elif user.groups.filter(name__in=['Relationship Managers', 'Welfare Officers']).exists():
            return WelfareCase.objects.filter(
                Q(assigned_officer=user) | Q(member__relationship_manager=user)
            ).select_related('member', 'assigned_officer')
        
        return WelfareCase.objects.none()

    def get_serializer_class(self):
        if self.action == 'create':
            return WelfareCaseCreateSerializer
        return WelfareCaseSerializer

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
        
        if new_status in dict(WelfareCase.CASE_STATUS):
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
            
            serializer = self.get_serializer(case)
            return Response(serializer.data)
        else:
            return Response(
                {'error': 'Invalid status'},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'])
    def add_update(self, request, pk=None):
        """Add an update to welfare case"""
        case = self.get_object()
        
        serializer = WelfareUpdateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(welfare_case=case, officer=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        """Get welfare dashboard statistics"""
        queryset = self.get_queryset()
        
        stats = {
            'total_cases': queryset.count(),
            'open_cases': queryset.filter(status__in=['open', 'in_progress']).count(),
            'resolved_cases': queryset.filter(status='resolved').count(),
            'overdue_cases': queryset.filter(
                status__in=['open', 'in_progress'],
                target_resolution_date__lt=timezone.now().date()
            ).count(),
            'cases_by_type': list(queryset.values('case_type').annotate(count=Count('id'))),
            'cases_by_urgency': list(queryset.values('urgency').annotate(count=Count('id'))),
        }
        
        return Response(stats)

class FamilyViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Family.objects.all().prefetch_related('members')
    serializer_class = FamilySerializer
    
    @action(detail=True, methods=['get'])
    def members(self, request, pk=None):
        """Get all members in a family"""
        family = self.get_object()
        members = family.members.all()
        serializer = MemberSerializer(members, many=True)
        return Response(serializer.data)

class MinistryParticipationViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = MinistryParticipation.objects.select_related('member', 'ministry')
    serializer_class = MinistryParticipationSerializer
    filter_backends = [DjangoFilterBackend]
    
    @action(detail=False, methods=['get'])
    def by_ministry(self, request):
        """Get all participants for a specific ministry"""
        ministry_id = request.query_params.get('ministry_id')
        if ministry_id:
            participation = self.get_queryset().filter(ministry_id=ministry_id, is_active=True)
            serializer = self.get_serializer(participation, many=True)
            return Response(serializer.data)
        return Response([])
