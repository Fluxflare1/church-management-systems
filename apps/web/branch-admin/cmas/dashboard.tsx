'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

interface GrowthMetrics {
  period: string;
  new_guests: number;
  returning_guests: number;
  total_visits: number;
  spiritual_decisions: number;
  conversion_rate: number;
}

interface Campaign {
  id: number;
  name: string;
  campaign_type: string;
  status: string;
  target_guests: number;
  actual_guests: number;
  completion_rate: number;
}

interface FunnelData {
  funnel_stages: {
    awareness: number;
    interest: number;
    visit: number;
    engagement: number;
    decision: number;
    membership: number;
  };
  conversion_rates: {
    [key: string]: number;
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

export default function CMASDashboard() {
  const { data: session } = useSession();
  const [metrics, setMetrics] = useState<GrowthMetrics | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [funnelData, setFunnelData] = useState<FunnelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'30' | '90' | '180'>('30');

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const [metricsRes, campaignsRes, funnelRes] = await Promise.all([
        fetch(`/api/v1/cmas/analytics/growth_metrics/?days=${timeRange}`),
        fetch('/api/v1/cmas/campaigns/?status=active'),
        fetch('/api/v1/cmas/analytics/funnel_analysis/')
      ]);

      if (metricsRes.ok) setMetrics(await metricsRes.json());
      if (campaignsRes.ok) {
        const campaignsData = await campaignsRes.json();
        setCampaigns(campaignsData.results || []);
      }
      if (funnelRes.ok) setFunnelData(await funnelRes.json());
      
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const funnelChartData = funnelData ? [
    { stage: 'Awareness', count: funnelData.funnel_stages.awareness },
    { stage: 'Interest', count: funnelData.funnel_stages.interest },
    { stage: 'First Visit', count: funnelData.funnel_stages.visit },
    { stage: 'Engagement', count: funnelData.funnel_stages.engagement },
    { stage: 'Decision', count: funnelData.funnel_stages.decision },
    { stage: 'Membership', count: funnelData.funnel_stages.membership },
  ] : [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Growth Analytics</h1>
          <p className="text-gray-600">Church Member Acquisition System Dashboard</p>
        </div>
        <div className="flex space-x-4">
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="border rounded-lg px-3 py-2"
          >
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
            <option value="180">Last 180 Days</option>
          </select>
          <Link
            href="/admin/cmas/campaigns/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            New Campaign
          </Link>
        </div>
      </div>

      {/* Key Metrics Grid */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="New Guests"
            value={metrics.new_guests}
            change={metrics.new_guests}
            color="blue"
          />
          <MetricCard
            title="Spiritual Decisions"
            value={metrics.spiritual_decisions}
            change={metrics.spiritual_decisions}
            color="green"
          />
          <MetricCard
            title="Total Visits"
            value={metrics.total_visits}
            change={metrics.total_visits}
            color="purple"
          />
          <MetricCard
            title="Conversion Rate"
            value={`${metrics.conversion_rate}%`}
            change={metrics.conversion_rate}
            color="orange"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversion Funnel */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Conversion Funnel</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={funnelChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="stage" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Active Campaigns */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Active Campaigns</h3>
            <Link href="/admin/cmas/campaigns" className="text-blue-600 hover:text-blue-800 text-sm">
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {campaigns.slice(0, 3).map((campaign) => (
              <CampaignProgress key={campaign.id} campaign={campaign} />
            ))}
            {campaigns.length === 0 && (
              <p className="text-gray-500 text-center py-4">No active campaigns</p>
            )}
          </div>
        </div>
      </div>

      {/* Conversion Rates */}
      {funnelData && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Stage Conversion Rates</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(funnelData.conversion_rates).map(([stage, rate], index) => (
              <div key={stage} className="text-center">
                <div className="text-2xl font-bold text-blue-600">{rate}%</div>
                <div className="text-sm text-gray-600 capitalize">
                  {stage.replace('_to_', ' → ').replace('_', ' ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Supporting Components
function MetricCard({ title, value, change, color }: { 
  title: string; 
  value: number | string; 
  change: number;
  color: string;
}) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    purple: 'bg-purple-50 border-purple-200',
    orange: 'bg-orange-50 border-orange-200'
  };

  return (
    <div className={`p-6 rounded-lg border-2 ${colorClasses[color as keyof typeof colorClasses]}`}>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
    </div>
  );
}

function CampaignProgress({ campaign }: { campaign: Campaign }) {
  return (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-semibold text-gray-900">{campaign.name}</h4>
        <span className={`px-2 py-1 rounded-full text-xs ${
          campaign.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {campaign.status}
        </span>
      </div>
      <div className="flex justify-between text-sm text-gray-600 mb-2">
        <span>{campaign.actual_guests} / {campaign.target_guests} guests</span>
        <span>{campaign.completion_rate}% complete</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full" 
          style={{ width: `${Math.min(campaign.completion_rate, 100)}%` }}
        ></div>
      </div>
    </div>
  );
}
