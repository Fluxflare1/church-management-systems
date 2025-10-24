'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCampaigns, useSendCampaign, useCampaignPerformance } from '@/lib/communications';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Users, Mail, BarChart3 } from 'lucide-react';

export function CampaignDashboard() {
  const [activeTab, setActiveTab] = useState('all');
  const { data: campaigns, isLoading } = useCampaigns();
  const { mutate: sendCampaign } = useSendCampaign();
  const { toast } = useToast();

  const filteredCampaigns = campaigns?.results?.filter(campaign => {
    if (activeTab === 'all') return true;
    return campaign.status === activeTab;
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'sent': return 'default';
      case 'scheduled': return 'secondary';
      case 'processing': return 'outline';
      case 'draft': return 'outline';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  const handleSendCampaign = (campaignId: number) => {
    sendCampaign({ id: campaignId, sendNow: true }, {
      onSuccess: () => {
        toast({
          title: 'Campaign sent',
          description: 'Campaign has been queued for sending',
        });
      }
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 bg-muted rounded w-48" />
          <div className="h-4 bg-muted rounded w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Campaign Dashboard</CardTitle>
        <CardDescription>
          Manage and monitor your communication campaigns
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="draft">Draft</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
            <TabsTrigger value="processing">Processing</TabsTrigger>
            <TabsTrigger value="sent">Sent</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4 mt-4">
            {filteredCampaigns?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No campaigns found</p>
                <p className="text-sm">Create your first campaign to get started</p>
              </div>
            ) : (
              filteredCampaigns?.map((campaign) => (
                <CampaignCard 
                  key={campaign.id} 
                  campaign={campaign} 
                  onSend={() => handleSendCampaign(campaign.id)}
                />
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function CampaignCard({ campaign, onSend }: { campaign: any; onSend: () => void }) {
  const { data: performance } = useCampaignPerformance(campaign.id);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{campaign.name}</h3>
              <Badge variant={getStatusVariant(campaign.status)}>
                {campaign.status}
              </Badge>
            </div>
            
            <p className="text-sm text-muted-foreground">
              {campaign.description}
            </p>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Mail className="h-4 w-4" />
                <span>{campaign.template_name}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{campaign.audience_count} recipients</span>
              </div>
              {campaign.scheduled_for && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(campaign.scheduled_for).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            {performance && (
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <BarChart3 className="h-4 w-4" />
                  <span>{performance.rates.delivery_rate}% delivered</span>
                </div>
                <span>{performance.overview.read} read</span>
                <span>{performance.engagement.total_opens} opens</span>
              </div>
            )}
          </div>

          <div className="flex gap-2 ml-4">
            {campaign.status === 'draft' && (
              <Button size="sm" onClick={onSend}>
                Send Now
              </Button>
            )}
            <Button variant="outline" size="sm">
              View
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
