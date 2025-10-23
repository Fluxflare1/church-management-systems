import { apiClient } from '@/lib/api-client';

// Type definitions for API responses
export interface Branch {
  id: string;
  name: string;
  slug: string;
  address: string;
  phone: string;
  email: string;
  service_times: ServiceTime[];
  pastors: Pastor[];
  location: {
    latitude: number;
    longitude: number;
  };
}

export interface ServiceTime {
  day: string;
  time: string;
  type: string;
  language: string;
}

export interface Pastor {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
}

export interface GuestFormData {
  personal: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    location: string;
  };
  visit: {
    branch: string;
    serviceDate: string;
    howHeard: string;
    firstTime: boolean;
  };
  interests: {
    salvation: boolean;
    baptism: boolean;
    membership: boolean;
    volunteering: boolean;
    prayer: boolean;
  };
  prayerRequest?: string;
}

export interface Sermon {
  id: string;
  title: string;
  speaker: string;
  branch: string;
  series: string;
  scripture: string;
  date: string;
  duration: number;
  audio_url: string;
  video_url: string;
  transcript?: string;
  downloads: number;
  tags: string[];
}

export interface ChurchEvent {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  location: string;
  event_type: 'service' | 'conference' | 'training' | 'social' | 'outreach';
  scope: 'global' | 'national' | 'regional' | 'branch';
  branches: string[];
  registration: {
    required: boolean;
    capacity?: number;
    registered: number;
  };
  live_stream: {
    available: boolean;
    url?: string;
  };
}

export interface LiveStream {
  id: string;
  branch: {
    id: string;
    name: string;
    slug: string;
  };
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  stream_url: string;
  platform: 'youtube' | 'facebook' | 'vimeo' | 'custom';
  status: 'live' | 'upcoming' | 'ended';
  viewers: number;
}

// API Service Classes
class BranchService {
  async getAllBranches(): Promise<Branch[]> {
    return apiClient.get<Branch[]>('/branches/');
  }

  async getBranch(slug: string): Promise<Branch> {
    return apiClient.get<Branch>(`/branches/${slug}/`);
  }

  async getBranchHierarchy() {
    return apiClient.get('/branches/hierarchy/');
  }

  async searchBranches(query: string, filters?: any): Promise<Branch[]> {
    return apiClient.get<Branch[]>('/branches/search/', { query, ...filters });
  }
}

class GuestService {
  async submitConnectCard(data: GuestFormData): Promise<{ success: boolean; guest_id: string }> {
    return apiClient.post<{ success: boolean; guest_id: string }>('/guests/connect-card/', data);
  }

  async getGuestStatus(guestId: string) {
    return apiClient.get(`/guests/${guestId}/status/`);
  }
}

class SermonService {
  async getAllSermons(filters?: any): Promise<Sermon[]> {
    return apiClient.get<Sermon[]>('/sermons/', filters);
  }

  async getSermon(sermonId: string): Promise<Sermon> {
    return apiClient.get<Sermon>(`/sermons/${sermonId}/`);
  }

  async getSermonSeries(): Promise<string[]> {
    return apiClient.get<string[]>('/sermons/series/');
  }

  async recordDownload(sermonId: string): Promise<void> {
    return apiClient.post(`/sermons/${sermonId}/download/`);
  }
}

class EventService {
  async getAllEvents(filters?: any): Promise<ChurchEvent[]> {
    return apiClient.get<ChurchEvent[]>('/events/', filters);
  }

  async getEvent(eventId: string): Promise<ChurchEvent> {
    return apiClient.get<ChurchEvent>(`/events/${eventId}/`);
  }

  async registerForEvent(eventId: string, data: any): Promise<{ success: boolean }> {
    return apiClient.post<{ success: boolean }>(`/events/${eventId}/register/`, data);
  }
}

class LiveStreamService {
  async getLiveStreams(): Promise<LiveStream[]> {
    return apiClient.get<LiveStream[]>('/streams/live/');
  }

  async getUpcomingStreams(): Promise<LiveStream[]> {
    return apiClient.get<LiveStream[]>('/streams/upcoming/');
  }

  async getStreamChat(streamId: string) {
    return apiClient.get(`/streams/${streamId}/chat/`);
  }
}

class GivingService {
  async initiateDonation(data: any): Promise<{ checkout_url: string }> {
    return apiClient.post<{ checkout_url: string }>('/donations/initiate/', data);
  }

  async getDonationHistory() {
    return apiClient.get('/donations/history/');
  }
}

// Export service instances
export const branchService = new BranchService();
export const guestService = new GuestService();
export const sermonService = new SermonService();
export const eventService = new EventService();
export const liveStreamService = new LiveStreamService();
export const givingService = new GivingService();
