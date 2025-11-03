"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, MapPin, Phone, User, FileText, Package, Truck } from "lucide-react"
import { toast } from "sonner"
import { AdminNav } from "@/components/admin/AdminNav"
import { CustomerNav } from "@/components/customer/CustomerNav"
 
interface OrderLine {
  productId: number
  name: string
  unitPrice: number
  quantity: number
  lineTotal: number
}

interface Shipment {
  shipmentId: number
  trackingNumber: string
  status: string
  address: string
  contactName: string
  deliveryDate: string | null
}

interface Order {
  orderId: number
  status: string
  createdAt: string
  lines: OrderLine[]
  subtotal: number
  tax: number
  total: number
  shipmentAddress: string
  contactName: string
  contactPhone: string
  note: string
  shipment: Shipment | null
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

const getShipmentStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    Pending: "bg-gray-100 text-gray-800 border-gray-300",
    Dispatched: "bg-blue-100 text-blue-800 border-blue-300",
    InTransit: "bg-purple-100 text-purple-800 border-purple-300",
    Delivered: "bg-green-100 text-green-800 border-green-300",
  }
  return colors[status] || "bg-gray-100 text-gray-800 border-gray-300"
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function OrderDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [email, setEmail] = useState<string | null>(null)
  const [password, setPassword] = useState<string | null>(null)
  const [role, setRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [order, setOrder] = useState<Order | null>(null)

  useEffect(() => {
    const storedEmail = localStorage.getItem("email")
    const storedPassword = localStorage.getItem("password")
    const storedRole = localStorage.getItem("role")

    if (!storedEmail || !storedPassword || !storedRole) {
      router.push("/auth")
      return
    }

    if (storedRole !== "Customer" && storedRole !== "Admin") {
      router.push("/auth")
      return
    }

    setEmail(storedEmail)
    setPassword(storedPassword)
    setRole(storedRole)
    fetchOrder(storedEmail, storedPassword, params.id as string)
  }, [router, params.id])

  const fetchOrder = async (userEmail: string, userPassword: string, orderId: string) => {
    setLoading(true)
    try {
      const response = await fetch(
        `http://localhost:5074/api/Order/${orderId}?email=${encodeURIComponent(userEmail)}&password=${encodeURIComponent(userPassword)}`,
      )

      if (response.ok) {
        const data = await response.json()
        setOrder(data)
      } else {
        toast.info("Error", {
            description: "Failed to load order details",
        })
        router.push("/orders")
      }
    } catch (error) {
      toast.info("Error", {
        description: "Network error",
      })
      router.push("/orders")
    } finally {
      setLoading(false)
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

  if (!order) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-emerald-50">
      {/* Header - Different for Admin vs Customer */}
      {role === "Admin" ? <AdminNav /> : <CustomerNav />}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-6">
          <Button
            onClick={() => router.push(role === "Admin" ? "/orders/admin" : "/orders")}
            variant="ghost"
            className="flex items-center gap-2 text-purple-600 hover:text-purple-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Orders
          </Button>
        </div>

        <div className="space-y-6">
          {/* Order Header */}
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <Package className="h-8 w-8 text-purple-600" />
                  <div>
                    <CardTitle className="text-2xl">Order #{order.orderId}</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">{formatDate(order.createdAt)}</p>
                  </div>
                </div>
                <Badge className={`${getStatusColor(order.status)} text-lg px-4 py-2`}>{order.status}</Badge>
              </div>
            </CardHeader>
          </Card>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Order Items */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {order.lines.map((line, index) => (
                      <div key={index} className="flex justify-between items-center pb-4 border-b last:border-b-0">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{line.name}</h4>
                          <p className="text-sm text-gray-500">
                            ${line.unitPrice.toFixed(2)} x {line.quantity}
                          </p>
                        </div>
                        <p className="font-bold text-gray-900">${line.lineTotal.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-4 border-t space-y-2">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span>${order.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Tax (10%)</span>
                      <span>${order.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold pt-2 border-t">
                      <span>Total</span>
                      <span className="text-emerald-600">${order.total.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Shipping Information */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Shipping Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-purple-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Contact Name</p>
                      <p className="font-medium text-gray-900">{order.contactName}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-purple-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Contact Phone</p>
                      <p className="font-medium text-gray-900">{order.contactPhone}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-purple-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Shipping Address</p>
                      <p className="font-medium text-gray-900 whitespace-pre-line">{order.shipmentAddress}</p>
                    </div>
                  </div>

                  {order.note && (
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-purple-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Order Notes</p>
                        <p className="font-medium text-gray-900 whitespace-pre-line">{order.note}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Shipment Tracking */}
              {order.shipment && (
                <Card className="shadow-lg">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Truck className="h-5 w-5 text-purple-600" />
                        Shipment Tracking
                      </CardTitle>
                      <Badge className={getShipmentStatusColor(order.shipment.status)}>
                        {order.shipment.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Tracking Number</p>
                      <p className="font-bold text-lg text-purple-600">{order.shipment.trackingNumber}</p>
                    </div>

                    {order.shipment.deliveryDate && (
                      <div>
                        <p className="text-sm text-gray-500">Delivery Date</p>
                        <p className="font-medium text-gray-900">{formatDate(order.shipment.deliveryDate)}</p>
                      </div>
                    )}

                    <div className="pt-3 border-t">
                      <p className="text-xs text-gray-500">
                        {order.shipment.status === "Pending" && "Your order is being prepared for shipment."}
                        {order.shipment.status === "Dispatched" && "Your order has been dispatched and is on its way!"}
                        {order.shipment.status === "InTransit" && "Your order is in transit to the delivery address."}
                        {order.shipment.status === "Delivered" && "Your order has been successfully delivered!"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
