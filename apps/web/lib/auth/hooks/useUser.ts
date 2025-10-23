'use client';

import { useAuth } from './useAuth';

export const useUser = () => {
  const { user, updateUser } = useAuth();

  return {
    user,
    updateUser,
    isGuest: user?.user_type === 'guest',
    isMember: user?.user_type === 'member',
    isStaff: user?.user_type === 'staff',
    isAdmin: user?.user_type === 'admin',
    isVerified: user?.is_verified,
  };
};
