'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { memberApi } from '@/lib/api/members';

interface AnalyticsData {
  total_members: number;
  active_members: number;
  engagement_stats: {
    avg_engagement_score: number;
    high_engagement: number;
    medium_engagement: number;
    low_engagement: number;
    inactive_engagement: number;
  };
  welfare_summary: {
    total_cases: number;
    open_cases: number;
    overdue_cases: number;
  };
  status_breakdown: Array<{ membership_status: string; count: number }>;
  welfare_breakdown: Array<{ welfare_category: string; count: number }>;
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [welfareStats, setWelfareStats] = useState<any>(null);
  const [timeRange, setTimeRange] = useState('30d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    try {
      const [engagementResponse, welfareResponse] = await Promise.all([
        memberApi.getEngagementReport(),
        memberApi.getWelfareDashboardStats()
      ]);
      
      setAnalytics(engagementResponse);
      setWelfareStats(welfareResponse);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading analytics...</div>;
  }

  if (!analytics || !welfareStats) {
    return <div>Error loading analytics data</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Member Analytics</h1>
          <p className="text-gray-600">Comprehensive insights into member engagement and welfare</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{analytics.total_members}</CardTitle>
            <CardDescription>Total Members</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl text-green-600">
              {analytics.engagement_stats.avg_engagement_score?.toFixed(1)}%
            </CardTitle>
            <CardDescription>Avg Engagement</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl text-blue-600">
              {analytics.welfare_summary.open_cases}
            </CardTitle>
            <CardDescription>Active Welfare Cases</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl text-red-600">
              {analytics.welfare_summary.overdue_cases}
            </CardTitle>
            <CardDescription>Overdue Cases</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Engagement Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Engagement Distribution</CardTitle>
            <CardDescription>Member engagement levels across the church</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-green-600 font-medium">High Engagement</span>
                <span className="font-bold">{analytics.engagement_stats.high_engagement}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ 
                    width: `${(analytics.engagement_stats.high_engagement / analytics.total_members) * 100}%` 
                  }}
                ></div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-yellow-600 font-medium">Medium Engagement</span>
                <span className="font-bold">{analytics.engagement_stats.medium_engagement}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-yellow-600 h-2 rounded-full" 
                  style={{ 
                    width: `${(analytics.engagement_stats.medium_engagement / analytics.total_members) * 100}%` 
                  }}
                ></div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-red-600 font-medium">Low Engagement</span>
                <span className="font-bold">{analytics.engagement_stats.low_engagement}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-red-600 h-2 rounded-full" 
                  style={{ 
                    width: `${(analytics.engagement_stats.low_engagement / analytics.total_members) * 100}%` 
                  }}
                ></div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Inactive</span>
                <span className="font-bold">{analytics.engagement_stats.inactive_engagement}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gray-600 h-2 rounded-full" 
                  style={{ 
                    width: `${(analytics.engagement_stats.inactive_engagement / analytics.total_members) * 100}%` 
                  }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Welfare Cases by Type */}
        <Card>
          <CardHeader>
            <CardTitle>Welfare Cases by Type</CardTitle>
            <CardDescription>Distribution of support requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {welfareStats.cases_by_type?.map((type: any) => (
                <div key={type.case_type} className="flex justify-between items-center">
                  <span className="capitalize">{type.case_type.replace('_', ' ')}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{type.count}</span>
                    <div 
                      className="w-16 bg-blue-100 rounded-full h-2"
                      title={`${((type.count / welfareStats.total_cases) * 100).toFixed(1)}%`}
                    >
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ 
                          width: `${(type.count / welfareStats.total_cases) * 100}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Membership Status */}
      <Card>
        <CardHeader>
          <CardTitle>Membership Status Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {analytics.status_breakdown.map((status) => (
              <div key={status.membership_status} className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{status.count}</div>
                <div className="text-sm text-gray-600 capitalize">
                  {status.membership_status.replace('_', ' ')}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle>Export Reports</CardTitle>
          <CardDescription>Download detailed reports for further analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button variant="outline">Export Engagement Report</Button>
            <Button variant="outline">Export Welfare Cases</Button>
            <Button variant="outline">Export Member Directory</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
