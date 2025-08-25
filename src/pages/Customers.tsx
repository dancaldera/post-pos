import { useEffect, useState } from "preact/hooks";
import { Button, Container, Dialog, DialogBody, DialogFooter, Heading, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Text } from "../components/ui";
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
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