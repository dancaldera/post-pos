import { useState, useEffect } from "preact/hooks";
import { Button, Container, Dialog, DialogBody, DialogFooter, Select, Input, Table, TableHead, TableBody, TableRow, TableHeader, TableCell, Text, Heading, Form, FormField, FormGroup, FormActions, DialogConfirm } from "../components/ui";
import { Order, orderService } from "../services/orders";
import { Product, productService } from "../services/products";

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<Order['status'] | 'all'>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  
  const [newOrder, setNewOrder] = useState({
    items: [] as Array<{ productId: string; quantity: number }>,
    paymentMethod: 'cash' as 'cash' | 'card' | 'transfer',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [ordersData, productsData] = await Promise.all([
        orderService.getOrders(),
        productService.getProducts()
      ]);
      setOrders(ordersData);
      setProducts(productsData.filter(p => p.isActive && p.stock > 0));
      setError("");
    } catch (err: any) {
      setError(err.message || "Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredOrders = selectedStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === selectedStatus);

  const handleCreateOrder = async () => {
    if (newOrder.items.length === 0) {
      setError("Please add at least one item to the order");
      return;
    }

    try {
      setIsLoading(true);
      const result = await orderService.createOrder(newOrder);
      
      if (result.success && result.order) {
        setOrders([...orders, result.order]);
        setIsCreateModalOpen(false);
        setNewOrder({
          items: [],
          paymentMethod: 'cash',
          notes: ''
        });
        setError("");
      } else {
        setError(result.error || "Failed to create order");
      }
    } catch (err) {
      setError("Failed to create order");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, status: Order['status']) => {
    try {
      const result = await orderService.updateOrderStatus(orderId, status);
      if (result.success && result.order) {
        setOrders(orders.map(o => o.id === orderId ? result.order! : o));
      } else {
        setError(result.error || "Failed to update order status");
      }
    } catch (err) {
      setError("Failed to update order status");
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      const result = await orderService.deleteOrder(orderId);
      if (result.success) {
        setOrders(orders.filter(o => o.id !== orderId));
        setDeleteConfirm(null);
      } else {
        setError(result.error || "Failed to delete order");
      }
    } catch (err) {
      setError("Failed to delete order");
    }
  };

  const addItemToOrder = (productId: string, quantity: number = 1) => {
    const existingItem = newOrder.items.find(item => item.productId === productId);
    
    if (existingItem) {
      setNewOrder({
        ...newOrder,
        items: newOrder.items.map(item =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      });
    } else {
      setNewOrder({
        ...newOrder,
        items: [...newOrder.items, { productId, quantity }]
      });
    }
  };

  const removeItemFromOrder = (productId: string) => {
    setNewOrder({
      ...newOrder,
      items: newOrder.items.filter(item => item.productId !== productId)
    });
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'paid': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  if (isLoading) {
    return (
      <div class="bg-white rounded-lg shadow p-6">
        <div class="text-center py-8">
          <div class="w-8 h-8 bg-blue-600 rounded-full animate-spin border-2 border-transparent border-t-white mx-auto mb-4"></div>
          <p class="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <Container size="xl">
      <div class="flex justify-between items-center mb-6">
        <div>
          <Heading level={3}>Orders Management</Heading>
          <Text>Manage your orders and transactions</Text>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <span class="mr-2">➕</span>
          Create Order
        </Button>
      </div>

      {error && (
        <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div class="mb-6">
        <Select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus((e.target as HTMLSelectElement).value as Order['status'] | 'all')}
          options={[
            { value: 'all', label: 'All Orders' },
            { value: 'pending', label: 'Pending' },
            { value: 'paid', label: 'Paid' },
            { value: 'completed', label: 'Completed' },
            { value: 'cancelled', label: 'Cancelled' }
          ]}
        />
      </div>

      <Table striped>
        <TableHead>
          <TableRow>
            <TableHeader>Order ID</TableHeader>
            <TableHeader>Customer</TableHeader>
            <TableHeader>Items</TableHeader>
            <TableHeader>Total</TableHeader>
            <TableHeader>Status</TableHeader>
            <TableHeader>Created</TableHeader>
            <TableHeader>Actions</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredOrders.map((order) => (
            <TableRow key={order.id}>
              <TableCell class="font-mono text-sm">#{order.id}</TableCell>
              <TableCell>
                {order.customerName || 'Guest'}
              </TableCell>
              <TableCell>
                <div class="text-sm">
                  {order.items.map(item => (
                    <div key={item.productId} class="flex justify-between">
                      <span>{item.productName}</span>
                      <span>x{item.quantity}</span>
                    </div>
                  ))}
                </div>
              </TableCell>
              <TableCell class="font-medium text-gray-900">
                {formatCurrency(order.total)}
              </TableCell>
              <TableCell>
                <span class={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </TableCell>
              <TableCell class="text-sm text-gray-600">
                {new Date(order.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <div class="flex space-x-2">
                  {order.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateStatus(order.id, 'paid')}
                      >
                        Mark Paid
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                  {order.status === 'paid' && (
                    <Button
                      size="sm"
                      onClick={() => handleUpdateStatus(order.id, 'completed')}
                    >
                      Complete
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => setDeleteConfirm(order.id)}
                  >
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {filteredOrders.length === 0 && (
        <div class="text-center py-8">
          <div class="text-4xl mb-4">📋</div>
          <Heading level={4} class="mb-2">
            {selectedStatus === 'all' ? 'No orders found' : `No ${selectedStatus} orders`}
          </Heading>
          <Text>
            {selectedStatus === 'all' 
              ? 'Get started by creating your first order.'
              : `No orders with status "${selectedStatus}" found.`
            }
          </Text>
        </div>
      )}

      <Dialog
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Order"
        size="lg"
      >
        <DialogBody>
          <Form>
            <FormGroup>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Available Products</label>
                <div class="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {products.map(product => (
                    <div key={product.id} class="border rounded-lg p-3">
                      <div class="flex justify-between items-start">
                        <div>
                          <div class="font-medium">{product.name}</div>
                          <div class="text-sm text-gray-600">
                            {formatCurrency(product.price)} • Stock: {product.stock}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => addItemToOrder(product.id)}
                          disabled={product.stock === 0}
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {newOrder.items.length > 0 && (
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Order Items</label>
                  <div class="space-y-2">
                    {newOrder.items.map(item => {
                      const product = products.find(p => p.id === item.productId);
                      return product ? (
                        <div key={item.productId} class="flex justify-between items-center border rounded-lg p-3">
                          <div>
                            <div class="font-medium">{product.name}</div>
                            <div class="text-sm text-gray-600">
                              {formatCurrency(product.price)} each
                            </div>
                          </div>
                          <div class="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                if (item.quantity > 1) {
                                  addItemToOrder(item.productId, -1);
                                } else {
                                  removeItemFromOrder(item.productId);
                                }
                              }}
                            >
                              -
                            </Button>
                            <Text class="w-8 text-center font-medium">{item.quantity}</Text>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => addItemToOrder(item.productId, 1)}
                              disabled={item.quantity >= product.stock}
                            >
                              +
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => removeItemFromOrder(item.productId)}
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              <FormField>
                <Select
                  label="Payment Method"
                  value={newOrder.paymentMethod}
                  onChange={(e) => setNewOrder({...newOrder, paymentMethod: (e.target as HTMLSelectElement).value as 'cash' | 'card' | 'transfer'})}
                  options={[
                    { value: 'cash', label: 'Cash' },
                    { value: 'card', label: 'Card' },
                    { value: 'transfer', label: 'Transfer' }
                  ]}
                />
              </FormField>

              <FormField>
                <Input
                  label="Notes"
                  value={newOrder.notes}
                  onInput={(e) => setNewOrder({...newOrder, notes: (e.target as HTMLInputElement).value})}
                  placeholder="Optional order notes"
                />
              </FormField>
            </FormGroup>
          </Form>
        </DialogBody>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsCreateModalOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleCreateOrder}
            disabled={isLoading || newOrder.items.length === 0}
          >
            {isLoading ? "Creating..." : "Create Order"}
          </Button>
        </DialogFooter>
      </Dialog>

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
  );
}