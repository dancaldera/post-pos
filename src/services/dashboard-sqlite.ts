import { customerService } from './customers-sqlite'
import { orderService } from './orders-sqlite'
import { productService } from './products-sqlite'

export interface DashboardStats {
  totalSales: number
  ordersToday: number
  totalCustomers: number
  totalRevenue: number
  averageOrderValue: number
  lowStockProducts: number
  pendingOrders: number
}

export interface SalesData {
  date: string
  amount: number
}

export interface TopProduct {
  id: string
  name: string
  sales: number
  revenue: number
}

export interface InventoryStatus {
  totalProducts: number
  outOfStock: number
  lowStock: number
  inStock: number
}

export class DashboardService {
  private static instance: DashboardService

  static getInstance(): DashboardService {
    if (!DashboardService.instance) {
      DashboardService.instance = new DashboardService()
    }
    return DashboardService.instance
  }

  async getDashboardStats(): Promise<DashboardStats> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 200))

      // Get all data in parallel for better performance
      const [orders, customers, products] = await Promise.all([
        orderService.getOrders(),
        customerService.getCustomers(),
        productService.getProducts(),
      ])

      // Filter completed/paid orders for sales calculations
      const completedOrders = orders.filter((o) => o.status === 'completed' || o.status === 'paid')

      // Total sales (sum of all completed/paid orders)
      const totalSales = completedOrders.reduce((sum, order) => sum + order.total, 0)

      // Orders today (based on current date)
      const today = new Date()
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString()
      const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString()

      const ordersToday = orders.filter((order) => order.createdAt >= todayStart && order.createdAt < todayEnd).length

      // Total customers (only active ones)
      const totalCustomers = customers.filter((c) => c.isActive).length

      // Total revenue (same as total sales for this implementation)
      const totalRevenue = totalSales

      // Average order value
      const averageOrderValue = completedOrders.length > 0 ? totalSales / completedOrders.length : 0

      // Low stock products (stock < 10 and > 0)
      const lowStockProducts = products.filter((p) => p.isActive && p.stock > 0 && p.stock < 10).length

      // Pending orders
      const pendingOrders = orders.filter((o) => o.status === 'pending').length

      return {
        totalSales,
        ordersToday,
        totalCustomers,
        totalRevenue,
        averageOrderValue,
        lowStockProducts,
        pendingOrders,
      }
    } catch (error) {
      console.error('Dashboard stats error:', error)
      throw new Error('Failed to fetch dashboard statistics')
    }
  }

  async getSalesData(days: number = 7): Promise<SalesData[]> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 150))

      const orders = await orderService.getOrders()
      const completedOrders = orders.filter((o) => o.status === 'completed' || o.status === 'paid')

      // Generate sales data for the specified number of days
      const salesData: SalesData[] = []
      const today = new Date()

      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString()
        const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1).toISOString()

        const dailySales = completedOrders
          .filter((order) => order.createdAt >= dayStart && order.createdAt < dayEnd)
          .reduce((sum, order) => sum + order.total, 0)

        salesData.push({
          date: date.toISOString().split('T')[0],
          amount: dailySales,
        })
      }

      return salesData
    } catch (error) {
      console.error('Sales data error:', error)
      throw new Error('Failed to fetch sales data')
    }
  }

  async getTopProducts(limit: number = 5): Promise<TopProduct[]> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 200))

      // Use the orderService's getTopSellingProducts method for better performance
      const topProducts = await orderService.getTopSellingProducts(limit)

      return topProducts.map((product) => ({
        id: product.productId,
        name: product.productName,
        sales: product.totalSold,
        revenue: product.totalRevenue,
      }))
    } catch (error) {
      console.error('Top products error:', error)
      throw new Error('Failed to fetch top products')
    }
  }

  async getRecentOrders(limit: number = 5) {
    try {
      await new Promise((resolve) => setTimeout(resolve, 100))

      const orders = await orderService.getOrders()
      return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, limit)
    } catch (error) {
      console.error('Recent orders error:', error)
      throw new Error('Failed to fetch recent orders')
    }
  }

  async getInventoryStatus(): Promise<InventoryStatus> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 150))

      const products = await productService.getProducts()
      const activeProducts = products.filter((p) => p.isActive)

      return {
        totalProducts: activeProducts.length,
        outOfStock: activeProducts.filter((p) => p.stock === 0).length,
        lowStock: activeProducts.filter((p) => p.stock > 0 && p.stock < 10).length,
        inStock: activeProducts.filter((p) => p.stock >= 10).length,
      }
    } catch (error) {
      console.error('Inventory status error:', error)
      throw new Error('Failed to fetch inventory status')
    }
  }

  async getSalesDataByDateRange(startDate: string, endDate: string): Promise<SalesData[]> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 200))

      const orders = await orderService.getOrdersByDateRange(startDate, endDate)
      const completedOrders = orders.filter((o) => o.status === 'completed' || o.status === 'paid')

      // Group orders by date
      const salesByDate = new Map<string, number>()

      completedOrders.forEach((order) => {
        const date = order.createdAt.split('T')[0]
        const currentAmount = salesByDate.get(date) || 0
        salesByDate.set(date, currentAmount + order.total)
      })

      // Convert to array and sort by date
      const salesData: SalesData[] = Array.from(salesByDate.entries())
        .map(([date, amount]) => ({ date, amount }))
        .sort((a, b) => a.date.localeCompare(b.date))

      return salesData
    } catch (error) {
      console.error('Sales data by date range error:', error)
      throw new Error('Failed to fetch sales data for date range')
    }
  }

  async getTotalSalesAmount(): Promise<number> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 100))

      return await orderService.getTotalSales()
    } catch (error) {
      console.error('Total sales amount error:', error)
      throw new Error('Failed to fetch total sales amount')
    }
  }

  async getOrderStatusBreakdown() {
    try {
      await new Promise((resolve) => setTimeout(resolve, 150))

      const [pending, paid, completed, cancelled] = await Promise.all([
        orderService.getOrdersByStatus('pending'),
        orderService.getOrdersByStatus('paid'),
        orderService.getOrdersByStatus('completed'),
        orderService.getOrdersByStatus('cancelled'),
      ])

      return {
        pending: pending.length,
        paid: paid.length,
        completed: completed.length,
        cancelled: cancelled.length,
        total: pending.length + paid.length + completed.length + cancelled.length,
      }
    } catch (error) {
      console.error('Order status breakdown error:', error)
      throw new Error('Failed to fetch order status breakdown')
    }
  }

  async getCustomerInsights() {
    try {
      await new Promise((resolve) => setTimeout(resolve, 200))

      const customers = await customerService.getCustomers()
      const activeCustomers = customers.filter((c) => c.isActive)

      // Calculate customer metrics
      const totalSpent = activeCustomers.reduce((sum, customer) => sum + customer.totalSpent, 0)
      const averageSpentPerCustomer = activeCustomers.length > 0 ? totalSpent / activeCustomers.length : 0

      // Find top customers by spending
      const topCustomers = activeCustomers
        .filter((c) => c.totalSpent > 0)
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, 5)
        .map((c) => ({
          id: c.id,
          name: `${c.firstName} ${c.lastName}`,
          totalSpent: c.totalSpent,
          loyaltyPoints: c.loyaltyPoints,
          lastPurchaseDate: c.lastPurchaseDate,
        }))

      return {
        totalActiveCustomers: activeCustomers.length,
        totalInactiveCustomers: customers.length - activeCustomers.length,
        averageSpentPerCustomer,
        totalCustomerSpending: totalSpent,
        topCustomers,
      }
    } catch (error) {
      console.error('Customer insights error:', error)
      throw new Error('Failed to fetch customer insights')
    }
  }
}

export const dashboardService = DashboardService.getInstance()
