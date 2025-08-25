import { useState, useEffect } from "preact/hooks";
import { dashboardService } from "../services/dashboard";
import { Container, Heading, Text } from "../components/ui";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalSales: 0,
    ordersToday: 0,
    totalCustomers: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    lowStockProducts: 0,
    pendingOrders: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const dashboardStats = await dashboardService.getDashboardStats();
      setStats(dashboardStats);
      setError("");
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  if (isLoading) {
    return (
      <Container size="xl">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} class="bg-white rounded-lg shadow p-6">
              <div class="flex items-center justify-between">
                <div>
                  <div class="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                  <div class="h-8 bg-gray-200 rounded w-16"></div>
                </div>
                <div class="h-8 w-8 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container size="xl">
        <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      </Container>
    );
  }

  return (
    <Container size="xl">
      <div class="mb-6">
        <Heading level={3}>Dashboard</Heading>
        <Text>Overview of your store performance</Text>
      </div>

      {error && (
        <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Total Sales</p>
              <p class="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalSales)}</p>
            </div>
            <div class="text-3xl">💰</div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Orders Today</p>
              <p class="text-2xl font-bold text-gray-900">{stats.ordersToday}</p>
            </div>
            <div class="text-3xl">📦</div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Customers</p>
              <p class="text-2xl font-bold text-gray-900">{stats.totalCustomers}</p>
            </div>
            <div class="text-3xl">👥</div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Revenue</p>
              <p class="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
            </div>
            <div class="text-3xl">📈</div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between mb-4">
            <p class="text-sm font-medium text-gray-600">Average Order Value</p>
            <div class="text-2xl">📊</div>
          </div>
          <p class="text-2xl font-bold text-gray-900">{formatCurrency(stats.averageOrderValue)}</p>
        </div>
        
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between mb-4">
            <p class="text-sm font-medium text-gray-600">Low Stock Products</p>
            <div class="text-2xl">⚠️</div>
          </div>
          <p class="text-2xl font-bold text-gray-900">{stats.lowStockProducts}</p>
        </div>
        
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between mb-4">
            <p class="text-sm font-medium text-gray-600">Pending Orders</p>
            <div class="text-2xl">⏳</div>
          </div>
          <p class="text-2xl font-bold text-gray-900">{stats.pendingOrders}</p>
        </div>
      </div>
    </Container>
  );
}