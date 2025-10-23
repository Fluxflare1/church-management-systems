'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface GuestStats {
  total_guests: number;
  new_this_week: number;
  need_follow_up: number;
  conversion_rate: number;
}

interface Guest {
  id: number;
  user: {
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
  };
  status: string;
  first_visit_date: string;
  total_visits: number;
  follow_up_agent: {
    first_name: string;
    last_name: string;
  } | null;
}

export default function GuestDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<GuestStats | null>(null);
  const [recentGuests, setRecentGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchGuestData();
  }, []);

  const fetchGuestData = async () => {
    try {
      setLoading(true);
      
      const [statsResponse, guestsResponse] = await Promise.all([
        fetch('/api/v1/guests/profiles/stats/'),
        fetch('/api/v1/guests/profiles/?limit=10&ordering=-created_at')
      ]);

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      if (guestsResponse.ok) {
        const guestsData = await guestsResponse.json();
        setRecentGuests(guestsData.results || []);
      }
    } catch (error) {
      console.error('Failed to fetch guest data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Guest Management</h1>
        <p className="text-gray-600">Manage and follow up with church guests</p>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900">Total Guests</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.total_guests}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900">New This Week</h3>
            <p className="text-3xl font-bold text-green-600">{stats.new_this_week}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900">Need Follow-up</h3>
            <p className="text-3xl font-bold text-orange-600">{stats.need_follow_up}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900">Conversion Rate</h3>
            <p className="text-3xl font-bold text-purple-600">{stats.conversion_rate}%</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-6 font-medium text-sm border-b-2 ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('guests')}
              className={`py-4 px-6 font-medium text-sm border-b-2 ${
                activeTab === 'guests'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              All Guests
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`py-4 px-6 font-medium text-sm border-b-2 ${
                activeTab === 'tasks'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Follow-up Tasks
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <RecentGuestsTable guests={recentGuests} />
          )}
          {activeTab === 'guests' && (
            <AllGuestsView />
          )}
          {activeTab === 'tasks' && (
            <FollowUpTasksView />
          )}
        </div>
      </div>
    </div>
  );
}

// Additional components would be implemented in separate files
// RecentGuestsTable, AllGuestsView, FollowUpTasksView, etc.
