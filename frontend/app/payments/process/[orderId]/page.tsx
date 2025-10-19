"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { CreditCard, ArrowLeft, CheckCircle } from "lucide-react"
import { toast } from "sonner"
import { CustomerNav } from "@/components/customer/CustomerNav"

interface OrderLine {
  productId: number
  name: string
  unitPrice: number
  quantity: number
  lineTotal: number
}

interface Order {
  orderId: number
  status: string
  createdAt: string
  lines: OrderLine[]
  subtotal: number
  tax: number
  total: number
}

export default function PaymentProcessPage() {
  const router = useRouter()
  const params = useParams()
  const orderId = params.orderId as string

  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [order, setOrder] = useState<Order | null>(null)

  useEffect(() => {
    const storedEmail = localStorage.getItem("email")
    const storedPassword = localStorage.getItem("password")
    const storedRole = localStorage.getItem("role")

    if (!storedEmail || !storedPassword || storedRole !== "Customer") {
      router.push("/auth")
      return
    }

    fetchOrder(storedEmail, storedPassword)
  }, [orderId, router])

  const fetchOrder = async (email: string, password: string) => {
    setLoading(true)
    try {
      const response = await fetch(
        `http://localhost:5074/api/Order/${orderId}?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
      )

      if (response.ok) {
        const data = await response.json()
        if (data.status !== "PendingPayment") {
          toast.info("Payment already processed", {
            description: "This order has already been paid.",
          })
          router.push("/orders")
          return
        }
        setOrder(data)
      } else {
        toast.error("Failed to load order", {
          description: "Please try again later.",
        })
        router.push("/orders")
      }
    } catch (error) {
      toast.error("Network error", {
        description: "Unable to connect to the server.",
      })
      router.push("/orders")
    } finally {
      setLoading(false)
    }
  }

  const handlePayment = async () => {
    const email = localStorage.getItem("email")
    const password = localStorage.getItem("password")

    if (!email || !password) return

    setProcessing(true)
    try {
      const response = await fetch(
        `http://localhost:5074/api/Payment/process/${orderId}?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
        {
          method: "POST",
        },
      )

      if (response.ok) {
        toast.success("Payment successful!", {
          description: "Invoice generated. Redirecting...",
          icon: <CheckCircle className="h-5 w-5" />,
        })
        setTimeout(() => {
          router.push(`/invoices/${orderId}`)
        }, 1500)
      } else {
        const errorText = await response.text()
        toast.error("Payment failed", {
          description: errorText || "Please try again later.",
        })
      }
    } catch (error) {
      toast.error("Network error", {
        description: "Unable to process payment.",
      })
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner className="h-8 w-8 text-purple-600" />
      </div>
    )
  }

  if (!order) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-emerald-50">
      <CustomerNav />

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <Button
          onClick={() => router.push("/orders")}
          variant="ghost"
          className="mb-6 flex items-center gap-2 text-purple-600 hover:text-purple-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </Button>

        <div className="flex items-center gap-3 mb-6">
          <CreditCard className="h-8 w-8 text-purple-600" />
          <h2 className="text-3xl font-bold text-gray-900">Payment</h2>
        </div>

        <Card className="shadow-lg mb-6">
          <CardHeader>
            <CardTitle className="text-xl">Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="font-semibold text-gray-700">Order ID:</span>
                <span className="text-gray-900">#{order.orderId}</span>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-gray-700 mb-3">Items:</h3>
                {order.lines.map((line, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{line.name}</p>
                      <p className="text-gray-500">
                        ${line.unitPrice.toFixed(2)} × {line.quantity}
                      </p>
                    </div>
                    <p className="font-semibold text-gray-900">${line.lineTotal.toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="text-gray-900">${order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax (10%):</span>
                  <span className="text-gray-900">${order.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span className="text-gray-900">Total:</span>
                  <span className="text-emerald-600">${order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Payment Method</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-6">Click the button below to simulate payment processing.</p>
            <Button
              onClick={handlePayment}
              disabled={processing}
              className="w-full bg-gradient-to-r from-purple-600 to-emerald-500 hover:from-purple-700 hover:to-emerald-600 text-lg py-6"
            >
              {processing ? (
                <>
                  <Spinner className="h-5 w-5 mr-2" />
                  Processing Payment...
                </>
              ) : (
                <>
                  <CreditCard className="h-5 w-5 mr-2" />
                  Simulate Payment
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
