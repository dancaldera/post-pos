import { authService, type User } from '../../services/auth-sqlite'
import { error, isLoading, user } from './authStore'

export const authActions = {
  // Login action
  async signIn(email: string, password: string) {
    isLoading.value = true
    error.value = null

    try {
      const result = await authService.signIn(email, password)

      if (result.success && result.user) {
        user.value = result.user
        error.value = null
        return result
      } else {
        error.value = result.error || 'Sign in failed'
        user.value = null
        return result
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sign in failed'
      error.value = errorMessage
      user.value = null
      throw err
    } finally {
      isLoading.value = false
    }
  },

  // Logout action
  signOut() {
    user.value = null
    error.value = null
    authService.signOut()
  },

  // Initialize auth state
  async initializeAuth() {
    isLoading.value = true

    try {
      const currentUser = authService.getCurrentUser()
      user.value = currentUser
      error.value = null
    } catch (err) {
      user.value = null
      error.value = err instanceof Error ? err.message : 'Auth initialization failed'
    } finally {
      isLoading.value = false
    }
  },

  // Clear error
  clearError() {
    error.value = null
  },

  // Check permissions - use store user directly
  hasPermission(permission: string): boolean {
    const currentUser = user.value
    if (!currentUser) return false

    // Admin has all permissions
    if (currentUser.permissions.includes('*')) return true

    return currentUser.permissions.includes(permission)
  },

  // Check role - use store user directly
  hasRole(role: User['role']): boolean {
    return user.value?.role === role
  },
}
