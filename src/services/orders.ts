import { productService } from "./products";

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  customerId?: string;
  customerName?: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'pending' | 'paid' | 'cancelled' | 'completed';
  paymentMethod?: 'cash' | 'card' | 'transfer';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface CreateOrderRequest {
  customerId?: string;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  paymentMethod?: 'cash' | 'card' | 'transfer';
  notes?: string;
}

const mockOrders: Order[] = [
  {
    id: "1",
    customerName: "John Doe",
    items: [
      {
        productId: "1",
        productName: "Coca Cola 500ml",
        quantity: 2,
        unitPrice: 2.50,
        totalPrice: 5.00
      },
      {
        productId: "2",
        productName: "Bread Loaf",
        quantity: 1,
        unitPrice: 3.99,
        totalPrice: 3.99
      }
    ],
    subtotal: 8.99,
    tax: 0.90,
    total: 9.89,
    status: 'completed',
    paymentMethod: 'cash',
    createdAt: "2024-01-15T10:30:00.000Z",
    updatedAt: "2024-01-15T10:35:00.000Z",
    completedAt: "2024-01-15T10:35:00.000Z"
  },
  {
    id: "2",
    customerName: "Jane Smith",
    items: [
      {
        productId: "3",
        productName: "Premium Coffee Beans 1kg",
        quantity: 1,
        unitPrice: 24.99,
        totalPrice: 24.99
      }
    ],
    subtotal: 24.99,
    tax: 2.50,
    total: 27.49,
    status: 'paid',
    paymentMethod: 'card',
    createdAt: "2024-01-16T14:45:00.000Z",
    updatedAt: "2024-01-16T14:50:00.000Z"
  }
];

export class OrderService {
  private static instance: OrderService;

  static getInstance(): OrderService {
    if (!OrderService.instance) {
      OrderService.instance = new OrderService();
    }
    return OrderService.instance;
  }

  async getOrders(): Promise<Order[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...mockOrders];
  }

  async getOrder(id: string): Promise<Order | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockOrders.find(o => o.id === id) || null;
  }

  async createOrder(orderData: CreateOrderRequest): Promise<{ success: boolean; order?: Order; error?: string }> {
    await new Promise(resolve => setTimeout(resolve, 800));

    if (!orderData.items.length) {
      return { success: false, error: "Order must contain at least one item" };
    }

    // Check stock availability and reserve items
    const stockCheck = await this.checkStockAvailability(orderData.items);
    if (!stockCheck.success) {
      return { success: false, error: stockCheck.error };
    }

    // Build order items with product details
    const orderItems: OrderItem[] = [];
    let subtotal = 0;

    for (const item of orderData.items) {
      const product = await productService.getProduct(item.productId);
      if (!product) {
        return { success: false, error: `Product ${item.productId} not found` };
      }

      const itemTotal = product.price * item.quantity;
      orderItems.push({
        productId: product.id,
        productName: product.name,
        quantity: item.quantity,
        unitPrice: product.price,
        totalPrice: itemTotal
      });

      subtotal += itemTotal;
    }

    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;

    const newOrder: Order = {
      id: (mockOrders.length + 1).toString(),
      customerId: orderData.customerId,
      items: orderItems,
      subtotal,
      tax,
      total,
      status: 'pending',
      paymentMethod: orderData.paymentMethod,
      notes: orderData.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    mockOrders.push(newOrder);
    return { success: true, order: newOrder };
  }

  async updateOrderStatus(id: string, status: Order['status'], paymentMethod?: Order['paymentMethod']): Promise<{ success: boolean; order?: Order; error?: string }> {
    await new Promise(resolve => setTimeout(resolve, 600));

    const orderIndex = mockOrders.findIndex(o => o.id === id);
    if (orderIndex === -1) {
      return { success: false, error: "Order not found" };
    }

    const order = mockOrders[orderIndex];
    const oldStatus = order.status;
    
    // Update order status
    order.status = status;
    order.updatedAt = new Date().toISOString();

    if (paymentMethod) {
      order.paymentMethod = paymentMethod;
    }

    if (status === 'completed' || status === 'paid') {
      order.completedAt = new Date().toISOString();
      
      // Deduct stock from inventory when order is completed/paid
      if (oldStatus !== 'completed' && oldStatus !== 'paid') {
        const stockResult = await this.deductStockFromOrder(order);
        if (!stockResult.success) {
          // Revert status change if stock deduction fails
          order.status = oldStatus;
          return { success: false, error: stockResult.error };
        }
      }
    } else if ((status === 'cancelled' || status === 'pending') && (oldStatus === 'completed' || oldStatus === 'paid')) {
      // Restore stock if order is cancelled or set back to pending after being completed/paid
      await this.restoreStockFromOrder(order);
    }

    return { success: true, order };
  }

  async deleteOrder(id: string): Promise<{ success: boolean; error?: string }> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const orderIndex = mockOrders.findIndex(o => o.id === id);
    if (orderIndex === -1) {
      return { success: false, error: "Order not found" };
    }

    const order = mockOrders[orderIndex];
    
    // Restore stock if order was completed/paid
    if (order.status === 'completed' || order.status === 'paid') {
      await this.restoreStockFromOrder(order);
    }

    mockOrders.splice(orderIndex, 1);
    return { success: true };
  }

  private async checkStockAvailability(items: Array<{ productId: string; quantity: number }>): Promise<{ success: boolean; error?: string }> {
    for (const item of items) {
      const product = await productService.getProduct(item.productId);
      if (!product) {
        return { success: false, error: `Product ${item.productId} not found` };
      }

      if (!product.isActive) {
        return { success: false, error: `Product ${product.name} is not active` };
      }

      if (product.stock < item.quantity) {
        return { success: false, error: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}` };
      }
    }
    return { success: true };
  }

  private async deductStockFromOrder(order: Order): Promise<{ success: boolean; error?: string }> {
    for (const item of order.items) {
      const product = await productService.getProduct(item.productId);
      if (!product) {
        return { success: false, error: `Product ${item.productId} not found` };
      }

      if (product.stock < item.quantity) {
        return { success: false, error: `Insufficient stock for ${product.name}. Available: ${product.stock}, Needed: ${item.quantity}` };
      }

      // Update product stock
      await productService.updateProduct(product.id, {
        stock: product.stock - item.quantity
      });
    }
    return { success: true };
  }

  private async restoreStockFromOrder(order: Order): Promise<void> {
    for (const item of order.items) {
      const product = await productService.getProduct(item.productId);
      if (product) {
        await productService.updateProduct(product.id, {
          stock: product.stock + item.quantity
        });
      }
    }
  }

  async getOrdersByStatus(status: Order['status']): Promise<Order[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockOrders.filter(o => o.status === status);
  }

  async getTotalSales(): Promise<number> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockOrders
      .filter(o => o.status === 'completed' || o.status === 'paid')
      .reduce((total, order) => total + order.total, 0);
  }
}

export const orderService = OrderService.getInstance();