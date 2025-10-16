"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DndContext, type DragEndEvent, DragOverlay, type DragStartEvent } from "@dnd-kit/core"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { LogOut } from "lucide-react"
import AddProductForm from "@/components/admin/AddProductForm"
import ProductList, { type Product } from "@/components/admin/ProductList"
import CatalogueSpace from "@/components/admin/CatalogueSpace"

interface Inventory {
  id: number
  productId: number
  quantity: number
}

export default function AdminDashboard() {
  const router = useRouter()
  const [email, setEmail] = useState<string | null>(null)
  const [password, setPassword] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const [products, setProducts] = useState<Product[]>([])
  const [catalogueProducts, setCatalogueProducts] = useState<Product[]>([])
  const [catalogueProductIds, setCatalogueProductIds] = useState<number[]>([])
  const [dataLoading, setDataLoading] = useState(false)

  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [editProductData, setEditProductData] = useState({
    name: "",
    price: "",
    category: "",
    quantity: "", // Added quantity field for editing
  })
  const [editProductLoading, setEditProductLoading] = useState(false)

  const [deletingProductId, setDeletingProductId] = useState<number | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)

  const [activeProduct, setActiveProduct] = useState<Product | null>(null)

  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
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

    fetchAllData()
  }, [router])

  const showToast = (type: "success" | "error", text: string) => {
    setToast({ type, text })
    setTimeout(() => setToast(null), 4000)
  }

  const fetchAllData = async () => {
    setDataLoading(true)
    try {
      // Fetch products, inventory, and catalogue in parallel
      const [productsRes, inventoryRes, catalogueRes] = await Promise.all([
        fetch("http://localhost:5074/api/Product/list"),
        fetch("http://localhost:5074/api/Inventory/list"),
        fetch("http://localhost:5074/api/Catalogue/list"),
      ])

      if (!productsRes.ok) {
        showToast("error", "Failed to load products.")
        setDataLoading(false)
        return
      }

      const productsData: Product[] = await productsRes.json()
      const inventoryData: Inventory[] = inventoryRes.ok ? await inventoryRes.json() : []
      const catalogueData: Product[] = catalogueRes.ok ? await catalogueRes.json() : []

      // Merge products with inventory quantities
      const mergedProducts = productsData.map((product) => {
        const inventory = inventoryData.find((inv) => inv.productId === product.id)
        return {
          ...product,
          quantity: inventory?.quantity,
          inventoryId: inventory?.id,
        }
      })

      setProducts(mergedProducts)
      setCatalogueProducts(catalogueData)
      setCatalogueProductIds(catalogueData.map((p) => p.id))
    } catch (error) {
      showToast("error", "Network error. Please check your connection.")
    } finally {
      setDataLoading(false)
    }
  }

  const handleDragStart = (event: DragStartEvent) => {
    const product = event.active.data.current as Product
    setActiveProduct(product)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveProduct(null)

    if (!active || !email || !password) return

    const product = active.data.current as Product
    const isCurrentlyInCatalogue = catalogueProductIds.includes(product.id)

    let shouldBeInCatalogue = isCurrentlyInCatalogue

    if (over?.id === "catalogue-space") {
      shouldBeInCatalogue = true
    } else if (over?.id === "product-list" || over === null) {
      shouldBeInCatalogue = false
    } else {
      // Dropped on another droppable - no change
      return
    }

    // Only update if the state actually changed
    if (isCurrentlyInCatalogue === shouldBeInCatalogue) return

    try {
      let response: Response

      if (shouldBeInCatalogue) {
        // Add to catalogue
        response = await fetch(
          `http://localhost:5074/api/Catalogue/add?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}&productId=${product.id}`,
          { method: "POST" },
        )
      } else {
        // Remove from catalogue
        response = await fetch(
          `http://localhost:5074/api/Catalogue/remove?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}&productId=${product.id}`,
          { method: "DELETE" },
        )
      }

      if (response.ok) {
        showToast("success", shouldBeInCatalogue ? "Product added to catalogue!" : "Product removed from catalogue!")
        fetchAllData()
      } else {
        const errorText = await response.text()
        showToast("error", errorText || "Failed to update catalogue status.")
      }
    } catch (error) {
      showToast("error", "Network error. Please check your connection.")
    }
  }

  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingProduct || !email || !password) return

    setEditProductLoading(true)

    try {
      // Update product details
      const productResponse = await fetch(
        `http://localhost:5074/api/Product/update?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}&id=${editingProduct.id}&name=${encodeURIComponent(editProductData.name)}&category=${encodeURIComponent(editProductData.category)}&price=${encodeURIComponent(editProductData.price)}`,
        { method: "PUT" },
      )

      if (!productResponse.ok) {
        const errorText = await productResponse.text()
        showToast("error", errorText || "Failed to update product.")
        setEditProductLoading(false)
        return
      }

      // Update inventory if quantity changed
      if (editProductData.quantity !== "") {
        const quantity = Number.parseInt(editProductData.quantity)

        if (editingProduct.inventoryId) {
          // Update existing inventory
          await fetch(
            `http://localhost:5074/api/Inventory/update?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}&productId=${editingProduct.id}&quantity=${quantity}`,
            { method: "PUT" },
          )
        } else {
          // Add new inventory
          await fetch(
            `http://localhost:5074/api/Inventory/add?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}&productId=${editingProduct.id}&quantity=${quantity}`,
            { method: "POST" },
          )
        }
      }

      showToast("success", "Product updated successfully!")
      setEditingProduct(null)
      fetchAllData()
    } catch (error) {
      showToast("error", "Network error. Please check your connection.")
    } finally {
      setEditProductLoading(false)
    }
  }

  const handleDeleteProduct = async () => {
    if (!productToDelete || !email || !password) return

    setDeletingProductId(productToDelete.id)

    try {
      const response = await fetch(
        `http://localhost:5074/api/Product/delete?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}&id=${productToDelete.id}`,
        { method: "DELETE" },
      )

      if (response.ok) {
        showToast("success", "Product deleted successfully!")
        setProducts(products.filter((p) => p.id !== productToDelete.id))
      } else {
        const errorText = await response.text()
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

  const openEditDialog = (product: Product) => {
    setEditingProduct(product)
    setEditProductData({
      name: product.name,
      price: product.price.toString(),
      category: product.category,
      quantity: product.quantity !== undefined ? product.quantity.toString() : "", // Include quantity
    })
  }

  const openDeleteDialog = (product: Product) => {
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
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-emerald-50">
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

        <main className="container mx-auto px-4 py-8">
          <div className="text-center space-y-2 mb-8">
            <h2 className="text-4xl font-bold text-gray-900">Product & Catalogue Management</h2>
            <p className="text-gray-600">Drag products into the catalogue space to make them visible to customers</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              {email && password && (
                <AddProductForm
                  email={email}
                  password={password}
                  onProductAdded={fetchAllData}
                  onShowToast={showToast}
                />
              )}
            </div>

            <div className="lg:col-span-1">
              <ProductList
                products={products}
                loading={dataLoading}
                onEdit={openEditDialog}
                onDelete={openDeleteDialog}
                deletingProductId={deletingProductId}
                catalogueProductIds={catalogueProductIds}
              />
            </div>

            <div className="lg:col-span-1">
              <CatalogueSpace catalogueProducts={catalogueProducts} loading={dataLoading} />
            </div>
          </div>
        </main>

        <Dialog open={!!editingProduct} onOpenChange={(open) => !open && setEditingProduct(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
              <DialogDescription>Update product details and inventory quantity</DialogDescription>
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
                <Label htmlFor="edit-quantity">Quantity (Inventory)</Label>
                <Input
                  id="edit-quantity"
                  type="number"
                  value={editProductData.quantity}
                  onChange={(e) => setEditProductData({ ...editProductData, quantity: e.target.value })}
                  placeholder="Leave empty to keep current"
                  className="rounded-lg"
                />
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

        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{productToDelete?.name}"? This action cannot be undone.
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

        <DragOverlay>
          {activeProduct ? (
            <Card className="shadow-2xl border-purple-300 rotate-3 opacity-90">
              <CardContent className="p-4">
                <h3 className="font-bold text-gray-900">{activeProduct.name}</h3>
                <p className="text-sm text-gray-600">{activeProduct.category}</p>
              </CardContent>
            </Card>
          ) : null}
        </DragOverlay>

        <footer className="mt-12 py-6 text-center text-sm text-gray-500 border-t">
          © 2025 Your Local Shop. All rights reserved.
        </footer>
      </div>
    </DndContext>
  )
}
