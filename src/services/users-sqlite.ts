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

export class UserService {
  private static instance: UserService
  private db: Database | null = null

  static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService()
    }
    return UserService.instance
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

  async getUser(id: string): Promise<User | null> {
    try {
      const db = await this.getDatabase()
      const users = await db.select<DatabaseUser[]>('SELECT * FROM users WHERE id = ? LIMIT 1', [parseInt(id, 10)])

      if (users.length === 0) {
        return null
      }

      return this.convertDbUser(users[0])
    } catch (error) {
      console.error('Get user error:', error)
      return null
    }
  }

  async getUsers(): Promise<User[]> {
    try {
      const db = await this.getDatabase()
      const users = await db.select<DatabaseUser[]>('SELECT * FROM users ORDER BY name')

      return users.map(user => this.convertDbUser(user))
    } catch (error) {
      console.error('Get users error:', error)
      return []
    }
  }
}

export const userService = UserService.getInstance()