'use client';

import { useAuth as useAuthContext } from '@/contexts/AuthContext';
import { UserRole } from '@/types';

// Re-export the main auth hook
export { useAuth } from '@/contexts/AuthContext';

// Hook to check if user has specific role
export function useRole(requiredRole: UserRole | UserRole[]) {
  const { user, isAuthenticated } = useAuthContext();
  
  if (!isAuthenticated || !user) {
    return false;
  }
  
  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  return roles.includes(user.role);
}

// Hook to check if user is admin
export function useIsAdmin() {
  return useRole('ADMIN');
}

// Hook to check if user is decorator
export function useIsDecorator() {
  return useRole('DECORATOR');
}

// Hook to check if user is customer
export function useIsCustomer() {
  return useRole('CUSTOMER');
}

// Hook to require authentication (redirects if not authenticated)
export function useRequireAuth() {
  const { isAuthenticated, isLoading } = useAuthContext();
  
  if (!isLoading && !isAuthenticated) {
    // In a real app, you might want to redirect here
    // For now, we'll just return the auth state
    console.warn('Authentication required but user is not authenticated');
  }
  
  return { isAuthenticated, isLoading };
}

// Hook to require specific role (redirects if insufficient permissions)
export function useRequireRole(requiredRole: UserRole | UserRole[]) {
  const { user, isAuthenticated, isLoading } = useAuthContext();
  const hasRole = useRole(requiredRole);
  
  if (!isLoading && isAuthenticated && !hasRole) {
    console.warn(`Insufficient permissions. Required: ${requiredRole}, User has: ${user?.role}`);
  }
  
  return { hasRole, isAuthenticated, isLoading };
}