import { useEffect, useState } from 'preact/hooks'
import { Container } from '../components/ui'
import { dashboardService } from '../services/dashboard-sqlite'

interface DashboardProps {
  onNavigate?: (page: string) => void
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [stats, setStats] = useState({
    totalSales: 0,
    ordersToday: 0,
    averageOrderValue: 0,
    lowStockProducts: 0,
    pendingOrders: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)
      const dashboardStats = await dashboardService.getDashboardStats()
      setStats(dashboardStats)
      setError('')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load dashboard data'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`
  }

  if (isLoading) {
    return (
      <Container size="xl">
        <div class="mb-6">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p class="text-gray-600">Loading your business overview...</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              class="backdrop-blur-md bg-white/70 rounded-xl shadow-lg border border-white/40 p-6 animate-pulse"
            >
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <div class="h-4 bg-gray-300/50 rounded-lg w-20 mb-3"></div>
                  <div class="h-8 bg-gray-300/50 rounded-lg w-16"></div>
                </div>
                <div class="w-12 h-12 bg-gray-300/50 rounded-full"></div>
              </div>
            </div>
          ))}
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div
              key={i}
              class="backdrop-blur-md bg-white/70 rounded-xl shadow-lg border border-white/40 p-6 animate-pulse"
            >
              <div class="flex items-center justify-between mb-4">
                <div class="h-4 bg-gray-300/50 rounded-lg w-24"></div>
                <div class="w-8 h-8 bg-gray-300/50 rounded-full"></div>
              </div>
              <div class="h-8 bg-gray-300/50 rounded-lg w-20"></div>
            </div>
          ))}
        </div>
      </Container>
    )
  }

  if (error) {
    return (
      <Container size="xl">
        <div class="mb-6">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p class="text-gray-600">Unable to load dashboard data</p>
        </div>

        <div class="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl backdrop-blur-sm">
          <div class="flex items-center">
            <span class="text-red-500 mr-3 text-xl">⚠️</span>
            <div>
              <h3 class="font-semibold">Dashboard Error</h3>
              <p class="text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      </Container>
    )
  }

  return (
    <Container size="xl">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p class="text-gray-600">Welcome back! Here's what's happening with your business today.</p>
      </div>

      {error && (
        <div class="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6 backdrop-blur-sm">
          <div class="flex items-center">
            <span class="text-red-500 mr-3 text-xl">⚠️</span>
            <div>
              <h3 class="font-semibold">Dashboard Error</h3>
              <p class="text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Stats Cards */}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div
          class="group backdrop-blur-md bg-gradient-to-br from-emerald-100/80 to-green-100/60 rounded-2xl shadow-xl border border-emerald-200/50 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer"
          onClick={() => onNavigate?.('orders')}
        >
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <p class="text-sm font-semibold text-emerald-700 uppercase tracking-wide mb-2">Daily Sales</p>
              <p class="text-3xl font-bold text-gray-900 drop-shadow-sm">{formatCurrency(stats.totalSales)}</p>
              <p class="text-xs text-emerald-600 mt-1">Completed & Paid</p>
            </div>
            <div class="text-4xl opacity-80 group-hover:scale-110 transition-transform">💰</div>
          </div>
        </div>

        <div
          class="group backdrop-blur-md bg-gradient-to-br from-blue-100/80 to-indigo-100/60 rounded-2xl shadow-xl border border-blue-200/50 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer"
          onClick={() => onNavigate?.('orders')}
        >
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <p class="text-sm font-semibold text-blue-700 uppercase tracking-wide mb-2">Orders</p>
              <p class="text-3xl font-bold text-gray-900 drop-shadow-sm">{stats.ordersToday}</p>
              <p class="text-xs text-blue-600 mt-1">Total Orders</p>
            </div>
            <div class="text-4xl opacity-80 group-hover:scale-110 transition-transform">📦</div>
          </div>
        </div>

        <div
          class="group backdrop-blur-md bg-gradient-to-br from-purple-100/80 to-pink-100/60 rounded-2xl shadow-xl border border-purple-200/50 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer"
          onClick={() => onNavigate?.('orders')}
        >
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <p class="text-sm font-semibold text-purple-700 uppercase tracking-wide mb-2">Avg Order Value</p>
              <p class="text-3xl font-bold text-gray-900 drop-shadow-sm">{formatCurrency(stats.averageOrderValue)}</p>
              <p class="text-xs text-purple-600 mt-1">Per Order</p>
            </div>
            <div class="text-4xl opacity-80 group-hover:scale-110 transition-transform">📊</div>
          </div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          class="group backdrop-blur-md bg-gradient-to-br from-amber-100/80 to-orange-100/60 rounded-2xl shadow-xl border border-amber-200/50 p-6 hover:shadow-2xl transition-all duration-300 cursor-pointer"
          onClick={() => onNavigate?.('products')}
        >
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center">
              <div class="text-3xl mr-3 group-hover:scale-110 transition-transform">⚠️</div>
              <p class="text-sm font-semibold text-amber-700 uppercase tracking-wide">Low Stock Alert</p>
            </div>
          </div>
          <p class="text-2xl font-bold text-gray-900 drop-shadow-sm">{stats.lowStockProducts}</p>
          <p class="text-xs text-amber-600 mt-2">Products need restocking</p>
        </div>

        <div
          class="group backdrop-blur-md bg-gradient-to-br from-rose-100/80 to-red-100/60 rounded-2xl shadow-xl border border-rose-200/50 p-6 hover:shadow-2xl transition-all duration-300 cursor-pointer"
          onClick={() => onNavigate?.('orders')}
        >
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center">
              <div class="text-3xl mr-3 group-hover:scale-110 transition-transform">⏳</div>
              <p class="text-sm font-semibold text-rose-700 uppercase tracking-wide">Pending Orders</p>
            </div>
          </div>
          <p class="text-2xl font-bold text-gray-900 drop-shadow-sm">{stats.pendingOrders}</p>
          <p class="text-xs text-rose-600 mt-2">Awaiting processing</p>
        </div>
      </div>
    </Container>
  )
}
