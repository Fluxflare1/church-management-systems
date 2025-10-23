export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  username: string;
}

export interface Branch {
  id: number;
  name: string;
  code: string;
  address: string;
}

export interface Family {
  id: number;
  family_id: string;
  family_name: string;
  primary_contact?: Member;
  primary_contact_name?: string;
  address: string;
  member_count: number;
  created_at: string;
  updated_at: string;
}

export interface Member {
  id: number;
  member_id: string;
  user: User;
  branch: Branch;
  marital_status: string;
  occupation: string;
  education_level: string;
  skills: string[];
  date_of_birth?: string;
  age?: number;
  salvation_date?: string;
  baptism_date?: string;
  membership_date: string;
  spiritual_gifts: string[];
  family?: Family;
  family_role: string;
  welfare_category: string;
  special_needs: string[];
  welfare_notes: string;
  relationship_manager?: User;
  membership_status: string;
  is_active_member: boolean;
  welfare_cases_count: number;
  active_ministries_count: number;
  engagement?: MemberEngagement;
  created_at: string;
  updated_at: string;
}

export interface MemberEngagement {
  attendance_streak: number;
  monthly_attendance_rate: number;
  last_attendance_date?: string;
  ministry_involvement: Record<string, any>;
  event_participation: Record<string, any>;
  last_communication?: string;
  communication_response_rate: number;
  giving_consistency: number;
  engagement_score: number;
  engagement_tier: string;
  updated_at: string;
}

export interface WelfareCase {
  id: number;
  member: Member;
  member_name: string;
  case_type: string;
  title: string;
  description: string;
  urgency: string;
  assigned_officer?: User;
  assigned_officer_name?: string;
  status: string;
  resolution_notes: string;
  reported_date: string;
  last_updated: string;
  target_resolution_date?: string;
  resolved_date?: string;
  is_overdue: boolean;
  days_open: number;
  updates: WelfareUpdate[];
}

export interface WelfareUpdate {
  id: number;
  officer: User;
  officer_name: string;
  update_notes: string;
  action_taken: string;
  next_steps: string;
  created_at: string;
}

export interface MinistryParticipation {
  id: number;
  member: Member;
  member_name: string;
  ministry: any; // Ministry type from groups module
  ministry_details?: any;
  role: string;
  start_date: string;
  end_date?: string;
  is_active: boolean;
  notes: string;
}

export interface CreateMemberData {
  user_id: number;
  branch_id: number;
  member_id?: string;
  marital_status?: string;
  occupation?: string;
  education_level?: string;
  skills?: string[];
  date_of_birth?: string;
  salvation_date?: string;
  baptism_date?: string;
  membership_date?: string;
  spiritual_gifts?: string[];
  welfare_category?: string;
  special_needs?: string[];
}

export interface CreateWelfareCaseData {
  member: number;
  case_type: string;
  title: string;
  description: string;
  urgency: string;
  target_resolution_date?: string;
}

// Filter types
export interface MemberFilters {
  membership_status?: string[];
  welfare_category?: string[];
  branch?: number;
  relationship_manager?: number;
  has_welfare_cases?: boolean;
  engagement_tier?: string;
  join_date_after?: string;
  join_date_before?: string;
  age_min?: number;
  age_max?: number;
  search?: string;
}

export interface WelfareCaseFilters {
  status?: string[];
  case_type?: string[];
  urgency?: string[];
  member?: number;
  branch?: number;
  assigned_officer?: number;
  reported_after?: string;
  reported_before?: string;
  target_date_after?: string;
  target_date_before?: string;
  is_overdue?: boolean;
  search?: string;
}
