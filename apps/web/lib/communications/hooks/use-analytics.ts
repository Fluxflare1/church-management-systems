import { useQuery } from '@tanstack/react-query';
import { communicationApi } from '../api-client';
import { CampaignPerformance, ChannelPerformance } from '../types';

export const useCampaignPerformance = (campaignId: number) => {
  return useQuery({
    queryKey: ['communication-campaign-performance', campaignId],
    queryFn: async () => {
      const response = await communicationApi.getCampaignPerformance(campaignId);
      return response.data as CampaignPerformance;
    },
    enabled: !!campaignId,
  });
};

export const useChannelPerformance = (days: number = 30) => {
  return useQuery({
    queryKey: ['communication-channel-performance', days],
    queryFn: async () => {
      const response = await communicationApi.getChannelPerformance(days);
      return response.data as ChannelPerformance;
    },
  });
};

export const useEngagementTrends = (days: number = 90) => {
  return useQuery({
    queryKey: ['communication-engagement-trends', days],
    queryFn: async () => {
      const response = await communicationApi.getEngagementTrends(days);
      return response.data;
    },
  });
};

export const useAudienceInsights = (filters?: any) => {
  return useQuery({
    queryKey: ['communication-audience-insights', filters],
    queryFn: async () => {
      const response = await communicationApi.getAudienceInsights(filters);
      return response.data;
    },
    enabled: !!filters,
  });
};
