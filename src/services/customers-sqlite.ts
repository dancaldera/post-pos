import Database from '@tauri-apps/plugin-sql'

export interface Customer {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  loyaltyPoints: number
  totalSpent: number
  lastPurchaseDate?: string
  isActive: boolean
  notes?: string
  createdAt: string
  updatedAt: string
}

export const CUSTOMER_TYPES = [
  'Regular',
  'VIP',
  'Wholesale',
  'Corporate',
  'Student',
  'Senior',
  'Employee',
  'Other',
] as const

interface DatabaseCustomer {
  id: number
  first_name: string
  last_name: string
  email: string
  phone: string
  address?: string
  city?: string
  state?: string
  zip_code?: string
  loyalty_points: number
  total_spent: number
  last_purchase_date?: string
  is_active: number
  notes?: string
  created_at: string
  updated_at: string
}

export class CustomerService {
  private static instance: CustomerService
  private db: Database | null = null

  static getInstance(): CustomerService {
    if (!CustomerService.instance) {
      CustomerService.instance = new CustomerService()
    }
    return CustomerService.instance
  }

  private async getDatabase(): Promise<Database> {
    if (!this.db) {
      this.db = await Database.load('sqlite:postpos.db')
    }
    return this.db
  }

  private convertDbCustomer(dbCustomer: DatabaseCustomer): Customer {
    return {
      id: dbCustomer.id.toString(),
      firstName: dbCustomer.first_name,
      lastName: dbCustomer.last_name,
      email: dbCustomer.email,
      phone: dbCustomer.phone,
      address: dbCustomer.address,
      city: dbCustomer.city,
      state: dbCustomer.state,
      zipCode: dbCustomer.zip_code,
      loyaltyPoints: dbCustomer.loyalty_points,
      totalSpent: dbCustomer.total_spent,
      lastPurchaseDate: dbCustomer.last_purchase_date,
      isActive: Boolean(dbCustomer.is_active),
      notes: dbCustomer.notes,
      createdAt: dbCustomer.created_at,
      updatedAt: dbCustomer.updated_at,
    }
  }

  async getCustomers(): Promise<Customer[]> {
    try {
      const db = await this.getDatabase()
      await new Promise((resolve) => setTimeout(resolve, 200))

      const customers = await db.select<DatabaseCustomer[]>('SELECT * FROM customers ORDER BY created_at DESC')

      return customers.map((customer) => this.convertDbCustomer(customer))
    } catch (error) {
      console.error('Get customers error:', error)
      throw new Error('Failed to fetch customers')
    }
  }

  async getCustomer(id: string): Promise<Customer | null> {
    try {
      const db = await this.getDatabase()
      await new Promise((resolve) => setTimeout(resolve, 150))

      const customers = await db.select<DatabaseCustomer[]>('SELECT * FROM customers WHERE id = ? LIMIT 1', [
        parseInt(id, 10),
      ])

      if (customers.length === 0) {
        return null
      }

      return this.convertDbCustomer(customers[0])
    } catch (error) {
      console.error('Get customer error:', error)
      throw new Error('Failed to fetch customer')
    }
  }

  async createCustomer(
    customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<{ success: boolean; customer?: Customer; error?: string }> {
    if (!customerData.firstName.trim() || !customerData.lastName.trim()) {
      return { success: false, error: 'First name and last name are required' }
    }

    if (!customerData.email.trim()) {
      return { success: false, error: 'Email is required' }
    }

    if (!customerData.phone.trim()) {
      return { success: false, error: 'Phone number is required' }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(customerData.email)) {
      return { success: false, error: 'Invalid email format' }
    }

    try {
      const db = await this.getDatabase()
      await new Promise((resolve) => setTimeout(resolve, 400))

      const existingEmail = await db.select<DatabaseCustomer[]>('SELECT id FROM customers WHERE email = ? LIMIT 1', [
        customerData.email,
      ])

      if (existingEmail.length > 0) {
        return {
          success: false,
          error: 'Customer with this email already exists',
        }
      }

      const existingPhone = await db.select<DatabaseCustomer[]>('SELECT id FROM customers WHERE phone = ? LIMIT 1', [
        customerData.phone,
      ])

      if (existingPhone.length > 0) {
        return {
          success: false,
          error: 'Customer with this phone number already exists',
        }
      }

      const now = new Date().toISOString()
      const result = await db.execute(
        `INSERT INTO customers (
          first_name, last_name, email, phone, address, city, state, zip_code,
          loyalty_points, total_spent, last_purchase_date, is_active, notes,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          customerData.firstName,
          customerData.lastName,
          customerData.email,
          customerData.phone,
          customerData.address || null,
          customerData.city || null,
          customerData.state || null,
          customerData.zipCode || null,
          customerData.loyaltyPoints,
          customerData.totalSpent,
          customerData.lastPurchaseDate || null,
          customerData.isActive ? 1 : 0,
          customerData.notes || null,
          now,
          now,
        ],
      )

      const newCustomer: Customer = {
        id: (result.lastInsertId ?? 0).toString(),
        firstName: customerData.firstName,
        lastName: customerData.lastName,
        email: customerData.email,
        phone: customerData.phone,
        address: customerData.address,
        city: customerData.city,
        state: customerData.state,
        zipCode: customerData.zipCode,
        loyaltyPoints: customerData.loyaltyPoints,
        totalSpent: customerData.totalSpent,
        lastPurchaseDate: customerData.lastPurchaseDate,
        isActive: customerData.isActive,
        notes: customerData.notes,
        createdAt: now,
        updatedAt: now,
      }

      return { success: true, customer: newCustomer }
    } catch (error) {
      console.error('Create customer error:', error)
      return { success: false, error: 'Failed to create customer' }
    }
  }

  async updateCustomer(
    id: string,
    updates: Partial<Omit<Customer, 'id' | 'createdAt'>>,
  ): Promise<{ success: boolean; customer?: Customer; error?: string }> {
    if (updates.firstName !== undefined && !updates.firstName.trim()) {
      return { success: false, error: 'First name is required' }
    }

    if (updates.lastName !== undefined && !updates.lastName.trim()) {
      return { success: false, error: 'Last name is required' }
    }

    if (updates.email !== undefined) {
      if (!updates.email.trim()) {
        return { success: false, error: 'Email is required' }
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(updates.email)) {
        return { success: false, error: 'Invalid email format' }
      }
    }

    if (updates.phone !== undefined && !updates.phone.trim()) {
      return { success: false, error: 'Phone number is required' }
    }

    try {
      const db = await this.getDatabase()
      await new Promise((resolve) => setTimeout(resolve, 350))

      const existingCustomer = await db.select<DatabaseCustomer[]>('SELECT * FROM customers WHERE id = ? LIMIT 1', [
        parseInt(id, 10),
      ])

      if (existingCustomer.length === 0) {
        return { success: false, error: 'Customer not found' }
      }

      if (updates.email) {
        const existingEmail = await db.select<DatabaseCustomer[]>(
          'SELECT id FROM customers WHERE email = ? AND id != ? LIMIT 1',
          [updates.email, parseInt(id, 10)],
        )

        if (existingEmail.length > 0) {
          return {
            success: false,
            error: 'Customer with this email already exists',
          }
        }
      }

      if (updates.phone) {
        const existingPhone = await db.select<DatabaseCustomer[]>(
          'SELECT id FROM customers WHERE phone = ? AND id != ? LIMIT 1',
          [updates.phone, parseInt(id, 10)],
        )

        if (existingPhone.length > 0) {
          return {
            success: false,
            error: 'Customer with this phone number already exists',
          }
        }
      }

      const updateFields = []
      const updateValues = []

      if (updates.firstName !== undefined) {
        updateFields.push('first_name = ?')
        updateValues.push(updates.firstName)
      }

      if (updates.lastName !== undefined) {
        updateFields.push('last_name = ?')
        updateValues.push(updates.lastName)
      }

      if (updates.email !== undefined) {
        updateFields.push('email = ?')
        updateValues.push(updates.email)
      }

      if (updates.phone !== undefined) {
        updateFields.push('phone = ?')
        updateValues.push(updates.phone)
      }

      if (updates.address !== undefined) {
        updateFields.push('address = ?')
        updateValues.push(updates.address || null)
      }

      if (updates.city !== undefined) {
        updateFields.push('city = ?')
        updateValues.push(updates.city || null)
      }

      if (updates.state !== undefined) {
        updateFields.push('state = ?')
        updateValues.push(updates.state || null)
      }

      if (updates.zipCode !== undefined) {
        updateFields.push('zip_code = ?')
        updateValues.push(updates.zipCode || null)
      }

      if (updates.loyaltyPoints !== undefined) {
        updateFields.push('loyalty_points = ?')
        updateValues.push(updates.loyaltyPoints)
      }

      if (updates.totalSpent !== undefined) {
        updateFields.push('total_spent = ?')
        updateValues.push(updates.totalSpent)
      }

      if (updates.lastPurchaseDate !== undefined) {
        updateFields.push('last_purchase_date = ?')
        updateValues.push(updates.lastPurchaseDate || null)
      }

      if (updates.isActive !== undefined) {
        updateFields.push('is_active = ?')
        updateValues.push(updates.isActive ? 1 : 0)
      }

      if (updates.notes !== undefined) {
        updateFields.push('notes = ?')
        updateValues.push(updates.notes || null)
      }

      updateFields.push('updated_at = ?')
      updateValues.push(new Date().toISOString())
      updateValues.push(parseInt(id, 10))

      if (updateFields.length > 1) {
        // More than just updated_at
        await db.execute(`UPDATE customers SET ${updateFields.join(', ')} WHERE id = ?`, updateValues)
      }

      const updatedCustomer = await db.select<DatabaseCustomer[]>('SELECT * FROM customers WHERE id = ? LIMIT 1', [
        parseInt(id, 10),
      ])

      return {
        success: true,
        customer: this.convertDbCustomer(updatedCustomer[0]),
      }
    } catch (error) {
      console.error('Update customer error:', error)
      return { success: false, error: 'Failed to update customer' }
    }
  }

  async deleteCustomer(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const db = await this.getDatabase()
      await new Promise((resolve) => setTimeout(resolve, 300))

      const result = await db.execute('DELETE FROM customers WHERE id = ?', [parseInt(id, 10)])

      if (result.rowsAffected === 0) {
        return { success: false, error: 'Customer not found' }
      }

      return { success: true }
    } catch (error) {
      console.error('Delete customer error:', error)
      return { success: false, error: 'Failed to delete customer' }
    }
  }

  async searchCustomers(query: string): Promise<Customer[]> {
    try {
      const db = await this.getDatabase()
      await new Promise((resolve) => setTimeout(resolve, 200))

      const searchTerm = `%${query.toLowerCase()}%`
      const customers = await db.select<DatabaseCustomer[]>(
        `SELECT * FROM customers 
         WHERE LOWER(first_name) LIKE ? 
            OR LOWER(last_name) LIKE ? 
            OR LOWER(email) LIKE ? 
            OR phone LIKE ?
            OR (address IS NOT NULL AND LOWER(address) LIKE ?)
            OR (city IS NOT NULL AND LOWER(city) LIKE ?)
         ORDER BY created_at DESC`,
        [searchTerm, searchTerm, searchTerm, `%${query}%`, searchTerm, searchTerm],
      )

      return customers.map((customer) => this.convertDbCustomer(customer))
    } catch (error) {
      console.error('Search customers error:', error)
      throw new Error('Failed to search customers')
    }
  }

  async getTopCustomers(limit: number = 5): Promise<Customer[]> {
    try {
      const db = await this.getDatabase()
      await new Promise((resolve) => setTimeout(resolve, 150))

      const customers = await db.select<DatabaseCustomer[]>(
        'SELECT * FROM customers ORDER BY total_spent DESC LIMIT ?',
        [limit],
      )

      return customers.map((customer) => this.convertDbCustomer(customer))
    } catch (error) {
      console.error('Get top customers error:', error)
      throw new Error('Failed to fetch top customers')
    }
  }
}

export const customerService = CustomerService.getInstance()
