import { orderService } from "./orders";
import { customerService } from "./customers";
import { productService } from "./products";

export interface DashboardStats {
  totalSales: number;
  ordersToday: number;
  totalCustomers: number;
  totalRevenue: number;
  averageOrderValue: number;
  lowStockProducts: number;
  pendingOrders: number;
}

export interface SalesData {
  date: string;
  amount: number;
}

export interface TopProduct {
  id: string;
  name: string;
  sales: number;
  revenue: number;
}

export class DashboardService {
  private static instance: DashboardService;

  static getInstance(): DashboardService {
    if (!DashboardService.instance) {
      DashboardService.instance = new DashboardService();
    }
    return DashboardService.instance;
  }

  async getDashboardStats(): Promise<DashboardStats> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const [orders, customers, products] = await Promise.all([
      orderService.getOrders(),
      customerService.getCustomers(),
      productService.getProducts()
    ]);

    // Filter completed/paid orders for sales calculations
    const completedOrders = orders.filter(o => o.status === 'completed' || o.status === 'paid');
    
    // Total sales (sum of all completed/paid orders)
    const totalSales = completedOrders.reduce((sum, order) => sum + order.total, 0);
    
    // Orders today (based on current date for demo)
    const today = new Date().toISOString().split('T')[0];
    const ordersToday = orders.filter(order => 
      order.createdAt.startsWith(today)
    ).length;
    
    // Total customers (only active ones)
    const totalCustomers = customers.filter(c => c.isActive).length;
    
    // Total revenue (same as total sales for this implementation)
    const totalRevenue = totalSales;
    
    // Average order value
    const averageOrderValue = completedOrders.length > 0 
      ? totalSales / completedOrders.length 
      : 0;
    
    // Low stock products (stock < 10)
    const lowStockProducts = products.filter(p => p.stock > 0 && p.stock < 10).length;
    
    // Pending orders
    const pendingOrders = orders.filter(o => o.status === 'pending').length;

    return {
      totalSales,
      ordersToday,
      totalCustomers,
      totalRevenue,
      averageOrderValue,
      lowStockProducts,
      pendingOrders
    };
  }

  async getSalesData(days: number = 7): Promise<SalesData[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const orders = await orderService.getOrders();
    const completedOrders = orders.filter(o => o.status === 'completed' || o.status === 'paid');
    
    // Generate last 7 days of sales data
    const salesData: SalesData[] = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      const dailySales = completedOrders
        .filter(order => order.createdAt.startsWith(dateString))
        .reduce((sum, order) => sum + order.total, 0);
      
      salesData.push({
        date: dateString,
        amount: dailySales
      });
    }
    
    return salesData;
  }

  async getTopProducts(limit: number = 5): Promise<TopProduct[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const orders = await orderService.getOrders();
    const completedOrders = orders.filter(o => o.status === 'completed' || o.status === 'paid');
    
    const productSales = new Map<string, { sales: number; revenue: number; name: string }>();
    
    completedOrders.forEach(order => {
      order.items.forEach(item => {
        if (!productSales.has(item.productId)) {
          productSales.set(item.productId, { 
            sales: 0, 
            revenue: 0, 
            name: item.productName 
          });
        }
        
        const product = productSales.get(item.productId)!;
        product.sales += item.quantity;
        product.revenue += item.totalPrice;
      });
    });
    
    return Array.from(productSales.entries())
      .map(([id, data]) => ({
        id,
        name: data.name,
        sales: data.sales,
        revenue: data.revenue
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit);
  }

  async getRecentOrders(limit: number = 5) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const orders = await orderService.getOrders();
    return orders
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  async getInventoryStatus() {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const products = await productService.getProducts();
    const activeProducts = products.filter(p => p.isActive);
    
    return {
      totalProducts: activeProducts.length,
      outOfStock: activeProducts.filter(p => p.stock === 0).length,
      lowStock: activeProducts.filter(p => p.stock > 0 && p.stock < 10).length,
      inStock: activeProducts.filter(p => p.stock >= 10).length
    };
  }
}

export const dashboardService = DashboardService.getInstance();