import { signal, computed, effect } from '@preact/signals';
import { User } from '../services/auth';

// Auth state signals
export const user = signal<User | null>(null);
export const isLoading = signal(true);
export const error = signal<string | null>(null);

// Computed values
export const isAuthenticated = computed(() => !!user.value);
export const isAdmin = computed(() => user.value?.role === 'admin');
export const isManager = computed(() => user.value?.role === 'manager' || user.value?.role === 'admin');

// Token management
const TOKEN_KEY = 'pos_token';
const USER_KEY = 'pos_user';

export const token = signal<string | null>(
  typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null
);

// Persist token and user changes to localStorage
effect(() => {
  if (typeof window !== 'undefined') {
    if (token.value && user.value) {
      localStorage.setItem(TOKEN_KEY, token.value);
      localStorage.setItem(USER_KEY, JSON.stringify(user.value));
    } else {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  }
});

// Initialize user from localStorage on app start
if (typeof window !== 'undefined') {
  const storedUser = localStorage.getItem(USER_KEY);
  const storedToken = localStorage.getItem(TOKEN_KEY);
  
  if (storedUser && storedToken) {
    try {
      const parsedUser = JSON.parse(storedUser);
      // Validate the stored user has required fields
      if (parsedUser && parsedUser.id && parsedUser.email) {
        user.value = parsedUser;
        token.value = storedToken;
      } else {
        // Clear invalid stored data
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(TOKEN_KEY);
      }
    } catch (e) {
      // Clear invalid stored data
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(TOKEN_KEY);
    }
  }
}