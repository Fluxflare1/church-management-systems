from django.contrib.auth import get_user_model
from django.db.models import Q
from typing import List, Dict, Any

User = get_user_model()

class AudienceService:
    """Service for segmenting and managing communication audiences"""
    
    @staticmethod
    def segment_users(filters: Dict[str, Any]) -> List[User]:
        """Segment users based on provided filters"""
        queryset = User.objects.filter(is_active=True)
        
        # Branch filter
        if filters.get('branch_id'):
            queryset = queryset.filter(profile__branch_id=filters['branch_id'])
        
        # Role filter
        if filters.get('roles'):
            role_conditions = Q()
            for role in filters['roles']:
                role_conditions |= Q(groups__name=role)
            queryset = queryset.filter(role_conditions)
        
        # Group/Department filter
        if filters.get('group_id'):
            queryset = queryset.filter(groups__id=filters['group_id'])
        
        # Member status filter
        if filters.get('member_status'):
            queryset = queryset.filter(profile__member_status=filters['member_status'])
        
        # Date range filters
        if filters.get('joined_after'):
            queryset = queryset.filter(date_joined__gte=filters['joined_after'])
        
        if filters.get('last_login_after'):
            queryset = queryset.filter(last_login__gte=filters['last_login_after'])
        
        return queryset.distinct()
    
    @staticmethod
    def get_branch_audience(branch_id: int, roles: List[str] = None) -> List[User]:
        """Get users from specific branch with optional role filter"""
        filters = {'branch_id': branch_id}
        if roles:
            filters['roles'] = roles
        return AudienceService.segment_users(filters)
    
    @staticmethod
    def get_group_audience(group_id: int) -> List[User]:
        """Get users from specific group/department"""
        return AudienceService.segment_users({'group_id': group_id})
    
    @staticmethod
    def get_audience_count(filters: Dict[str, Any]) -> int:
        """Get count of users matching filters"""
        return len(AudienceService.segment_users(filters))
