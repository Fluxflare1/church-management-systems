import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  branchService,
  guestService,
  sermonService,
  eventService,
  liveStreamService,
  givingService,
  type GuestFormData,
  type Branch,
  type Sermon,
  type ChurchEvent,
  type LiveStream,
} from '@/services/api-services';

// Branch queries
export const useBranches = () => {
  return useQuery({
    queryKey: ['branches'],
    queryFn: () => branchService.getAllBranches(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useBranch = (slug: string) => {
  return useQuery({
    queryKey: ['branches', slug],
    queryFn: () => branchService.getBranch(slug),
    enabled: !!slug,
  });
};

export const useBranchHierarchy = () => {
  return useQuery({
    queryKey: ['branches', 'hierarchy'],
    queryFn: () => branchService.getBranchHierarchy(),
  });
};

// Guest mutations
export const useSubmitGuestForm = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: GuestFormData) => guestService.submitConnectCard(data),
    onSuccess: () => {
      // Invalidate relevant queries after successful form submission
      queryClient.invalidateQueries({ queryKey: ['guests'] });
    },
  });
};

// Sermon queries
export const useSermons = (filters?: any) => {
  return useQuery({
    queryKey: ['sermons', filters],
    queryFn: () => sermonService.getAllSermons(filters),
  });
};

export const useSermon = (sermonId: string) => {
  return useQuery({
    queryKey: ['sermons', sermonId],
    queryFn: () => sermonService.getSermon(sermonId),
    enabled: !!sermonId,
  });
};

export const useSermonSeries = () => {
  return useQuery({
    queryKey: ['sermons', 'series'],
    queryFn: () => sermonService.getSermonSeries(),
  });
};

// Event queries
export const useEvents = (filters?: any) => {
  return useQuery({
    queryKey: ['events', filters],
    queryFn: () => eventService.getAllEvents(filters),
  });
};

export const useEvent = (eventId: string) => {
  return useQuery({
    queryKey: ['events', eventId],
    queryFn: () => eventService.getEvent(eventId),
    enabled: !!eventId,
  });
};

export const useEventRegistration = () => {
  return useMutation({
    mutationFn: ({ eventId, data }: { eventId: string; data: any }) =>
      eventService.registerForEvent(eventId, data),
  });
};

// Live stream queries
export const useLiveStreams = () => {
  return useQuery({
    queryKey: ['streams', 'live'],
    queryFn: () => liveStreamService.getLiveStreams(),
    refetchInterval: 30000, // Refetch every 30 seconds for live data
  });
};

export const useUpcomingStreams = () => {
  return useQuery({
    queryKey: ['streams', 'upcoming'],
    queryFn: () => liveStreamService.getUpcomingStreams(),
  });
};

// Giving mutations
export const useInitiateDonation = () => {
  return useMutation({
    mutationFn: (data: any) => givingService.initiateDonation(data),
  });
};
