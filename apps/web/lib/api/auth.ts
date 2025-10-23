import { apiClient } from './client';
import { 
  LoginCredentials, 
  RegisterCredentials, 
  AuthResponse, 
  User 
} from '../auth/types';
import { AUTH_CONFIG } from '../auth/config';

export const authAPI = {
  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>(
      AUTH_CONFIG.AUTH_ENDPOINTS.LOGIN,
      credentials
    );
  },

  // Register user
  async register(credentials: RegisterCredentials): Promise<{ message: string; user_id: string }> {
    return apiClient.post<{ message: string; user_id: string }>(
      AUTH_CONFIG.AUTH_ENDPOINTS.REGISTER,
      credentials
    );
  },

  // Logout user
  async logout(): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(
      AUTH_CONFIG.AUTH_ENDPOINTS.LOGOUT
    );
  },

  // Get user profile
  async getProfile(): Promise<User> {
    return apiClient.get<User>(AUTH_CONFIG.AUTH_ENDPOINTS.PROFILE);
  },

  // Update user profile
  async updateProfile(userData: Partial<User>): Promise<User> {
    return apiClient.patch<User>(AUTH_CONFIG.AUTH_ENDPOINTS.PROFILE, userData);
  },

  // Verify email
  async verifyEmail(token: string): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(
      AUTH_CONFIG.AUTH_ENDPOINTS.VERIFY_EMAIL,
      { token }
    );
  },

  // Resend verification email
  async resendVerification(email: string): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(
      AUTH_CONFIG.AUTH_ENDPOINTS.RESEND_VERIFICATION,
      { email }
    );
  },

  // Request password reset
  async requestPasswordReset(email: string): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(
      AUTH_CONFIG.AUTH_ENDPOINTS.PASSWORD_RESET,
      { email }
    );
  },

  // Confirm password reset
  async confirmPasswordReset(
    token: string, 
    newPassword: string, 
    newPasswordConfirm: string
  ): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(
      AUTH_CONFIG.AUTH_ENDPOINTS.PASSWORD_RESET_CONFIRM,
      { token, new_password: newPassword, new_password_confirm: newPasswordConfirm }
    );
  },

  // Refresh tokens
  async refreshTokens(refreshToken: string): Promise<{ access: string; refresh?: string }> {
    return apiClient.post<{ access: string; refresh?: string }>(
      AUTH_CONFIG.AUTH_ENDPOINTS.REFRESH_TOKEN,
      { refresh: refreshToken }
    );
  },
};
