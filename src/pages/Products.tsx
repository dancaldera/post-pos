import { useEffect, useState } from 'preact/hooks'
import {
  Button,
  Container,
  Dialog,
  DialogBody,
  DialogConfirm,
  DialogFooter,
  Input,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Textarea,
} from '../components/ui'
import { useAuth } from '../hooks/useAuth'
import { PRODUCT_CATEGORIES, type Product, productService } from '../services/products-sqlite'

interface EditProductModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
  onSave: (product: Product) => void
}

function EditProductModal({ product, isOpen, onClose, onSave }: EditProductModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    cost: 0,
    stock: 0,
    category: '',
    barcode: '',
    isActive: true,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (product && isOpen) {
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        cost: product.cost,
        stock: product.stock,
        category: product.category,
        barcode: product.barcode || '',
        isActive: product.isActive,
      })
    } else if (isOpen) {
      setFormData({
        name: '',
        description: '',
        price: 0,
        cost: 0,
        stock: 0,
        category: '',
        barcode: '',
        isActive: true,
      })
    }
    setError('')
  }, [product, isOpen])

  const handleSubmit = async (e: Event) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      let result: { success: boolean; product?: Product; error?: string }
      if (product) {
        result = await productService.updateProduct(product.id, {
          name: formData.name,
          description: formData.description,
          price: formData.price,
          cost: formData.cost,
          stock: formData.stock,
          category: formData.category,
          barcode: formData.barcode || undefined,
          isActive: formData.isActive,
        })
      } else {
        result = await productService.createProduct({
          name: formData.name,
          description: formData.description,
          price: formData.price,
          cost: formData.cost,
          stock: formData.stock,
          category: formData.category,
          barcode: formData.barcode || undefined,
          isActive: formData.isActive,
        })
      }

      if (result.success && result.product) {
        onSave(result.product)
        onClose()
      } else {
        setError(result.error || 'An error occurred')
      }
    } catch (_err) {
      setError('An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={product ? 'Edit Product' : 'Create Product'} size="md">
      <DialogBody>
        {error && (
          <div class="bg-red-500/10 backdrop-blur-sm border border-red-400/20 text-red-700 px-4 py-3 rounded-xl mb-6">
            <div class="flex items-center">
              <span class="text-red-500 mr-2">⚠️</span>
              {error}
            </div>
          </div>
        )}

        <div class="backdrop-blur-lg bg-gradient-to-br from-indigo-50/60 to-purple-50/40 border border-indigo-200/50 rounded-2xl p-6 shadow-xl">
          <form onSubmit={handleSubmit} class="space-y-6">
            <div class="grid grid-cols-2 gap-6">
              <div>
                <Input
                  label="📦 Product Name"
                  value={formData.name}
                  onInput={(e) =>
                    setFormData({
                      ...formData,
                      name: (e.target as HTMLInputElement).value,
                    })
                  }
                  required
                  class="bg-white/80 text-gray-900"
                  placeholder="Enter product name"
                />
              </div>

              <div>
                <Select
                  label="🏷️ Category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      category: (e.target as HTMLSelectElement).value,
                    })
                  }
                  required
                  placeholder="Select a category"
                  options={PRODUCT_CATEGORIES.map((category) => ({
                    value: category,
                    label: category,
                  }))}
                  class="bg-white/80"
                />
              </div>
            </div>

            <div>
              <Textarea
                label="📝 Description"
                value={formData.description}
                onInput={(e) =>
                  setFormData({
                    ...formData,
                    description: (e.target as HTMLTextAreaElement).value,
                  })
                }
                rows={3}
                class="bg-white/80 text-gray-900"
                placeholder="Enter product description"
              />
            </div>

            <div class="grid grid-cols-3 gap-4">
              <div>
                <Input
                  label="💰 Price"
                  type="number"
                  value={formData.price.toString()}
                  onInput={(e) =>
                    setFormData({
                      ...formData,
                      price: parseFloat((e.target as HTMLInputElement).value) || 0,
                    })
                  }
                  required
                  class="bg-white/80 text-gray-900"
                  placeholder="0.00"
                />
              </div>

              <div>
                <Input
                  label="🏭 Cost"
                  type="number"
                  value={formData.cost.toString()}
                  onInput={(e) =>
                    setFormData({
                      ...formData,
                      cost: parseFloat((e.target as HTMLInputElement).value) || 0,
                    })
                  }
                  required
                  class="bg-white/80 text-gray-900"
                  placeholder="0.00"
                />
              </div>

              <div>
                <Input
                  label="📊 Stock"
                  type="number"
                  value={formData.stock.toString()}
                  onInput={(e) =>
                    setFormData({
                      ...formData,
                      stock: parseInt((e.target as HTMLInputElement).value, 10) || 0,
                    })
                  }
                  required
                  class="bg-white/80 text-gray-900"
                  placeholder="0"
                />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-6">
              <div>
                <Input
                  label="📊 Barcode (Optional)"
                  value={formData.barcode}
                  onInput={(e) =>
                    setFormData({
                      ...formData,
                      barcode: (e.target as HTMLInputElement).value,
                    })
                  }
                  placeholder="Enter barcode"
                  class="bg-white/80 text-gray-900"
                />
              </div>

              <div>
                <Select
                  label="✅ Status"
                  value={formData.isActive ? 'active' : 'inactive'}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      isActive: (e.target as HTMLSelectElement).value === 'active',
                    })
                  }
                  options={[
                    {
                      value: 'active',
                      label: '✅ Active - Available for sale',
                    },
                    {
                      value: 'inactive',
                      label: '⛔ Inactive - Hidden from sales',
                    },
                  ]}
                  class="bg-white/80"
                />
              </div>
            </div>

            {/* Profit Margin Preview */}
            {formData.price > 0 && formData.cost > 0 && (
              <div class="backdrop-blur-md bg-emerald-100/60 rounded-xl p-4 border border-emerald-200/50 shadow-md">
                <div class="flex justify-between items-center">
                  <span class="font-semibold text-emerald-800">Profit Margin:</span>
                  <span class="text-xl font-bold text-emerald-600">
                    {(((formData.price - formData.cost) / formData.cost) * 100).toFixed(1)}%
                  </span>
                </div>
                <div class="text-sm text-emerald-700 mt-1">
                  Profit: ${(formData.price - formData.cost).toFixed(2)} per unit
                </div>
              </div>
            )}
          </form>
        </div>
      </DialogBody>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="button" onClick={() => handleSubmit(new Event('submit'))} disabled={isLoading}>
          {isLoading ? 'Saving...' : product ? 'Update' : 'Create'}
        </Button>
      </DialogFooter>
    </Dialog>
  )
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const { user: currentUser, hasRole, hasPermission } = useAuth()

  const canManageProducts = currentUser && (hasRole('admin') || hasRole('manager') || hasPermission('products.view'))

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    if (!canManageProducts) {
      setError("You don't have permission to view products")
      setIsLoading(false)
      return
    }

    try {
      const productsList = await productService.getProducts()
      setAllProducts(productsList)
      setProducts(productsList)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load products'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    if (query.trim() === '') {
      setProducts(allProducts)
      return
    }

    try {
      const searchResults = await productService.searchProducts(query)
      setProducts(searchResults)
    } catch (_err) {
      setError('Search failed')
    }
  }

  const handleCreateProduct = () => {
    setEditingProduct(null)
    setIsModalOpen(true)
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setIsModalOpen(true)
  }

  const handleDeleteProduct = async (productId: string) => {
    try {
      const result = await productService.deleteProduct(productId)
      if (result.success) {
        setAllProducts(allProducts.filter((p) => p.id !== productId))
        setProducts(products.filter((p) => p.id !== productId))
        setDeleteConfirm(null)
      } else {
        setError(result.error || 'Failed to delete product')
      }
    } catch (_err) {
      setError('Failed to delete product')
    }
  }

  const handleSaveProduct = (savedProduct: Product) => {
    if (editingProduct) {
      const updatedProducts = allProducts.map((p) => (p.id === savedProduct.id ? savedProduct : p))
      setAllProducts(updatedProducts)
      setProducts(products.map((p) => (p.id === savedProduct.id ? savedProduct : p)))
    } else {
      setAllProducts([...allProducts, savedProduct])
      setProducts([...products, savedProduct])
    }
  }

  const getStockColor = (stock: number) => {
    if (stock === 0) return 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-300'
    if (stock < 10) return 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border border-yellow-300'
    return 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300'
  }

  const getStatusColor = (isActive: boolean) => {
    return isActive
      ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300 shadow-sm'
      : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300 shadow-sm'
  }

  const getStockIcon = (stock: number) => {
    if (stock === 0) return '❌'
    if (stock < 10) return '⚠️'
    return '✅'
  }

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      Beverages: '🥤',
      Bakery: '🍞',
      'Coffee & Tea': '☕',
      Dairy: '🥛',
      Snacks: '🍫',
      Seafood: '🐟',
      'Frozen Foods': '🧊',
      'Fresh Produce': '🍎',
      'Household Items': '🧽',
      'Personal Care': '🧴',
    }
    return icons[category] || '📦'
  }

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`
  }

  if (!canManageProducts) {
    return (
      <Container size="xl">
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
          <div class="text-center">
            <div class="text-6xl mb-6 drop-shadow-lg">🔒</div>
            <h3 class="text-2xl font-bold text-gray-900 mb-3">Access Denied</h3>
            <p class="text-gray-600 max-w-md mx-auto">
              You don't have permission to view the products page. Contact your administrator for access.
            </p>
          </div>
        </div>
      </Container>
    )
  }

  if (isLoading) {
    return (
      <Container size="xl">
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
          <div class="text-center">
            <div class="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full animate-spin border-4 border-transparent border-t-white mx-auto mb-6 shadow-lg"></div>
            <p class="text-gray-600 text-lg">Loading products catalog...</p>
          </div>
        </div>
      </Container>
    )
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
        {(hasPermission('products.create') || hasRole('admin') || hasRole('manager')) && (
          <Button onClick={handleCreateProduct}>
            <span class="mr-2">➕</span>
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
          leftIcon={
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          }
          rightIcon={
            searchQuery ? (
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : undefined
          }
          onRightIconClick={searchQuery ? () => handleSearch('') : undefined}
          class="w-full bg-white text-gray-900 placeholder-gray-500"
        />
      </div>

      {error && (
        <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 backdrop-blur-sm">
          <div class="flex items-center">
            <span class="text-red-500 mr-2">⚠️</span>
            {error}
          </div>
        </div>
      )}

      <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <Table>
          <TableHead>
            <TableRow class="bg-gray-50">
              <TableHeader class="font-semibold text-gray-900">Product</TableHeader>
              <TableHeader class="font-semibold text-gray-900">Category</TableHeader>
              <TableHeader class="font-semibold text-gray-900">Price</TableHeader>
              <TableHeader class="font-semibold text-gray-900">Cost</TableHeader>
              <TableHeader class="font-semibold text-gray-900">Stock</TableHeader>
              <TableHeader class="font-semibold text-gray-900">Status</TableHeader>
              <TableHeader class="font-semibold text-gray-900">Actions</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product, index) => (
              <TableRow
                key={product.id}
                class="hover:bg-gray-50 transition-all duration-200 hover:shadow-sm"
                style={`animation-delay: ${index * 50}ms`}
              >
                <TableCell>
                  <div class="flex items-start">
                    <div class="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-lg font-bold mr-3 shadow-md">
                      {getCategoryIcon(product.category)}
                    </div>
                    <div class="min-w-0 flex-1">
                      <div class="font-semibold text-gray-900 truncate">{product.name}</div>
                      {product.description && (
                        <div class="text-sm text-gray-600 truncate max-w-xs mt-1">{product.description}</div>
                      )}
                      {product.barcode && (
                        <div class="text-xs text-gray-500 mt-1 font-mono bg-gray-100 px-2 py-1 rounded w-fit">
                          📊 {product.barcode}
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div class="inline-flex items-center px-3 py-2 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-100 to-indigo-200 text-blue-800 border border-blue-300 shadow-sm">
                    <span class="mr-1">{getCategoryIcon(product.category)}</span>
                    {product.category}
                  </div>
                </TableCell>
                <TableCell>
                  <div class="text-lg font-bold text-emerald-600 drop-shadow-sm">{formatCurrency(product.price)}</div>
                </TableCell>
                <TableCell>
                  <div class="text-gray-600 font-medium">{formatCurrency(product.cost)}</div>
                  <div class="text-xs text-gray-500">
                    Margin: {(((product.price - product.cost) / product.cost) * 100).toFixed(1)}%
                  </div>
                </TableCell>
                <TableCell>
                  <div
                    class={`inline-flex items-center px-3 py-2 rounded-full text-xs font-semibold transition-all hover:scale-105 ${getStockColor(product.stock)} shadow-sm`}
                  >
                    <span class="mr-1">{getStockIcon(product.stock)}</span>
                    {product.stock} units
                  </div>
                </TableCell>
                <TableCell>
                  <div
                    class={`inline-flex items-center px-3 py-2 rounded-full text-xs font-semibold uppercase tracking-wide ${getStatusColor(product.isActive)} transition-all hover:scale-105`}
                  >
                    <span class="mr-1">{product.isActive ? '✅' : '⛔'}</span>
                    {product.isActive ? 'Active' : 'Inactive'}
                  </div>
                </TableCell>
                <TableCell>
                  <div class="flex space-x-2">
                    {(hasPermission('products.edit') || hasRole('admin') || hasRole('manager')) && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditProduct(product)}
                        class="text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all hover:shadow-md mr-2"
                      >
                        ✏️ Edit
                      </Button>
                    )}
                    {(hasPermission('products.delete') || hasRole('admin') || hasRole('manager')) && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setDeleteConfirm(product.id)}
                        class="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 transition-all hover:shadow-md"
                      >
                        🗑️ Delete
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {products.length === 0 && (
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
          <div class="text-center">
            <div class="text-6xl mb-6">{searchQuery ? '🔍' : '📦'}</div>
            <h3 class="text-2xl font-bold text-gray-900 mb-3">
              {searchQuery ? 'No products found' : 'No products in catalog'}
            </h3>
            <p class="text-gray-600 mb-6 max-w-md mx-auto">
              {searchQuery
                ? `We couldn't find any products matching "${searchQuery}". Try adjusting your search terms.`
                : 'Your product catalog is empty. Add your first product to get started with inventory management.'}
            </p>
            {!searchQuery && (hasPermission('products.create') || hasRole('admin') || hasRole('manager')) && (
              <Button onClick={handleCreateProduct} class="mt-4">
                <span class="mr-2">➕</span>
                Add First Product
              </Button>
            )}
          </div>
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
  )
}
