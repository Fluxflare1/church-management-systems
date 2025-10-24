import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { communicationApi } from '../api-client';
import { CommunicationPreferences, UpdatePreferencesRequest } from '../types';
import { useToast } from '@/hooks/use-toast';

export const usePreferences = () => {
  return useQuery({
    queryKey: ['communication-preferences'],
    queryFn: async () => {
      const response = await communicationApi.getPreferences();
      return response.data as CommunicationPreferences;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useUpdatePreferences = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: UpdatePreferencesRequest) => {
      const response = await communicationApi.updatePreferences(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communication-preferences'] });
      toast({
        title: 'Preferences updated',
        description: 'Your communication preferences have been updated.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error updating preferences',
        description: error.response?.data?.detail || 'An error occurred',
        variant: 'destructive',
      });
    },
  });
};
