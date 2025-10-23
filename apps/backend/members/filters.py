import django_filters
from django_filters import rest_framework as filters
from .models import Member, WelfareCase

class MemberFilter(django_filters.FilterSet):
    membership_status = django_filters.MultipleChoiceFilter(
        choices=Member.MEMBERSHIP_STATUS,
        field_name='membership_status'
    )
    welfare_category = django_filters.MultipleChoiceFilter(
        choices=Member.WELFARE_CATEGORIES,
        field_name='welfare_category'
    )
    branch = django_filters.NumberFilter(field_name='branch__id')
    relationship_manager = django_filters.NumberFilter(field_name='relationship_manager__id')
    has_welfare_cases = django_filters.BooleanFilter(method='filter_has_welfare_cases')
    engagement_tier = django_filters.ChoiceFilter(
        field_name='engagement__engagement_tier',
        choices=[
            ('high', 'High Engagement'),
            ('medium', 'Medium Engagement'),
            ('low', 'Low Engagement'),
            ('inactive', 'Inactive'),
        ]
    )
    join_date_after = django_filters.DateFilter(field_name='membership_date', lookup_expr='gte')
    join_date_before = django_filters.DateFilter(field_name='membership_date', lookup_expr='lte')
    age_min = django_filters.NumberFilter(method='filter_age_min')
    age_max = django_filters.NumberFilter(method='filter_age_max')

    class Meta:
        model = Member
        fields = {
            'marital_status': ['exact'],
            'occupation': ['icontains'],
            'education_level': ['icontains'],
        }

    def filter_has_welfare_cases(self, queryset, name, value):
        if value:
            return queryset.filter(welfare_cases__isnull=False).distinct()
        return queryset.filter(welfare_cases__isnull=True)

    def filter_age_min(self, queryset, name, value):
        from django.utils import timezone
        from datetime import date
        
        if value:
            max_birth_year = timezone.now().year - value
            return queryset.filter(date_of_birth__year__lte=max_birth_year)
        return queryset

    def filter_age_max(self, queryset, name, value):
        from django.utils import timezone
        from datetime import date
        
        if value:
            min_birth_year = timezone.now().year - value
            return queryset.filter(date_of_birth__year__gte=min_birth_year)
        return queryset

class WelfareCaseFilter(django_filters.FilterSet):
    status = django_filters.MultipleChoiceFilter(
        choices=WelfareCase.CASE_STATUS,
        field_name='status'
    )
    case_type = django_filters.MultipleChoiceFilter(
        choices=WelfareCase.CASE_TYPES,
        field_name='case_type'
    )
    urgency = django_filters.MultipleChoiceFilter(
        choices=WelfareCase.URGENCY_LEVELS,
        field_name='urgency'
    )
    member = django_filters.NumberFilter(field_name='member__id')
    branch = django_filters.NumberFilter(field_name='member__branch__id')
    assigned_officer = django_filters.NumberFilter(field_name='assigned_officer__id')
    reported_after = django_filters.DateFilter(field_name='reported_date', lookup_expr='gte')
    reported_before = django_filters.DateFilter(field_name='reported_date', lookup_expr='lte')
    target_date_after = django_filters.DateFilter(field_name='target_resolution_date', lookup_expr='gte')
    target_date_before = django_filters.DateFilter(field_name='target_resolution_date', lookup_expr='lte')
    is_overdue = django_filters.BooleanFilter(method='filter_is_overdue')
    has_updates = django_filters.BooleanFilter(method='filter_has_updates')

    class Meta:
        model = WelfareCase
        fields = {
            'title': ['icontains'],
        }

    def filter_is_overdue(self, queryset, name, value):
        from django.utils import timezone
        
        if value:
            return queryset.filter(
                status__in=['open', 'in_progress'],
                target_resolution_date__lt=timezone.now().date()
            )
        return queryset.filter(
            Q(target_resolution_date__isnull=True) | 
            Q(target_resolution_date__gte=timezone.now().date()) |
            ~Q(status__in=['open', 'in_progress'])
        )

    def filter_has_updates(self, queryset, name, value):
        if value:
            return queryset.filter(updates__isnull=False).distinct()
        return queryset.filter(updates__isnull=True)
