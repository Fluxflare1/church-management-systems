from rest_framework import permissions
from django.db.models import Q

class MemberPermissions(permissions.BasePermission):
    """
    Custom permissions for Member model
    """
    def has_permission(self, request, view):
        # Allow read-only for authenticated users for list view
        if request.method in permissions.SAFE_METHODS:
            return request.user.is_authenticated
        
        # Write operations require specific roles
        if request.method in ['POST', 'PUT', 'PATCH', 'DELETE']:
            return request.user.groups.filter(
                name__in=['Platform Admins', 'Branch Managers', 'Relationship Managers']
            ).exists()
        
        return False

    def has_object_permission(self, request, view, obj):
        user = request.user
        
        # Platform admins can do anything
        if user.groups.filter(name='Platform Admins').exists():
            return True
        
        # Branch managers can manage members in their branch
        if user.groups.filter(name='Branch Managers').exists():
            branch = getattr(user, 'managed_branch', None)
            if branch and obj.branch == branch:
                return True
        
        # Relationship managers can manage their assigned members
        if user.groups.filter(name='Relationship Managers').exists():
            if obj.relationship_manager == user:
                return True
        
        # Members can view and update their own profile
        if hasattr(user, 'member_profile') and obj.user == user:
            return request.method in ['GET', 'PUT', 'PATCH']
        
        return False

class WelfareCasePermissions(permissions.BasePermission):
    """
    Custom permissions for WelfareCase model
    """
    def has_permission(self, request, view):
        # Allow read for authenticated users with appropriate roles
        if request.method in permissions.SAFE_METHODS:
            return request.user.is_authenticated and request.user.groups.filter(
                name__in=['Platform Admins', 'Branch Managers', 'Relationship Managers', 'Welfare Officers']
            ).exists()
        
        # Write operations require specific roles
        if request.method in ['POST', 'PUT', 'PATCH', 'DELETE']:
            return request.user.groups.filter(
                name__in=['Platform Admins', 'Branch Managers', 'Relationship Managers', 'Welfare Officers']
            ).exists()
        
        return False

    def has_object_permission(self, request, view, obj):
        user = request.user
        
        # Platform admins can do anything
        if user.groups.filter(name='Platform Admins').exists():
            return True
        
        # Branch managers can manage cases in their branch
        if user.groups.filter(name='Branch Managers').exists():
            branch = getattr(user, 'managed_branch', None)
            if branch and obj.member.branch == branch:
                return True
        
        # Assigned officers and relationship managers can manage their cases
        if user.groups.filter(name__in=['Relationship Managers', 'Welfare Officers']).exists():
            if obj.assigned_officer == user or obj.member.relationship_manager == user:
                return True
        
        return False

class FamilyPermissions(permissions.BasePermission):
    """
    Custom permissions for Family model
    """
    def has_permission(self, request, view):
        # Only specific roles can manage families
        return request.user.is_authenticated and request.user.groups.filter(
            name__in=['Platform Admins', 'Branch Managers', 'Relationship Managers']
        ).exists()

    def has_object_permission(self, request, view, obj):
        user = request.user
        
        # Platform admins can do anything
        if user.groups.filter(name='Platform Admins').exists():
            return True
        
        # Branch managers can manage families in their branch
        if user.groups.filter(name='Branch Managers').exists():
            # Check if any family member belongs to manager's branch
            branch = getattr(user, 'managed_branch', None)
            if branch and obj.members.filter(branch=branch).exists():
                return True
        
        return False
