import Database from '@tauri-apps/plugin-sql'

export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'manager' | 'user'
  permissions: string[]
  createdAt: string
  lastLogin?: string
}

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
}

interface DatabaseUser {
  id: number
  email: string
  password: string
  name: string
  role: 'admin' | 'manager' | 'user'
  permissions: string
  created_at: string
  last_login?: string
}

export class AuthService {
  private static instance: AuthService
  private currentUser: User | null = null
  private db: Database | null = null

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  private async getDatabase(): Promise<Database> {
    if (!this.db) {
      this.db = await Database.load('sqlite:postpos.db')
    }
    return this.db
  }

  private convertDbUser(dbUser: DatabaseUser): User {
    return {
      id: dbUser.id.toString(),
      email: dbUser.email,
      name: dbUser.name,
      role: dbUser.role,
      permissions: JSON.parse(dbUser.permissions),
      createdAt: dbUser.created_at,
      lastLogin: dbUser.last_login,
    }
  }

  async signIn(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const db = await this.getDatabase()

      await new Promise((resolve) => setTimeout(resolve, 500))

      const users = await db.select<DatabaseUser[]>('SELECT * FROM users WHERE email = ? LIMIT 1', [
        email.toLowerCase(),
      ])

      if (users.length === 0) {
        return {
          success: false,
          error: 'No account found with this email address',
        }
      }

      const dbUser = users[0]

      if (dbUser.password !== password) {
        return {
          success: false,
          error: 'Incorrect password. Please try again.',
        }
      }

      const user = this.convertDbUser(dbUser)

      await db.execute('UPDATE users SET last_login = ? WHERE id = ?', [new Date().toISOString(), dbUser.id])

      this.currentUser = user

      localStorage.setItem('pos_user', JSON.stringify(user))
      localStorage.setItem('pos_token', this.generateToken(user))

      return {
        success: true,
        user,
      }
    } catch (error) {
      console.error('Sign in error:', error)
      return {
        success: false,
        error: 'An error occurred during sign in',
      }
    }
  }

  signOut(): void {
    this.currentUser = null
    localStorage.removeItem('pos_user')
    localStorage.removeItem('pos_token')
  }

  getCurrentUser(): User | null {
    if (this.currentUser) {
      return this.currentUser
    }

    const storedUser = localStorage.getItem('pos_user')
    const storedToken = localStorage.getItem('pos_token')

    if (storedUser && storedToken && this.isValidToken(storedToken)) {
      this.currentUser = JSON.parse(storedUser)
      return this.currentUser
    }

    return null
  }

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null
  }

  hasPermission(permission: string): boolean {
    const user = this.getCurrentUser()
    if (!user) return false

    if (user.permissions.includes('*')) return true

    return user.permissions.includes(permission)
  }

  hasRole(role: User['role']): boolean {
    const user = this.getCurrentUser()
    return user?.role === role
  }

  private generateToken(user: User): string {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      iat: Date.now(),
      exp: Date.now() + 24 * 60 * 60 * 1000,
    }

    return btoa(JSON.stringify(payload))
  }

  private isValidToken(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token))
      return payload.exp > Date.now()
    } catch {
      return false
    }
  }

  async getUsers(): Promise<User[]> {
    if (!this.hasPermission('users.view') && !this.hasRole('admin')) {
      throw new Error('Insufficient permissions')
    }

    try {
      const db = await this.getDatabase()
      const users = await db.select<DatabaseUser[]>('SELECT * FROM users ORDER BY created_at DESC')

      return users.map((user) => this.convertDbUser(user))
    } catch (error) {
      console.error('Get users error:', error)
      throw new Error('Failed to fetch users')
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    const user = this.getCurrentUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    if (newPassword.length < 6) {
      return {
        success: false,
        error: 'New password must be at least 6 characters',
      }
    }

    try {
      const db = await this.getDatabase()

      const users = await db.select<DatabaseUser[]>('SELECT password FROM users WHERE id = ? LIMIT 1', [
        parseInt(user.id, 10),
      ])

      if (users.length === 0) {
        return { success: false, error: 'User not found' }
      }

      if (users[0].password !== currentPassword) {
        return { success: false, error: 'Current password is incorrect' }
      }

      await db.execute('UPDATE users SET password = ? WHERE id = ?', [newPassword, parseInt(user.id, 10)])

      return { success: true }
    } catch (error) {
      console.error('Change password error:', error)
      return { success: false, error: 'Failed to change password' }
    }
  }

  async createUser(
    userData: Omit<User, 'id' | 'createdAt' | 'permissions'> & {
      password: string
    },
  ): Promise<{ success: boolean; user?: User; error?: string }> {
    if (!this.hasPermission('users.create') && !this.hasRole('admin')) {
      return { success: false, error: 'Insufficient permissions' }
    }

    if (userData.password.length < 6) {
      return {
        success: false,
        error: 'Password must be at least 6 characters',
      }
    }

    try {
      const db = await this.getDatabase()

      const existingUsers = await db.select<DatabaseUser[]>('SELECT id FROM users WHERE email = ? LIMIT 1', [
        userData.email.toLowerCase(),
      ])

      if (existingUsers.length > 0) {
        return { success: false, error: 'User with this email already exists' }
      }

      const permissions = JSON.stringify(DEFAULT_PERMISSIONS[userData.role])

      const result = await db.execute(
        'INSERT INTO users (email, password, name, role, permissions, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        [
          userData.email.toLowerCase(),
          userData.password,
          userData.name,
          userData.role,
          permissions,
          new Date().toISOString(),
        ],
      )

      const newUser: User = {
        id: (result.lastInsertId ?? 0).toString(),
        email: userData.email,
        name: userData.name,
        role: userData.role,
        permissions: [...DEFAULT_PERMISSIONS[userData.role]],
        createdAt: new Date().toISOString(),
      }

      return { success: true, user: newUser }
    } catch (error) {
      console.error('Create user error:', error)
      return { success: false, error: 'Failed to create user' }
    }
  }

  async updateUser(
    userId: string,
    updates: Partial<Omit<User, 'id' | 'createdAt'>>,
  ): Promise<{ success: boolean; user?: User; error?: string }> {
    if (!this.hasPermission('users.edit') && !this.hasRole('admin')) {
      return { success: false, error: 'Insufficient permissions' }
    }

    try {
      const db = await this.getDatabase()

      const users = await db.select<DatabaseUser[]>('SELECT * FROM users WHERE id = ? LIMIT 1', [parseInt(userId, 10)])

      if (users.length === 0) {
        return { success: false, error: 'User not found' }
      }

      const currentUser = this.getCurrentUser()
      if (currentUser?.id === userId && updates.role && updates.role !== currentUser.role) {
        return { success: false, error: 'Cannot change your own role' }
      }

      if (updates.email) {
        const existingUsers = await db.select<DatabaseUser[]>(
          'SELECT id FROM users WHERE email = ? AND id != ? LIMIT 1',
          [updates.email.toLowerCase(), parseInt(userId, 10)],
        )

        if (existingUsers.length > 0) {
          return {
            success: false,
            error: 'User with this email already exists',
          }
        }
      }

      const updateFields = []
      const updateValues = []

      if (updates.email) {
        updateFields.push('email = ?')
        updateValues.push(updates.email.toLowerCase())
      }

      if (updates.name) {
        updateFields.push('name = ?')
        updateValues.push(updates.name)
      }

      if (updates.role) {
        updateFields.push('role = ?')
        updateValues.push(updates.role)
        updateFields.push('permissions = ?')
        updateValues.push(JSON.stringify(DEFAULT_PERMISSIONS[updates.role]))
      }

      if (updateFields.length > 0) {
        updateValues.push(parseInt(userId, 10))

        await db.execute(`UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`, updateValues)
      }

      const updatedUsers = await db.select<DatabaseUser[]>('SELECT * FROM users WHERE id = ? LIMIT 1', [
        parseInt(userId, 10),
      ])

      const updatedUser = this.convertDbUser(updatedUsers[0])
      return { success: true, user: updatedUser }
    } catch (error) {
      console.error('Update user error:', error)
      return { success: false, error: 'Failed to update user' }
    }
  }

  async deleteUser(userId: string): Promise<{ success: boolean; error?: string }> {
    if (!this.hasPermission('users.delete') && !this.hasRole('admin')) {
      return { success: false, error: 'Insufficient permissions' }
    }

    const currentUser = this.getCurrentUser()
    if (currentUser?.id === userId) {
      return { success: false, error: 'Cannot delete your own account' }
    }

    try {
      const db = await this.getDatabase()

      const result = await db.execute('DELETE FROM users WHERE id = ?', [parseInt(userId, 10)])

      if (result.rowsAffected === 0) {
        return { success: false, error: 'User not found' }
      }

      return { success: true }
    } catch (error) {
      console.error('Delete user error:', error)
      return { success: false, error: 'Failed to delete user' }
    }
  }
}

export const authService = AuthService.getInstance()
