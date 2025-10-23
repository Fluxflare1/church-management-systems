import { useState, useCallback } from 'react';
import { CMASGuestProfile, getGuestAcquisitionStatus, updateGuestAcquisitionStage } from '@/lib/api/cmas';

export function useCMAS() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trackGuestEngagement = useCallback(async (guestId: string, action: string, metadata?: any) => {
    try {
      setLoading(true);
      setError(null);
      
      await fetch('/api/v1/cmas/engagement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          guest_id: guestId,
          action,
          metadata,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (err) {
      setError('Failed to track engagement');
      console.error('Engagement tracking error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getGuestStatus = useCallback(async (guestId: string) => {
    try {
      setLoading(true);
      setError(null);
      return await getGuestAcquisitionStatus(guestId);
    } catch (err) {
      setError('Failed to fetch guest status');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateGuestStage = useCallback(async (guestId: string, stage: string, notes?: string) => {
    try {
      setLoading(true);
      setError(null);
      return await updateGuestAcquisitionStage(guestId, stage, notes);
    } catch (err) {
      setError('Failed to update guest stage');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    trackGuestEngagement,
    getGuestStatus,
    updateGuestStage,
  };
}
