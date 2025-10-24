'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { usePreferences, useUpdatePreferences, useChannels } from '@/lib/communications';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export function CommunicationPreferences() {
  const { data: preferences, isLoading: preferencesLoading } = usePreferences();
  const { data: channels, isLoading: channelsLoading } = useChannels();
  const { mutate: updatePreferences, isPending } = useUpdatePreferences();
  const { toast } = useToast();

  const handlePreferenceChange = (channelType: string, enabled: boolean) => {
    if (!preferences) return;

    updatePreferences({
      preferences: {
        ...preferences.preferences,
        [channelType]: { is_enabled: enabled }
      }
    });
  };

  if (preferencesLoading || channelsLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-6 w-12" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Communication Preferences</CardTitle>
        <CardDescription>
          Choose how you'd like to receive communications from THOGMi
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {channels?.map((channel) => {
            const preference = preferences?.preferences[channel.channel_type];
            const isEnabled = preference?.is_enabled ?? true;

            return (
              <div key={channel.id} className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor={`channel-${channel.id}`} className="text-base">
                    {channel.name}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive {channel.channel_type} messages and notifications
                  </p>
                </div>
                <Switch
                  id={`channel-${channel.id}`}
                  checked={isEnabled}
                  onCheckedChange={(checked) => 
                    handlePreferenceChange(channel.channel_type, checked)
                  }
                  disabled={isPending}
                />
              </div>
            );
          })}
        </div>

        <div className="rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base">Global Opt-out</Label>
              <p className="text-sm text-muted-foreground">
                Opt out of all non-essential communications
              </p>
            </div>
            <Switch
              checked={preferences?.global_opt_out || false}
              onCheckedChange={(checked) => 
                updatePreferences({ global_opt_out: checked })
              }
              disabled={isPending}
            />
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          <p>Essential communications include important service updates and emergency alerts</p>
        </div>
      </CardContent>
    </Card>
  );
}
