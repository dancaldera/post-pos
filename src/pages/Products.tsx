import { useState, useEffect } from "preact/hooks";
import { Button, Input, Select, Textarea, Dialog, DialogBody, DialogFooter, DialogConfirm, Container, Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from "../components/ui";
import { Product, productService, PRODUCT_CATEGORIES } from "../services/products-sqlite";
import { useAuth } from "../hooks/useAuth";

interface EditProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
}

function EditProductModal({ product, isOpen, onClose, onSave }: EditProductModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    cost: 0,
    stock: 0,
    category: "",
    barcode: "",
    isActive: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (product && isOpen) {
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        cost: product.cost,
        stock: product.stock,
        category: product.category,
        barcode: product.barcode || "",
        isActive: product.isActive
      });
    } else if (isOpen) {
      setFormData({
        name: "",
        description: "",
        price: 0,
        cost: 0,
        stock: 0,
        category: "",
        barcode: "",
        isActive: true
      });
    }
    setError("");
  }, [product, isOpen]);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      let result;
      if (product) {
        result = await productService.updateProduct(product.id, {
          name: formData.name,
          description: formData.description,
          price: formData.price,
          cost: formData.cost,
          stock: formData.stock,
          category: formData.category,
          barcode: formData.barcode || undefined,
          isActive: formData.isActive
        });
      } else {
        result = await productService.createProduct({
          name: formData.name,
          description: formData.description,
          price: formData.price,
          cost: formData.cost,
          stock: formData.stock,
          category: formData.category,
          barcode: formData.barcode || undefined,
          isActive: formData.isActive
        });
      }

      if (result.success && result.product) {
        onSave(result.product);
        onClose();
      } else {
        setError(result.error || "An error occurred");
      }
    } catch (err) {
      setError("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={product ? "Edit Product" : "Create Product"}
      size="md"
    >
      <DialogBody>
        {error && (
          <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <Input
              label="Name"
              value={formData.name}
              onInput={(e) => setFormData({ ...formData, name: (e.target as HTMLInputElement).value })}
              required
            />

            <Select
              label="Category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: (e.target as HTMLSelectElement).value })}
              required
              placeholder="Select a category"
              options={PRODUCT_CATEGORIES.map(category => ({ value: category, label: category }))}
            />

          </div>

          <Textarea
            label="Description"
            value={formData.description}
            onInput={(e) => setFormData({ ...formData, description: (e.target as HTMLTextAreaElement).value })}
            rows={3}
          />

          <div class="grid grid-cols-3 gap-4">
            <Input
              label="Price"
              type="number"
              value={formData.price.toString()}
              onInput={(e) => setFormData({ ...formData, price: parseFloat((e.target as HTMLInputElement).value) || 0 })}
              required
            />

            <Input
              label="Cost"
              type="number"
              value={formData.cost.toString()}
              onInput={(e) => setFormData({ ...formData, cost: parseFloat((e.target as HTMLInputElement).value) || 0 })}
              required
            />

            <Input
              label="Stock"
              type="number"
              value={formData.stock.toString()}
              onInput={(e) => setFormData({ ...formData, stock: parseInt((e.target as HTMLInputElement).value) || 0 })}
              required
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <Input
                label="Barcode"
                value={formData.barcode}
                onInput={(e) => setFormData({ ...formData, barcode: (e.target as HTMLInputElement).value })}
                placeholder="Optional"
              />
            </div>

            <Select
              label="Status"
              value={formData.isActive ? "active" : "inactive"}
              onChange={(e) => setFormData({ ...formData, isActive: (e.target as HTMLSelectElement).value === "active" })}
              options={[
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" }
              ]}
            />
          </div>
        </form>
      </DialogBody>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={() => handleSubmit(new Event('submit'))}
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : product ? "Update" : "Create"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { user: currentUser, hasRole, hasPermission } = useAuth();

  const canManageProducts = currentUser && (
    hasRole("admin") ||
    hasRole("manager") ||
    hasPermission("products.view")
  );

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    if (!canManageProducts) {
      setError("You don't have permission to view products");
      setIsLoading(false);
      return;
    }

    try {
      const productsList = await productService.getProducts();
      setAllProducts(productsList);
      setProducts(productsList);
    } catch (err: any) {
      setError(err.message || "Failed to load products");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setProducts(allProducts);
      return;
    }

    try {
      const searchResults = await productService.searchProducts(query);
      setProducts(searchResults);
    } catch (err) {
      setError("Search failed");
    }
  };

  const handleCreateProduct = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      const result = await productService.deleteProduct(productId);
      if (result.success) {
        setAllProducts(allProducts.filter(p => p.id !== productId));
        setProducts(products.filter(p => p.id !== productId));
        setDeleteConfirm(null);
      } else {
        setError(result.error || "Failed to delete product");
      }
    } catch (err) {
      setError("Failed to delete product");
    }
  };

  const handleSaveProduct = (savedProduct: Product) => {
    if (editingProduct) {
      const updatedProducts = allProducts.map(p => p.id === savedProduct.id ? savedProduct : p);
      setAllProducts(updatedProducts);
      setProducts(products.map(p => p.id === savedProduct.id ? savedProduct : p));
    } else {
      setAllProducts([...allProducts, savedProduct]);
      setProducts([...products, savedProduct]);
    }
  };

  const getStockColor = (stock: number) => {
    if (stock === 0) return "text-red-600";
    if (stock < 10) return "text-yellow-600";
    return "text-green-600";
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive
      ? "bg-green-100 text-green-800"
      : "bg-gray-100 text-gray-800";
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  if (!canManageProducts) {
    return (
      <div class="rounded-lg shadow p-6">
        <div class="text-center py-8">
          <div class="text-4xl mb-4">🔒</div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Access Denied</h3>
          <p class="text-gray-600">You don't have permission to view the products page.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div class="rounded-lg shadow p-6">
        <div class="text-center py-8">
          <div class="w-8 h-8 bg-blue-600 rounded-full animate-spin border-2 border-transparent border-t-white mx-auto mb-4"></div>
          <p class="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <Container size="xl">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 mb-2">Products</h1>
          <p class="text-gray-600">
            {allProducts.length} {allProducts.length === 1 ? 'product' : 'products'} total
            {searchQuery && ` • ${products.length} found`}
          </p>
        </div>
        {(hasPermission("products.create") || hasRole("admin") || hasRole("manager")) && (
          <Button onClick={handleCreateProduct}>
            <span class="mr-2">📦</span>
            Add Product
          </Button>
        )}
      </div>

      <div class="mb-6">
        <Input
          type="search"
          placeholder="Search products by name, description, category, or barcode..."
          value={searchQuery}
          onInput={(e) => handleSearch((e.target as HTMLInputElement).value)}
          class="w-full"
        />
      </div>

      {error && (
        <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <Table striped>
        <TableHead>
          <TableRow>
            <TableHeader>Product</TableHeader>
            <TableHeader>Category</TableHeader>
            <TableHeader>Price</TableHeader>
            <TableHeader>Cost</TableHeader>
            <TableHeader>Stock</TableHeader>
            <TableHeader>Status</TableHeader>
            <TableHeader>Actions</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                <div>
                  <div class="font-medium text-gray-900">{product.name}</div>
                  {product.description && (
                    <div class="text-sm text-gray-600 truncate max-w-xs">{product.description}</div>
                  )}
                  {product.barcode && (
                    <div class="text-xs text-gray-500">Barcode: {product.barcode}</div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <span class="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {product.category}
                </span>
              </TableCell>
              <TableCell class="font-medium text-gray-900">
                {formatCurrency(product.price)}
              </TableCell>
              <TableCell class="text-gray-600">
                {formatCurrency(product.cost)}
              </TableCell>
              <TableCell>
                <span class={`font-medium ${getStockColor(product.stock)}`}>
                  {product.stock}
                </span>
              </TableCell>
              <TableCell>
                <span class={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(product.isActive)}`}>
                  {product.isActive ? "Active" : "Inactive"}
                </span>
              </TableCell>
              <TableCell>
                <div class="flex space-x-2">
                  {(hasPermission("products.edit") || hasRole("admin") || hasRole("manager")) && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditProduct(product)}
                    >
                      Edit
                    </Button>
                  )}
                  {(hasPermission("products.delete") || hasRole("admin") || hasRole("manager")) && (
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => setDeleteConfirm(product.id)}
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {products.length === 0 && (
        <div class="text-center py-8">
          <div class="text-4xl mb-4">📦</div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
          <p class="text-gray-600">Get started by adding your first product.</p>
        </div>
      )}

      <EditProductModal
        product={editingProduct}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProduct}
      />

      <DialogConfirm
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => deleteConfirm && handleDeleteProduct(deleteConfirm)}
        title="Confirm Delete"
        message="Are you sure you want to delete this product? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />
    </Container>
  );
}
