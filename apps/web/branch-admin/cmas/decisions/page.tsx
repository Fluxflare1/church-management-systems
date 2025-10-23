'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface SpiritualDecision {
  id: number;
  decision_type: string;
  decision_date: string;
  follow_up_completed: boolean;
  follow_up_agent: {
    first_name: string;
    last_name: string;
  } | null;
  guest: {
    id: number;
    user: {
      first_name: string;
      last_name: string;
      email: string;
    };
    branch: {
      name: string;
    };
  };
}

export default function SpiritualDecisionsPage() {
  const { data: session } = useSession();
  const [decisions, setDecisions] = useState<SpiritualDecision[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  useEffect(() => {
    fetchDecisions();
  }, [filter]);

  const fetchDecisions = async () => {
    try {
      setLoading(true);
      const url = filter === 'all' 
        ? '/api/v1/cmas/decisions/' 
        : `/api/v1/cmas/decisions/?follow_up=${filter}`;
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setDecisions(data.results || []);
      }
    } catch (error) {
      console.error('Failed to fetch decisions:', error);
    } finally {
      setLoading(false);
    }
  };

  const completeFollowUp = async (decisionId: number) => {
    try {
      const response = await fetch(`/api/v1/cmas/decisions/${decisionId}/complete_follow_up/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notes: 'Follow-up completed via dashboard'
        })
      });

      if (response.ok) {
        // Refresh the list
        fetchDecisions();
      }
    } catch (error) {
      console.error('Failed to complete follow-up:', error);
    }
  };

  const getDecisionTypeColor = (type: string) => {
    const colors = {
      salvation: 'bg-green-100 text-green-800',
      baptism: 'bg-blue-100 text-blue-800',
      membership: 'bg-purple-100 text-purple-800',
      rededication: 'bg-orange-100 text-orange-800',
      calling: 'bg-red-100 text-red-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Spiritual Decisions</h1>
          <p className="text-gray-600">Track and follow up on spiritual decisions</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex space-x-2 mb-6">
        {(['all', 'pending', 'completed'] as const).map((filterType) => (
          <button
            key={filterType}
            onClick={() => setFilter(filterType)}
            className={`px-4 py-2 rounded-lg capitalize ${
              filter === filterType
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {filterType} Follow-up
          </button>
        ))}
      </div>

      {/* Decisions Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Guest
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Decision Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Follow-up Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {decisions.map((decision) => (
                  <tr key={decision.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium text-gray-900">
                          {decision.guest.user.first_name} {decision.guest.user.last_name}
                        </div>
                        <div className="text-sm text-gray-500">{decision.guest.user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs capitalize ${getDecisionTypeColor(decision.decision_type)}`}>
                        {decision.decision_type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(decision.decision_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {decision.follow_up_completed ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                          Completed
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {!decision.follow_up_completed && (
                        <button
                          onClick={() => completeFollowUp(decision.id)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          Mark Complete
                        </button>
                      )}
                      <button className="text-gray-600 hover:text-gray-900">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
