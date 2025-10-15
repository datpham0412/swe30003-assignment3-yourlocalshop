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
import { LogOut, Pencil, Trash2, Plus } from "lucide-react"

interface Product {
  id: number
  name: string
  price: number
  category: string
}

interface Inventory {
  id: number
  productId: number
  quantity: number
}

interface UnifiedProduct {
  id: number
  name: string
  price: number
  category: string
  quantity: number | null // null if no inventory exists
  inventoryId: number | null // null if no inventory exists
}

export default function AdminDashboard() {
  const router = useRouter()
  const [email, setEmail] = useState<string | null>(null)
  const [password, setPassword] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const [unifiedProducts, setUnifiedProducts] = useState<UnifiedProduct[]>([])
  const [dataLoading, setDataLoading] = useState(false)

  // Add product state
  const [addProductData, setAddProductData] = useState({
    name: "",
    price: "",
    category: "",
  })
  const [addProductLoading, setAddProductLoading] = useState(false)

  const [editingProduct, setEditingProduct] = useState<UnifiedProduct | null>(null)
  const [editProductData, setEditProductData] = useState({
    name: "",
    price: "",
    category: "",
    quantity: "",
  })
  const [editProductLoading, setEditProductLoading] = useState(false)

  // Delete state
  const [deletingProductId, setDeletingProductId] = useState<number | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<UnifiedProduct | null>(null)

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

    fetchUnifiedData()
  }, [router])

  const showToast = (type: "success" | "error", text: string) => {
    setToast({ type, text })
    setTimeout(() => setToast(null), 4000)
  }

  const fetchUnifiedData = async () => {
    setDataLoading(true)
    try {
      // Fetch both products and inventories in parallel
      const [productsResponse, inventoriesResponse] = await Promise.all([
        fetch("http://localhost:5074/api/Product/list"),
        fetch("http://localhost:5074/api/Inventory/list"),
      ])

      if (!productsResponse.ok) {
        showToast("error", "Failed to load products.")
        setDataLoading(false)
        return
      }

      const products: Product[] = await productsResponse.json()
      const inventories: Inventory[] = inventoriesResponse.ok ? await inventoriesResponse.json() : []

      // Merge products with their inventory data
      const unified: UnifiedProduct[] = products.map((product) => {
        const inventory = inventories.find((inv) => inv.productId === product.id)
        return {
          id: product.id,
          name: product.name,
          price: product.price,
          category: product.category,
          quantity: inventory ? inventory.quantity : null,
          inventoryId: inventory ? inventory.id : null,
        }
      })

      setUnifiedProducts(unified)
    } catch (error) {
      showToast("error", "Network error. Please check your connection.")
    } finally {
      setDataLoading(false)
    }
  }

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddProductLoading(true)

    try {
      const response = await fetch(
        `http://localhost:5074/api/Product/add?email=${encodeURIComponent(email!)}&password=${encodeURIComponent(password!)}&name=${encodeURIComponent(addProductData.name)}&price=${encodeURIComponent(addProductData.price)}&category=${encodeURIComponent(addProductData.category)}}`,
        { method: "POST" },
      )

      if (response.ok) {
        showToast("success", "Product added successfully!")
        setAddProductData({ name: "", price: "", category: ""})
        fetchUnifiedData() // Refresh the list
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
      let productUpdateSuccess = true
      let inventoryUpdateSuccess = true

      // Check if product fields changed
      const productChanged =
        editProductData.name !== editingProduct.name ||
        Number.parseFloat(editProductData.price) !== editingProduct.price ||
        editProductData.category !== editingProduct.category

      // Check if quantity changed
      const quantityChanged =
        editProductData.quantity !== "" &&
        (editingProduct.quantity === null || Number.parseInt(editProductData.quantity) !== editingProduct.quantity)

      // Update product if needed
      if (productChanged) {
        const response = await fetch(
          `http://localhost:5074/api/Product/update?email=${encodeURIComponent(email!)}&password=${encodeURIComponent(password!)}&id=${editingProduct.id}&name=${encodeURIComponent(editProductData.name)}&category=${encodeURIComponent(editProductData.category)}&price=${encodeURIComponent(editProductData.price)}`,
          { method: "PUT" },
        )
        productUpdateSuccess = response.ok
        if (!response.ok) {
          const errorText = await response.text()
          showToast("error", errorText || "Failed to update product.")
        }
      }

      // Update or add inventory if quantity changed
      if (quantityChanged && editProductData.quantity !== "") {
        if (editingProduct.inventoryId !== null) {
          // Update existing inventory
          const response = await fetch(
            `http://localhost:5074/api/Inventory/update?email=${encodeURIComponent(email!)}&password=${encodeURIComponent(password!)}&productId=${editingProduct.id}&quantity=${encodeURIComponent(editProductData.quantity)}`,
            { method: "PUT" },
          )
          inventoryUpdateSuccess = response.ok
          if (!response.ok) {
            const errorText = await response.text()
            showToast("error", errorText || "Failed to update inventory.")
          }
        } else {
          // Add new inventory
          const response = await fetch(
            `http://localhost:5074/api/Inventory/add?email=${encodeURIComponent(email!)}&password=${encodeURIComponent(password!)}&productId=${editingProduct.id}&quantity=${encodeURIComponent(editProductData.quantity)}`,
            { method: "POST" },
          )
          inventoryUpdateSuccess = response.ok
          if (!response.ok) {
            const errorText = await response.text()
            showToast("error", errorText || "Failed to add inventory.")
          }
        }
      }

      if (productUpdateSuccess && inventoryUpdateSuccess) {
        showToast("success", "Product updated successfully!")
        setEditingProduct(null)
        fetchUnifiedData() // Refresh the list
      }
    } catch (error) {
      showToast("error", "Network error. Please check your connection.")
    } finally {
      setEditProductLoading(false)
    }
  }

  const handleDeleteProduct = async () => {
    if (!productToDelete) return

    setDeletingProductId(productToDelete.id)

    try {
      // Delete product
      const productResponse = await fetch(
        `http://localhost:5074/api/Product/delete?email=${encodeURIComponent(email!)}&password=${encodeURIComponent(password!)}&id=${productToDelete.id}`,
        { method: "DELETE" },
      )

      // Delete inventory if exists
      let inventoryDeleted = true
      if (productToDelete.inventoryId !== null) {
        const inventoryResponse = await fetch(
          `http://localhost:5074/api/Inventory/delete?email=${encodeURIComponent(email!)}&password=${encodeURIComponent(password!)}&productId=${productToDelete.inventoryId}`,
          { method: "DELETE" },
        )
        inventoryDeleted = inventoryResponse.ok
      }

      if (productResponse.ok && inventoryDeleted) {
        showToast("success", "Product and inventory deleted successfully!")
        setUnifiedProducts(unifiedProducts.filter((p) => p.id !== productToDelete.id))
      } else {
        const errorText = await productResponse.text()
        showToast("error", errorText || "Failed to delete product.")
      }
    } catch (error) {
      showToast("error", "Network error. Please check your connection.")
    } finally {
      setDeletingProductId(null)
      setDeleteDialogOpen(false)
      setProductToDelete(null)
    }
  }

  const openEditDialog = (product: UnifiedProduct) => {
    setEditingProduct(product)
    setEditProductData({
      name: product.name,
      price: product.price.toString(),
      category: product.category,
      quantity: product.quantity !== null ? product.quantity.toString() : "",
    })
  }

  const openDeleteDialog = (product: UnifiedProduct) => {
    setProductToDelete(product)
    setDeleteDialogOpen(true)
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
            Your Local Shop — Admin Dashboard
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
          <h2 className="text-4xl font-bold text-gray-900">Product & Inventory Management</h2>
          <p className="text-gray-600">Manage your products and inventory in one unified view</p>
        </div>

        {/* Add Product Form */}
        <Card className="shadow-xl border-purple-100 max-w-4xl mx-auto">
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

        {/* Unified Product & Inventory Table */}
        <Card className="shadow-xl border-emerald-100">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Products & Inventory</span>
              <Button
                onClick={fetchUnifiedData}
                variant="outline"
                size="sm"
                disabled={dataLoading}
                className="flex items-center gap-2 bg-transparent"
              >
                {dataLoading ? <Spinner className="h-4 w-4" /> : "Refresh"}
              </Button>
            </CardTitle>
            <CardDescription>View and manage all products with their inventory quantities</CardDescription>
          </CardHeader>
          <CardContent>
            {dataLoading ? (
              <div className="flex justify-center py-8">
                <Spinner className="h-8 w-8 text-purple-600" />
              </div>
            ) : unifiedProducts.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No products yet. Add your first product above!</p>
            ) : (
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-purple-50 to-emerald-50">
                      <TableHead className="font-semibold">Name</TableHead>
                      <TableHead className="font-semibold">Category</TableHead>
                      <TableHead className="font-semibold">Price</TableHead>
                      <TableHead className="font-semibold">Quantity</TableHead>
                      <TableHead className="font-semibold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {unifiedProducts.map((product) => (
                      <TableRow key={product.id} className="hover:bg-gray-50 transition-colors">
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>
                          <span className="px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-700">
                            {product.category}
                          </span>
                        </TableCell>
                        <TableCell className="text-emerald-600 font-semibold">${product.price.toFixed(2)}</TableCell>
                        <TableCell>
                          {product.quantity !== null ? (
                            <span className="px-2 py-1 rounded-full text-xs bg-emerald-100 text-emerald-700 font-semibold">
                              {product.quantity}
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
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
                              onClick={() => openDeleteDialog(product)}
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
      <Dialog open={!!editingProduct} onOpenChange={(open) => !open && setEditingProduct(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Product & Inventory</DialogTitle>
            <DialogDescription>Update product details and quantity</DialogDescription>
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

            <div className="space-y-2">
              <Label htmlFor="edit-category">Category</Label>
              <Input
                id="edit-category"
                type="text"
                value={editProductData.category}
                onChange={(e) => setEditProductData({ ...editProductData, category: e.target.value })}
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
                <Label htmlFor="edit-quantity">Quantity</Label>
                <Input
                  id="edit-quantity"
                  type="number"
                  placeholder="Leave blank to skip"
                  value={editProductData.quantity}
                  onChange={(e) => setEditProductData({ ...editProductData, quantity: e.target.value })}
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
                className="bg-gradient-to-r from-purple-600 to-emerald-600 hover:from-purple-700 hover:to-emerald-700"
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{productToDelete?.name}"? This will remove both the product and its
              inventory record.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false)
                setProductToDelete(null)
              }}
              disabled={deletingProductId !== null}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteProduct}
              className="bg-red-600 hover:bg-red-700"
              disabled={deletingProductId !== null}
            >
              {deletingProductId !== null ? (
                <span className="flex items-center gap-2">
                  <Spinner className="h-4 w-4" />
                  Deleting...
                </span>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="mt-12 py-6 text-center text-sm text-gray-500 border-t">
        © 2025 Your Local Shop. All rights reserved.
      </footer>
    </div>
  )
}
