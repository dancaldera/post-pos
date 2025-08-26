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

const mockCustomers: Customer[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@email.com',
    phone: '(555) 123-4567',
    address: '123 Main St',
    city: 'Anytown',
    state: 'CA',
    zipCode: '12345',
    loyaltyPoints: 1250,
    totalSpent: 2450.75,
    lastPurchaseDate: '2024-01-20T14:30:00.000Z',
    isActive: true,
    notes: 'Prefers morning shopping, regular coffee buyer',
    createdAt: '2023-06-15T10:00:00.000Z',
    updatedAt: '2024-01-20T14:30:00.000Z',
  },
  {
    id: '2',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@email.com',
    phone: '(555) 987-6543',
    address: '456 Oak Ave',
    city: 'Somewhere',
    state: 'NY',
    zipCode: '67890',
    loyaltyPoints: 3500,
    totalSpent: 5890.25,
    lastPurchaseDate: '2024-01-22T16:45:00.000Z',
    isActive: true,
    notes: 'VIP customer, bulk purchases',
    createdAt: '2023-03-10T14:20:00.000Z',
    updatedAt: '2024-01-22T16:45:00.000Z',
  },
  {
    id: '3',
    firstName: 'Bob',
    lastName: 'Johnson',
    email: 'bob.johnson@email.com',
    phone: '(555) 456-7890',
    address: '789 Pine St',
    city: 'Otherville',
    state: 'TX',
    zipCode: '34567',
    loyaltyPoints: 800,
    totalSpent: 1200.5,
    lastPurchaseDate: '2024-01-18T11:15:00.000Z',
    isActive: true,
    notes: 'Prefers self-checkout, quick shopper',
    createdAt: '2023-09-05T09:30:00.000Z',
    updatedAt: '2024-01-18T11:15:00.000Z',
  },
  {
    id: '4',
    firstName: 'Alice',
    lastName: 'Williams',
    email: 'alice.williams@email.com',
    phone: '(555) 234-5678',
    address: '321 Elm Blvd',
    city: 'Newtown',
    state: 'FL',
    zipCode: '45678',
    loyaltyPoints: 2100,
    totalSpent: 3780.9,
    lastPurchaseDate: '2024-01-21T13:20:00.000Z',
    isActive: true,
    notes: 'Corporate account, monthly billing',
    createdAt: '2023-07-20T16:45:00.000Z',
    updatedAt: '2024-01-21T13:20:00.000Z',
  },
  {
    id: '5',
    firstName: 'Mike',
    lastName: 'Brown',
    email: 'mike.brown@email.com',
    phone: '(555) 876-5432',
    address: '654 Cedar Rd',
    city: 'Westville',
    state: 'WA',
    zipCode: '78901',
    loyaltyPoints: 450,
    totalSpent: 890.25,
    lastPurchaseDate: '2024-01-19T10:30:00.000Z',
    isActive: true,
    notes: 'Student discount, frequent snack purchases',
    createdAt: '2023-11-12T12:15:00.000Z',
    updatedAt: '2024-01-19T10:30:00.000Z',
  },
  {
    id: '6',
    firstName: 'Sarah',
    lastName: 'Davis',
    email: 'sarah.davis@email.com',
    phone: '(555) 345-6789',
    address: '987 Maple Ln',
    city: 'Eastside',
    state: 'IL',
    zipCode: '23456',
    loyaltyPoints: 1800,
    totalSpent: 3120.75,
    lastPurchaseDate: '2024-01-17T15:45:00.000Z',
    isActive: true,
    notes: 'Senior citizen, prefers assistance',
    createdAt: '2023-05-25T11:20:00.000Z',
    updatedAt: '2024-01-17T15:45:00.000Z',
  },
  {
    id: '7',
    firstName: 'David',
    lastName: 'Wilson',
    email: 'david.wilson@email.com',
    phone: '(555) 765-4321',
    address: '159 Birch St',
    city: 'Northtown',
    state: 'OH',
    zipCode: '56789',
    loyaltyPoints: 950,
    totalSpent: 1560.4,
    lastPurchaseDate: '2024-01-16T09:15:00.000Z',
    isActive: true,
    notes: 'Employee discount, regular shopper',
    createdAt: '2023-10-08T13:30:00.000Z',
    updatedAt: '2024-01-16T09:15:00.000Z',
  },
  {
    id: '8',
    firstName: 'Emily',
    lastName: 'Taylor',
    email: 'emily.taylor@email.com',
    phone: '(555) 654-3210',
    address: '753 Spruce Ave',
    city: 'Southburg',
    state: 'GA',
    zipCode: '34567',
    loyaltyPoints: 2800,
    totalSpent: 4780.6,
    lastPurchaseDate: '2024-01-23T12:30:00.000Z',
    isActive: true,
    notes: 'Wholesale buyer, bulk orders',
    createdAt: '2023-04-18T15:45:00.000Z',
    updatedAt: '2024-01-23T12:30:00.000Z',
  },
  {
    id: '9',
    firstName: 'Tom',
    lastName: 'Anderson',
    email: 'tom.anderson@email.com',
    phone: '(555) 432-1098',
    address: '246 Willow Way',
    city: 'Central City',
    state: 'CO',
    zipCode: '45678',
    loyaltyPoints: 1200,
    totalSpent: 2100.8,
    lastPurchaseDate: '2024-01-15T14:20:00.000Z',
    isActive: false,
    notes: 'Moved out of state',
    createdAt: '2023-08-30T10:15:00.000Z',
    updatedAt: '2024-01-15T14:20:00.000Z',
  },
  {
    id: '10',
    firstName: 'Lisa',
    lastName: 'Martinez',
    email: 'lisa.martinez@email.com',
    phone: '(555) 321-0987',
    address: '864 Palm Dr',
    city: 'Beachside',
    state: 'CA',
    zipCode: '98765',
    loyaltyPoints: 3200,
    totalSpent: 5420.95,
    lastPurchaseDate: '2024-01-24T17:30:00.000Z',
    isActive: true,
    notes: 'Regular weekend shopper, large family',
    createdAt: '2023-02-14T09:45:00.000Z',
    updatedAt: '2024-01-24T17:30:00.000Z',
  },
]

export class CustomerService {
  private static instance: CustomerService

  static getInstance(): CustomerService {
    if (!CustomerService.instance) {
      CustomerService.instance = new CustomerService()
    }
    return CustomerService.instance
  }

  async getCustomers(): Promise<Customer[]> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return [...mockCustomers]
  }

  async getCustomer(id: string): Promise<Customer | null> {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return mockCustomers.find((c) => c.id === id) || null
  }

  async createCustomer(
    customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<{ success: boolean; customer?: Customer; error?: string }> {
    await new Promise((resolve) => setTimeout(resolve, 800))

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

    if (mockCustomers.find((c) => c.email === customerData.email)) {
      return {
        success: false,
        error: 'Customer with this email already exists',
      }
    }

    if (mockCustomers.find((c) => c.phone === customerData.phone)) {
      return {
        success: false,
        error: 'Customer with this phone number already exists',
      }
    }

    const newCustomer: Customer = {
      ...customerData,
      id: (mockCustomers.length + 1).toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    mockCustomers.push(newCustomer)
    return { success: true, customer: newCustomer }
  }

  async updateCustomer(
    id: string,
    updates: Partial<Omit<Customer, 'id' | 'createdAt'>>,
  ): Promise<{ success: boolean; customer?: Customer; error?: string }> {
    await new Promise((resolve) => setTimeout(resolve, 700))

    const customerIndex = mockCustomers.findIndex((c) => c.id === id)
    if (customerIndex === -1) {
      return { success: false, error: 'Customer not found' }
    }

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
      const existingCustomer = mockCustomers.find((c) => c.id !== id && c.email === updates.email)
      if (existingCustomer) {
        return {
          success: false,
          error: 'Customer with this email already exists',
        }
      }
    }

    if (updates.phone !== undefined) {
      if (!updates.phone.trim()) {
        return { success: false, error: 'Phone number is required' }
      }
      const existingCustomer = mockCustomers.find((c) => c.id !== id && c.phone === updates.phone)
      if (existingCustomer) {
        return {
          success: false,
          error: 'Customer with this phone number already exists',
        }
      }
    }

    mockCustomers[customerIndex] = {
      ...mockCustomers[customerIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    return { success: true, customer: mockCustomers[customerIndex] }
  }

  async deleteCustomer(id: string): Promise<{ success: boolean; error?: string }> {
    await new Promise((resolve) => setTimeout(resolve, 600))

    const customerIndex = mockCustomers.findIndex((c) => c.id === id)
    if (customerIndex === -1) {
      return { success: false, error: 'Customer not found' }
    }

    mockCustomers.splice(customerIndex, 1)
    return { success: true }
  }

  async searchCustomers(query: string): Promise<Customer[]> {
    await new Promise((resolve) => setTimeout(resolve, 400))

    const searchTerm = query.toLowerCase()
    return mockCustomers.filter(
      (customer) =>
        customer.firstName.toLowerCase().includes(searchTerm) ||
        customer.lastName.toLowerCase().includes(searchTerm) ||
        customer.email.toLowerCase().includes(searchTerm) ||
        customer.phone.includes(searchTerm) ||
        customer.address?.toLowerCase().includes(searchTerm) ||
        customer.city?.toLowerCase().includes(searchTerm),
    )
  }

  async getTopCustomers(limit: number = 5): Promise<Customer[]> {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return [...mockCustomers].sort((a, b) => b.totalSpent - a.totalSpent).slice(0, limit)
  }
}

export const customerService = CustomerService.getInstance()
