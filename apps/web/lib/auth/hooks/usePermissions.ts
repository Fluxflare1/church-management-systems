'use client';

import { useUser } from './useUser';
import { AUTH_CONFIG } from '../config';

export const usePermissions = () => {
  const { user } = useUser();

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;

    const userConfig = AUTH_CONFIG.USER_TYPES[user.user_type.toUpperCase() as keyof typeof AUTH_CONFIG.USER_TYPES];
    return userConfig?.permissions.includes(permission) || false;
  };

  const canAccessRoute = (route: string): boolean => {
    if (!user) return false;

    const userConfig = AUTH_CONFIG.USER_TYPES[user.user_type.toUpperCase() as keyof typeof AUTH_CONFIG.USER_TYPES];
    return userConfig?.routes.some(allowedRoute => 
      route.startsWith(allowedRoute)
    ) || false;
  };

  return {
    hasPermission,
    canAccessRoute,
    userType: user?.user_type,
  };
};
