"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Search, ShoppingBag, Filter, ShoppingCart, Plus, Minus } from "lucide-react"
import { motion } from "framer-motion"
import { CustomerNav } from "@/components/customer/CustomerNav"
import { toast } from "sonner"

interface CatalogueProduct {
  id: number
  name: string
  price: number
  category: string
}

export default function CataloguePage() {
  const [products, setProducts] = useState<CatalogueProduct[]>([])
  const [filteredProducts, setFilteredProducts] = useState<CatalogueProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("All")
  const [categories, setCategories] = useState<string[]>([])
  const [addingToCart, setAddingToCart] = useState<Set<number>>(new Set())
  const [quantities, setQuantities] = useState<Record<number, number>>({})

  useEffect(() => {
    fetchCatalogue()
  }, [])

  useEffect(() => {
    filterProducts()
  }, [searchQuery, selectedCategory, products])

  const fetchCatalogue = async () => {
    setLoading(true)
    try {
      const response = await fetch("http://localhost:5074/api/Catalogue/list")

      if (response.ok) {
        const data: CatalogueProduct[] = await response.json()
        setProducts(data)
        setFilteredProducts(data)

        const uniqueCategories = Array.from(new Set(data.map((p) => p.category)))
        setCategories(["All", ...uniqueCategories])
      }
    } catch (error) {
      console.error("Failed to fetch catalogue:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterProducts = () => {
    let filtered = products

    if (searchQuery) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.category.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (selectedCategory !== "All") {
      filtered = filtered.filter((product) => product.category === selectedCategory)
    }

    setFilteredProducts(filtered)
  }

  const addToCart = async (productId: number) => {
    const email = localStorage.getItem("email")
    const password = localStorage.getItem("password")

    if (!email || !password) {
      toast.error("Authentication required", {
        description: "Please log in to add items to cart",
      })
      return
    }

    const quantity = quantities[productId] || 1
    setAddingToCart((prev) => new Set(prev).add(productId))

    try {
      const response = await fetch(
        `http://localhost:5074/api/ShoppingCart/add?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId, quantity }),
        },
      )

      if (response.ok) {
        toast.success("Added to cart", {
          description: `${quantity} item(s) added successfully`,
        })
        setQuantities((prev) => ({ ...prev, [productId]: 1 }))
      } else {
        const errorText = await response.text()
        toast.error("Failed to add to cart", {
          description: errorText || "Please try again",
        })
      }
    } catch (error) {
      toast.error("Network error", {
        description: "Please check your connection",
      })
    } finally {
      setAddingToCart((prev) => {
        const newSet = new Set(prev)
        newSet.delete(productId)
        return newSet
      })
    }
  }

  const updateQuantity = (productId: number, delta: number) => {
    setQuantities((prev) => {
      const current = prev[productId] || 1
      const newQuantity = Math.max(1, current + delta)
      return { ...prev, [productId]: newQuantity }
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-emerald-50">
        <Spinner className="h-12 w-12 text-purple-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-emerald-50">
      <CustomerNav />

      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-4 mb-12"
        >
          <h2 className="text-5xl font-bold text-gray-900">Our Catalogue</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover our carefully curated selection of quality products
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8 space-y-4"
        >
          <div className="flex flex-col md:flex-row gap-4 max-w-4xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-lg border-gray-300 focus:border-purple-500 focus:ring-purple-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-500" />
              <div className="flex gap-2 flex-wrap">
                {categories.map((category) => (
                  <Button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    className={
                      selectedCategory === category
                        ? "bg-gradient-to-r from-purple-600 to-emerald-600 hover:from-purple-700 hover:to-emerald-700"
                        : "hover:bg-purple-50"
                    }
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <p className="text-center text-sm text-gray-500">
            Showing {filteredProducts.length} of {products.length} products
          </p>
        </motion.div>

        {filteredProducts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-16"
          >
            <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-xl text-gray-500">No products found</p>
            <p className="text-sm text-gray-400 mt-2">Try adjusting your search or filters</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                whileHover={{ scale: 1.03, y: -5 }}
                className="h-full"
              >
                <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-purple-100 h-full">
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
                      <span className="inline-block px-3 py-1 rounded-full text-xs bg-purple-100 text-purple-700 font-medium mb-3">
                        {product.category}
                      </span>
                    </div>

                    <div className="space-y-3 mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-emerald-600 bg-clip-text text-transparent">
                          ${product.price.toFixed(2)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center border rounded-lg">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => updateQuantity(product.id, -1)}
                            disabled={addingToCart.has(product.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm font-medium">{quantities[product.id] || 1}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => updateQuantity(product.id, 1)}
                            disabled={addingToCart.has(product.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        <Button
                          onClick={() => addToCart(product.id)}
                          disabled={addingToCart.has(product.id)}
                          className="flex-1 bg-gradient-to-r from-purple-600 to-emerald-500 hover:from-purple-700 hover:to-emerald-600"
                          size="sm"
                        >
                          {addingToCart.has(product.id) ? (
                            <Spinner className="h-4 w-4" />
                          ) : (
                            <>
                              <ShoppingCart className="h-4 w-4 mr-1" />
                              Add
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>

      <footer className="mt-16 py-8 text-center text-sm text-gray-500 border-t">
        <p>© 2025 Your Local Shop. All rights reserved.</p>
      </footer>
    </div>
  )
}
