'use client';

import { useState } from 'react';

interface Guest {
  id: number;
  user: {
    first_name: string;
    last_name: string;
    email: string;
  };
  status: string;
  total_visits: number;
}

interface SpiritualDecision {
  id: number;
  decision_type: string;
  decision_date: string;
  follow_up_completed: boolean;
}

export default function CMASGuestIntegration({ guest }: { guest: Guest }) {
  const [decisions, setDecisions] = useState<SpiritualDecision[]>([]);
  const [showDecisionForm, setShowDecisionForm] = useState(false);
  const [newDecision, setNewDecision] = useState({
    decision_type: 'salvation',
    decision_date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const fetchGuestDecisions = async () => {
    try {
      const response = await fetch(`/api/v1/cmas/decisions/?guest_id=${guest.id}`);
      if (response.ok) {
        const data = await response.json();
        setDecisions(data.results || []);
      }
    } catch (error) {
      console.error('Failed to fetch decisions:', error);
    }
  };

  const recordSpiritualDecision = async () => {
    try {
      const response = await fetch('/api/v1/cmas/decisions/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          guest_id: guest.id,
          ...newDecision
        })
      });

      if (response.ok) {
        setShowDecisionForm(false);
        setNewDecision({
          decision_type: 'salvation',
          decision_date: new Date().toISOString().split('T')[0],
          notes: ''
        });
        fetchGuestDecisions(); // Refresh the list
      }
    } catch (error) {
      console.error('Failed to record decision:', error);
    }
  };

  // Load decisions when component mounts
  useState(() => {
    fetchGuestDecisions();
  });

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold mb-4">Spiritual Journey</h3>
      
      {/* Record New Decision */}
      <div className="mb-6">
        <button
          onClick={() => setShowDecisionForm(!showDecisionForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Record Spiritual Decision
        </button>

        {showDecisionForm && (
          <div className="mt-4 p-4 border rounded-lg bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Decision Type</label>
                <select
                  value={newDecision.decision_type}
                  onChange={(e) => setNewDecision({...newDecision, decision_type: e.target.value})}
                  className="w-full p-2 border rounded"
                >
                  <option value="salvation">Salvation Decision</option>
                  <option value="baptism">Baptism Decision</option>
                  <option value="membership">Membership Decision</option>
                  <option value="rededication">Rededication</option>
                  <option value="calling">Ministry Calling</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Decision Date</label>
                <input
                  type="date"
                  value={newDecision.decision_date}
                  onChange={(e) => setNewDecision({...newDecision, decision_date: e.target.value})}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Notes</label>
              <textarea
                value={newDecision.notes}
                onChange={(e) => setNewDecision({...newDecision, notes: e.target.value})}
                rows={3}
                className="w-full p-2 border rounded"
                placeholder="Any details about this decision..."
              />
            </div>
            <div className="flex space-x-2">
              <button
                onClick={recordSpiritualDecision}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Save Decision
              </button>
              <button
                onClick={() => setShowDecisionForm(false)}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Decisions List */}
      <div>
        <h4 className="font-medium mb-3">Recorded Decisions</h4>
        {decisions.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No spiritual decisions recorded yet</p>
        ) : (
          <div className="space-y-3">
            {decisions.map((decision) => (
              <div key={decision.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-medium capitalize">{decision.decision_type.replace('_', ' ')}</span>
                    <p className="text-sm text-gray-600">
                      {new Date(decision.decision_date).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    decision.follow_up_completed 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {decision.follow_up_completed ? 'Followed Up' : 'Needs Follow-up'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
