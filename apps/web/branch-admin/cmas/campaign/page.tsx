'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

interface Campaign {
  id: number;
  name: string;
  campaign_type: string;
  status: string;
  start_date: string;
  end_date: string;
  target_guests: number;
  actual_guests: number;
  budget: string;
  campaign_lead: {
    first_name: string;
    last_name: string;
  };
}

export default function CampaignsPage() {
  const { data: session } = useSession();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'draft' | 'completed'>('all');

  useEffect(() => {
    fetchCampaigns();
  }, [filter]);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const url = filter === 'all' 
        ? '/api/v1/cmas/campaigns/' 
        : `/api/v1/cmas/campaigns/?status=${filter}`;
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setCampaigns(data.results || []);
      }
    } catch (error) {
      console.error('Failed to fetch campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      active: 'bg-green-100 text-green-800',
      paused: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getCampaignTypeIcon = (type: string) => {
    const icons = {
      outreach: '🌍',
      revival: '🔥',
      membership: '👥',
      special_event: '🎉',
      digital_ads: '📱'
    };
    return icons[type as keyof typeof icons] || '📊';
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Growth Campaigns</h1>
          <p className="text-gray-600">Manage outreach and acquisition campaigns</p>
        </div>
        <Link
          href="/admin/cmas/campaigns/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Create Campaign
        </Link>
      </div>

      {/* Filters */}
      <div className="flex space-x-2 mb-6">
        {(['all', 'active', 'draft', 'completed'] as const).map((filterType) => (
          <button
            key={filterType}
            onClick={() => setFilter(filterType)}
            className={`px-4 py-2 rounded-lg capitalize ${
              filter === filterType
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {filterType}
          </button>
        ))}
      </div>

      {/* Campaigns Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <CampaignCard 
              key={campaign.id} 
              campaign={campaign} 
              getStatusColor={getStatusColor}
              getCampaignTypeIcon={getCampaignTypeIcon}
            />
          ))}
          {campaigns.length === 0 && (
            <div className="col-span-full text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📊</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No campaigns found</h3>
              <p className="text-gray-600 mb-4">Get started by creating your first growth campaign</p>
              <Link
                href="/admin/cmas/campaigns/new"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Create Campaign
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CampaignCard({ campaign, getStatusColor, getCampaignTypeIcon }: {
  campaign: Campaign;
  getStatusColor: (status: string) => string;
  getCampaignTypeIcon: (type: string) => string;
}) {
  const progress = campaign.target_guests > 0 
    ? (campaign.actual_guests / campaign.target_guests) * 100 
    : 0;

  return (
    <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{getCampaignTypeIcon(campaign.campaign_type)}</span>
            <div>
              <h3 className="font-semibold text-gray-900">{campaign.name}</h3>
              <p className="text-sm text-gray-600 capitalize">{campaign.campaign_type.replace('_', ' ')}</p>
            </div>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(campaign.status)}`}>
            {campaign.status}
          </span>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Guest Acquisition</span>
            <span>{campaign.actual_guests}/{campaign.target_guests}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all" 
              style={{ width: `${Math.min(progress, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Lead:</span>
            <span>{campaign.campaign_lead.first_name} {campaign.campaign_lead.last_name}</span>
          </div>
          <div className="flex justify-between">
            <span>Budget:</span>
            <span>${campaign.budget}</span>
          </div>
          <div className="flex justify-between">
            <span>Duration:</span>
            <span>{new Date(campaign.start_date).toLocaleDateString()} - {campaign.end_date ? new Date(campaign.end_date).toLocaleDateString() : 'Ongoing'}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-2 mt-4 pt-4 border-t">
          <Link
            href={`/admin/cmas/campaigns/${campaign.id}`}
            className="flex-1 bg-blue-600 text-white text-center py-2 rounded hover:bg-blue-700"
          >
            View Details
          </Link>
          <button className="px-3 py-2 border rounded text-gray-600 hover:bg-gray-50">
            ...
          </button>
        </div>
      </div>
    </div>
  );
}
