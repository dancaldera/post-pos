// Mock user database
export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'manager' | 'user'
  permissions: string[]
  createdAt: string
  lastLogin?: string
}

// Default permissions for each role
export const DEFAULT_PERMISSIONS = {
  admin: ['*'],
  manager: [
    'sales.view',
    'sales.create',
    'sales.edit',
    'products.view',
    'products.create',
    'products.edit',
    'products.delete',
    'inventory.view',
    'inventory.edit',
    'customers.view',
    'customers.create',
    'customers.edit',
    'reports.view',
    'reports.export',
    'users.view',
    'users.create',
    'users.edit',
    'users.delete',
  ],
  user: ['sales.view', 'sales.create', 'products.view', 'customers.view', 'customers.create'],
} as const

// Mock users data - permissions are derived from role
const mockUsers: (User & { password: string })[] = [
  {
    id: '1',
    email: 'admin@postpos.com',
    password: 'admin123',
    name: 'Admin User',
    role: 'admin',
    permissions: [...DEFAULT_PERMISSIONS.admin],
    createdAt: '2024-01-01T00:00:00.000Z',
    lastLogin: '2025-01-24T10:30:00.000Z',
  },
  {
    id: '2',
    email: 'manager@postpos.com',
    password: 'manager123',
    name: 'Store Manager',
    role: 'manager',
    permissions: [...DEFAULT_PERMISSIONS.manager],
    createdAt: '2024-01-15T00:00:00.000Z',
    lastLogin: '2025-01-23T14:45:00.000Z',
  },
  {
    id: '3',
    email: 'user@postpos.com',
    password: 'user123',
    name: 'John Cashier',
    role: 'user',
    permissions: [...DEFAULT_PERMISSIONS.user],
    createdAt: '2024-02-01T00:00:00.000Z',
    lastLogin: '2025-01-24T09:00:00.000Z',
  },
]

// Authentication service
export class AuthService {
  private static instance: AuthService
  private currentUser: User | null = null

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  // Sign in method
  async signIn(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const user = mockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase())

    if (!user) {
      return {
        success: false,
        error: 'No account found with this email address',
      }
    }

    if (user.password !== password) {
      return {
        success: false,
        error: 'Incorrect password. Please try again.',
      }
    }

    // Remove password from user object
    const { password: _, ...userWithoutPassword } = user

    // Update last login
    user.lastLogin = new Date().toISOString()

    // Set current user
    this.currentUser = userWithoutPassword

    // Store in localStorage for persistence
    localStorage.setItem('pos_user', JSON.stringify(userWithoutPassword))
    localStorage.setItem('pos_token', this.generateToken(userWithoutPassword))

    return {
      success: true,
      user: userWithoutPassword,
    }
  }

  // Sign out method
  signOut(): void {
    this.currentUser = null
    localStorage.removeItem('pos_user')
    localStorage.removeItem('pos_token')
  }

  // Get current user
  getCurrentUser(): User | null {
    if (this.currentUser) {
      return this.currentUser
    }

    // Try to restore from localStorage
    const storedUser = localStorage.getItem('pos_user')
    const storedToken = localStorage.getItem('pos_token')

    if (storedUser && storedToken && this.isValidToken(storedToken)) {
      this.currentUser = JSON.parse(storedUser)
      return this.currentUser
    }

    return null
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null
  }

  // Check if user has permission
  hasPermission(permission: string): boolean {
    const user = this.getCurrentUser()
    if (!user) return false

    // Admin has all permissions
    if (user.permissions.includes('*')) return true

    return user.permissions.includes(permission)
  }

  // Check if user has role
  hasRole(role: User['role']): boolean {
    const user = this.getCurrentUser()
    return user?.role === role
  }

  // Generate mock token
  private generateToken(user: User): string {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      iat: Date.now(),
      exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    }

    return btoa(JSON.stringify(payload))
  }

  // Validate token
  private isValidToken(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token))
      return payload.exp > Date.now()
    } catch {
      return false
    }
  }

  // Get all users (admin only)
  async getUsers(): Promise<User[]> {
    if (!this.hasPermission('users.view') && !this.hasRole('admin')) {
      throw new Error('Insufficient permissions')
    }

    // Remove passwords from response
    return mockUsers.map(({ password, ...user }) => user)
  }

  // Change password
  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    const user = this.getCurrentUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const mockUser = mockUsers.find((u) => u.id === user.id)
    if (!mockUser) {
      return { success: false, error: 'User not found' }
    }

    if (mockUser.password !== currentPassword) {
      return { success: false, error: 'Current password is incorrect' }
    }

    if (newPassword.length < 6) {
      return {
        success: false,
        error: 'New password must be at least 6 characters',
      }
    }

    // Update password
    mockUser.password = newPassword

    return { success: true }
  }

  // Create user (admin/manager only)
  async createUser(
    userData: Omit<User, 'id' | 'createdAt' | 'permissions'> & {
      password: string
    },
  ): Promise<{ success: boolean; user?: User; error?: string }> {
    if (!this.hasPermission('users.create') && !this.hasRole('admin')) {
      return { success: false, error: 'Insufficient permissions' }
    }

    if (mockUsers.find((u) => u.email.toLowerCase() === userData.email.toLowerCase())) {
      return { success: false, error: 'User with this email already exists' }
    }

    if (userData.password.length < 6) {
      return {
        success: false,
        error: 'Password must be at least 6 characters',
      }
    }

    const newUser = {
      ...userData,
      id: (mockUsers.length + 1).toString(),
      createdAt: new Date().toISOString(),
      permissions: [...DEFAULT_PERMISSIONS[userData.role]],
    }

    mockUsers.push(newUser)

    const { password: _password, ...userWithoutPassword } = newUser
    return { success: true, user: userWithoutPassword }
  }

  // Update user (admin/manager only)
  async updateUser(
    userId: string,
    updates: Partial<Omit<User, 'id' | 'createdAt'>>,
  ): Promise<{ success: boolean; user?: User; error?: string }> {
    if (!this.hasPermission('users.edit') && !this.hasRole('admin')) {
      return { success: false, error: 'Insufficient permissions' }
    }

    const userIndex = mockUsers.findIndex((u) => u.id === userId)
    if (userIndex === -1) {
      return { success: false, error: 'User not found' }
    }

    const currentUser = this.getCurrentUser()
    if (currentUser?.id === userId && updates.role && updates.role !== currentUser.role) {
      return { success: false, error: 'Cannot change your own role' }
    }

    if (updates.email) {
      const existingUser = mockUsers.find(
        (u) => u.id !== userId && u.email.toLowerCase() === updates.email?.toLowerCase(),
      )
      if (existingUser) {
        return { success: false, error: 'User with this email already exists' }
      }
    }

    // Update user data
    mockUsers[userIndex] = { ...mockUsers[userIndex], ...updates }

    // If role is updated, update permissions automatically
    if (updates.role) {
      mockUsers[userIndex].permissions = [...DEFAULT_PERMISSIONS[updates.role]]
    }

    const { password: _password2, ...userWithoutPassword } = mockUsers[userIndex]

    return { success: true, user: userWithoutPassword }
  }

  // Delete user (admin/manager only)
  async deleteUser(userId: string): Promise<{ success: boolean; error?: string }> {
    if (!this.hasPermission('users.delete') && !this.hasRole('admin')) {
      return { success: false, error: 'Insufficient permissions' }
    }

    const currentUser = this.getCurrentUser()
    if (currentUser?.id === userId) {
      return { success: false, error: 'Cannot delete your own account' }
    }

    const userIndex = mockUsers.findIndex((u) => u.id === userId)
    if (userIndex === -1) {
      return { success: false, error: 'User not found' }
    }

    mockUsers.splice(userIndex, 1)
    return { success: true }
  }
}

// Export singleton instance
export const authService = AuthService.getInstance()
