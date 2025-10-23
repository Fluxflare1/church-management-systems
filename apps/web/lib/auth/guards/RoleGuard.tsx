'use client';

import { usePermissions } from '../hooks/usePermissions';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
  fallback?: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  allowedRoles,
  fallback = null,
}) => {
  const { userType } = usePermissions();

  if (!userType || !allowedRoles.includes(userType)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
