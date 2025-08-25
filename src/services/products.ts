export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  cost: number;
  stock: number;
  category: string;
  barcode?: string;
  image?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const PRODUCT_CATEGORIES = [
  "Beverages",
  "Bakery",
  "Coffee & Tea", 
  "Dairy",
  "Snacks",
  "Frozen Foods",
  "Fresh Produce",
  "Meat & Poultry",
  "Seafood",
  "Pantry Items",
  "Condiments & Sauces",
  "Breakfast Items",
  "Household Items",
  "Personal Care",
  "Electronics",
  "Other"
] as const;

const mockProducts: Product[] = [
  {
    id: "1",
    name: "Coca Cola 500ml",
    description: "Refreshing soft drink",
    price: 2.50,
    cost: 1.20,
    stock: 120,
    category: "Beverages",
    barcode: "7501055363063",
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-15T10:30:00.000Z"
  },
  {
    id: "2",
    name: "Bread Loaf",
    description: "Fresh whole wheat bread",
    price: 3.99,
    cost: 1.80,
    stock: 25,
    category: "Bakery",
    barcode: "1234567890123",
    isActive: true,
    createdAt: "2024-01-02T00:00:00.000Z",
    updatedAt: "2024-01-16T14:45:00.000Z"
  },
  {
    id: "3",
    name: "Premium Coffee Beans 1kg",
    description: "Arabica coffee beans from Colombia",
    price: 24.99,
    cost: 12.00,
    stock: 8,
    category: "Coffee & Tea",
    barcode: "9876543210987",
    isActive: true,
    createdAt: "2024-01-03T00:00:00.000Z",
    updatedAt: "2024-01-17T09:15:00.000Z"
  },
  {
    id: "4",
    name: "Organic Milk 1L",
    description: "Fresh organic whole milk",
    price: 4.50,
    cost: 2.20,
    stock: 45,
    category: "Dairy",
    barcode: "5555666677778",
    isActive: true,
    createdAt: "2024-01-04T00:00:00.000Z",
    updatedAt: "2024-01-18T16:20:00.000Z"
  },
  {
    id: "5",
    name: "Chocolate Bar",
    description: "Dark chocolate 70% cocoa",
    price: 5.99,
    cost: 2.80,
    stock: 0,
    category: "Snacks",
    barcode: "1111222233334",
    isActive: false,
    createdAt: "2024-01-05T00:00:00.000Z",
    updatedAt: "2024-01-19T11:10:00.000Z"
  },
  {
    id: "6",
    name: "Fresh Salmon Fillet",
    description: "Atlantic salmon, wild-caught",
    price: 18.99,
    cost: 12.50,
    stock: 12,
    category: "Seafood",
    barcode: "2222333344445",
    isActive: true,
    createdAt: "2024-01-06T00:00:00.000Z",
    updatedAt: "2024-01-20T08:30:00.000Z"
  },
  {
    id: "7",
    name: "Frozen Pizza Margherita",
    description: "Traditional Italian style pizza",
    price: 6.99,
    cost: 3.50,
    stock: 35,
    category: "Frozen Foods",
    barcode: "3333444455556",
    isActive: true,
    createdAt: "2024-01-07T00:00:00.000Z",
    updatedAt: "2024-01-21T15:45:00.000Z"
  },
  {
    id: "8",
    name: "Bananas (per lb)",
    description: "Fresh organic bananas",
    price: 1.29,
    cost: 0.65,
    stock: 150,
    category: "Fresh Produce",
    barcode: "4444555566667",
    isActive: true,
    createdAt: "2024-01-08T00:00:00.000Z",
    updatedAt: "2024-01-22T12:15:00.000Z"
  },
  {
    id: "9",
    name: "Paper Towels (6-pack)",
    description: "Ultra-absorbent paper towels",
    price: 12.99,
    cost: 7.20,
    stock: 28,
    category: "Household Items",
    barcode: "5555666677778",
    isActive: true,
    createdAt: "2024-01-09T00:00:00.000Z",
    updatedAt: "2024-01-23T09:30:00.000Z"
  },
  {
    id: "10",
    name: "Shampoo & Conditioner Set",
    description: "Moisturizing hair care set",
    price: 15.99,
    cost: 8.90,
    stock: 22,
    category: "Personal Care",
    barcode: "6666777788889",
    isActive: true,
    createdAt: "2024-01-10T00:00:00.000Z",
    updatedAt: "2024-01-24T14:20:00.000Z"
  }
];

export class ProductService {
  private static instance: ProductService;

  static getInstance(): ProductService {
    if (!ProductService.instance) {
      ProductService.instance = new ProductService();
    }
    return ProductService.instance;
  }

  async getProducts(): Promise<Product[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...mockProducts];
  }

  async getProduct(id: string): Promise<Product | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockProducts.find(p => p.id === id) || null;
  }

  async createProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; product?: Product; error?: string }> {
    await new Promise(resolve => setTimeout(resolve, 800));

    if (!productData.name.trim()) {
      return { success: false, error: "Product name is required" };
    }

    if (productData.price <= 0) {
      return { success: false, error: "Price must be greater than 0" };
    }

    if (productData.cost < 0) {
      return { success: false, error: "Cost cannot be negative" };
    }

    if (productData.stock < 0) {
      return { success: false, error: "Stock cannot be negative" };
    }

    if (productData.barcode && mockProducts.find(p => p.barcode === productData.barcode)) {
      return { success: false, error: "Product with this barcode already exists" };
    }

    const newProduct: Product = {
      ...productData,
      id: (mockProducts.length + 1).toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    mockProducts.push(newProduct);
    return { success: true, product: newProduct };
  }

  async updateProduct(id: string, updates: Partial<Omit<Product, 'id' | 'createdAt'>>): Promise<{ success: boolean; product?: Product; error?: string }> {
    await new Promise(resolve => setTimeout(resolve, 700));

    const productIndex = mockProducts.findIndex(p => p.id === id);
    if (productIndex === -1) {
      return { success: false, error: "Product not found" };
    }

    if (updates.name !== undefined && !updates.name.trim()) {
      return { success: false, error: "Product name is required" };
    }

    if (updates.price !== undefined && updates.price <= 0) {
      return { success: false, error: "Price must be greater than 0" };
    }

    if (updates.cost !== undefined && updates.cost < 0) {
      return { success: false, error: "Cost cannot be negative" };
    }

    if (updates.stock !== undefined && updates.stock < 0) {
      return { success: false, error: "Stock cannot be negative" };
    }

    if (updates.barcode) {
      const existingProduct = mockProducts.find(p => p.id !== id && p.barcode === updates.barcode);
      if (existingProduct) {
        return { success: false, error: "Product with this barcode already exists" };
      }
    }

    mockProducts[productIndex] = {
      ...mockProducts[productIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    return { success: true, product: mockProducts[productIndex] };
  }

  async deleteProduct(id: string): Promise<{ success: boolean; error?: string }> {
    await new Promise(resolve => setTimeout(resolve, 600));

    const productIndex = mockProducts.findIndex(p => p.id === id);
    if (productIndex === -1) {
      return { success: false, error: "Product not found" };
    }

    mockProducts.splice(productIndex, 1);
    return { success: true };
  }

  async getCategories(): Promise<string[]> {
    const categories = Array.from(new Set(mockProducts.map(p => p.category)));
    return categories.sort();
  }
}

export const productService = ProductService.getInstance();