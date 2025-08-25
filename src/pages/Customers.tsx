import { useEffect, useState } from "preact/hooks";
import { Button, Container, Dialog, DialogBody, DialogConfirm, DialogFooter, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui";
import { type Customer, customerService } from "../services/customers-sqlite";

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
          <h1 class="text-2xl font-bold text-gray-900 mb-2">Customers</h1>
          <p class="text-gray-600">
            {customers.length} {customers.length === 1 ? 'customer' : 'customers'} total
            {searchQuery && ` • ${customers.length} found`}
          </p>
        </div>
        <Button onClick={() => {
          setEditingCustomer(null);
          resetForm();
          setIsDialogOpen(true);
        }}>
          <span class="mr-2">➕</span>
          Add Customer
        </Button>
      </div>

      {error && (
        <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 backdrop-blur-sm">
          <div class="flex items-center">
            <span class="text-red-500 mr-2">⚠️</span>
            {error}
          </div>
        </div>
      )}

      <div class="mb-6 relative">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span class="text-gray-400 text-lg">🔍</span>
        </div>
        <Input
          type="search"
          placeholder="Search customers by name, email, or phone..."
          value={searchQuery}
          onInput={(e) => handleSearch((e.target as HTMLInputElement).value)}
          class="w-full bg-white text-gray-900 placeholder-gray-500 pl-10 pr-4"
        />
        {searchQuery && (
          <button
            onClick={() => handleSearch("")}
            class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            <span class="text-lg">❌</span>
          </button>
        )}
      </div>

      {isLoading ? (
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
          <div class="text-center">
            <div class="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full animate-spin border-4 border-transparent border-t-white mx-auto mb-6 shadow-lg"></div>
            <p class="text-gray-600 text-lg">Loading customers...</p>
          </div>
        </div>
      ) : customers.length === 0 ? (
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
          <div class="text-center">
            <div class="text-6xl mb-6">
              {searchQuery ? "🔍" : "👥"}
            </div>
            <h3 class="text-2xl font-bold text-gray-900 mb-3">
              {searchQuery ? "No customers found" : "No customers yet"}
            </h3>
            <p class="text-gray-600 mb-6 max-w-md mx-auto">
              {searchQuery 
                ? `We couldn't find any customers matching "${searchQuery}". Try adjusting your search terms.`
                : "Your customer base is empty. Add your first customer to start building relationships."
              }
            </p>
            {!searchQuery && (
              <Button onClick={() => {
                setEditingCustomer(null);
                resetForm();
                setIsDialogOpen(true);
              }} class="mt-4">
                <span class="mr-2">➕</span>
                Add First Customer
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <Table>
            <TableHead>
              <TableRow class="bg-gray-50">
                <TableHeader class="font-semibold text-gray-900">Customer</TableHeader>
                <TableHeader class="font-semibold text-gray-900">Contact</TableHeader>
                <TableHeader class="font-semibold text-gray-900">Location</TableHeader>
                <TableHeader class="font-semibold text-gray-900">Loyalty Points</TableHeader>
                <TableHeader class="font-semibold text-gray-900">Total Spent</TableHeader>
                <TableHeader class="font-semibold text-gray-900">Actions</TableHeader>
              </TableRow>
            </TableHead>
          <TableBody>
            {customers.map((customer, index) => (
              <TableRow 
                key={customer.id} 
                class="hover:bg-gray-50 transition-all duration-200 hover:shadow-sm"
                style={`animation-delay: ${index * 50}ms`}
              >
                <TableCell>
                  <div class="flex items-center">
                    <div class="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-lg font-bold mr-4 shadow-md">
                      {customer.firstName.charAt(0).toUpperCase()}{customer.lastName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div class="font-semibold text-gray-900">
                        {customer.firstName} {customer.lastName}
                      </div>
                      <div class={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                        customer.isActive 
                          ? "bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300"
                          : "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300"
                      } shadow-sm`}>
                        <span class="mr-1">{customer.isActive ? "✅" : "⛔"}</span>
                        {customer.isActive ? "Active" : "Inactive"}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div class="space-y-1">
                    <div class="flex items-center text-sm text-gray-900">
                      <span class="mr-2">📧</span>
                      {customer.email}
                    </div>
                    <div class="flex items-center text-sm text-gray-600">
                      <span class="mr-2">📱</span>
                      {customer.phone}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div class="text-sm text-gray-600">
                    {customer.city && customer.state ? (
                      <div class="flex items-center">
                        <span class="mr-2">📍</span>
                        {customer.city}, {customer.state}
                      </div>
                    ) : (
                      <div class="text-gray-400 italic">No location</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div class="inline-flex items-center px-3 py-2 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-100 to-indigo-200 text-blue-800 border border-blue-300 shadow-sm">
                    <span class="mr-1">⭐</span>
                    {customer.loyaltyPoints} pts
                  </div>
                </TableCell>
                <TableCell>
                  <div class="text-lg font-bold text-emerald-600 drop-shadow-sm">
                    ${customer.totalSpent.toFixed(2)}
                  </div>
                  {customer.lastPurchaseDate && (
                    <div class="text-xs text-gray-500">
                      Last: {new Date(customer.lastPurchaseDate).toLocaleDateString()}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div class="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewCustomer(customer)}
                      class="text-indigo-600 border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300 transition-all hover:shadow-md mr-2"
                    >
                      👁️ View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditCustomer(customer)}
                      class="text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all hover:shadow-md mr-2"
                    >
                      ✏️ Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteCustomer(customer)}
                      disabled={deletingCustomerId === customer.id}
                      class="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 transition-all hover:shadow-md"
                    >
                      {deletingCustomerId === customer.id ? "⏳ Deleting..." : "🗑️ Delete"}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          </Table>
        </div>
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
          <div class="backdrop-blur-lg bg-gradient-to-br from-emerald-50/60 to-green-50/40 border border-emerald-200/50 rounded-2xl p-6 shadow-xl">
            <form class="space-y-6">
              <div class="grid grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-semibold text-gray-800 mb-3 drop-shadow-sm">
                    👤 First Name
                  </label>
                  <Input
                    value={formData.firstName}
                    onInput={(e) => setFormData({ ...formData, firstName: (e.target as HTMLInputElement).value })}
                    required
                    class="bg-white/80 text-gray-900"
                    placeholder="Enter first name"
                  />
                </div>

                <div>
                  <label class="block text-sm font-semibold text-gray-800 mb-3 drop-shadow-sm">
                    👤 Last Name
                  </label>
                  <Input
                    value={formData.lastName}
                    onInput={(e) => setFormData({ ...formData, lastName: (e.target as HTMLInputElement).value })}
                    required
                    class="bg-white/80 text-gray-900"
                    placeholder="Enter last name"
                  />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-semibold text-gray-800 mb-3 drop-shadow-sm">
                    📧 Email Address
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onInput={(e) => setFormData({ ...formData, email: (e.target as HTMLInputElement).value })}
                    required
                    class="bg-white/80 text-gray-900"
                    placeholder="Enter email address"
                  />
                </div>

                <div>
                  <label class="block text-sm font-semibold text-gray-800 mb-3 drop-shadow-sm">
                    📱 Phone Number
                  </label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onInput={(e) => setFormData({ ...formData, phone: (e.target as HTMLInputElement).value })}
                    required
                    class="bg-white/80 text-gray-900"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-800 mb-3 drop-shadow-sm">
                  🏠 Street Address
                </label>
                <Input
                  value={formData.address}
                  onInput={(e) => setFormData({ ...formData, address: (e.target as HTMLInputElement).value })}
                  placeholder="Enter street address (optional)"
                  class="bg-white/80 text-gray-900"
                />
              </div>

              <div class="grid grid-cols-3 gap-4">
                <div>
                  <label class="block text-sm font-semibold text-gray-800 mb-3 drop-shadow-sm">
                    🏙️ City
                  </label>
                  <Input
                    value={formData.city}
                    onInput={(e) => setFormData({ ...formData, city: (e.target as HTMLInputElement).value })}
                    placeholder="City"
                    class="bg-white/80 text-gray-900"
                  />
                </div>

                <div>
                  <label class="block text-sm font-semibold text-gray-800 mb-3 drop-shadow-sm">
                    🗺️ State
                  </label>
                  <Input
                    value={formData.state}
                    onInput={(e) => setFormData({ ...formData, state: (e.target as HTMLInputElement).value })}
                    placeholder="State"
                    class="bg-white/80 text-gray-900"
                  />
                </div>

                <div>
                  <label class="block text-sm font-semibold text-gray-800 mb-3 drop-shadow-sm">
                    📮 ZIP Code
                  </label>
                  <Input
                    value={formData.zipCode}
                    onInput={(e) => setFormData({ ...formData, zipCode: (e.target as HTMLInputElement).value })}
                    placeholder="ZIP"
                    class="bg-white/80 text-gray-900"
                  />
                </div>
              </div>

              <div class="grid grid-cols-3 gap-4">
                <div>
                  <label class="block text-sm font-semibold text-gray-800 mb-3 drop-shadow-sm">
                    ⭐ Loyalty Points
                  </label>
                  <Input
                    type="number"
                    value={formData.loyaltyPoints.toString()}
                    onInput={(e) => setFormData({ ...formData, loyaltyPoints: parseInt((e.target as HTMLInputElement).value) || 0 })}
                    class="bg-white/80 text-gray-900"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label class="block text-sm font-semibold text-gray-800 mb-3 drop-shadow-sm">
                    💰 Total Spent
                  </label>
                  <Input
                    type="number"
                    value={formData.totalSpent.toString()}
                    onInput={(e) => setFormData({ ...formData, totalSpent: parseFloat((e.target as HTMLInputElement).value) || 0 })}
                    class="bg-white/80 text-gray-900"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label class="block text-sm font-semibold text-gray-800 mb-3 drop-shadow-sm">
                    ✅ Status
                  </label>
                  <select
                    class="w-full px-4 py-2.5 bg-white/80 border border-white/40 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    value={formData.isActive ? "active" : "inactive"}
                    onChange={(e) => setFormData({ ...formData, isActive: (e.target as HTMLSelectElement).value === "active" })}
                  >
                    <option value="active">✅ Active</option>
                    <option value="inactive">⛔ Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-800 mb-3 drop-shadow-sm">
                  📝 Notes (Optional)
                </label>
                <textarea
                  class="w-full px-4 py-2.5 bg-white/80 border border-white/40 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-none"
                  rows={3}
                  value={formData.notes}
                  onInput={(e) => setFormData({ ...formData, notes: (e.target as HTMLTextAreaElement).value })}
                  placeholder="Add any additional notes about this customer..."
                />
              </div>
            </form>
          </div>
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
              {/* Customer Header */}
              <div class="text-center pb-4 border-b border-gray-200">
                <div class="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 shadow-lg">
                  {viewingCustomer.firstName.charAt(0).toUpperCase()}{viewingCustomer.lastName.charAt(0).toUpperCase()}
                </div>
                <h2 class="text-2xl font-bold text-gray-900 mb-2">
                  {viewingCustomer.firstName} {viewingCustomer.lastName}
                </h2>
                <div class={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
                  viewingCustomer.isActive 
                    ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300' 
                    : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300'
                } shadow-sm`}>
                  <span class="mr-2">{viewingCustomer.isActive ? '✅' : '⛔'}</span>
                  {viewingCustomer.isActive ? 'Active Customer' : 'Inactive Customer'}
                </div>
              </div>

              <div class="grid grid-cols-2 gap-6">
                <div class="backdrop-blur-md bg-blue-50/60 rounded-xl p-6 border border-blue-200/50 shadow-lg">
                  <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <span class="mr-2">📞</span>
                    Contact Information
                  </h3>
                  <div class="space-y-4">
                    <div>
                      <div class="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">📧 Email</div>
                      <div class="text-gray-900 font-medium">{viewingCustomer.email}</div>
                    </div>
                    <div>
                      <div class="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">📱 Phone</div>
                      <div class="text-gray-900 font-medium">{viewingCustomer.phone}</div>
                    </div>
                  </div>
                </div>

                <div class="backdrop-blur-md bg-purple-50/60 rounded-xl p-6 border border-purple-200/50 shadow-lg">
                  <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <span class="mr-2">📍</span>
                    Address Information
                  </h3>
                  <div class="space-y-4">
                    <div>
                      <div class="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">🏠 Address</div>
                      <div class="text-gray-900 font-medium">{viewingCustomer.address || 'Not provided'}</div>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <div class="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">🏙️ City</div>
                        <div class="text-gray-900 font-medium">{viewingCustomer.city || 'N/A'}</div>
                      </div>
                      <div>
                        <div class="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">🗺️ State</div>
                        <div class="text-gray-900 font-medium">{viewingCustomer.state || 'N/A'}</div>
                      </div>
                    </div>
                    <div>
                      <div class="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">📮 ZIP Code</div>
                      <div class="text-gray-900 font-medium">{viewingCustomer.zipCode || 'N/A'}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-3 gap-4">
                <div class="text-center p-6 backdrop-blur-md bg-gradient-to-br from-blue-100/80 to-indigo-100/60 rounded-2xl border border-blue-200/50 shadow-xl hover:shadow-2xl transition-all">
                  <div class="text-4xl mb-2">⭐</div>
                  <div class="text-3xl font-bold text-blue-600 mb-1">{viewingCustomer.loyaltyPoints}</div>
                  <div class="text-sm font-semibold text-gray-700">Loyalty Points</div>
                </div>
                <div class="text-center p-6 backdrop-blur-md bg-gradient-to-br from-emerald-100/80 to-green-100/60 rounded-2xl border border-emerald-200/50 shadow-xl hover:shadow-2xl transition-all">
                  <div class="text-4xl mb-2">💰</div>
                  <div class="text-3xl font-bold text-emerald-600 mb-1">${viewingCustomer.totalSpent.toFixed(2)}</div>
                  <div class="text-sm font-semibold text-gray-700">Total Spent</div>
                </div>
                <div class="text-center p-6 backdrop-blur-md bg-gradient-to-br from-purple-100/80 to-pink-100/60 rounded-2xl border border-purple-200/50 shadow-xl hover:shadow-2xl transition-all">
                  <div class="text-4xl mb-2">🛒</div>
                  <div class="text-lg font-bold text-purple-600 mb-1">
                    {viewingCustomer.lastPurchaseDate 
                      ? new Date(viewingCustomer.lastPurchaseDate).toLocaleDateString()
                      : 'Never'
                    }
                  </div>
                  <div class="text-sm font-semibold text-gray-700">Last Purchase</div>
                </div>
              </div>

              {viewingCustomer.notes && (
                <div class="backdrop-blur-md bg-yellow-50/60 rounded-xl p-6 border border-yellow-200/50 shadow-lg">
                  <h3 class="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <span class="mr-2">📝</span>
                    Customer Notes
                  </h3>
                  <div class="text-gray-800 leading-relaxed">
                    {viewingCustomer.notes}
                  </div>
                </div>
              )}

              <div class="text-sm text-gray-500 border-t border-gray-200 pt-4 backdrop-blur-sm bg-gray-50/50 rounded-lg p-4">
                <div class="flex justify-between items-center">
                  <div class="flex items-center">
                    <span class="mr-2">📅</span>
                    <span>Customer since: <strong>{new Date(viewingCustomer.createdAt).toLocaleDateString()}</strong></span>
                  </div>
                  <div class="flex items-center">
                    <span class="mr-2">🔄</span>
                    <span>Last updated: <strong>{new Date(viewingCustomer.updatedAt).toLocaleDateString()}</strong></span>
                  </div>
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