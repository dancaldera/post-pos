import { user, isLoading, error, token } from './authStore';
import { authService, User } from '../../services/auth';

export const authActions = {
  // Login action
  async signIn(email: string, password: string) {
    isLoading.value = true;
    error.value = null;
    
    try {
      const result = await authService.signIn(email, password);
      
      if (result.success && result.user) {
        user.value = result.user;
        token.value = 'mock-token-' + result.user.id; // Mock token for now
        error.value = null;
        return result;
      } else {
        error.value = result.error || 'Sign in failed';
        user.value = null;
        token.value = null;
        return result;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sign in failed';
      error.value = errorMessage;
      user.value = null;
      token.value = null;
      throw err;
    } finally {
      isLoading.value = false;
    }
  },

  // Logout action
  signOut() {
    user.value = null;
    token.value = null;
    error.value = null;
    authService.signOut();
  },

  // Initialize auth state
  async initializeAuth() {
    isLoading.value = true;
    
    try {
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        user.value = currentUser;
        // Token should already be set from localStorage via the store
      } else {
        user.value = null;
        token.value = null;
      }
      error.value = null;
    } catch (err) {
      user.value = null;
      token.value = null;
      error.value = err instanceof Error ? err.message : 'Auth initialization failed';
    } finally {
      isLoading.value = false;
    }
  },

  // Clear error
  clearError() {
    error.value = null;
  },

  // Check permissions
  hasPermission(permission: string): boolean {
    return authService.hasPermission(permission);
  },

  // Check role
  hasRole(role: User["role"]): boolean {
    return authService.hasRole(role);
  },
};