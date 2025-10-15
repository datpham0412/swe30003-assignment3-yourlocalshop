"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { LogOut, Package, Pencil, Trash2, Plus } from "lucide-react"

interface Product {
  id: number
  name: string
  price: number
  category: string
  stock: number
}

export default function AdminDashboard() {
  const router = useRouter()
  const [email, setEmail] = useState<string | null>(null)
  const [password, setPassword] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Product list state
  const [products, setProducts] = useState<Product[]>([])
  const [productsLoading, setProductsLoading] = useState(false)

  // Add product state
  const [addProductData, setAddProductData] = useState({
    name: "",
    price: "",
    category: "",
    stock: "",
  })
  const [addProductLoading, setAddProductLoading] = useState(false)

  // Edit product state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [editProductData, setEditProductData] = useState({
    name: "",
    price: "",
    stock: "",
  })
  const [editProductLoading, setEditProductLoading] = useState(false)

  // Delete product state
  const [deletingProductId, setDeletingProductId] = useState<number | null>(null)

  // Toast message state
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    // Check authentication on mount
    const storedEmail = localStorage.getItem("email")
    const storedPassword = localStorage.getItem("password")
    const storedRole = localStorage.getItem("role")

    if (!storedEmail || !storedPassword || !storedRole) {
      router.push("/auth")
      return
    }

    if (storedRole !== "Admin") {
      router.push("/dashboard")
      return
    }

    setEmail(storedEmail)
    setPassword(storedPassword)
    setLoading(false)

    // Fetch products on mount
    fetchProducts()
  }, [router])

  const showToast = (type: "success" | "error", text: string) => {
    setToast({ type, text })
    setTimeout(() => setToast(null), 4000)
  }

  const fetchProducts = async () => {
    setProductsLoading(true)
    try {
      const response = await fetch("http://localhost:5074/api/Product/list")
      if (response.ok) {
        const data = await response.json()
        setProducts(data)
      } else {
        showToast("error", "Failed to load products.")
      }
    } catch (error) {
      showToast("error", "Network error. Please check your connection.")
    } finally {
      setProductsLoading(false)
    }
  }

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddProductLoading(true)

    try {
      const response = await fetch(
        `http://localhost:5074/api/Product/add?email=${encodeURIComponent(email!)}&password=${encodeURIComponent(password!)}&name=${encodeURIComponent(addProductData.name)}&price=${encodeURIComponent(addProductData.price)}&category=${encodeURIComponent(addProductData.category)}&stock=${encodeURIComponent(addProductData.stock)}`,
        { method: "POST" },
      )

      if (response.ok) {
        showToast("success", "Product added successfully!")
        setAddProductData({ name: "", price: "", category: "", stock: "" })
        fetchProducts() // Refresh the list
      } else {
        const errorText = await response.text()
        showToast("error", errorText || "Failed to add product.")
      }
    } catch (error) {
      showToast("error", "Network error. Please check your connection.")
    } finally {
      setAddProductLoading(false)
    }
  }

  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingProduct) return

    setEditProductLoading(true)

    try {
      const response = await fetch(
        `http://localhost:5074/api/Product/update?email=${encodeURIComponent(email!)}&password=${encodeURIComponent(password!)}&id=${editingProduct.id}&name=${encodeURIComponent(editProductData.name)}&price=${encodeURIComponent(editProductData.price)}&stock=${encodeURIComponent(editProductData.stock)}`,
        { method: "PUT" },
      )

      if (response.ok) {
        showToast("success", "Product updated successfully!")
        setEditingProduct(null)
        fetchProducts() // Refresh the list
      } else {
        const errorText = await response.text()
        showToast("error", errorText || "Failed to update product.")
      }
    } catch (error) {
      showToast("error", "Network error. Please check your connection.")
    } finally {
      setEditProductLoading(false)
    }
  }

  const handleDeleteProduct = async (productId: number) => {
    setDeletingProductId(productId)

    try {
      const response = await fetch(
        `http://localhost:5074/api/Product/delete?email=${encodeURIComponent(email!)}&password=${encodeURIComponent(password!)}&id=${productId}`,
        { method: "DELETE" },
      )

      if (response.ok) {
        showToast("success", "Product deleted successfully!")
        setProducts(products.filter((p) => p.id !== productId))
      } else {
        const errorText = await response.text()
        showToast("error", errorText || "Failed to delete product.")
      }
    } catch (error) {
      showToast("error", "Network error. Please check your connection.")
    } finally {
      setDeletingProductId(null)
    }
  }

  const openEditDialog = (product: Product) => {
    setEditingProduct(product)
    setEditProductData({
      name: product.name,
      price: product.price.toString(),
      stock: product.stock.toString(),
    })
  }

  const handleLogout = () => {
    localStorage.removeItem("email")
    localStorage.removeItem("password")
    localStorage.removeItem("role")
    router.push("/auth")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner className="h-8 w-8 text-purple-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-emerald-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-emerald-500 bg-clip-text text-transparent">
            Your Local Shop
          </h1>
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-colors bg-transparent"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-top-5">
          <div
            className={`px-4 py-3 rounded-lg shadow-lg ${
              toast.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {toast.text}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Page Header */}
        <div className="text-center space-y-2">
          <h2 className="text-4xl font-bold text-gray-900 flex items-center justify-center gap-2">
            Manage Products <Package className="h-8 w-8 text-purple-600" />
          </h2>
          <p className="text-gray-600">Add, update, or remove items from your store</p>
        </div>

        {/* Add Product Form */}
        <Card className="shadow-xl border-purple-100 max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-purple-600" />
              Add New Product
            </CardTitle>
            <CardDescription>Fill in the details to add a product to your catalogue</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="add-name">Product Name</Label>
                  <Input
                    id="add-name"
                    type="text"
                    placeholder="e.g., Organic Apples"
                    value={addProductData.name}
                    onChange={(e) => setAddProductData({ ...addProductData, name: e.target.value })}
                    required
                    className="rounded-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="add-category">Category</Label>
                  <Input
                    id="add-category"
                    type="text"
                    placeholder="e.g., Fruits"
                    value={addProductData.category}
                    onChange={(e) => setAddProductData({ ...addProductData, category: e.target.value })}
                    required
                    className="rounded-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="add-price">Price ($)</Label>
                  <Input
                    id="add-price"
                    type="number"
                    step="0.01"
                    placeholder="9.99"
                    value={addProductData.price}
                    onChange={(e) => setAddProductData({ ...addProductData, price: e.target.value })}
                    required
                    className="rounded-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="add-stock">Stock</Label>
                  <Input
                    id="add-stock"
                    type="number"
                    placeholder="100"
                    value={addProductData.stock}
                    onChange={(e) => setAddProductData({ ...addProductData, stock: e.target.value })}
                    required
                    className="rounded-lg"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 transition-all duration-200"
                disabled={addProductLoading}
              >
                {addProductLoading ? (
                  <span className="flex items-center gap-2">
                    <Spinner className="h-4 w-4" />
                    Adding Product...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Product
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Product List */}
        <Card className="shadow-xl border-emerald-100">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Product Inventory</span>
              <Button
                onClick={fetchProducts}
                variant="outline"
                size="sm"
                disabled={productsLoading}
                className="flex items-center gap-2 bg-transparent"
              >
                {productsLoading ? <Spinner className="h-4 w-4" /> : "Refresh"}
              </Button>
            </CardTitle>
            <CardDescription>View and manage all products in your store</CardDescription>
          </CardHeader>
          <CardContent>
            {productsLoading ? (
              <div className="flex justify-center py-8">
                <Spinner className="h-8 w-8 text-purple-600" />
              </div>
            ) : products.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No products yet. Add your first product above!</p>
            ) : (
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-purple-50">
                      <TableHead className="font-semibold">Name</TableHead>
                      <TableHead className="font-semibold">Category</TableHead>
                      <TableHead className="font-semibold">Price</TableHead>
                      <TableHead className="font-semibold">Stock</TableHead>
                      <TableHead className="font-semibold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id} className="hover:bg-gray-50 transition-colors">
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell className="text-emerald-600 font-semibold">${product.price.toFixed(2)}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              product.stock > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                            }`}
                          >
                            {product.stock}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              onClick={() => openEditDialog(product)}
                              variant="outline"
                              size="sm"
                              className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              onClick={() => handleDeleteProduct(product.id)}
                              variant="outline"
                              size="sm"
                              className="hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                              disabled={deletingProductId === product.id}
                            >
                              {deletingProductId === product.id ? (
                                <Spinner className="h-4 w-4" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Edit Product Dialog */}
      <Dialog open={!!editingProduct} onOpenChange={(open: any) => !open && setEditingProduct(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>Update the product details below</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditProduct} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Product Name</Label>
              <Input
                id="edit-name"
                type="text"
                value={editProductData.name}
                onChange={(e) => setEditProductData({ ...editProductData, name: e.target.value })}
                required
                className="rounded-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-price">Price ($)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  value={editProductData.price}
                  onChange={(e) => setEditProductData({ ...editProductData, price: e.target.value })}
                  required
                  className="rounded-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-stock">Stock</Label>
                <Input
                  id="edit-stock"
                  type="number"
                  value={editProductData.stock}
                  onChange={(e) => setEditProductData({ ...editProductData, stock: e.target.value })}
                  required
                  className="rounded-lg"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingProduct(null)}
                disabled={editProductLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                disabled={editProductLoading}
              >
                {editProductLoading ? (
                  <span className="flex items-center gap-2">
                    <Spinner className="h-4 w-4" />
                    Saving...
                  </span>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="mt-12 py-6 text-center text-sm text-gray-500 border-t">
        © 2025 Your Local Shop. All rights reserved.
      </footer>
    </div>
  )
}
