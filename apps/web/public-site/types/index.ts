// apps/web/public-site/types/index.ts
export type Priority = 'global' | 'national' | 'regional' | 'branch';

export interface CTA {
  text: string;
  link: string;
  variant: 'primary' | 'secondary';
}

export interface HeroContent {
  priority: Priority;
  title: string;
  description: string;
  image: string;
  cta?: CTA | null;
  liveStream?: {
    isLive: boolean;
    branch: string;
    streamUrl: string;
  } | null;
}

export interface ServiceTime {
  day: string;
  time: string;
}

export interface ContactInfo {
  phone?: string;
  email?: string;
  address?: string;
}

export interface Branch {
  id: string;
  name: string;
  slug: string;
  address?: string;
  serviceTimes?: ServiceTime[];
  pastors?: string[];
  contact?: ContactInfo;
  image?: string;
}

export interface BranchHierarchy {
  country: Array<{
    id: string;
    name: string;
    nationalHQ?: string;
    regions?: Array<{
      id: string;
      name: string;
      regionalHQ?: string;
      branches?: Branch[];
    }>;
  }>;
}

export interface ChurchEvent {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  location?: string;
  eventType: 'service' | 'conference' | 'training' | 'social' | 'outreach';
  scope: 'global' | 'national' | 'regional' | 'branch';
  branches?: string[];
  registration?: {
    required: boolean;
    capacity?: number;
    registered?: number;
  };
  liveStream?: {
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
  description?: string;
  startTime: string;
  endTime?: string;
  streamUrl: string;
  platform: 'youtube' | 'facebook' | 'vimeo' | 'custom';
  status: 'live' | 'upcoming' | 'ended';
  viewers?: number;
  chatEnabled?: boolean;
}

export interface Sermon {
  id: string;
  title: string;
  speaker?: string;
  branch?: string;
  series?: string;
  scripture?: string;
  date: string;
  duration?: number;
  audioUrl?: string;
  videoUrl?: string;
  transcript?: string;
  slides?: string[];
  downloads?: number;
  tags?: string[];
}
