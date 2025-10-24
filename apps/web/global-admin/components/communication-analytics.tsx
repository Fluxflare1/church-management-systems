'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useChannelPerformance, useEngagementTrends } from '@/lib/communications';
import { Skeleton } from '@/components/ui/skeleton';

export function CommunicationAnalytics() {
  const { data: channelPerformance, isLoading: performanceLoading } = useChannelPerformance(30);
  const { data: engagementTrends, isLoading: trendsLoading } = useEngagementTrends(90);

  if (performanceLoading || trendsLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Communication Analytics</CardTitle>
        <CardDescription>
          Performance metrics across all communication channels
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="channels">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="channels">Channel Performance</TabsTrigger>
            <TabsTrigger value="engagement">Engagement Trends</TabsTrigger>
          </TabsList>
          
          <TabsContent value="channels" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {channelPerformance?.channels?.map((channel) => (
                <Card key={channel.channel_id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{channel.channel_name}</CardTitle>
                    <CardDescription className="text-xs capitalize">
                      {channel.channel_type}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {channel.metrics.success_rate}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {channel.metrics.successful} sent / {channel.metrics.total_messages} total
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Cost: ${channel.cost.total_cost.toFixed(2)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="font-medium">Total Messages</div>
                    <div>{channelPerformance?.summary.total_messages}</div>
                  </div>
                  <div>
                    <div className="font-medium">Total Cost</div>
                    <div>${channelPerformance?.summary.total_cost.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="font-medium">Avg Cost/Message</div>
                    <div>${channelPerformance?.summary.average_cost_per_message.toFixed(4)}</div>
                  </div>
                  <div>
                    <div className="font-medium">Most Effective</div>
                    <div className="capitalize">
                      {channelPerformance?.summary.most_effective_channel?.channel_type}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="engagement">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Engagement Overview</CardTitle>
                <CardDescription>
                  Last {engagementTrends?.period}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center border rounded-lg">
                  <div className="text-center text-muted-foreground">
                    <p>Engagement charts would be displayed here</p>
                    <p className="text-sm">
                      {engagementTrends?.daily_metrics?.length} days of data available
                    </p>
                  </div>
                </div>
                
                {engagementTrends?.trend_analysis && (
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <div className="text-sm font-medium">Trend Analysis</div>
                    <div className="text-sm text-muted-foreground capitalize">
                      Engagement is {engagementTrends.trend_analysis.trend}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
