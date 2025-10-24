'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useCreateCampaign, useChannels } from '@/lib/communications';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface VisibilityCampaignsProps {
  segmentFilters: any;
}

export function VisibilityCampaigns({ segmentFilters }: VisibilityCampaignsProps) {
  const [campaignName, setCampaignName] = useState('');
  const [campaignMessage, setCampaignMessage] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('');
  
  const { mutate: createCampaign, isPending } = useCreateCampaign();
  const { data: channels } = useChannels();
  const { toast } = useToast();

  const handleCreateCampaign = () => {
    if (!campaignName || !campaignMessage || !selectedChannel) return;

    // In a real implementation, you would create a template first
    // For this demo, we'll assume template creation is handled elsewhere
    createCampaign({
      name: campaignName,
      description: `Visibility campaign for ${campaignName}`,
      template: 1, // This would be dynamic
      audience_filter: segmentFilters,
      schedule_type: 'immediate',
      channel: parseInt(selectedChannel)
    }, {
      onSuccess: () => {
        toast({
          title: 'Campaign created',
          description: 'Visibility campaign has been launched',
        });
        setCampaignName('');
        setCampaignMessage('');
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Outreach Campaigns
          <Badge variant="outline">Visibility Engine</Badge>
        </CardTitle>
        <CardDescription>
          Create targeted outreach campaigns to increase church visibility
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          <label className="text-sm font-medium">Campaign Name</label>
          <Input
            placeholder="Easter Service Outreach"
            value={campaignName}
            onChange={(e) => setCampaignName(e.target.value)}
          />
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium">Message Content</label>
          <Textarea
            placeholder="Join us for our special Easter service..."
            value={campaignMessage}
            onChange={(e) => setCampaignMessage(e.target.value)}
            rows={4}
          />
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium">Channel</label>
          <select
            value={selectedChannel}
            onChange={(e) => setSelectedChannel(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <option value="">Select channel</option>
            {channels?.map((channel) => (
              <option key={channel.id} value={channel.id.toString()}>
                {channel.name}
              </option>
            ))}
          </select>
        </div>

        <Button 
          onClick={handleCreateCampaign}
          disabled={!campaignName || !campaignMessage || !selectedChannel || isPending}
        >
          {isPending ? 'Creating...' : 'Launch Campaign'}
        </Button>

        <div className="text-xs text-muted-foreground">
          <p>Targeting: {segmentFilters?.branch_id ? 'Specific branch' : 'All segments'}</p>
          <p>This campaign will reach all users matching your current filters</p>
        </div>
      </CardContent>
    </Card>
  );
}
