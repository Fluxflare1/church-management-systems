import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { communicationApi } from '../api-client';
import { SendMessageRequest } from '../types';
import { useToast } from '@/hooks/use-toast';

export const useMessages = (params?: any) => {
  return useQuery({
    queryKey: ['communication-messages', params],
    queryFn: async () => {
      const response = await communicationApi.getMessages(params);
      return response.data;
    },
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: SendMessageRequest) => {
      const response = await communicationApi.sendMessage(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communication-messages'] });
      toast({
        title: 'Messages sent',
        description: 'Your messages have been queued for delivery.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error sending messages',
        description: error.response?.data?.detail || 'An error occurred',
        variant: 'destructive',
      });
    },
  });
};
