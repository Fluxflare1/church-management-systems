import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { communicationApi } from '../api-client';
import { useToast } from '@/hooks/use-toast';

export const useConversations = (params?: any) => {
  return useQuery({
    queryKey: ['communication-conversations', params],
    queryFn: async () => {
      const response = await communicationApi.getConversations(params);
      return response.data;
    },
  });
};

export const useConversation = (id: number) => {
  return useQuery({
    queryKey: ['communication-conversation', id],
    queryFn: async () => {
      const response = await communicationApi.getConversation(id);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useConversationMessages = (conversationId: number) => {
  return useQuery({
    queryKey: ['communication-conversation-messages', conversationId],
    queryFn: async () => {
      const response = await communicationApi.getConversationMessages(conversationId);
      return response.data;
    },
    enabled: !!conversationId,
    refetchInterval: 30000, // Refetch every 30 seconds for new messages
  });
};

export const useSendConversationMessage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ conversationId, content }: { conversationId: number; content: string }) => {
      const response = await communicationApi.sendConversationMessage(conversationId, content);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['communication-conversation-messages', variables.conversationId] 
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error sending message',
        description: error.response?.data?.detail || 'An error occurred',
        variant: 'destructive',
      });
    },
  });
};
