import axios, { AxiosInstance, AxiosResponse } from 'axios';

class CommunicationApiClient {
  private client: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    this.client = axios.create({
      baseURL: `${this.baseURL}/communications/api`,
      timeout: 30000,
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized access
          window.location.href = '/auth/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Templates API
  async getTemplates(params?: any): Promise<AxiosResponse> {
    return this.client.get('/templates/', { params });
  }

  async getTemplate(id: number): Promise<AxiosResponse> {
    return this.client.get(`/templates/${id}/`);
  }

  async createTemplate(data: any): Promise<AxiosResponse> {
    return this.client.post('/templates/', data);
  }

  async updateTemplate(id: number, data: any): Promise<AxiosResponse> {
    return this.client.patch(`/templates/${id}/`, data);
  }

  async deleteTemplate(id: number): Promise<AxiosResponse> {
    return this.client.delete(`/templates/${id}/`);
  }

  // Campaigns API
  async getCampaigns(params?: any): Promise<AxiosResponse> {
    return this.client.get('/campaigns/', { params });
  }

  async getCampaign(id: number): Promise<AxiosResponse> {
    return this.client.get(`/campaigns/${id}/`);
  }

  async createCampaign(data: any): Promise<AxiosResponse> {
    return this.client.post('/campaigns/', data);
  }

  async updateCampaign(id: number, data: any): Promise<AxiosResponse> {
    return this.client.patch(`/campaigns/${id}/`, data);
  }

  async sendCampaign(id: number, sendNow: boolean = false): Promise<AxiosResponse> {
    return this.client.post(`/campaigns/${id}/send/`, { send_now: sendNow });
  }

  // Messages API
  async getMessages(params?: any): Promise<AxiosResponse> {
    return this.client.get('/messages/', { params });
  }

  async getMessage(id: number): Promise<AxiosResponse> {
    return this.client.get(`/messages/${id}/`);
  }

  // Quick Send API
  async sendMessage(data: any): Promise<AxiosResponse> {
    return this.client.post('/send-message/', data);
  }

  // Conversations API
  async getConversations(params?: any): Promise<AxiosResponse> {
    return this.client.get('/conversations/', { params });
  }

  async getConversation(id: number): Promise<AxiosResponse> {
    return this.client.get(`/conversations/${id}/`);
  }

  async getConversationMessages(conversationId: number): Promise<AxiosResponse> {
    return this.client.get(`/conversations/${conversationId}/messages/`);
  }

  async sendConversationMessage(conversationId: number, content: string): Promise<AxiosResponse> {
    return this.client.post(`/conversations/${conversationId}/send_message/`, { content });
  }

  // Preferences API
  async getPreferences(): Promise<AxiosResponse> {
    return this.client.get('/preferences/');
  }

  async updatePreferences(data: any): Promise<AxiosResponse> {
    return this.client.post('/preferences/', data);
  }

  // Channels API
  async getChannels(): Promise<AxiosResponse> {
    return this.client.get('/channels/');
  }

  // Analytics API
  async getCampaignPerformance(campaignId: number): Promise<AxiosResponse> {
    return this.client.get(`/analytics/campaign_performance/?campaign_id=${campaignId}`);
  }

  async getChannelPerformance(days: number = 30): Promise<AxiosResponse> {
    return this.client.get(`/analytics/channel_performance/?days=${days}`);
  }

  async getEngagementTrends(days: number = 90): Promise<AxiosResponse> {
    return this.client.get(`/analytics/engagement_trends/?days=${days}`);
  }

  async getAudienceInsights(filters?: any): Promise<AxiosResponse> {
    return this.client.post('/analytics/audience_insights/', { filters });
  }

  // Advanced Audience API
  async createSmartSegment(rules: any): Promise<AxiosResponse> {
    return this.client.post('/advanced/audience/smart_segment/', { rules });
  }

  async getSegmentAnalytics(filters: any): Promise<AxiosResponse> {
    return this.client.post('/advanced/audience/segment_analytics/', { filters });
  }
}

// Singleton instance
export const communicationApi = new CommunicationApiClient();
