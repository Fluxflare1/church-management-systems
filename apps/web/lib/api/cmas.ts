import { GuestFormData } from '@/types';

export interface CMASGuestProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  branch: string;
  source: 'website' | 'event' | 'referral' | 'walk-in';
  status: 'new' | 'contacted' | 'nurturing' | 'converted' | 'inactive';
  acquisitionStage: 'awareness' | 'consideration' | 'conversion' | 'discipleship';
  engagementScore: number;
  lastContact: string;
  nextAction: string;
  tags: string[];
}

export interface CMASWorkflow {
  id: string;
  name: string;
  description: string;
  triggers: string[];
  actions: CMASAction[];
  conditions: CMASCondition[];
  isActive: boolean;
}

export interface CMASAction {
  type: 'email' | 'sms' | 'task' | 'tag' | 'stage_change';
  config: Record<string, any>;
  delay?: number; // minutes
}

export interface CMASCondition {
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than';
  value: any;
}

export interface CMASAnalytics {
  totalGuests: number;
  newThisWeek: number;
  conversionRate: number;
  averageEngagement: number;
  topSources: Array<{ source: string; count: number }>;
  stageBreakdown: Array<{ stage: string; count: number }>;
}

// Submit guest to CMAS and trigger acquisition workflow
export async function submitGuestToCMAS(
  guestData: GuestFormData
): Promise<{ 
  success: boolean; 
  guestId: string; 
  workflowId: string;
  nextSteps: string[];
}> {
  const response = await fetch('/api/v1/cmas/guests', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...guestData,
      source: 'website',
      acquisition_channel: 'digital_connect_card',
      timestamp: new Date().toISOString(),
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to submit guest to acquisition system');
  }

  return response.json();
}

// Get guest acquisition status and next steps
export async function getGuestAcquisitionStatus(guestId: string): Promise<{
  guest: CMASGuestProfile;
  currentWorkflow: string;
  nextActions: CMASAction[];
  engagementTimeline: Array<{
    date: string;
    action: string;
    channel: string;
    outcome?: string;
  }>;
}> {
  const response = await fetch(`/api/v1/cmas/guests/${guestId}/status`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch guest acquisition status');
  }

  return response.json();
}

// Trigger specific acquisition workflow
export async function triggerAcquisitionWorkflow(
  workflowId: string,
  guestId: string,
  metadata?: Record<string, any>
): Promise<{ success: boolean; executionId: string }> {
  const response = await fetch('/api/v1/cmas/workflows/trigger', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      workflow_id: workflowId,
      guest_id: guestId,
      metadata,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to trigger acquisition workflow');
  }

  return response.json();
}

// Get CMAS analytics for dashboard
export async function getCMASAnalytics(
  timeframe: '7d' | '30d' | '90d' | '1y' = '30d',
  branch?: string
): Promise<CMASAnalytics> {
  const params = new URLSearchParams({
    timeframe,
    ...(branch && { branch }),
  });

  const response = await fetch(`/api/v1/cmas/analytics?${params}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch CMAS analytics');
  }

  return response.json();
}

// Get available acquisition workflows
export async function getAcquisitionWorkflows(): Promise<CMASWorkflow[]> {
  const response = await fetch('/api/v1/cmas/workflows');
  
  if (!response.ok) {
    throw new Error('Failed to fetch acquisition workflows');
  }

  return response.json();
}

// Update guest acquisition stage
export async function updateGuestAcquisitionStage(
  guestId: string,
  stage: string,
  notes?: string
): Promise<{ success: boolean }> {
  const response = await fetch(`/api/v1/cmas/guests/${guestId}/stage`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      stage,
      notes,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to update guest acquisition stage');
  }

  return response.json();
}
