"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"
import { LogOut, ArrowLeft, Package } from "lucide-react"
import { toast } from "sonner"

interface Cart {
  cartId: number
  items: Array<{
    cartItemId: number
    productId: number
    name: string
    unitPrice: number
    quantity: number
    subtotal: number
  }>
  subtotal: number
  tax: number
  total: number
}

export default function CheckoutPage() {
  const router = useRouter()
  const [email, setEmail] = useState<string | null>(null)
  const [password, setPassword] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [cart, setCart] = useState<Cart | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    shipmentAddress: "",
    contactName: "",
    contactPhone: "",
    note: "",
  })

  const [errors, setErrors] = useState({
    shipmentAddress: "",
    contactName: "",
    contactPhone: "",
  })

  useEffect(() => {
    const storedEmail = localStorage.getItem("email")
    const storedPassword = localStorage.getItem("password")
    const storedRole = localStorage.getItem("role")

    if (!storedEmail || !storedPassword || storedRole !== "Customer") {
      router.push("/auth")
      return
    }

    setEmail(storedEmail)
    setPassword(storedPassword)
    fetchCart(storedEmail, storedPassword)
  }, [router])

  const fetchCart = async (userEmail: string, userPassword: string) => {
    setLoading(true)
    try {
      const response = await fetch(
        `http://localhost:5074/api/ShoppingCart/list?email=${encodeURIComponent(userEmail)}&password=${encodeURIComponent(userPassword)}`,
      )

      if (response.ok) {
        const data = await response.json()
        if (data.items.length === 0) {
          toast.info("Cart is empty", {
            description: "Please add items to your cart first.",
          })
          router.push("/catalogue")
          return
        }
        setCart(data)
      } else {
       toast.error("Failed to load cart", {
          description: "Please try again later.",
        })
        router.push("/cart")
      }
    } catch (error) {
            toast.error("Network error", {
        description: "Unable to connect to the server.",
      })
      router.push("/cart")

    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    const newErrors = {
      shipmentAddress: "",
      contactName: "",
      contactPhone: "",
    }

    if (!formData.shipmentAddress.trim()) {
      newErrors.shipmentAddress = "Shipping address is required"
    }

    if (!formData.contactName.trim()) {
      newErrors.contactName = "Contact name is required"
    }

    if (!formData.contactPhone.trim()) {
      newErrors.contactPhone = "Contact phone is required"
    } else if (!/^\+?[\d\s-()]+$/.test(formData.contactPhone)) {
      newErrors.contactPhone = "Invalid phone number format"
    }

    setErrors(newErrors)
    return !Object.values(newErrors).some((error) => error !== "")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
       toast.warning("Validation error", {
        description: "Please fill in all required fields correctly.",
      })
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch(
        `http://localhost:5074/api/Order/create?email=${encodeURIComponent(email!)}&password=${encodeURIComponent(password!)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        },
      )

      if (response.ok) {
        toast.success("Order placed successfully!", {
          description: "Your order has been created.",
        })
        router.push("/orders")
      } else {
        const errorText = await response.text()
        toast.error("Failed to create order", {
          description: errorText || "Something went wrong.",
        })
      }
    } catch (error) {
     toast.error("Network error", {
        description: "Please check your connection.",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleLogout = () => {
    localStorage.clear()
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

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-6">
          <Button
            onClick={() => router.push("/cart")}
            variant="ghost"
            className="flex items-center gap-2 text-purple-600 hover:text-purple-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Cart
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Shipping Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-6 w-6 text-purple-600" />
                  Shipping Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="contactName">
                      Contact Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="contactName"
                      value={formData.contactName}
                      onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                      placeholder="John Doe"
                      className={errors.contactName ? "border-red-500" : ""}
                    />
                    {errors.contactName && <p className="text-sm text-red-500">{errors.contactName}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">
                      Contact Phone <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="contactPhone"
                      value={formData.contactPhone}
                      onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                      placeholder="+1 234 567 8900"
                      className={errors.contactPhone ? "border-red-500" : ""}
                    />
                    {errors.contactPhone && <p className="text-sm text-red-500">{errors.contactPhone}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shipmentAddress">
                      Shipping Address <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="shipmentAddress"
                      value={formData.shipmentAddress}
                      onChange={(e) => setFormData({ ...formData, shipmentAddress: e.target.value })}
                      placeholder="123 Main St, City, State, ZIP"
                      rows={3}
                      className={errors.shipmentAddress ? "border-red-500" : ""}
                    />
                    {errors.shipmentAddress && <p className="text-sm text-red-500">{errors.shipmentAddress}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="note">Order Notes (Optional)</Label>
                    <Textarea
                      id="note"
                      value={formData.note}
                      onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                      placeholder="Any special instructions for your order..."
                      rows={3}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-gradient-to-r from-purple-600 to-emerald-500 hover:from-purple-700 hover:to-emerald-600 text-lg py-6"
                  >
                    {submitting ? (
                      <>
                        <Spinner className="h-4 w-4 mr-2" />
                        Placing Order...
                      </>
                    ) : (
                      "Place Order"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          {cart && (
            <div className="lg:col-span-1">
              <Card className="shadow-lg sticky top-24">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {cart.items.map((item) => (
                      <div key={item.cartItemId} className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          {item.name} x {item.quantity}
                        </span>
                        <span className="font-medium">${item.subtotal.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span>${cart.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Tax (10%)</span>
                      <span>${cart.tax.toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-emerald-600">${cart.total.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
