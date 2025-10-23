from rest_framework import permissions

class IsVerified(permissions.BasePermission):
    """Allow access only to verified users."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_verified

class IsGuest(permissions.BasePermission):
    """Allow access only to guest users."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.user_type == 'guest'

class IsMember(permissions.BasePermission):
    """Allow access only to member users."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.user_type == 'member'

class IsStaff(permissions.BasePermission):
    """Allow access only to staff users."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.user_type == 'staff'

class IsAdmin(permissions.BasePermission):
    """Allow access only to admin users."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.user_type == 'admin'

class IsBranchMember(permissions.BasePermission):
    """Allow access only to users belonging to a specific branch."""
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        # Get branch from view or request
        branch_id = view.kwargs.get('branch_id') or request.data.get('branch')
        if branch_id:
            return request.user.branch and request.user.branch.id == int(branch_id)
        
        return True

class HasUserType(permissions.BasePermission):
    """Allow access only to users with specific user types."""
    def __init__(self, allowed_types):
        self.allowed_types = allowed_types
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.user_type in self.allowed_types
