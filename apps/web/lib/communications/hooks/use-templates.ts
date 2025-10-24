import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { communicationApi } from '../api-client';
import { MessageTemplate, CreateTemplateRequest } from '../types';
import { useToast } from '@/hooks/use-toast';

export const useTemplates = (params?: any) => {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['communication-templates', params],
    queryFn: async () => {
      const response = await communicationApi.getTemplates(params);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useTemplate = (id: number) => {
  return useQuery({
    queryKey: ['communication-template', id],
    queryFn: async () => {
      const response = await communicationApi.getTemplate(id);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateTemplate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateTemplateRequest) => {
      const response = await communicationApi.createTemplate(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communication-templates'] });
      toast({
        title: 'Template created',
        description: 'Message template has been created successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error creating template',
        description: error.response?.data?.detail || 'An error occurred',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateTemplate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<MessageTemplate> }) => {
      const response = await communicationApi.updateTemplate(id, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['communication-templates'] });
      queryClient.invalidateQueries({ queryKey: ['communication-template', variables.id] });
      toast({
        title: 'Template updated',
        description: 'Message template has been updated successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error updating template',
        description: error.response?.data?.detail || 'An error occurred',
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteTemplate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      await communicationApi.deleteTemplate(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communication-templates'] });
      toast({
        title: 'Template deleted',
        description: 'Message template has been deleted successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error deleting template',
        description: error.response?.data?.detail || 'An error occurred',
        variant: 'destructive',
      });
    },
  });
};
