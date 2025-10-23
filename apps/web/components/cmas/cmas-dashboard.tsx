'use client';

import { useState, useEffect } from 'react';
import { Users, TrendingUp, Mail, Phone, Calendar } from 'lucide-react';
import { getCMASAnalytics, getAcquisitionWorkflows, CMASAnalytics, CMASWorkflow } from '@/lib/api/cmas';

interface CMASDashboardProps {
  branch?: string;
}

export default function CMASDashboard({ branch }: CMASDashboardProps) {
  const [analytics, setAnalytics] = useState<CMASAnalytics | null>(null);
  const [workflows, setWorkflows] = useState<CMASWorkflow[]>([]);
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('30d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [timeframe, branch]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [analyticsData, workflowsData] = await Promise.all([
        getCMASAnalytics(timeframe, branch),
        getAcquisitionWorkflows()
      ]);
      setAnalytics(analyticsData);
      setWorkflows(workflowsData);
    } catch (error) {
      console.error('Failed to load CMAS dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading acquisition analytics...</div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-8 text-gray-500">
        Failed to load acquisition data
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Timeframe Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Member Acquisition Dashboard</h2>
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value as any)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Guests</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalGuests}</p>
            </div>
          </div>
          <div className="mt-2 text-sm text-green-600">
            +{analytics.newThisWeek} new this week
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.conversionRate}%
              </p>
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            Guest to member
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <Mail className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Engagement Score</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.averageEngagement}/10
              </p>
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            Average guest engagement
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Workflows</p>
              <p className="text-2xl font-bold text-gray-900">
                {workflows.filter(w => w.isActive).length}
              </p>
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            Acquisition sequences
          </div>
        </div>
      </div>

      {/* Sources and Stages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Sources */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Guest Sources</h3>
          <div className="space-y-3">
            {analytics.topSources.map((source, index) => (
              <div key={source.source} className="flex justify-between items-center">
                <span className="text-sm text-gray-600 capitalize">{source.source.replace('-', ' ')}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ 
                        width: `${(source.count / Math.max(...analytics.topSources.map(s => s.count))) * 100}%` 
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-8 text-right">
                    {source.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stage Breakdown */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Acquisition Stage Breakdown</h3>
          <div className="space-y-3">
            {analytics.stageBreakdown.map((stage) => (
              <div key={stage.stage} className="flex justify-between items-center">
                <span className="text-sm text-gray-600 capitalize">{stage.stage}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full"
                      style={{ 
                        width: `${(stage.count / analytics.totalGuests) * 100}%` 
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-8 text-right">
                    {stage.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active Workflows */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Acquisition Workflows</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workflows
            .filter(workflow => workflow.isActive)
            .map(workflow => (
              <div key={workflow.id} className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">{workflow.name}</h4>
                <p className="text-sm text-gray-600 mb-3">{workflow.description}</p>
                <div className="flex flex-wrap gap-1">
                  {workflow.triggers.slice(0, 3).map(trigger => (
                    <span 
                      key={trigger}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {trigger}
                    </span>
                  ))}
                  {workflow.triggers.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      +{workflow.triggers.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
