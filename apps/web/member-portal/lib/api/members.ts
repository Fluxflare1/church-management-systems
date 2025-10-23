import { apiClient } from '@/lib/api-client';
import { 
  Member, 
  WelfareCase, 
  Family, 
  MinistryParticipation,
  MemberEngagement,
  CreateMemberData,
  CreateWelfareCaseData 
} from '../types/member-types';

export const memberApi = {
  // Member Management
  getMembers: async (params?: any): Promise<{ results: Member[]; count: number }> => {
    const response = await apiClient.get('/members/members/', { params });
    return response.data;
  },

  getMember: async (id: string): Promise<Member> => {
    const response = await apiClient.get(`/members/members/${id}/`);
    return response.data;
  },

  createMember: async (data: CreateMemberData): Promise<Member> => {
    const response = await apiClient.post('/members/members/', data);
    return response.data;
  },

  updateMember: async (id: string, data: Partial<Member>): Promise<Member> => {
    const response = await apiClient.patch(`/members/members/${id}/`, data);
    return response.data;
  },

  updateWelfareStatus: async (id: string, data: { 
    welfare_category: string; 
    welfare_notes: string; 
    special_needs: string[]; 
  }): Promise<Member> => {
    const response = await apiClient.post(`/members/members/${id}/update_welfare_status/`, data);
    return response.data;
  },

  assignRelationshipManager: async (id: string, managerId: number): Promise<Member> => {
    const response = await apiClient.post(`/members/members/${id}/assign_relationship_manager/`, {
      relationship_manager_id: managerId
    });
    return response.data;
  },

  // Welfare Cases
  getWelfareCases: async (params?: any): Promise<{ results: WelfareCase[]; count: number }> => {
    const response = await apiClient.get('/members/welfare-cases/', { params });
    return response.data;
  },

  getWelfareCase: async (id: string): Promise<WelfareCase> => {
    const response = await apiClient.get(`/members/welfare-cases/${id}/`);
    return response.data;
  },

  createWelfareCase: async (data: CreateWelfareCaseData): Promise<WelfareCase> => {
    const response = await apiClient.post('/members/welfare-cases/', data);
    return response.data;
  },

  updateWelfareCaseStatus: async (id: string, data: {
    status: string;
    resolution_notes?: string;
    update_notes?: string;
    action_taken?: string;
    next_steps?: string;
  }): Promise<WelfareCase> => {
    const response = await apiClient.post(`/members/welfare-cases/${id}/update_status/`, data);
    return response.data;
  },

  assignWelfareOfficer: async (caseId: string, officerId: number): Promise<WelfareCase> => {
    const response = await apiClient.post(`/members/welfare-cases/${caseId}/assign_officer/`, {
      officer_id: officerId
    });
    return response.data;
  },

  addWelfareUpdate: async (caseId: string, data: {
    update_notes: string;
    action_taken?: string;
    next_steps?: string;
  }): Promise<any> => {
    const response = await apiClient.post(`/members/welfare-cases/${caseId}/add_update/`, data);
    return response.data;
  },

  // Reports and Analytics
  getEngagementReport: async (): Promise<any> => {
    const response = await apiClient.get('/members/members/engagement_report/');
    return response.data;
  },

  getWelfareDashboardStats: async (): Promise<any> => {
    const response = await apiClient.get('/members/welfare-cases/dashboard_stats/');
    return response.data;
  },

  getInactiveMembers: async (): Promise<Member[]> => {
    const response = await apiClient.get('/members/members/inactive_members/');
    return response.data;
  },

  getUrgentWelfareCases: async (): Promise<WelfareCase[]> => {
    const response = await apiClient.get('/members/welfare-cases/urgent_cases/');
    return response.data;
  },

  // Ministry Participation
  getMinistryParticipation: async (memberId: string): Promise<MinistryParticipation[]> => {
    const response = await apiClient.get(`/members/members/${memberId}/ministry_participation/`);
    return response.data;
  },

  addMinistryParticipation: async (memberId: string, data: {
    ministry_id: string;
    role: string;
    notes?: string;
  }): Promise<MinistryParticipation> => {
    const response = await apiClient.post(`/members/members/${memberId}/add_ministry_participation/`, data);
    return response.data;
  },

  // Families
  getFamilies: async (params?: any): Promise<Family[]> => {
    const response = await apiClient.get('/members/families/', { params });
    return response.data;
  },

  getFamilyMembers: async (familyId: string): Promise<Member[]> => {
    const response = await apiClient.get(`/members/families/${familyId}/members/`);
    return response.data;
  },
};

// Integration with CMAS and Guest Management
export const integrationApi = {
  // Convert guest to member (CMAS integration)
  convertGuestToMember: async (guestId: string, memberData?: any): Promise<Member> => {
    const response = await apiClient.post('/cmas/conversion/convert-to-member/', {
      guest_id: guestId,
      member_data: memberData
    });
    return response.data;
  },

  // Get guest history for member
  getMemberGuestHistory: async (memberId: string): Promise<any> => {
    const response = await apiClient.get(`/guests/guests/member-history/${memberId}/`);
    return response.data;
  },

  // Update CMAS with member engagement data
  updateCmasEngagement: async (memberId: string, engagementData: any): Promise<void> => {
    await apiClient.post('/cmas/engagement/update-member-engagement/', {
      member_id: memberId,
      engagement_data: engagementData
    });
  },
};
