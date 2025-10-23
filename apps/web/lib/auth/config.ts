export const AUTH_CONFIG = {
  // Token storage keys
  ACCESS_TOKEN_KEY: 'thogmi_access_token',
  REFRESH_TOKEN_KEY: 'thogmi_refresh_token',
  USER_DATA_KEY: 'thogmi_user_data',

  // API endpoints
  API_BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
  AUTH_ENDPOINTS: {
    LOGIN: '/auth/login/',
    REGISTER: '/auth/register/',
    LOGOUT: '/auth/logout/',
    PROFILE: '/auth/profile/',
    VERIFY_EMAIL: '/auth/verify-email/',
    RESEND_VERIFICATION: '/auth/resend-verification/',
    PASSWORD_RESET: '/auth/password-reset/',
    PASSWORD_RESET_CONFIRM: '/auth/password-reset-confirm/',
    REFRESH_TOKEN: '/auth/token/refresh/',
  },

  // Token expiration (in minutes)
  ACCESS_TOKEN_EXPIRY: 15, // 15 minutes
  REFRESH_TOKEN_EXPIRY: 7 * 24 * 60, // 7 days

  // Routes
  ROUTES: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    VERIFY_EMAIL: '/auth/verify-email',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    PROFILE: '/profile',
    DASHBOARD: '/dashboard',
    HOME: '/',
  },

  // User type configurations
  USER_TYPES: {
    GUEST: {
      routes: ['/', '/branches', '/events', '/sermons', '/live'],
      permissions: ['read:content', 'submit:guest-form'],
    },
    MEMBER: {
      routes: ['/', '/dashboard', '/profile', '/giving', '/groups'],
      permissions: ['read:content', 'access:member', 'give:online', 'join:groups'],
    },
    STAFF: {
      routes: ['/', '/dashboard', '/admin', '/reports'],
      permissions: ['read:content', 'access:admin', 'manage:content'],
    },
    ADMIN: {
      routes: ['/', '/dashboard', '/admin', '/settings'],
      permissions: ['read:content', 'access:admin', 'manage:users', 'manage:system'],
    },
  },
} as const;
