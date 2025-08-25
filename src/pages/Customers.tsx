import { useEffect, useState } from "preact/hooks";
import { Button, Container, Dialog, DialogBody, DialogFooter, DialogConfirm, Heading, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Text } from "../components/ui";
import { Customer, customerService } from "../services/customers-sqlite";

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
  const [deletingCustomerId, setDeletingCustomerId] = useState<string | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    loyaltyPoints: 0,
    totalSpent: 0,
    isActive: true,
    notes: ""
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setIsLoading(true);
      const customersList = await customerService.getCustomers();
      setCustomers(customersList);
      setError("");
    } catch (err: any) {
      setError(err.message || "Failed to load customers");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      loadCustomers();
      return;
    }

    try {
      const searchResults = await customerService.searchCustomers(query);
      setCustomers(searchResults);
    } catch (err) {
      setError("Search failed");
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      loyaltyPoints: 0,
      totalSpent: 0,
      isActive: true,
      notes: ""
    });
  };

  const handleCreateCustomer = async () => {
    setIsCreating(true);
    setError("");

    try {
      const result = await customerService.createCustomer({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address || undefined,
        city: formData.city || undefined,
        state: formData.state || undefined,
        zipCode: formData.zipCode || undefined,
        loyaltyPoints: formData.loyaltyPoints,
        totalSpent: formData.totalSpent,
        isActive: formData.isActive,
        notes: formData.notes || undefined
      });

      if (result.success && result.customer) {
        setCustomers([...customers, result.customer]);
        setIsDialogOpen(false);
        resetForm();
      } else {
        setError(result.error || "Failed to create customer");
      }
    } catch (err) {
      setError("Failed to create customer");
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      phone: customer.phone,
      address: customer.address || "",
      city: customer.city || "",
      state: customer.state || "",
      zipCode: customer.zipCode || "",
      loyaltyPoints: customer.loyaltyPoints,
      totalSpent: customer.totalSpent,
      isActive: customer.isActive,
      notes: customer.notes || ""
    });
    setIsDialogOpen(true);
  };

  const handleUpdateCustomer = async () => {
    if (!editingCustomer) return;
    
    setIsUpdating(true);
    setError("");

    try {
      const result = await customerService.updateCustomer(editingCustomer.id, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address || undefined,
        city: formData.city || undefined,
        state: formData.state || undefined,
        zipCode: formData.zipCode || undefined,
        loyaltyPoints: formData.loyaltyPoints,
        totalSpent: formData.totalSpent,
        isActive: formData.isActive,
        notes: formData.notes || undefined,
        updatedAt: new Date().toISOString()
      });

      if (result.success && result.customer) {
        setCustomers(customers.map(c => c.id === editingCustomer.id ? result.customer! : c));
        setIsDialogOpen(false);
        setEditingCustomer(null);
        resetForm();
      } else {
        setError(result.error || "Failed to update customer");
      }
    } catch (err) {
      setError("Failed to update customer");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteCustomer = (customer: Customer) => {
    setCustomerToDelete(customer);
  };

  const confirmDeleteCustomer = async () => {
    if (!customerToDelete) return;
    
    setIsDeleting(true);
    setDeletingCustomerId(customerToDelete.id);
    setError("");

    try {
      const result = await customerService.deleteCustomer(customerToDelete.id);
      
      if (result.success) {
        setCustomers(customers.filter(c => c.id !== customerToDelete.id));
        setCustomerToDelete(null);
      } else {
        setError(result.error || "Failed to delete customer");
      }
    } catch (err) {
      setError("Failed to delete customer");
    } finally {
      setIsDeleting(false);
      setDeletingCustomerId(null);
    }
  };

  const handleViewCustomer = (customer: Customer) => {
    setViewingCustomer(customer);
  };

  return (
    <Container size="xl">
      <div class="flex justify-between items-center mb-6">
        <div>
          <Heading level={1} class="mb-2">Customers</Heading>
          <Text color="muted">
            {customers.length} {customers.length === 1 ? 'customer' : 'customers'} total
          </Text>
        </div>
        <Button onClick={() => {
          setEditingCustomer(null);
          resetForm();
          setIsDialogOpen(true);
        }}>
          Add Customer
        </Button>
      </div>

      {error && (
        <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div class="mb-6">
        <Input
          type="search"
          placeholder="Search customers by name, email, or phone..."
          value={searchQuery}
          onInput={(e) => handleSearch((e.target as HTMLInputElement).value)}
          class="w-full"
        />
      </div>

      {isLoading ? (
        <div class="rounded-lg shadow p-6">
          <div class="text-center py-8">
            <div class="w-8 h-8 bg-blue-600 rounded-full animate-spin border-2 border-transparent border-t-white mx-auto mb-4"></div>
            <p class="text-gray-600">Loading customers...</p>
          </div>
        </div>
      ) : customers.length === 0 ? (
        <div class="rounded-lg shadow p-6">
          <div class="text-center py-8">
            <div class="text-4xl mb-4">👥</div>
            <Heading level={4} class="mb-2">
              {searchQuery ? "No customers found" : "No customers yet"}
            </Heading>
            <Text>
              {searchQuery ? "Try a different search term" : "Get started by adding your first customer."}
            </Text>
          </div>
        </div>
      ) : (
        <Table striped>
          <TableHead>
            <TableRow>
              <TableHeader>Customer</TableHeader>
              <TableHeader>Contact</TableHeader>
              <TableHeader>Location</TableHeader>
              <TableHeader>Loyalty Points</TableHeader>
              <TableHeader>Total Spent</TableHeader>
              <TableHeader>Actions</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell>
                  <div class="font-medium text-gray-900">
                    {customer.firstName} {customer.lastName}
                  </div>
                  <div class="text-sm text-gray-600">
                    {customer.isActive ? "Active" : "Inactive"}
                  </div>
                </TableCell>
                <TableCell>
                  <div class="text-sm">
                    <div class="text-gray-900">{customer.email}</div>
                    <div class="text-gray-600">{customer.phone}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div class="text-sm text-gray-600">
                    {customer.city && customer.state ? `${customer.city}, ${customer.state}` : "-"}
                  </div>
                </TableCell>
                <TableCell>
                  <span class="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {customer.loyaltyPoints} pts
                  </span>
                </TableCell>
                <TableCell class="font-medium text-gray-900">
                  ${customer.totalSpent.toFixed(2)}
                </TableCell>
                <TableCell>
                  <div class="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewCustomer(customer)}
                    >
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditCustomer(customer)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteCustomer(customer)}
                      disabled={deletingCustomerId === customer.id}
                      class="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      {deletingCustomerId === customer.id ? "..." : "Delete"}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setEditingCustomer(null);
          resetForm();
        }}
        title={editingCustomer ? "Edit Customer" : "Add New Customer"}
        size="lg"
      >
        <DialogBody>
          <form class="space-y-4">
            <div class="grid grid-cols-2 gap-4">

              <Input
                label="First Name"
                value={formData.firstName}
                onInput={(e) => setFormData({ ...formData, firstName: (e.target as HTMLInputElement).value })}
                required
              />

              <Input
                label="Last Name"
                value={formData.lastName}
                onInput={(e) => setFormData({ ...formData, lastName: (e.target as HTMLInputElement).value })}
                required
              />

            </div>

            <div class="grid grid-cols-2 gap-4">
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onInput={(e) => setFormData({ ...formData, email: (e.target as HTMLInputElement).value })}
                required
              />


              <Input
                label="Phone"
                type="tel"
                value={formData.phone}
                onInput={(e) => setFormData({ ...formData, phone: (e.target as HTMLInputElement).value })}
                required
              />
            </div>

            <div>
              <Input
                label="Address"
                value={formData.address}
                onInput={(e) => setFormData({ ...formData, address: (e.target as HTMLInputElement).value })}
                placeholder="Street address"
              />
            </div>

            <div class="grid grid-cols-3 gap-4">
              <Input
                label="City"
                value={formData.city}
                onInput={(e) => setFormData({ ...formData, city: (e.target as HTMLInputElement).value })}
                placeholder="City"
              />

              <Input
                label="State"
                value={formData.state}
                onInput={(e) => setFormData({ ...formData, state: (e.target as HTMLInputElement).value })}
                placeholder="State"
              />

              <Input
                label="ZIP"
                value={formData.zipCode}
                onInput={(e) => setFormData({ ...formData, zipCode: (e.target as HTMLInputElement).value })}
                placeholder="ZIP"
              />

            </div>

            <div class="grid grid-cols-3 gap-4">
              <Input
                label="Loyalty Points"
                type="number"
                value={formData.loyaltyPoints.toString()}
                onInput={(e) => setFormData({ ...formData, loyaltyPoints: parseInt((e.target as HTMLInputElement).value) || 0 })}
              />

              <Input
                label="Total Spent"
                type="number"
                value={formData.totalSpent.toString()}
                onInput={(e) => setFormData({ ...formData, totalSpent: parseFloat((e.target as HTMLInputElement).value) || 0 })}
              />

              <div class="flex flex-col">
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  class="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.isActive ? "active" : "inactive"}
                  onChange={(e) => setFormData({ ...formData, isActive: (e.target as HTMLSelectElement).value === "active" })}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                class="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                value={formData.notes}
                onInput={(e) => setFormData({ ...formData, notes: (e.target as HTMLTextAreaElement).value })}
                placeholder="Optional notes about this customer..."
              />
            </div>
          </form>
        </DialogBody>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setIsDialogOpen(false);
              setEditingCustomer(null);
              resetForm();
            }}
            disabled={isCreating || isUpdating}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={editingCustomer ? handleUpdateCustomer : handleCreateCustomer}
            disabled={isCreating || isUpdating}
          >
            {editingCustomer 
              ? (isUpdating ? "Updating..." : "Update Customer")
              : (isCreating ? "Creating..." : "Create Customer")
            }
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Customer Details Modal */}
      {viewingCustomer && (
        <Dialog
          isOpen={!!viewingCustomer}
          onClose={() => setViewingCustomer(null)}
          title={`${viewingCustomer.firstName} ${viewingCustomer.lastName}`}
          size="lg"
        >
          <DialogBody>
            <div class="space-y-6">
              <div class="grid grid-cols-2 gap-6">
                <div>
                  <h3 class="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
                  <div class="space-y-3">
                    <div>
                      <Text variant="small" color="muted" weight="medium">Name</Text>
                      <Text>{viewingCustomer.firstName} {viewingCustomer.lastName}</Text>
                    </div>
                    <div>
                      <Text variant="small" color="muted" weight="medium">Email</Text>
                      <Text>{viewingCustomer.email}</Text>
                    </div>
                    <div>
                      <Text variant="small" color="muted" weight="medium">Phone</Text>
                      <Text>{viewingCustomer.phone}</Text>
                    </div>
                    <div>
                      <Text variant="small" color="muted" weight="medium">Status</Text>
                      <span class={`px-2 py-1 rounded-full text-xs font-medium ${
                        viewingCustomer.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {viewingCustomer.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 class="text-lg font-medium text-gray-900 mb-4">Address</h3>
                  <div class="space-y-3">
                    <div>
                      <Text variant="small" color="muted" weight="medium">Street Address</Text>
                      <Text>{viewingCustomer.address || 'Not provided'}</Text>
                    </div>
                    <div>
                      <Text variant="small" color="muted" weight="medium">City</Text>
                      <Text>{viewingCustomer.city || 'Not provided'}</Text>
                    </div>
                    <div>
                      <Text variant="small" color="muted" weight="medium">State</Text>
                      <Text>{viewingCustomer.state || 'Not provided'}</Text>
                    </div>
                    <div>
                      <Text variant="small" color="muted" weight="medium">ZIP Code</Text>
                      <Text>{viewingCustomer.zipCode || 'Not provided'}</Text>
                    </div>
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-3 gap-6">
                <div class="text-center p-4 bg-blue-50 rounded-lg">
                  <div class="text-2xl font-bold text-blue-600">{viewingCustomer.loyaltyPoints}</div>
                  <div class="text-sm text-gray-600">Loyalty Points</div>
                </div>
                <div class="text-center p-4 bg-green-50 rounded-lg">
                  <div class="text-2xl font-bold text-green-600">${viewingCustomer.totalSpent.toFixed(2)}</div>
                  <div class="text-sm text-gray-600">Total Spent</div>
                </div>
                <div class="text-center p-4 bg-purple-50 rounded-lg">
                  <div class="text-2xl font-bold text-purple-600">
                    {viewingCustomer.lastPurchaseDate 
                      ? new Date(viewingCustomer.lastPurchaseDate).toLocaleDateString()
                      : 'Never'
                    }
                  </div>
                  <div class="text-sm text-gray-600">Last Purchase</div>
                </div>
              </div>

              {viewingCustomer.notes && (
                <div>
                  <h3 class="text-lg font-medium text-gray-900 mb-2">Notes</h3>
                  <div class="bg-gray-50 rounded-lg p-4">
                    <Text>{viewingCustomer.notes}</Text>
                  </div>
                </div>
              )}

              <div class="text-sm text-gray-500 border-t pt-4">
                <div class="flex justify-between">
                  <span>Customer since: {new Date(viewingCustomer.createdAt).toLocaleDateString()}</span>
                  <span>Last updated: {new Date(viewingCustomer.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </DialogBody>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setViewingCustomer(null)}
            >
              Close
            </Button>
            <Button
              onClick={() => {
                setViewingCustomer(null);
                handleEditCustomer(viewingCustomer);
              }}
            >
              Edit Customer
            </Button>
          </DialogFooter>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <DialogConfirm
        isOpen={!!customerToDelete}
        onClose={() => setCustomerToDelete(null)}
        onConfirm={confirmDeleteCustomer}
        title="Delete Customer"
        message={customerToDelete 
          ? `Are you sure you want to delete "${customerToDelete.firstName} ${customerToDelete.lastName}"? This action cannot be undone and will permanently remove all customer data.`
          : ""
        }
        confirmText={isDeleting ? "Deleting..." : "Delete"}
        cancelText="Cancel"
        variant="danger"
      />
    </Container>
  );
}