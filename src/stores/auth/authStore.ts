import { signal, computed } from '@preact/signals';
import { User } from '../../services/auth-sqlite';

// Auth state signals
export const user = signal<User | null>(null);
export const isLoading = signal(false);
export const error = signal<string | null>(null);

// Computed values
export const isAuthenticated = computed(() => !!user.value);
export const isAdmin = computed(() => user.value?.role === 'admin');
export const isManager = computed(() => user.value?.role === 'manager');
export const isUser = computed(() => user.value?.role === 'user');