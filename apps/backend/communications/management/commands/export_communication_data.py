import csv
import json
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta, datetime

from communications.models import Message, MessageCampaign
from communications.services.analytics_service import AnalyticsService

class Command(BaseCommand):
    help = 'Export communication data for analysis or backup'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--format',
            choices=['csv', 'json'],
            default='csv',
            help='Output format (default: csv)'
        )
        parser.add_argument(
            '--days',
            type=int,
            default=30,
            help='Export data from last N days (default: 30)'
        )
        parser.add_argument(
            '--output',
            type=str,
            help='Output file path (default: print to stdout)'
        )
        parser.add_argument(
            '--include-analytics',
            action='store_true',
            help='Include analytics data in export'
        )
    
    def handle(self, *args, **options):
        format_type = options['format']
        days = options['days']
        output_file = options['output']
        include_analytics = options['include_analytics']
        
        cutoff_date = timezone.now() - timedelta(days=days)
        
        # Get data
        messages = Message.objects.filter(created_at__gte=cutoff_date)
        campaigns = MessageCampaign.objects.filter(created_at__gte=cutoff_date)
        
        if include_analytics:
            analytics_service = AnalyticsService()
            analytics_data = analytics_service.get_engagement_trends(days)
        
        # Prepare data based on format
        if format_type == 'csv':
            data = self._prepare_csv_data(messages, campaigns, analytics_data if include_analytics else None)
            output = self._convert_to_csv(data)
        else:  # json
            data = self._prepare_json_data(messages, campaigns, analytics_data if include_analytics else None)
            output = json.dumps(data, indent=2, default=str)
        
        # Output results
        if output_file:
            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(output)
            self.stdout.write(self.style.SUCCESS(f"Data exported to {output_file}"))
        else:
            self.stdout.write(output)
    
    def _prepare_csv_data(self, messages, campaigns, analytics_data):
        """Prepare data for CSV export"""
        data = {
            'messages': [],
            'campaigns': [],
            'analytics': []
        }
        
        # Messages data
        for msg in messages:
            data['messages'].append({
                'id': msg.id,
                'campaign_id': msg.campaign.id if msg.campaign else '',
                'channel': msg.channel.channel_type,
                'from_user': msg.from_user.email,
                'to_user': msg.to_user.email if msg.to_user else '',
                'status': msg.status,
                'subject': msg.subject,
                'sent_at': msg.sent_at,
                'delivered_at': msg.delivered_at,
                'read_at': msg.read_at,
                'open_count': msg.open_count,
                'click_count': msg.click_count,
                'created_at': msg.created_at
            })
        
        # Campaigns data
        for campaign in campaigns:
            data['campaigns'].append({
                'id': campaign.id,
                'name': campaign.name,
                'template': campaign.template.name,
                'schedule_type': campaign.schedule_type,
                'status': campaign.status,
                'scheduled_for': campaign.scheduled_for,
                'created_at': campaign.created_at
            })
        
        # Analytics data
        if analytics_data:
            for daily_metric in analytics_data.get('daily_metrics', []):
                data['analytics'].append({
                    'date': daily_metric['date'],
                    'total_messages': daily_metric['total_messages'],
                    'opened_messages': daily_metric['opened_messages'],
                    'clicked_messages': daily_metric['clicked_messages'],
                    'response_rate': daily_metric['response_rate']
                })
        
        return data
    
    def _prepare_json_data(self, messages, campaigns, analytics_data):
        """Prepare data for JSON export"""
        return {
            'export_date': timezone.now().isoformat(),
            'period_days': 30,
            'messages_count': messages.count(),
            'campaigns_count': campaigns.count(),
            'messages': list(messages.values(
                'id', 'campaign', 'channel', 'from_user', 'to_user',
                'status', 'subject', 'sent_at', 'delivered_at', 'read_at',
                'open_count', 'click_count', 'created_at'
            )),
            'campaigns': list(campaigns.values(
                'id', 'name', 'template', 'schedule_type', 'status',
                'scheduled_for', 'created_at'
            )),
            'analytics': analytics_data if analytics_data else {}
        }
    
    def _convert_to_csv(self, data):
        """Convert data to CSV format"""
        output = []
        
        # Messages CSV
        if data['messages']:
            output.append("MESSAGES")
            writer = csv.DictWriter(output, fieldnames=data['messages'][0].keys())
            writer.writeheader()
            for row in data['messages']:
                writer.writerow(row)
            output.append("")
        
        # Campaigns CSV
        if data['campaigns']:
            output.append("CAMPAIGNS")
            writer = csv.DictWriter(output, fieldnames=data['campaigns'][0].keys())
            writer.writeheader()
            for row in data['campaigns']:
                writer.writerow(row)
            output.append("")
        
        # Analytics CSV
        if data['analytics']:
            output.append("ANALYTICS")
            writer = csv.DictWriter(output, fieldnames=data['analytics'][0].keys())
            writer.writeheader()
            for row in data['analytics']:
                writer.writerow(row)
        
        return '\n'.join(output)
