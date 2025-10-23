from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, UserProfile

class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    verbose_name_plural = 'Profile'

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    model = User
    list_display = ('email', 'first_name', 'last_name', 'user_type', 'branch', 'is_verified', 'is_staff', 'is_active')
    list_filter = ('user_type', 'is_verified', 'is_staff', 'is_active', 'branch')
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('first_name', 'last_name', 'phone_number', 'profile_picture')}),
        ('Church Info', {'fields': ('user_type', 'branch')}),
        ('Permissions', {'fields': ('is_verified', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2', 'user_type', 'branch', 'is_staff', 'is_active')}
        ),
    )
    search_fields = ('email', 'first_name', 'last_name')
    ordering = ('email',)
    inlines = (UserProfileInline,)

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'marital_status', 'occupation')
    search_fields = ('user__email', 'user__first_name', 'user__last_name')
    list_filter = ('marital_status',)
