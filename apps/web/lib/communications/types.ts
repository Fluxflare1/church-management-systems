// Base communication types
export interface CommunicationChannel {
  id: number;
  name: string;
  channel_type: 'email' | 'sms' | 'whatsapp' | 'push' | 'in_app' | 'announcement';
  is_active: boolean;
  created_at: string;
}

export interface MessageTemplate {
  id: number;
  name: string;
  template_type: 'welcome' | 'follow_up' | 'event' | 'giving' | 'welfare' | 'system';
  subject: string;
  content: string;
  variables: string[];
  channel: CommunicationChannel;
  channel_name: string;
  created_by_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MessageCampaign {
  id: number;
  name: string;
  description: string;
  template: MessageTemplate;
  template_name: string;
  audience_filter: Record<string, any>;
  schedule_type: 'immediate' | 'scheduled' | 'recurring';
  scheduled_for?: string;
  status: 'draft' | 'scheduled' | 'processing' | 'sent' | 'cancelled';
  created_by_name: string;
  audience_count: number;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: number;
  campaign?: MessageCampaign;
  template: MessageTemplate;
  channel: CommunicationChannel;
  channel_name: string;
  message_type: 'outbound' | 'inbound' | 'announcement';
  from_user: number;
  from_user_name: string;
  to_user?: number;
  to_user_name: string;
  to_group?: number;
  subject: string;
  content: string;
  variables_used: Record<string, any>;
  status: 'queued' | 'sent' | 'delivered' | 'read' | 'failed';
  sent_at?: string;
  delivered_at?: string;
  read_at?: string;
  open_count: number;
  click_count: number;
  error_message: string;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: number;
  subject: string;
  participant_count: number;
  last_message_preview: string;
  last_message_at: string;
  created_at: string;
}

export interface ConversationMessage {
  id: number;
  conversation: number;
  sender: number;
  sender_name: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface UserCommunicationPreference {
  id: number;
  user: number;
  channel: CommunicationChannel;
  channel_name: string;
  channel_type: string;
  is_enabled: boolean;
  opt_in_date: string;
}

export interface CommunicationPreferences {
  user_id: number;
  preferences: Record<string, {
    channel_id: number;
    channel_name: string;
    is_enabled: boolean;
    opt_in_date: string | null;
  }>;
  global_opt_out: boolean;
}

// API Request types
export interface CreateTemplateRequest {
  name: string;
  template_type: MessageTemplate['template_type'];
  subject: string;
  content: string;
  channel: number;
}

export interface CreateCampaignRequest {
  name: string;
  description?: string;
  template: number;
  audience_filter: Record<string, any>;
  schedule_type: 'immediate' | 'scheduled' | 'recurring';
  scheduled_for?: string;
}

export interface SendMessageRequest {
  template_id: number;
  audience_filters: Record<string, any>;
  schedule_type: 'immediate' | 'scheduled';
  scheduled_for?: string;
}

export interface UpdatePreferencesRequest {
  preferences: Record<string, { is_enabled: boolean }>;
  global_opt_out?: boolean;
}

// Analytics types
export interface CampaignPerformance {
  campaign_id: number;
  campaign_name: string;
  overview: {
    total_messages: number;
    sent: number;
    delivered: number;
    read: number;
    failed: number;
  };
  rates: {
    delivery_rate: number;
    read_rate: number;
    open_rate: number;
    click_rate: number;
  };
  engagement: {
    total_opens: number;
    total_clicks: number;
    time_to_first_open: string;
    peak_engagement_time: string;
  };
  audience_breakdown: Record<string, any>;
}

export interface ChannelPerformance {
  period: string;
  channels: Array<{
    channel_id: number;
    channel_name: string;
    channel_type: string;
    metrics: {
      total_messages: number;
      successful: number;
      failed: number;
      success_rate: number;
    };
    cost: {
      cost_per_message: number;
      total_cost: number;
    };
  }>;
  summary: {
    total_messages: number;
    total_cost: number;
    average_cost_per_message: number;
    most_effective_channel: any;
  };
}

// WebSocket types
export interface WebSocketMessage {
  type: 'chat_message' | 'typing_indicator' | 'read_receipt' | 'conversation_history';
  message?: any;
  user?: any;
  is_typing?: boolean;
  message_id?: number;
  messages?: any[];
}
