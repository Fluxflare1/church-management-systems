from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from django.utils import timezone
from apps.authentication.models import User
from apps.churches.models import Branch
from .models import GuestProfile, GuestVisit, GuestCommunication, FollowUpTask
from .serializers import (
    GuestProfileSerializer, GuestVisitSerializer, GuestCommunicationSerializer,
    FollowUpTaskSerializer, ConnectCardSubmissionSerializer
)
from .services.workflow_engine import process_new_guest_registration

class GuestProfileViewSet(viewsets.ModelViewSet):
    serializer_class = GuestProfileSerializer
    queryset = GuestProfile.objects.select_related('user', 'branch', 'follow_up_agent').all()
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by branch if user is branch-specific
        user = self.request.user
        if hasattr(user, 'branch'):
            queryset = queryset.filter(branch=user.branch)
        elif hasattr(user, 'managed_branches'):
            # Regional/National admin can see multiple branches
            queryset = queryset.filter(branch__in=user.managed_branches.all())
        
        # Additional filtering
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return queryset
    
    @action(detail=False, methods=['post'])
    def submit_connect_card(self, request):
        """Handle digital connect card submissions"""
        serializer = ConnectCardSubmissionSerializer(data=request.data)
        
        if serializer.is_valid():
            try:
                with transaction.atomic():
                    # Create or get user
                    user, created = User.objects.get_or_create(
                        email=serializer.validated_data['email'],
                        defaults={
                            'first_name': serializer.validated_data['first_name'],
                            'last_name': serializer.validated_data['last_name'],
                            'phone_number': serializer.validated_data.get('phone', ''),
                            'is_active': True
                        }
                    )
                    
                    # Get branch
                    branch = Branch.objects.get(id=serializer.validated_data['branch_id'])
                    
                    # Create guest profile
                    guest_profile, guest_created = GuestProfile.objects.get_or_create(
                        user=user,
                        branch=branch,
                        defaults={
                            'source': serializer.validated_data['how_heard'],
                            'first_visit_date': serializer.validated_data['visit_date'],
                            'prefers_email': serializer.validated_data['prefers_email'],
                            'prefers_sms': serializer.validated_data['prefers_sms'],
                            'prefers_whatsapp': serializer.validated_data['prefers_whatsapp'],
                            'prefers_in_app': serializer.validated_data['prefers_in_app'],
                            'interested_salvation': serializer.validated_data['interested_salvation'],
                            'interested_baptism': serializer.validated_data['interested_baptism'],
                            'interested_membership': serializer.validated_data['interested_membership'],
                            'interested_volunteering': serializer.validated_data['interested_volunteering'],
                        }
                    )
                    
                    # Record visit
                    GuestVisit.objects.create(
                        guest=guest_profile,
                        branch=branch,
                        visit_date=serializer.validated_data['visit_date'],
                        service_type='sunday_service',  # Default, can be enhanced
                        notes=serializer.validated_data.get('notes', '') + 
                              f"\nPrayer Request: {serializer.validated_data.get('prayer_request', '')}"
                    )
                    
                    # Trigger automated workflows if new guest
                    if guest_created:
                        process_new_guest_registration.delay(guest_profile.id)
                    
                    return Response({
                        'success': True,
                        'guest_id': guest_profile.id,
                        'message': 'Connect card submitted successfully'
                    }, status=status.HTTP_201_CREATED)
                    
            except Exception as e:
                return Response({
                    'success': False,
                    'error': str(e)
                }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def record_visit(self, request, pk=None):
        """Record a new visit for a guest"""
        guest = self.get_object()
        
        visit_data = {
            'guest': guest.id,
            'branch': guest.branch.id,
            'visit_date': timezone.now().date(),
            'service_type': request.data.get('service_type', 'sunday_service'),
            'notes': request.data.get('notes', '')
        }
        
        serializer = GuestVisitSerializer(data=visit_data)
        if serializer.is_valid():
            serializer.save(checked_in_by=request.user)
            
            # Update guest stats
            guest.total_visits += 1
            guest.last_visit_date = timezone.now().date()
            
            # Update status based on visit count
            if guest.total_visits >= 3:
                guest.status = 'visited'
            
            guest.save()
            
            # Trigger workflows for multiple visits
            if guest.total_visits == 2:
                from .services.workflow_engine import WorkflowEngine
                workflow_engine = WorkflowEngine()
                workflow_engine.trigger_workflow(guest, 'second_visit')
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class GuestVisitViewSet(viewsets.ModelViewSet):
    serializer_class = GuestVisitSerializer
    queryset = GuestVisit.objects.select_related('guest', 'branch', 'checked_in_by').all()

class GuestCommunicationViewSet(viewsets.ModelViewSet):
    serializer_class = GuestCommunicationSerializer
    queryset = GuestCommunication.objects.select_related('guest', 'sent_by').all()

class FollowUpTaskViewSet(viewsets.ModelViewSet):
    serializer_class = FollowUpTaskSerializer
    queryset = FollowUpTask.objects.select_related('guest', 'assigned_to').all()
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by assigned user unless admin
        user = self.request.user
        if not user.is_staff:
            queryset = queryset.filter(assigned_to=user)
        
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return queryset
