export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  user_type: 'guest' | 'member' | 'staff' | 'admin';
  phone_number?: string;
  profile_picture?: string;
  branch?: string;
  branch_name?: string;
  is_verified: boolean;
  profile?: UserProfile;
  created_at: string;
}

export interface UserProfile {
  id: string;
  marital_status?: string;
  occupation?: string;
  address?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  date_saved?: string;
  date_baptized?: string;
  spiritual_gifts: string[];
  communication_preferences: Record<string, boolean>;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  user_type?: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  user_type: 'guest' | 'member';
  branch_slug?: string;
}

export interface AuthResponse {
  message: string;
  tokens: AuthTokens;
  user: User;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  refreshTokens: () => Promise<boolean>;
  updateUser: (userData: Partial<User>) => void;
  clearError: () => void;
}
