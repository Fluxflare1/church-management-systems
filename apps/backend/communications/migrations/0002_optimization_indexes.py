from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('communications', '0001_initial'),
    ]

    operations = [
        # Add indexes for better query performance
        migrations.AddIndex(
            model_name='message',
            index=models.Index(fields=['status', 'created_at'], name='msg_status_created_idx'),
        ),
        migrations.AddIndex(
            model_name='message',
            index=models.Index(fields=['to_user', 'channel', 'created_at'], name='msg_user_channel_created_idx'),
        ),
        migrations.AddIndex(
            model_name='message',
            index=models.Index(fields=['campaign', 'status'], name='msg_campaign_status_idx'),
        ),
        migrations.AddIndex(
            model_name='messagecampaign',
            index=models.Index(fields=['status', 'scheduled_for'], name='campaign_status_scheduled_idx'),
        ),
        migrations.AddIndex(
            model_name='usercommunicationpreference',
            index=models.Index(fields=['user', 'channel'], name='pref_user_channel_idx'),
        ),
        migrations.AddIndex(
            model_name='usercommunicationpreference',
            index=models.Index(fields=['is_enabled'], name='pref_enabled_idx'),
        ),
        migrations.AddIndex(
            model_name='conversationmessage',
            index=models.Index(fields=['conversation', 'created_at'], name='conv_msg_conversation_created_idx'),
        ),
        
        # Add partial indexes for better performance
        migrations.RunSQL(
            "CREATE INDEX CONCURRENTLY msg_sent_status_idx ON communications_message (sent_at) WHERE status IN ('sent', 'delivered', 'read');",
            "DROP INDEX IF EXISTS msg_sent_status_idx;"
        ),
        
        # Add composite indexes for common query patterns
        migrations.RunSQL(
            """CREATE INDEX CONCURRENTLY msg_analytics_idx 
               ON communications_message (channel_id, status, date_trunc('day', created_at));""",
            "DROP INDEX IF EXISTS msg_analytics_idx;"
        ),
    ]
