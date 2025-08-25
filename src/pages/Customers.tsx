import { useState, useEffect } from "preact/hooks";
import { Button, Input, Container, Heading, Text, Dialog, DialogBody, DialogFooter } from "../components/ui";
import { Customer, customerService } from "../services/customers";

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: ""
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
        loyaltyPoints: 0,
        totalSpent: 0,
        isActive: true
      });

      if (result.success && result.customer) {
        setCustomers([...customers, result.customer]);
        setIsDialogOpen(false);
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          address: "",
          city: "",
          state: "",
          zipCode: ""
        });
      } else {
        setError(result.error || "Failed to create customer");
      }
    } catch (err) {
      setError("Failed to create customer");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Container size="xl">
      <div class="flex justify-between items-center mb-6">
        <div>
          <Heading level={3}>Customer Management</Heading>
          <Text>Manage your customer database and relationships</Text>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
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
        <div class="bg-white rounded-lg shadow p-6">
          <div class="text-center py-8">
            <div class="w-8 h-8 bg-blue-600 rounded-full animate-spin border-2 border-transparent border-t-white mx-auto mb-4"></div>
            <p class="text-gray-600">Loading customers...</p>
          </div>
        </div>
      ) : customers.length === 0 ? (
        <div class="bg-white rounded-lg shadow p-6">
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
        <div class="bg-white rounded-lg shadow overflow-hidden">
          <table class="w-full">
            <thead>
              <tr class="border-b border-gray-200">
                <th class="text-left py-3 px-4 font-medium text-gray-700">Customer</th>
                <th class="text-left py-3 px-4 font-medium text-gray-700">Contact</th>
                <th class="text-left py-3 px-4 font-medium text-gray-700">Location</th>
                <th class="text-left py-3 px-4 font-medium text-gray-700">Loyalty Points</th>
                <th class="text-left py-3 px-4 font-medium text-gray-700">Total Spent</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id} class="border-b border-gray-100 hover:bg-gray-50">
                  <td class="py-3 px-4">
                    <div class="font-medium text-gray-900">
                      {customer.firstName} {customer.lastName}
                    </div>
                    <div class="text-sm text-gray-600">
                      {customer.isActive ? "Active" : "Inactive"}
                    </div>
                  </td>
                  <td class="py-3 px-4">
                    <div class="text-sm">
                      <div class="text-gray-900">{customer.email}</div>
                      <div class="text-gray-600">{customer.phone}</div>
                    </div>
                  </td>
                  <td class="py-3 px-4">
                    <div class="text-sm text-gray-600">
                      {customer.city && customer.state ? `${customer.city}, ${customer.state}` : "-"}
                    </div>
                  </td>
                  <td class="py-3 px-4">
                    <span class="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {customer.loyaltyPoints} pts
                    </span>
                  </td>
                  <td class="py-3 px-4 font-medium text-gray-900">
                    ${customer.totalSpent.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)}
        title="Add New Customer"
        size="lg"
      >
        <DialogBody>
          <form class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <Input
                  value={formData.firstName}
                  onInput={(e) => setFormData({...formData, firstName: (e.target as HTMLInputElement).value})}
                  required
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <Input
                  value={formData.lastName}
                  onInput={(e) => setFormData({...formData, lastName: (e.target as HTMLInputElement).value})}
                  required
                />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onInput={(e) => setFormData({...formData, email: (e.target as HTMLInputElement).value})}
                  required
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Phone *
                </label>
                <Input
                  value={formData.phone}
                  onInput={(e) => setFormData({...formData, phone: (e.target as HTMLInputElement).value})}
                  required
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <Input
                value={formData.address}
                onInput={(e) => setFormData({...formData, address: (e.target as HTMLInputElement).value})}
                placeholder="Street address"
              />
            </div>

            <div class="grid grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <Input
                  value={formData.city}
                  onInput={(e) => setFormData({...formData, city: (e.target as HTMLInputElement).value})}
                  placeholder="City"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  State
                </label>
                <Input
                  value={formData.state}
                  onInput={(e) => setFormData({...formData, state: (e.target as HTMLInputElement).value})}
                  placeholder="State"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  ZIP Code
                </label>
                <Input
                  value={formData.zipCode}
                  onInput={(e) => setFormData({...formData, zipCode: (e.target as HTMLInputElement).value})}
                  placeholder="ZIP"
                />
              </div>
            </div>
          </form>
        </DialogBody>
        
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsDialogOpen(false)}
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleCreateCustomer}
            disabled={isCreating}
          >
            {isCreating ? "Creating..." : "Create Customer"}
          </Button>
        </DialogFooter>
      </Dialog>
    </Container>
  );
}