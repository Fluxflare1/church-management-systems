import { useQuery } from '@tanstack/react-query';
import { communicationApi } from '../api-client';
import { CommunicationChannel } from '../types';

export const useChannels = () => {
  return useQuery({
    queryKey: ['communication-channels'],
    queryFn: async () => {
      const response = await communicationApi.getChannels();
      return response.data as CommunicationChannel[];
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};
