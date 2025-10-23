from django.db.models import Prefetch
from django.core.cache import cache
from django.utils import timezone
from datetime import timedelta

class GuestQueryOptimizer:
    """Optimize database queries for guest management"""
    
    @staticmethod
    def get_guests_with_optimized_queries(branch=None, status=None):
        """Get guests with optimized database queries"""
        base_queryset = GuestProfile.objects.select_related(
            'user', 'branch', 'follow_up_agent'
        ).prefetch_related(
            Prefetch('visits', queryset=GuestVisit.objects.select_related('branch').order_by('-visit_date')),
            Prefetch('communications', queryset=GuestCommunication.objects.select_related('sent_by').order_by('-sent_at')),
            Prefetch('follow_up_tasks', queryset=FollowUpTask.objects.select_related('assigned_to').filter(status='pending'))
        )
        
        if branch:
            base_queryset = base_queryset.filter(branch=branch)
        
        if status:
            base_queryset = base_queryset.filter(status=status)
        
        return base_queryset
    
    @staticmethod
    def get_cached_guest_stats(branch, cache_timeout=300):
        """Get cached guest statistics to reduce database load"""
        cache_key = f"guest_stats_{branch.id}_{timezone.now().strftime('%Y-%m-%d')}"
        
        cached_data = cache.get(cache_key)
        if cached_data:
            return cached_data
        
        # Calculate fresh stats
        stats = {
            'total_guests': GuestProfile.objects.filter(branch=branch).count(),
            'active_guests': GuestProfile.objects.filter(
                branch=branch, 
                last_visit_date__gte=timezone.now().date() - timedelta(days=30)
            ).count(),
            'need_follow_up': GuestProfile.objects.filter(
                branch=branch,
                status__in=['new', 'contacted'],
                last_visit_date__lte=timezone.now().date() - timedelta(days=7)
            ).count(),
        }
        
        # Cache the results
        cache.set(cache_key, stats, cache_timeout)
        return stats
