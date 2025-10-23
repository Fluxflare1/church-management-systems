from django.contrib import admin
from django.utils.html import format_html
from .models import Member, Family, WelfareCase, WelfareUpdate, MemberEngagement, MinistryParticipation

@admin.register(Member)
class MemberAdmin(admin.ModelAdmin):
    list_display = [
        'member_id', 'full_name', 'branch', 'membership_status', 
        'welfare_category', 'relationship_manager', 'membership_date'
    ]
    list_filter = [
        'branch', 'membership_status', 'welfare_category', 'marital_status',
        'relationship_manager', 'created_at'
    ]
    search_fields = [
        'user__first_name', 'user__last_name', 'user__email', 
        'member_id', 'occupation'
    ]
    readonly_fields = ['created_at', 'updated_at', 'member_id']
    fieldsets = (
        ('Personal Information', {
            'fields': (
                'user', 'member_id', 'branch', 
                'marital_status', 'date_of_birth', 'occupation', 'education_level'
            )
        }),
        ('Spiritual Journey', {
            'fields': (
                'salvation_date', 'baptism_date', 'membership_date',
                'spiritual_gifts', 'skills'
            )
        }),
        ('Family & Relationships', {
            'fields': (
                'family', 'family_role', 'relationship_manager'
            )
        }),
        ('Welfare & Support', {
            'fields': (
                'welfare_category', 'special_needs', 'welfare_notes'
            )
        }),
        ('Status & Metadata', {
            'fields': (
                'membership_status', 'created_at', 'updated_at'
            )
        }),
    )
    
    def full_name(self, obj):
        return obj.user.get_full_name()
    full_name.short_description = 'Name'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'user', 'branch', 'family', 'relationship_manager'
    )

@admin.register(Family)
class FamilyAdmin(admin.ModelAdmin):
    list_display = ['family_id', 'family_name', 'primary_contact_name', 'member_count', 'address']
    search_fields = ['family_id', 'family_name', 'address']
    readonly_fields = ['created_at', 'updated_at']
    
    def primary_contact_name(self, obj):
        if obj.primary_contact:
            return obj.primary_contact.user.get_full_name()
        return "Not set"
    primary_contact_name.short_description = 'Primary Contact'
    
    def member_count(self, obj):
        return obj.members.count()
    member_count.short_description = 'Members'

class WelfareUpdateInline(admin.TabularInline):
    model = WelfareUpdate
    extra = 1
    readonly_fields = ['created_at']
    fields = ['officer', 'update_notes', 'action_taken', 'next_steps', 'created_at']

@admin.register(WelfareCase)
class WelfareCaseAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'member_name', 'case_type', 'urgency', 'status', 
        'assigned_officer_name', 'reported_date', 'is_overdue_display'
    ]
    list_filter = ['case_type', 'urgency', 'status', 'reported_date']
    search_fields = ['title', 'member__user__first_name', 'member__user__last_name']
    readonly_fields = ['reported_date', 'last_updated']
    inlines = [WelfareUpdateInline]
    fieldsets = (
        ('Case Details', {
            'fields': (
                'member', 'case_type', 'title', 'description', 'urgency'
            )
        }),
        ('Assignment & Status', {
            'fields': (
                'assigned_officer', 'status', 'resolution_notes'
            )
        }),
        ('Timelines', {
            'fields': (
                'target_resolution_date', 'resolved_date',
                'reported_date', 'last_updated'
            )
        }),
    )
    
    def member_name(self, obj):
        return obj.member.user.get_full_name()
    member_name.short_description = 'Member'
    
    def assigned_officer_name(self, obj):
        if obj.assigned_officer:
            return obj.assigned_officer.get_full_name()
        return "Unassigned"
    assigned_officer_name.short_description = 'Assigned Officer'
    
    def is_overdue_display(self, obj):
        if obj.is_overdue:
            return format_html('<span style="color: red;">⚠ Overdue</span>')
        return format_html('<span style="color: green;">On track</span>')
    is_overdue_display.short_description = 'Status'

@admin.register(MemberEngagement)
class MemberEngagementAdmin(admin.ModelAdmin):
    list_display = [
        'member_name', 'engagement_score', 'engagement_tier', 
        'attendance_streak', 'last_attendance_date', 'updated_at'
    ]
    list_filter = ['engagement_tier', 'updated_at']
    search_fields = ['member__user__first_name', 'member__user__last_name']
    readonly_fields = ['updated_at']
    
    def member_name(self, obj):
        return obj.member.user.get_full_name()
    member_name.short_description = 'Member'

@admin.register(MinistryParticipation)
class MinistryParticipationAdmin(admin.ModelAdmin):
    list_display = ['member_name', 'ministry_name', 'role', 'is_active', 'start_date']
    list_filter = ['ministry', 'role', 'is_active', 'start_date']
    search_fields = [
        'member__user__first_name', 'member__user__last_name', 
        'ministry__name'
    ]
    
    def member_name(self, obj):
        return obj.member.user.get_full_name()
    member_name.short_description = 'Member'
    
    def ministry_name(self, obj):
        return obj.ministry.name
    ministry_name.short_description = 'Ministry'

# Register models that don't need custom admin
admin.site.register(WelfareUpdate)
