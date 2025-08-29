import { useEffect, useState } from 'preact/hooks'
import {
  Button,
  Container,
  Dialog,
  DialogBody,
  DialogConfirm,
  DialogFooter,
  Dropdown,
  type DropdownItem,
  Heading,
  Input,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Text,
} from '../components/ui'
import { type Order, orderService } from '../services/orders-sqlite'
import { type Product, productService } from '../services/products-sqlite'
import { companySettingsService } from '../services/company-settings-sqlite'
import { userService } from '../services/users-sqlite'

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [allOrders, setAllOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<Order['status'] | 'all'>('all')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'total' | 'status'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const [taxRate, setTaxRate] = useState<number>(0.1)
  const [taxEnabled, setTaxEnabled] = useState<boolean>(true)
  const [currencySymbol, setCurrencySymbol] = useState<string>('$')
  const [productSearch, setProductSearch] = useState('')
  const [editProductSearch, setEditProductSearch] = useState('')
  const [users, setUsers] = useState<{ [key: string]: string }>({}) // userId -> userName mapping

  const [newOrder, setNewOrder] = useState({
    items: [] as Array<{ productId: string; quantity: number }>,
    paymentMethod: 'cash' as 'cash' | 'card' | 'transfer',
    notes: '',
  })

  const [editOrderItems, setEditOrderItems] = useState<Array<{ productId: string; quantity: number }>>([])
  const [editPaymentMethod, setEditPaymentMethod] = useState<'cash' | 'card' | 'transfer'>('cash')
  const [editNotes, setEditNotes] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [ordersData, productsData, settings, usersData] = await Promise.all([
        orderService.getOrders(),
        productService.getProducts(),
        companySettingsService.getSettings(),
        userService.getUsers()
      ])
      setAllOrders(ordersData)
      setOrders(ordersData)
      setProducts(productsData.filter((p) => p.isActive && p.stock > 0))
      setTaxEnabled(settings.taxEnabled)
      setTaxRate(settings.taxEnabled ? settings.taxPercentage / 100 : 0)
      setCurrencySymbol(settings.currencySymbol)

      // Create user mapping
      const userMapping: { [key: string]: string } = {}
      usersData.forEach(user => {
        userMapping[user.id] = user.name
      })
      setUsers(userMapping)

      setError('')
    } catch (err: unknown) {
      setError((err as Error)?.message || 'Failed to load data')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredOrders = (() => {
    let filtered = selectedStatus === 'all' ? orders : orders.filter((order) => order.status === selectedStatus)

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (order) =>
          order.id.includes(query) ||
          order.items.some((item) => item.productName.toLowerCase().includes(query)) ||
          order.total.toString().includes(query),
      )
    }

    // Sort orders
    filtered = filtered.sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case 'date':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
        case 'total':
          comparison = a.total - b.total
          break
        case 'status':
          comparison = a.status.localeCompare(b.status)
          break
      }

      return sortOrder === 'asc' ? comparison : -comparison
    })

    return filtered
  })()

  const filteredProducts = (() => {
    if (!productSearch.trim()) {
      return products
    }

    const query = productSearch.toLowerCase()
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.price.toString().includes(query)
    )
  })()

  const filteredEditProducts = (() => {
    if (!editProductSearch.trim()) {
      return products
    }

    const query = editProductSearch.toLowerCase()
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.price.toString().includes(query)
    )
  })()

  const handleCreateOrder = async () => {
    if (newOrder.items.length === 0) {
      setError('Please add at least one item to the order')
      return
    }

    try {
      setIsLoading(true)
      const result = await orderService.createOrder(newOrder)

      if (result.success && result.order) {
        const newOrdersList = [...allOrders, result.order]
        setAllOrders(newOrdersList)
        setOrders(newOrdersList)
        setIsCreateModalOpen(false)
        setNewOrder({
          items: [],
          paymentMethod: 'cash',
          notes: '',
        })

        // Reload products to update stock levels
        const updatedProducts = await productService.getProducts()
        setProducts(updatedProducts.filter((p) => p.isActive && p.stock > 0))

        setError('')
      } else {
        setError(result.error || 'Failed to create order')
      }
    } catch (_err) {
      setError('Failed to create order')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateStatus = async (orderId: string, status: Order['status']) => {
    try {
      const result = await orderService.updateOrderStatus(orderId, status)
      if (result.success && result.order) {
        const updatedOrder = result.order
        const updatedAllOrders = allOrders.map((o) => (o.id === orderId ? updatedOrder : o))
        setAllOrders(updatedAllOrders)
        setOrders(updatedAllOrders)

        // Reload products to update stock levels if status affects inventory
        if (status === 'completed' || status === 'paid' || status === 'cancelled') {
          const updatedProducts = await productService.getProducts()
          setProducts(updatedProducts.filter((p) => p.isActive && p.stock > 0))
        }
      } else {
        setError(result.error || 'Failed to update order status')
      }
    } catch (_err) {
      setError('Failed to update order status')
    }
  }

  const handleDeleteOrder = async (orderId: string) => {
    try {
      const result = await orderService.deleteOrder(orderId)
      if (result.success) {
        const filteredAllOrders = allOrders.filter((o) => o.id !== orderId)
        setAllOrders(filteredAllOrders)
        setOrders(filteredAllOrders)
        setDeleteConfirm(null)

        // Reload products to update stock levels
        const updatedProducts = await productService.getProducts()
        setProducts(updatedProducts.filter((p) => p.isActive && p.stock > 0))
      } else {
        setError(result.error || 'Failed to delete order')
      }
    } catch (_err) {
      setError('Failed to delete order')
    }
  }

  const addItemToOrder = (productId: string, quantity: number = 1) => {
    const existingItem = newOrder.items.find((item) => item.productId === productId)

    if (existingItem) {
      setNewOrder({
        ...newOrder,
        items: newOrder.items.map((item) =>
          item.productId === productId ? { ...item, quantity: item.quantity + quantity } : item,
        ),
      })
    } else {
      setNewOrder({
        ...newOrder,
        items: [...newOrder.items, { productId, quantity }],
      })
    }
  }

  const removeItemFromOrder = (productId: string) => {
    setNewOrder({
      ...newOrder,
      items: newOrder.items.filter((item) => item.productId !== productId),
    })
  }

  const handleEditOrder = (order: Order) => {
    setEditingOrder(order)
    setEditOrderItems(order.items.map(item => ({ productId: item.productId, quantity: item.quantity })))
    setEditPaymentMethod(order.paymentMethod || 'cash')
    setEditNotes(order.notes || '')
    setEditProductSearch('')
  }

  const handleUpdateOrder = async () => {
    if (!editingOrder || editOrderItems.length === 0) {
      setError('Please add at least one item to the order')
      return
    }

    try {
      setIsLoading(true)
      const result = await orderService.updateOrder(editingOrder.id, {
        items: editOrderItems,
        paymentMethod: editPaymentMethod,
        notes: editNotes
      })

      if (result.success && result.order) {
        const updatedAllOrders = allOrders.map((o) => (o.id === editingOrder.id ? result.order! : o))
        setAllOrders(updatedAllOrders)
        setOrders(updatedAllOrders)
        setEditingOrder(null)
        setEditOrderItems([])
        setEditPaymentMethod('cash')
        setEditNotes('')
        setError('')
      } else {
        setError(result.error || 'Failed to update order')
      }
    } catch (_err) {
      setError('Failed to update order')
    } finally {
      setIsLoading(false)
    }
  }

  const addItemToEditOrder = (productId: string, quantity: number = 1) => {
    const existingItem = editOrderItems.find((item) => item.productId === productId)
    const originalItem = editingOrder?.items.find((item) => item.productId === productId)

    if (existingItem) {
      // Only allow increasing quantities, not decreasing below original amount
      const newQuantity = Math.max(
        existingItem.quantity + quantity,
        originalItem?.quantity || 1
      )

      setEditOrderItems(
        editOrderItems.map((item) =>
          item.productId === productId ? { ...item, quantity: newQuantity } : item,
        )
      )
    } else {
      setEditOrderItems([...editOrderItems, { productId, quantity }])
    }
  }

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border border-yellow-300 shadow-sm'
      case 'paid':
        return 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300 shadow-sm'
      case 'completed':
        return 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300 shadow-sm'
      case 'cancelled':
        return 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-300 shadow-sm'
      default:
        return 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300 shadow-sm'
    }
  }

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return '⏳'
      case 'paid':
        return '💳'
      case 'completed':
        return '✅'
      case 'cancelled':
        return '❌'
      default:
        return '❓'
    }
  }

  const formatCurrency = (amount: number) => {
    return `${currencySymbol}${amount.toFixed(2)}`
  }

  const handleSort = (column: 'date' | 'total' | 'status') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('desc')
    }
  }

  const getSortIcon = (column: 'date' | 'total' | 'status') => {
    if (sortBy !== column) return '⇅'
    return sortOrder === 'asc' ? '↑' : '↓'
  }

  const getOrderActionItems = (order: Order): DropdownItem[] => {
    const items: DropdownItem[] = [
      {
        id: `view-${order.id}`,
        label: 'View Details',
        icon: '👁️',
        onClick: () => setSelectedOrder(order),
      },
    ]

    if (order.status === 'pending') {
      items.push(
        {
          id: `edit-${order.id}`,
          label: 'Update Order',
          icon: '✏️',
          onClick: () => handleEditOrder(order),
        },
        {
          id: `pay-${order.id}`,
          label: 'Mark as Paid',
          icon: '💰',
          onClick: () => handleUpdateStatus(order.id, 'paid'),
        },
        {
          id: `cancel-${order.id}`,
          label: 'Cancel Order',
          icon: '❌',
          onClick: () => handleUpdateStatus(order.id, 'cancelled'),
          variant: 'danger',
        }
      )
    }

    if (order.status === 'paid') {
      items.push({
        id: `complete-${order.id}`,
        label: 'Mark Complete',
        icon: '✅',
        onClick: () => handleUpdateStatus(order.id, 'completed'),
      })
    }

    items.push(
      {
        id: `separator-${order.id}`,
        label: '',
        icon: '',
        onClick: () => { },
        separator: true,
      },
      {
        id: `delete-${order.id}`,
        label: 'Delete Order',
        icon: '🗑️',
        onClick: () => setDeleteConfirm(order.id),
        variant: 'danger',
      }
    )

    return items
  }

  if (isLoading) {
    return (
      <div class="bg-white rounded-lg shadow p-6">
        <div class="text-center py-8">
          <div class="w-8 h-8 bg-blue-600 rounded-full animate-spin border-2 border-transparent border-t-white mx-auto mb-4"></div>
          <p class="text-gray-600">Loading orders...</p>
        </div>
      </div>
    )
  }

  return (
    <Container size="xl">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 mb-2">Orders</h1>
          <p class="text-gray-600">
            {allOrders.length} {allOrders.length === 1 ? 'order' : 'orders'} total
            {searchQuery && ` • ${filteredOrders.length} found`}
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <span class="mr-2">➕</span>
          Create Order
        </Button>
      </div>

      {error && <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      <div class="mb-6 space-y-4">
        <div class="flex gap-4">
          <div class="flex-1">
            <Input
              type="search"
              placeholder="Search orders by ID, customer name, items, or total..."
              value={searchQuery}
              onInput={(e) => setSearchQuery((e.target as HTMLInputElement).value)}
              onChange={(e) => setSearchQuery((e.target as HTMLInputElement).value)}
              leftIcon={
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
              rightIcon={
                searchQuery ? (
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : undefined
              }
              onRightIconClick={searchQuery ? () => setSearchQuery('') : undefined}
              class="bg-white text-gray-900 placeholder-gray-500"
            />
          </div>
          <div class="w-auto">
            <Select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus((e.target as HTMLSelectElement).value as Order['status'] | 'all')}
              options={[
                { value: 'all', label: 'All Orders' },
                { value: 'pending', label: 'Pending' },
                { value: 'paid', label: 'Paid' },
                { value: 'completed', label: 'Completed' },
                { value: 'cancelled', label: 'Cancelled' },
              ]}
              class="w-auto min-w-0"
            />
          </div>
          <div class="flex items-center text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg w-auto">
            <span class="mr-2">Sort by:</span>
            <span class="font-medium capitalize">{sortBy}</span>
            <span class="ml-1">{getSortIcon(sortBy)}</span>
          </div>
        </div>

        {/* Order Statistics */}
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 hover:shadow-md transition-shadow">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-3xl font-bold text-blue-600">
                  {allOrders.filter((o) => o.status === 'pending').length}
                </div>
                <div class="text-sm font-medium text-blue-700">Pending Orders</div>
              </div>
              <div class="text-blue-400 text-2xl">⏳</div>
            </div>
          </div>
          <div class="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200 hover:shadow-md transition-shadow">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-3xl font-bold text-green-600">
                  {allOrders.filter((o) => o.status === 'completed').length}
                </div>
                <div class="text-sm font-medium text-green-700">Completed</div>
              </div>
              <div class="text-green-400 text-2xl">✅</div>
            </div>
          </div>
          <div class="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200 hover:shadow-md transition-shadow">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-3xl font-bold text-purple-600">
                  {allOrders.filter((o) => o.status === 'paid').length}
                </div>
                <div class="text-sm font-medium text-purple-700">Paid Orders</div>
              </div>
              <div class="text-purple-400 text-2xl">💳</div>
            </div>
          </div>
          <div class="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl border border-red-200 hover:shadow-md transition-shadow">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-3xl font-bold text-red-600">
                  {allOrders.filter((o) => o.status === 'cancelled').length}
                </div>
                <div class="text-sm font-medium text-red-700">Cancelled</div>
              </div>
              <div class="text-red-400 text-2xl">❌</div>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <Table>
          <TableHead>
            <TableRow class="bg-gray-50">
              <TableHeader class="font-semibold text-gray-900">Order</TableHeader>
              <TableHeader class="font-semibold text-gray-900">Items</TableHeader>
              <TableHeader class="font-semibold text-gray-900">Payment</TableHeader>
              <TableHeader
                class="font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 select-none"
                onClick={() => handleSort('total')}
              >
                Total {getSortIcon('total')}
              </TableHeader>
              <TableHeader
                class="font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 select-none"
                onClick={() => handleSort('status')}
              >
                Status {getSortIcon('status')}
              </TableHeader>
              <TableHeader
                class="font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 select-none"
                onClick={() => handleSort('date')}
              >
                Date {getSortIcon('date')}
              </TableHeader>
              <TableHeader class="font-semibold text-gray-900">Actions</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredOrders.map((order, index) => (
              <TableRow
                key={order.id}
                class="hover:bg-gray-50 transition-all duration-200 hover:shadow-sm cursor-pointer"
                style={`animation-delay: ${index * 50}ms`}
                onClick={() => setSelectedOrder(order)}
              >
                <TableCell>
                  <Text>
                    #{order.id}
                  </Text>
                </TableCell>
                <TableCell>
                  <div class="max-w-xs">
                    <div class="text-sm font-medium text-gray-900 mb-1">
                      {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                    </div>
                    <div class="space-y-1">
                      {order.items.slice(0, 2).map((item) => (
                        <div key={item.productId} class="flex justify-between text-xs text-gray-600">
                          <span class="truncate mr-2">{item.productName}</span>
                          <span class="flex-shrink-0 font-medium">×{item.quantity}</span>
                        </div>
                      ))}
                      {order.items.length > 2 && (
                        <div class="text-xs text-gray-500">+{order.items.length - 2} more...</div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {order.paymentMethod && (
                    <div class="flex items-center">
                      <span class="text-lg mr-2">
                        {order.paymentMethod === 'cash' ? '💵' : order.paymentMethod === 'card' ? '💳' : '🔄'}
                      </span>
                      <span class="text-sm font-medium text-gray-700 capitalize">{order.paymentMethod}</span>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div class="text-right">
                    <div class="text-lg font-bold text-gray-900">
                      {formatCurrency(taxEnabled ? order.total : order.subtotal)}
                    </div>
                    {taxEnabled && order.tax > 0 && (
                      <div class="text-xs text-gray-500">
                        Tax: {formatCurrency(order.tax)}
                      </div>
                    )}
                    {taxEnabled && order.tax === 0 && (
                      <div class="text-xs text-gray-400 italic">
                        No tax applied
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div
                    class={`inline-flex items-center px-3 py-2 rounded-full text-xs font-semibold uppercase tracking-wide ${getStatusColor(order.status)} transition-all hover:scale-105`}
                  >
                    <span class="mr-1 text-sm">{getStatusIcon(order.status)}</span>
                    {order.status}
                  </div>
                </TableCell>
                <TableCell>
                  <div class="text-sm text-gray-600">
                    <div>{new Date(order.createdAt).toLocaleDateString()}</div>
                    <div class="text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div onClick={(e) => e.stopPropagation()}>
                    <Dropdown
                      trigger={
                        <Button
                          size="sm"
                          variant="outline"
                          class="text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all hover:shadow-md"
                        >
                          ⚙️ Actions
                        </Button>
                      }
                      items={getOrderActionItems(order)}
                      align="right"
                      width="w-48"
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredOrders.length === 0 && (
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
          <div class="text-center">
            <div class="text-6xl mb-6">
              {searchQuery
                ? '🔍'
                : selectedStatus === 'all'
                  ? '📋'
                  : selectedStatus === 'pending'
                    ? '⏳'
                    : selectedStatus === 'completed'
                      ? '✅'
                      : selectedStatus === 'paid'
                        ? '💳'
                        : '❌'}
            </div>
            <Heading level={3} class="mb-3 text-gray-900">
              {searchQuery
                ? 'No matching orders found'
                : selectedStatus === 'all'
                  ? 'No orders yet'
                  : `No ${selectedStatus} orders`}
            </Heading>
            <Text class="text-gray-600 mb-6 max-w-md mx-auto">
              {searchQuery
                ? `We couldn't find any orders matching "${searchQuery}". Try adjusting your search terms.`
                : selectedStatus === 'all'
                  ? 'Get started by creating your first order. Orders will appear here once created.'
                  : `There are currently no orders with the status "${selectedStatus}".`}
            </Text>
            {!searchQuery && selectedStatus === 'all' && (
              <Button onClick={() => setIsCreateModalOpen(true)} class="mt-4">
                <span class="mr-2">➕</span>
                Create Your First Order
              </Button>
            )}
          </div>
        </div>
      )}

      {/*  Create Order Modal */}
      <Dialog isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create New Order" size="full">
        <DialogBody>
          <div class="space-y-6">
            {/* Available Products */}
            <div>
              <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                <div>
                  <h3 class="text-lg font-semibold text-gray-900">Available Products</h3>
                  <p class="text-sm text-gray-600 mt-1">Click on any product card to add it to your order</p>
                </div>
                <div class="flex items-center gap-3">
                  <div class="w-64">
                    <Input
                      type="search"
                      placeholder="Search products..."
                      value={productSearch}
                      onInput={(e) => setProductSearch((e.target as HTMLInputElement).value)}
                      leftIcon={
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                        </svg>
                      }
                      rightIcon={
                        productSearch ? (
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        ) : undefined
                      }
                      onRightIconClick={productSearch ? () => setProductSearch('') : undefined}
                      class="text-sm"
                    />
                  </div>
                  <div class="text-sm text-gray-500">
                    {filteredProducts.length} of {products.length} products
                  </div>
                </div>
              </div>
              <div class="max-h-96 overflow-y-auto backdrop-blur-lg bg-gradient-to-br from-white/20 to-white/10 border border-white/30 rounded-2xl p-6 shadow-2xl">
                {filteredProducts.length === 0 ? (
                  <div class="text-center py-12">
                    <div class="text-6xl mb-4">🔍</div>
                    <h3 class="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                    <p class="text-gray-500">
                      {productSearch ? `No products match "${productSearch}"` : 'No products available'}
                    </p>
                    {productSearch && (
                      <button
                        type="button"
                        onClick={() => setProductSearch('')}
                        class="mt-4 text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Clear search
                      </button>
                    )}
                  </div>
                ) : (
                  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                    {filteredProducts.map((product) => (
                      <div
                        key={product.id}
                        onClick={() => product.stock > 0 && addItemToOrder(product.id)}
                        class="group relative backdrop-blur-md bg-white/70 border border-white/40 rounded-xl p-4 hover:bg-white/80 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                      >
                        {/* Glass highlight overlay */}
                        <div class="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent rounded-xl opacity-60 pointer-events-none"></div>

                        <div class="relative flex justify-between items-start">
                          <div class="flex-1">
                            <div class="font-semibold text-gray-900 mb-1 drop-shadow-sm">{product.name}</div>
                            <div class="text-sm text-gray-700 mb-3 font-medium backdrop-blur-sm bg-white/40 px-2 py-1 rounded-full w-fit">
                              {product.category}
                            </div>
                            <div class="flex items-center justify-between">
                              <div class="text-xl font-bold text-emerald-600 drop-shadow-md">
                                {formatCurrency(product.price)}
                              </div>
                              <div
                                class={`text-sm px-3 py-1.5 rounded-full font-semibold backdrop-blur-sm border transition-all ${product.stock > 10
                                  ? 'bg-emerald-100/80 text-emerald-800 border-emerald-200/50 shadow-emerald-100/50'
                                  : product.stock > 0
                                    ? 'bg-amber-100/80 text-amber-800 border-amber-200/50 shadow-amber-100/50'
                                    : 'bg-red-100/80 text-red-800 border-red-200/50 shadow-red-100/50'
                                  } shadow-lg`}
                              >
                                📦 {product.stock}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Order Items */}
            {newOrder.items.length > 0 && (
              <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
                <div class="backdrop-blur-lg bg-gradient-to-br from-blue-100/60 to-indigo-100/40 border border-blue-200/50 rounded-2xl p-6 space-y-4 shadow-xl">
                  {newOrder.items.map((item) => {
                    const product = products.find((p) => p.id === item.productId)
                    return product ? (
                      <div
                        key={item.productId}
                        class="relative flex justify-between items-center backdrop-blur-md bg-white/80 border border-white/50 rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        {/* Glass highlight overlay */}
                        <div class="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent rounded-xl opacity-70 pointer-events-none"></div>

                        <div class="relative flex-1">
                          <div class="font-semibold text-gray-900 mb-2 drop-shadow-sm">{product.name}</div>
                          <div class="text-sm text-gray-700 backdrop-blur-sm bg-white/60 px-3 py-1 rounded-full w-fit">
                            {formatCurrency(product.price)} × {item.quantity} ={' '}
                            <span class="font-bold text-emerald-600">
                              {formatCurrency(product.price * item.quantity)}
                            </span>
                          </div>
                        </div>
                        <div class="relative flex items-center space-x-3">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              if (item.quantity > 1) {
                                addItemToOrder(item.productId, -1)
                              } else {
                                removeItemFromOrder(item.productId)
                              }
                            }}
                            class="w-10 h-10 p-0 flex items-center justify-center backdrop-blur-sm bg-white/70 border-white/60 hover:bg-white/90 hover:shadow-lg transition-all duration-200 hover:scale-110"
                          >
                            <span class="drop-shadow-sm">➖</span>
                          </Button>
                          <div class="w-14 text-center font-bold text-xl backdrop-blur-sm bg-gradient-to-r from-indigo-100/80 to-blue-100/80 px-3 py-2 rounded-lg border border-white/40 shadow-md">
                            {item.quantity}
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => addItemToOrder(item.productId, 1)}
                            disabled={item.quantity >= product.stock}
                            class="w-10 h-10 p-0 flex items-center justify-center backdrop-blur-sm bg-white/70 border-white/60 hover:bg-white/90 hover:shadow-lg transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:hover:scale-100"
                          >
                            <span class="drop-shadow-sm">➕</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeItemFromOrder(item.productId)}
                            class="backdrop-blur-sm bg-red-100/70 text-red-700 border-red-200/60 hover:bg-red-200/80 hover:shadow-lg transition-all duration-200 hover:scale-110 ml-2"
                          >
                            <span class="drop-shadow-sm">🗑️</span>
                          </Button>
                        </div>
                      </div>
                    ) : null
                  })}

                  {/* Order Totals */}
                  <div class="border-t border-white/40 pt-4 mt-6">
                    {(() => {
                      const subtotal = newOrder.items.reduce((total, item) => {
                        const product = products.find((p) => p.id === item.productId)
                        return total + (product ? product.price * item.quantity : 0)
                      }, 0)
                      const tax = taxEnabled ? subtotal * taxRate : 0
                      const total = subtotal + tax

                      return (
                        <div class={`backdrop-blur-md rounded-xl p-5 border shadow-lg ${taxEnabled
                          ? 'bg-white/60 border-white/50'
                          : 'bg-gray-50/60 border-gray-200/50'
                          }`}>
                          <div class="space-y-3">
                            <div class="flex justify-between text-gray-700 text-lg">
                              <span class="font-medium">Subtotal:</span>
                              <span class="font-semibold drop-shadow-sm">{formatCurrency(subtotal)}</span>
                            </div>
                            {taxEnabled && (
                              <div class="flex justify-between text-gray-700 text-lg">
                                <span class="font-medium">Tax ({(taxRate * 100).toFixed(1)}%):</span>
                                <span class="font-semibold drop-shadow-sm">{formatCurrency(tax)}</span>
                              </div>
                            )}
                            {!taxEnabled && (
                              <div class="text-sm text-gray-500 italic text-center py-2">
                                Tax calculation is disabled in settings
                              </div>
                            )}
                            <div class="border-t border-white/40 pt-3">
                              <div class="flex justify-between text-2xl font-bold text-gray-900 backdrop-blur-sm bg-gradient-to-r from-emerald-100/60 to-green-100/40 px-4 py-3 rounded-lg border border-emerald-200/50 shadow-md">
                                <span class="drop-shadow-sm">Total:</span>
                                <span class="drop-shadow-sm text-emerald-700">{formatCurrency(total)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                </div>
              </div>
            )}

            {/* Payment & Notes */}
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Select
                  label="Payment Method"
                  value={newOrder.paymentMethod}
                  onChange={(e) =>
                    setNewOrder({
                      ...newOrder,
                      paymentMethod: (e.target as HTMLSelectElement).value as 'cash' | 'card' | 'transfer',
                    })
                  }
                  options={[
                    { value: 'cash', label: '💵 Cash' },
                    { value: 'card', label: '💳 Card' },
                    { value: 'transfer', label: '🔄 Transfer' },
                  ]}
                />
              </div>
              <div>
                <Input
                  label="Order Notes"
                  value={newOrder.notes}
                  onInput={(e) =>
                    setNewOrder({
                      ...newOrder,
                      notes: (e.target as HTMLInputElement).value,
                    })
                  }
                  placeholder="Optional notes..."
                />
              </div>
            </div>
          </div>
        </DialogBody>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="button" onClick={handleCreateOrder} disabled={isLoading || newOrder.items.length === 0}>
            {isLoading ? 'Creating...' : 'Create Order'}
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Edit Order Modal */}
      <Dialog
        isOpen={!!editingOrder}
        onClose={() => {
          setEditingOrder(null)
          setEditOrderItems([])
          setEditPaymentMethod('cash')
          setEditNotes('')
          setEditProductSearch('')
        }}
        title={`Update Order #${editingOrder?.id}`}
        size="full"
      >
        <DialogBody>
          <div class="space-y-6">
            {/* Available Products for Editing */}
            <div>
              <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                <div>
                  <h3 class="text-lg font-semibold text-gray-900">Available Products</h3>
                  <p class="text-sm text-gray-600 mt-1">Click on any product card to add it to your order</p>
                </div>
                <div class="flex items-center gap-3">
                  <div class="w-64">
                    <Input
                      type="search"
                      placeholder="Search products..."
                      value={editProductSearch}
                      onInput={(e) => setEditProductSearch((e.target as HTMLInputElement).value)}
                      leftIcon={
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                        </svg>
                      }
                      rightIcon={
                        editProductSearch ? (
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        ) : undefined
                      }
                      onRightIconClick={editProductSearch ? () => setEditProductSearch('') : undefined}
                      class="text-sm"
                    />
                  </div>
                  <div class="text-sm text-gray-500">
                    {filteredEditProducts.length} of {products.length} products
                  </div>
                </div>
              </div>
              <div class="max-h-96 overflow-y-auto backdrop-blur-lg bg-gradient-to-br from-emerald-50/40 to-blue-50/30 border border-emerald-200/30 rounded-2xl p-6 shadow-2xl">
                {filteredEditProducts.length === 0 ? (
                  <div class="text-center py-12">
                    <div class="text-6xl mb-4">🔍</div>
                    <h3 class="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                    <p class="text-gray-500">
                      {editProductSearch ? `No products match "${editProductSearch}"` : 'No products available'}
                    </p>
                    {editProductSearch && (
                      <button
                        type="button"
                        onClick={() => setEditProductSearch('')}
                        class="mt-4 text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Clear search
                      </button>
                    )}
                  </div>
                ) : (
                  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                    {filteredEditProducts.map((product) => (
                      <div
                        key={product.id}
                        onClick={() => product.stock > 0 && addItemToEditOrder(product.id)}
                        class="group relative backdrop-blur-md bg-white/70 border border-white/40 rounded-xl p-4 hover:bg-white/80 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] hover:border-emerald-300/50 cursor-pointer"
                      >
                        <div class="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent rounded-xl opacity-60 pointer-events-none"></div>

                        <div class="relative flex justify-between items-start">
                          <div class="flex-1">
                            <div class="font-semibold text-gray-900 mb-1 drop-shadow-sm">{product.name}</div>
                            <div class="text-sm text-gray-700 mb-3 font-medium backdrop-blur-sm bg-white/40 px-2 py-1 rounded-full w-fit">
                              {product.category}
                            </div>
                            <div class="flex items-center justify-between">
                              <div class="text-xl font-bold text-emerald-600 drop-shadow-md">
                                {formatCurrency(product.price)}
                              </div>
                              <div
                                class={`text-sm px-3 py-1.5 rounded-full font-semibold backdrop-blur-sm border transition-all ${product.stock > 10
                                    ? 'bg-emerald-100/80 text-emerald-800 border-emerald-200/50 shadow-emerald-100/50'
                                    : product.stock > 0
                                      ? 'bg-amber-100/80 text-amber-800 border-amber-200/50 shadow-amber-100/50'
                                      : 'bg-red-100/80 text-red-800 border-red-200/50 shadow-red-100/50'
                                  } shadow-lg`}
                              >
                                📦 {product.stock}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Edit Order Items */}
            {editOrderItems.length > 0 && (
              <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Updated Order Summary</h3>
                <div class="backdrop-blur-lg bg-gradient-to-br from-emerald-100/60 to-green-100/40 border border-emerald-200/50 rounded-2xl p-6 space-y-4 shadow-xl">
                  {editOrderItems.map((item) => {
                    const product = products.find((p) => p.id === item.productId)
                    return product ? (
                      <div
                        key={item.productId}
                        class="relative flex justify-between items-center backdrop-blur-md bg-white/80 border border-white/50 rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        <div class="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent rounded-xl opacity-70 pointer-events-none"></div>

                        <div class="relative flex-1">
                          <div class="font-semibold text-gray-900 mb-2 drop-shadow-sm">{product.name}</div>
                          <div class="text-sm text-gray-700 backdrop-blur-sm bg-white/60 px-3 py-1 rounded-full w-fit">
                            {formatCurrency(product.price)} × {item.quantity} ={' '}
                            <span class="font-bold text-emerald-600">
                              {formatCurrency(product.price * item.quantity)}
                            </span>
                          </div>
                        </div>
                        <div class="relative flex items-center space-x-3">
                          {(() => {
                            const originalItem = editingOrder?.items.find((origItem) => origItem.productId === item.productId)
                            const canDecrease = item.quantity > (originalItem?.quantity || 1)

                            return (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => addItemToEditOrder(item.productId, -1)}
                                  disabled={!canDecrease}
                                  class="w-10 h-10 p-0 flex items-center justify-center backdrop-blur-sm bg-white/70 border-white/60 hover:bg-white/90 hover:shadow-lg transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:hover:scale-100"
                                >
                                  <span class="drop-shadow-sm">➖</span>
                                </Button>
                                <div class="w-14 text-center font-bold text-xl backdrop-blur-sm bg-gradient-to-r from-emerald-100/80 to-green-100/80 px-3 py-2 rounded-lg border border-white/40 shadow-md">
                                  {item.quantity}
                                  {originalItem && item.quantity > originalItem.quantity && (
                                    <div class="text-xs text-emerald-600 font-medium">
                                      +{item.quantity - originalItem.quantity}
                                    </div>
                                  )}
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => addItemToEditOrder(item.productId, 1)}
                                  disabled={item.quantity >= product.stock}
                                  class="w-10 h-10 p-0 flex items-center justify-center backdrop-blur-sm bg-white/70 border-white/60 hover:bg-white/90 hover:shadow-lg transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:hover:scale-100"
                                >
                                  <span class="drop-shadow-sm">➕</span>
                                </Button>
                              </>
                            )
                          })()}
                        </div>
                      </div>
                    ) : null
                  })}

                  {/* Updated Order Totals */}
                  <div class="border-t border-white/40 pt-4 mt-6">
                    {(() => {
                      const subtotal = editOrderItems.reduce((total, item) => {
                        const product = products.find((p) => p.id === item.productId)
                        return total + (product ? product.price * item.quantity : 0)
                      }, 0)
                      const tax = taxEnabled ? subtotal * taxRate : 0
                      const total = subtotal + tax

                      return (
                        <div
                          class={`backdrop-blur-md rounded-xl p-5 border shadow-lg ${taxEnabled
                              ? 'bg-white/60 border-white/50'
                              : 'bg-gray-50/60 border-gray-200/50'
                            }`}
                        >
                          <div class="space-y-3">
                            <div class="flex justify-between text-gray-700 text-lg">
                              <span class="font-medium">Subtotal:</span>
                              <span class="font-semibold drop-shadow-sm">{formatCurrency(subtotal)}</span>
                            </div>
                            {taxEnabled && (
                              <div class="flex justify-between text-gray-700 text-lg">
                                <span class="font-medium">Tax ({(taxRate * 100).toFixed(1)}%):</span>
                                <span class="font-semibold drop-shadow-sm">{formatCurrency(tax)}</span>
                              </div>
                            )}
                            {!taxEnabled && (
                              <div class="text-sm text-gray-500 italic text-center py-2">
                                Tax calculation is disabled in settings
                              </div>
                            )}
                            <div class="border-t border-white/40 pt-3">
                              <div class="flex justify-between text-2xl font-bold text-gray-900 backdrop-blur-sm bg-gradient-to-r from-emerald-100/60 to-green-100/40 px-4 py-3 rounded-lg border border-emerald-200/50 shadow-md">
                                <span class="drop-shadow-sm">New Total:</span>
                                <span class="drop-shadow-sm text-emerald-700">{formatCurrency(total)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                </div>
              </div>
            )}

            {/* Payment Method & Notes */}
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Select
                  label="Payment Method"
                  value={editPaymentMethod}
                  onChange={(e) => setEditPaymentMethod((e.target as HTMLSelectElement).value as 'cash' | 'card' | 'transfer')}
                  options={[
                    { value: 'cash', label: '💵 Cash' },
                    { value: 'card', label: '💳 Card' },
                    { value: 'transfer', label: '🔄 Transfer' },
                  ]}
                />
              </div>
              <div>
                <Input
                  label="Order Notes"
                  value={editNotes}
                  onInput={(e) => setEditNotes((e.target as HTMLInputElement).value)}
                  placeholder="Optional notes..."
                />
              </div>
            </div>
          </div>
        </DialogBody>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setEditingOrder(null)
              setEditOrderItems([])
              setEditPaymentMethod('cash')
              setEditNotes('')
              setEditProductSearch('')
            }}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleUpdateOrder}
            disabled={isLoading || editOrderItems.length === 0}
          >
            {isLoading ? 'Updating...' : 'Update Order'}
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Order Details Modal */}
      {selectedOrder && (
        <Dialog
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          title={`Order Details - #${selectedOrder.id}`}
          size="lg"
        >
          <DialogBody>
            <div class="space-y-6">
              {/* Order Header */}
              <div class="flex justify-between items-start pb-4 border-b border-gray-200">
                <div>
                  <div class="flex items-center space-x-3 mb-2">
                    <div
                      class={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide ${getStatusColor(selectedOrder.status)} transition-all`}
                    >
                      <span class="mr-2 text-base">{getStatusIcon(selectedOrder.status)}</span>
                      {selectedOrder.status}
                    </div>
                    {selectedOrder.paymentMethod && (
                      <div class="flex items-center text-gray-600">
                        <span class="text-lg mr-1">
                          {selectedOrder.paymentMethod === 'cash'
                            ? '💵'
                            : selectedOrder.paymentMethod === 'card'
                              ? '💳'
                              : '🔄'}
                        </span>
                        <span class="text-sm capitalize">{selectedOrder.paymentMethod}</span>
                      </div>
                    )}
                  </div>
                  <div class="text-sm text-gray-600">Created: {new Date(selectedOrder.createdAt).toLocaleString()}</div>
                  {selectedOrder.completedAt && (
                    <div class="text-sm text-gray-600">
                      Completed: {new Date(selectedOrder.completedAt).toLocaleString()}
                    </div>
                  )}
                  {selectedOrder.userId && users[selectedOrder.userId] && (
                    <div class="text-sm text-gray-600">
                      Created by: <span class="font-medium text-gray-700">{users[selectedOrder.userId]}</span>
                    </div>
                  )}
                </div>
                <div class="text-right">
                  <div class="text-3xl font-bold text-gray-900">
                    {formatCurrency(taxEnabled ? selectedOrder.total : selectedOrder.subtotal)}
                  </div>
                  <div class="text-sm text-gray-500">Total Amount</div>
                </div>
              </div>


              {/* Order Items */}
              <div>
                <h4 class="text-lg font-semibold text-gray-900 mb-3">Order Items</h4>
                <div class="space-y-3">
                  {selectedOrder.items.map((item, index) => (
                    <div
                      key={`${item.productId}-${index}`}
                      class="flex justify-between items-center bg-gray-50 rounded-lg p-4"
                    >
                      <div class="flex-1">
                        <div class="font-semibold text-gray-900">{item.productName}</div>
                        <div class="text-sm text-gray-600">Product ID: {item.productId}</div>
                      </div>
                      <div class="text-center mx-4">
                        <div class="font-semibold text-gray-900">×{item.quantity}</div>
                        <div class="text-sm text-gray-500">Quantity</div>
                      </div>
                      <div class="text-right">
                        <div class="font-semibold text-gray-900">{formatCurrency(item.unitPrice)}</div>
                        <div class="text-sm text-gray-500">Unit Price</div>
                      </div>
                      <div class="text-right ml-4 min-w-0">
                        <div class="font-bold text-lg text-gray-900">{formatCurrency(item.totalPrice)}</div>
                        <div class="text-sm text-gray-500">Item Total</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div class="bg-blue-50 rounded-lg p-4">
                <h4 class="text-lg font-semibold text-gray-900 mb-3">Order Summary</h4>
                <div class="space-y-2">
                  {/* Only show subtotal and tax breakdown when tax is enabled */}
                  {taxEnabled && (
                    <>
                      <div class="flex justify-between text-gray-700">
                        <span>Subtotal:</span>
                        <span class="font-semibold">{formatCurrency(selectedOrder.subtotal)}</span>
                      </div>
                      {/* Only show tax line if the order actually has tax applied */}
                      {selectedOrder.tax > 0 && (
                        <div class="flex justify-between text-gray-700">
                          <span>Tax ({((selectedOrder.tax / selectedOrder.subtotal) * 100).toFixed(1)}%):</span>
                          <span class="font-semibold">{formatCurrency(selectedOrder.tax)}</span>
                        </div>
                      )}
                      <div class="border-t border-blue-200 pt-2">
                        <div class="flex justify-between text-xl font-bold text-gray-900">
                          <span>Total:</span>
                          <span>{formatCurrency(selectedOrder.total)}</span>
                        </div>
                      </div>
                    </>
                  )}
                  {/* When tax is disabled, only show the total */}
                  {!taxEnabled && (
                    <div class="flex justify-between text-xl font-bold text-gray-900">
                      <span>Total:</span>
                      <span>{formatCurrency(selectedOrder.subtotal)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              {selectedOrder.notes && (
                <div>
                  <h4 class="text-lg font-semibold text-gray-900 mb-3">Notes</h4>
                  <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p class="text-gray-800">{selectedOrder.notes}</p>
                  </div>
                </div>
              )}

              {/* Order Actions */}
              <div class="border-t border-gray-200 pt-4">
                <h4 class="text-lg font-semibold text-gray-900 mb-3">Actions</h4>
                <div class="flex flex-wrap gap-2">
                  {selectedOrder.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => {
                          handleEditOrder(selectedOrder)
                          setSelectedOrder(null)
                        }}
                      >
                        ✏️ Update Order
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          handleUpdateStatus(selectedOrder.id, 'paid')
                          setSelectedOrder(null)
                        }}
                        class="bg-green-600 hover:bg-green-700 text-white"
                      >
                        💰 Mark as Paid
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          handleUpdateStatus(selectedOrder.id, 'cancelled')
                          setSelectedOrder(null)
                        }}
                        class="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        ❌ Cancel Order
                      </Button>
                    </>
                  )}
                  {selectedOrder.status === 'paid' && (
                    <Button
                      size="sm"
                      onClick={() => {
                        handleUpdateStatus(selectedOrder.id, 'completed')
                        setSelectedOrder(null)
                      }}
                      class="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      ✅ Mark as Complete
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setDeleteConfirm(selectedOrder.id)
                      setSelectedOrder(null)
                    }}
                    class="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    🗑️ Delete Order
                  </Button>
                </div>
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedOrder(null)}>
              Close
            </Button>
          </DialogFooter>
        </Dialog>
      )}

      <DialogConfirm
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => deleteConfirm && handleDeleteOrder(deleteConfirm)}
        title="Confirm Delete"
        message="Are you sure you want to delete this order? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />
    </Container>
  )
}
