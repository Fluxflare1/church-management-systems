from django.db import transaction
from django.contrib.auth import get_user_model
from typing import Dict, List, Any
import logging

from ..models import UserCommunicationPreference, CommunicationChannel

User = get_user_model()
logger = logging.getLogger(__name__)

class PreferenceService:
    """Service for managing user communication preferences"""
    
    def __init__(self):
        pass
    
    def get_user_preferences(self, user) -> Dict[str, Any]:
        """Get all communication preferences for a user"""
        try:
            preferences = UserCommunicationPreference.objects.filter(user=user)
            
            # Create default structure with all channels
            all_channels = CommunicationChannel.objects.filter(is_active=True)
            preference_data = {}
            
            for channel in all_channels:
                channel_pref = preferences.filter(channel=channel).first()
                preference_data[channel.channel_type] = {
                    'channel_id': channel.id,
                    'channel_name': channel.name,
                    'is_enabled': channel_pref.is_enabled if channel_pref else True,
                    'opt_in_date': channel_pref.opt_in_date if channel_pref else None,
                }
            
            return {
                'user_id': user.id,
                'preferences': preference_data,
                'global_opt_out': self._is_globally_opted_out(user)
            }
            
        except Exception as e:
            logger.error(f"Error getting preferences for user {user.id}: {str(e)}")
            return {}
    
    def update_user_preferences(self, user, preferences_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update user communication preferences"""
        try:
            with transaction.atomic():
                results = {}
                
                for channel_type, pref_data in preferences_data.get('preferences', {}).items():
                    try:
                        channel = CommunicationChannel.objects.get(
                            channel_type=channel_type, 
                            is_active=True
                        )
                        
                        preference, created = UserCommunicationPreference.objects.get_or_create(
                            user=user,
                            channel=channel,
                            defaults={'is_enabled': pref_data.get('is_enabled', True)}
                        )
                        
                        if not created:
                            preference.is_enabled = pref_data.get('is_enabled', True)
                            preference.save()
                        
                        results[channel_type] = {
                            'status': 'success',
                            'is_enabled': preference.is_enabled
                        }
                        
                    except CommunicationChannel.DoesNotExist:
                        results[channel_type] = {
                            'status': 'error',
                            'error': f'Channel {channel_type} not found'
                        }
                    except Exception as e:
                        results[channel_type] = {
                            'status': 'error',
                            'error': str(e)
                        }
                
                # Handle global opt-out
                global_opt_out = preferences_data.get('global_opt_out', False)
                self._set_global_opt_out(user, global_opt_out)
                
                return {
                    'user_id': user.id,
                    'results': results,
                    'global_opt_out': global_opt_out
                }
                
        except Exception as e:
            logger.error(f"Error updating preferences for user {user.id}: {str(e)}")
            return {'status': 'error', 'error': str(e)}
    
    def bulk_opt_in_users(self, users: List[User], channel_types: List[str] = None) -> Dict[str, Any]:
        """Bulk opt-in users to communication channels"""
        try:
            with transaction.atomic():
                channels = CommunicationChannel.objects.filter(is_active=True)
                if channel_types:
                    channels = channels.filter(channel_type__in=channel_types)
                
                results = {
                    'total_users': len(users),
                    'channels_processed': [],
                    'users_processed': 0
                }
                
                for channel in channels:
                    channel_results = {
                        'channel': channel.channel_type,
                        'opted_in': 0,
                        'errors': 0
                    }
                    
                    for user in users:
                        try:
                            preference, created = UserCommunicationPreference.objects.update_or_create(
                                user=user,
                                channel=channel,
                                defaults={'is_enabled': True}
                            )
                            channel_results['opted_in'] += 1
                        except Exception as e:
                            logger.error(f"Error opting in user {user.id} to {channel.channel_type}: {str(e)}")
                            channel_results['errors'] += 1
                    
                    results['channels_processed'].append(channel_results)
                    results['users_processed'] += channel_results['opted_in']
                
                return results
                
        except Exception as e:
            logger.error(f"Error in bulk opt-in: {str(e)}")
            return {'status': 'error', 'error': str(e)}
    
    def get_opt_in_analytics(self) -> Dict[str, Any]:
        """Get analytics on user opt-in rates"""
        try:
            total_users = User.objects.filter(is_active=True).count()
            channels = CommunicationChannel.objects.filter(is_active=True)
            
            analytics = {
                'total_active_users': total_users,
                'channel_opt_ins': {},
                'global_metrics': {}
            }
            
            total_opt_ins = 0
            for channel in channels:
                opt_in_count = UserCommunicationPreference.objects.filter(
                    channel=channel,
                    is_enabled=True
                ).count()
                
                opt_in_rate = (opt_in_count / total_users * 100) if total_users > 0 else 0
                
                analytics['channel_opt_ins'][channel.channel_type] = {
                    'opted_in': opt_in_count,
                    'opt_in_rate': round(opt_in_rate, 2),
                    'total_users': total_users
                }
                
                total_opt_ins += opt_in_count
            
            # Global metrics
            if channels.count() > 0:
                avg_opt_in_rate = total_opt_ins / (channels.count() * total_users) * 100 if total_users > 0 else 0
                analytics['global_metrics'] = {
                    'average_opt_in_rate': round(avg_opt_in_rate, 2),
                    'total_opt_ins_across_channels': total_opt_ins
                }
            
            return analytics
            
        except Exception as e:
            logger.error(f"Error getting opt-in analytics: {str(e)}")
            return {}
    
    def _is_globally_opted_out(self, user) -> bool:
        """Check if user has globally opted out of all communications"""
        # This could be stored in user profile or a separate model
        return getattr(user.profile, 'global_communication_opt_out', False) if hasattr(user, 'profile') else False
    
    def _set_global_opt_out(self, user, opt_out: bool):
        """Set global opt-out status for user"""
        try:
            if hasattr(user, 'profile'):
                user.profile.global_communication_opt_out = opt_out
                user.profile.save()
        except Exception as e:
            logger.error(f"Error setting global opt-out for user {user.id}: {str(e)}")
    
    def can_receive_messages(self, user, channel_type: str = None) -> bool:
        """Check if user can receive messages on specific channel"""
        # Check global opt-out first
        if self._is_globally_opted_out(user):
            return False
        
        # If specific channel is provided, check its preference
        if channel_type:
            try:
                channel = CommunicationChannel.objects.get(channel_type=channel_type, is_active=True)
                preference = UserCommunicationPreference.objects.filter(
                    user=user,
                    channel=channel
                ).first()
                
                # If preference exists, use it. Otherwise, default to True
                return preference.is_enabled if preference else True
                
            except CommunicationChannel.DoesNotExist:
                return False
        
        return True
    
    def get_eligible_recipients(self, users: List[User], channel_type: str) -> List[User]:
        """Filter users who are eligible to receive messages on a channel"""
        eligible_users = []
        
        for user in users:
            if self.can_receive_messages(user, channel_type):
                eligible_users.append(user)
        
        return eligible_users
