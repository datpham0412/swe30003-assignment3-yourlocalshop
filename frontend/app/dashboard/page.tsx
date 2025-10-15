"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { LogOut, ShoppingBag } from "lucide-react"

interface Product {
  id: number
  name: string
  price: number
  category: string
  stock: number
}

export default function DashboardPage() {
  const router = useRouter()
  const [role, setRole] = useState<string | null>(null)
  const [email, setEmail] = useState<string | null>(null)
  const [password, setPassword] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const [productData, setProductData] = useState({
    name: "",
    price: "",
    category: "",
    stock: "",
  })
  const [addProductLoading, setAddProductLoading] = useState(false)
  const [addProductMessage, setAddProductMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const [catalogue, setCatalogue] = useState<Product[]>([])
  const [catalogueLoading, setCatalogueLoading] = useState(false)
  const [catalogueError, setCatalogueError] = useState<string | null>(null)

  useEffect(() => {
    const storedEmail = localStorage.getItem("email")
    const storedPassword = localStorage.getItem("password")
    const storedRole = localStorage.getItem("role")

    if (!storedEmail || !storedPassword || !storedRole) {
      router.push("/auth")
      return
    }

    if (storedRole === "Admin") {
      router.push("/dashboard/admin")
      return
    }

    setEmail(storedEmail)
    setPassword(storedPassword)
    setRole(storedRole)
    setLoading(false)

    if (storedRole === "Customer") {
      fetchCatalogue()
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("email")
    localStorage.removeItem("password")
    localStorage.removeItem("role")
    router.push("/auth")
  }

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddProductLoading(true)
    setAddProductMessage(null)

    try {
      const response = await fetch(
        `http://localhost:5074/api/Product/add?email=${encodeURIComponent(email!)}&password=${encodeURIComponent(password!)}&name=${encodeURIComponent(productData.name)}&price=${encodeURIComponent(productData.price)}&category=${encodeURIComponent(productData.category)}&stock=${encodeURIComponent(productData.stock)}`,
        { method: "POST" },
      )

      if (response.ok) {
        setAddProductMessage({ type: "success", text: "Product added successfully!" })
        setProductData({ name: "", price: "", category: "", stock: "" })
      } else {
        const errorText = await response.text()
        setAddProductMessage({ type: "error", text: errorText || "Failed to add product." })
      }
    } catch (error) {
      setAddProductMessage({ type: "error", text: "Network error. Please check your connection." })
    } finally {
      setAddProductLoading(false)
    }
  }

  const fetchCatalogue = async () => {
    setCatalogueLoading(true)
    setCatalogueError(null)

    try {
      const response = await fetch("http://localhost:5074/api/Catalogue")

      if (response.ok) {
        const data = await response.json()
        setCatalogue(data)
      } else {
        setCatalogueError("Failed to load catalogue.")
      }
    } catch (error) {
      setCatalogueError("Network error. Please check your connection.")
    } finally {
      setCatalogueLoading(false)
    }
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

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-gray-900">Welcome back, {email}</h2>
            <p className="text-gray-600">Browse our catalogue and find what you need</p>
          </div>

          <div className="flex justify-center">
            <Button
              onClick={fetchCatalogue}
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 flex items-center gap-2"
              disabled={catalogueLoading}
            >
              {catalogueLoading ? (
                <>
                  <Spinner className="h-4 w-4" />
                  Loading Catalogue...
                </>
              ) : (
                <>
                  <ShoppingBag className="h-4 w-4" />
                  Refresh Catalogue
                </>
              )}
            </Button>
          </div>

          {catalogueError && <p className="text-center text-red-600">{catalogueError}</p>}

          {catalogue.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {catalogue.map((product) => (
                <Card key={product.id} className="shadow-lg hover:shadow-xl transition-shadow border-emerald-100">
                  <CardHeader>
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <CardDescription className="text-sm text-gray-500">{product.category}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-emerald-600">${product.price.toFixed(2)}</span>
                      <span
                        className={`text-sm px-2 py-1 rounded-full ${
                          product.stock > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}
                      >
                        {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            !catalogueLoading && <p className="text-center text-gray-500">No products available. Check back later!</p>
          )}
        </div>
      </main>

      <footer className="mt-12 py-6 text-center text-sm text-gray-500 border-t">
        © 2025 Your Local Shop. All rights reserved.
      </footer>
    </div>
  )
}
