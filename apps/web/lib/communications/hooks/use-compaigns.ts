import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { communicationApi } from '../api-client';
import { MessageCampaign, CreateCampaignRequest } from '../types';
import { useToast } from '@/hooks/use-toast';

export const useCampaigns = (params?: any) => {
  return useQuery({
    queryKey: ['communication-campaigns', params],
    queryFn: async () => {
      const response = await communicationApi.getCampaigns(params);
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useCampaign = (id: number) => {
  return useQuery({
    queryKey: ['communication-campaign', id],
    queryFn: async () => {
      const response = await communicationApi.getCampaign(id);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateCampaign = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateCampaignRequest) => {
      const response = await communicationApi.createCampaign(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communication-campaigns'] });
      toast({
        title: 'Campaign created',
        description: 'Message campaign has been created successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error creating campaign',
        description: error.response?.data?.detail || 'An error occurred',
        variant: 'destructive',
      });
    },
  });
};

export const useSendCampaign = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, sendNow }: { id: number; sendNow?: boolean }) => {
      const response = await communicationApi.sendCampaign(id, sendNow);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['communication-campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['communication-campaign', variables.id] });
      toast({
        title: 'Campaign sent',
        description: 'Message campaign has been queued for sending.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error sending campaign',
        description: error.response?.data?.detail || 'An error occurred',
        variant: 'destructive',
      });
    },
  });
};
