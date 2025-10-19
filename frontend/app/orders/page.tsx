"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Badge } from "@/components/ui/badge"
import { Package, CreditCard, FileText } from "lucide-react"
import { toast } from "sonner"
import { CustomerNav } from "@/components/customer/CustomerNav"

interface Order {
  orderId: number
  status: string
  createdAt: string
  total: number
  lines: Array<{
    productId: number
    name: string
    unitPrice: number
    quantity: number
    lineTotal: number
  }>
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    PendingPayment: "bg-yellow-100 text-yellow-800 border-yellow-300",
    Paid: "bg-blue-100 text-blue-800 border-blue-300",
    Processing: "bg-orange-100 text-orange-800 border-orange-300",
    Packed: "bg-purple-100 text-purple-800 border-purple-300",
    Shipped: "bg-indigo-100 text-indigo-800 border-indigo-300",
    Delivered: "bg-green-100 text-green-800 border-green-300",
    Failed: "bg-red-100 text-red-800 border-red-300",
    Cancelled: "bg-gray-100 text-gray-800 border-gray-300",
  }
  return colors[status] || "bg-gray-100 text-gray-800 border-gray-300"
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
}

export default function OrdersPage() {
  const router = useRouter()
  const [email, setEmail] = useState<string | null>(null)
  const [password, setPassword] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<Order[]>([])

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
    fetchOrders(storedEmail, storedPassword)
  }, [router])

  const fetchOrders = async (userEmail: string, userPassword: string) => {
    setLoading(true)
    try {
      const response = await fetch(
        `http://localhost:5074/api/Order/list?email=${encodeURIComponent(userEmail)}&password=${encodeURIComponent(userPassword)}`,
      )

      if (response.ok) {
        const data = await response.json()
        setOrders(data)
      } else {
        toast.error("Failed to load orders", {
          description: "Please try again later.",
        })
      }
    } catch (error) {
      toast.error("Network error", {
        description: "Unable to connect to the server.",
      })
    } finally {
      setLoading(false)
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
      <CustomerNav />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center gap-3 mb-6">
          <Package className="h-8 w-8 text-purple-600" />
          <h2 className="text-3xl font-bold text-gray-900">Order History</h2>
        </div>

        {orders.length === 0 ? (
          <Card className="shadow-lg">
            <CardContent className="py-12 text-center">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-4">No orders yet</p>
              <Button
                onClick={() => router.push("/catalogue")}
                className="bg-gradient-to-r from-purple-600 to-emerald-500 hover:from-purple-700 hover:to-emerald-600"
              >
                Start Shopping
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.orderId} className="shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-[200px]">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg text-gray-900">Order #{order.orderId}</h3>
                        <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                      </div>
                      <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {order.lines.length} item{order.lines.length !== 1 ? "s" : ""}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right mr-4">
                        <p className="text-2xl font-bold text-emerald-600">${order.total.toFixed(2)}</p>
                      </div>

                      <div className="flex flex-col gap-2">
                        {order.status === "PendingPayment" && (
                          <Button
                            onClick={() => router.push(`/payments/process/${order.orderId}`)}
                            className="bg-gradient-to-r from-purple-600 to-emerald-500 hover:from-purple-700 hover:to-emerald-600"
                            size="sm"
                          >
                            <CreditCard className="h-4 w-4 mr-2" />
                            Make Payment
                          </Button>
                        )}

                        {order.status === "Paid" && (
                          <Button
                            onClick={() => router.push(`/invoices/${order.orderId}`)}
                            className="bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600"
                            size="sm"
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            View Invoice
                          </Button>
                        )}

                        <Button
                          onClick={() => router.push(`/orders/${order.orderId}`)}
                          variant="outline"
                          size="sm"
                          className="hover:bg-purple-50"
                        >
                          View Details →
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
