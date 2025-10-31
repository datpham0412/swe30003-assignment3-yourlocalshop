"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Package, CreditCard, FileText, LogOut, Search, Home, Truck, BarChart3, LayoutDashboard } from "lucide-react"
import { toast } from "sonner"
import { CustomerNav } from "@/components/customer/CustomerNav"
import Link from "next/link"

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
  total: number
  lines: Array<{
    productId: number
    name: string
    unitPrice: number
    quantity: number
    lineTotal: number
  }>
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

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
}

export default function OrdersPage() {
  const router = useRouter()
  const [email, setEmail] = useState<string | null>(null)
  const [password, setPassword] = useState<string | null>(null)
  const [role, setRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [dataLoading, setDataLoading] = useState(false)
  const [processingOrderId, setProcessingOrderId] = useState<number | null>(null)
  const [updatingStatusOrderId, setUpdatingStatusOrderId] = useState<number | null>(null)

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
    setLoading(false)
    fetchOrders(storedEmail, storedPassword, storedRole)
  }, [router])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredOrders(orders)
    } else {
      const filtered = orders.filter((order) =>
        order.orderId.toString().includes(searchQuery) ||
        order.status.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredOrders(filtered)
    }
  }, [searchQuery, orders])

  const fetchOrders = async (userEmail: string, userPassword: string, userRole: string) => {
    setDataLoading(true)
    try {
      const endpoint = userRole === "Admin"
        ? `http://localhost:5074/api/Order/all?email=${encodeURIComponent(userEmail)}&password=${encodeURIComponent(userPassword)}`
        : `http://localhost:5074/api/Order/list?email=${encodeURIComponent(userEmail)}&password=${encodeURIComponent(userPassword)}`

      const response = await fetch(endpoint)

      if (response.ok) {
        const data = await response.json()
        setOrders(data)
        setFilteredOrders(data)
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
      setDataLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.clear()
    router.push("/auth")
  }

    const handleProcessPayment = async (orderId: number) => {
    if (!email || !password) return

    setProcessingOrderId(orderId)
    try {
      const response = await fetch(
        `http://localhost:5074/api/Order/${orderId}/admin-pay?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
        {
          method: "POST",
        },
      )

      if (response.ok) {
        const result = await response.json()
        toast.success("Payment processed successfully!", {
          description: `Invoice ${result.invoiceNumber} generated. Shipment created.`,
        })
        // Refresh orders list
        if (role) {
          fetchOrders(email, password, role)
        }
      } else {
        const errorText = await response.text()
        toast.error("Payment processing failed", {
          description: errorText || "Please try again.",
        })
      }
    } catch (error) {
      toast.error("Network error", {
        description: "Unable to process payment.",
      })
    } finally {
      setProcessingOrderId(null)
    }
  }

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    if (!email || !password) return

    setUpdatingStatusOrderId(orderId)

    // Force string conversion to ensure clean JSON serialization
    const requestBody = { Status: String(newStatus) }

    // Alternative: Use numeric enum values (like Swagger)
    // const statusMap: Record<string, number> = {
    //   PendingPayment: 0, Paid: 1, Processing: 2, Packed: 3,
    //   Shipped: 4, Delivered: 5, Failed: 6, Cancelled: 7
    // }
    // const requestBody = { Status: statusMap[newStatus] }

    console.log("🚀 Sending status update request:", {
      orderId,
      newStatus,
      requestBody,
      stringified: JSON.stringify(requestBody)
    })

    try {
      const response = await fetch(
        `http://localhost:5074/api/Order/status/${orderId}?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          // Send Status with exact enum string match (e.g., "Paid", "Processing")
          // Using String() to ensure clean string serialization
          body: JSON.stringify(requestBody),
        }
      )

      console.log("📥 Response status:", response.status)

      if (response.ok) {
        const result = await response.json()
        console.log("✅ Status updated successfully:", result)
        toast.success("Order status updated!", {
          description: `Order #${orderId} status changed to ${newStatus}`,
        })
        // Refresh orders list
        if (role) {
          fetchOrders(email, password, role)
        }
      } else {
        const errorText = await response.text()
        console.error("❌ Status update failed:", {
          status: response.status,
          errorText
        })
        toast.error("Failed to update status", {
          description: errorText || "Please try again.",
        })
      }
    } catch (error) {
      console.error("🔥 Network error:", error)
      toast.error("Network error", {
        description: "Could not update order status.",
      })
    } finally {
      setUpdatingStatusOrderId(null)
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
      {/* Header - Different for Admin vs Customer */}
      {role === "Admin" ? (
        <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-emerald-500 bg-clip-text text-transparent">
                Your Local Shop — Admin
              </h1>
              <nav className="flex items-center gap-2">
                <Link href="/">
                  <Button variant="ghost" size="sm" className="hover:bg-purple-50">
                    <Home className="h-4 w-4 mr-2" />
                    Home
                  </Button>
                </Link>
                <Link href="/orders">
                  <Button variant="default" size="sm" className="bg-gradient-to-r from-purple-600 to-emerald-500">
                    <Package className="h-4 w-4 mr-2" />
                    Orders
                  </Button>
                </Link>
                <Link href="/payments">
                  <Button variant="ghost" size="sm" className="hover:bg-purple-50">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Payments
                  </Button>
                </Link>
                <Link href="/invoices">
                  <Button variant="ghost" size="sm" className="hover:bg-purple-50">
                    <FileText className="h-4 w-4 mr-2" />
                    Invoices
                  </Button>
                </Link>
                <Link href="/shipments">
                  <Button variant="ghost" size="sm" className="hover:bg-purple-50">
                    <Truck className="h-4 w-4 mr-2" />
                    Shipments
                  </Button>
                </Link>
                <Link href="/reports">
                  <Button variant="ghost" size="sm" className="hover:bg-purple-50">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Reports
                  </Button>
                </Link>
                <Link href="/dashboard/admin">
                  <Button variant="ghost" size="sm" className="hover:bg-purple-50">
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Admin
                  </Button>
                </Link>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-colors ml-2 bg-transparent"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </nav>
            </div>
          </div>
        </header>
      ) : (
        <CustomerNav />
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {role === "Admin" ? (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-emerald-500 bg-clip-text text-transparent">
                Order Management
              </CardTitle>
              <CardDescription>View and manage all customer orders</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 justify-between">
                <div className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search by Order ID or Status..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
                <Button
                  onClick={() => email && password && role && fetchOrders(email, password, role)}
                  variant="outline"
                  disabled={dataLoading}
                  className="flex items-center gap-2"
                >
                  {dataLoading ? <Spinner className="h-4 w-4" /> : "Refresh"}
                </Button>
              </div>

              {dataLoading ? (
                <div className="flex justify-center py-12">
                  <Spinner className="h-8 w-8 text-purple-600" />
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  {searchQuery ? "No orders found matching your search." : "No orders yet."}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map((order) => (
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
                                  onClick={() => handleProcessPayment(order.orderId)}
                                  disabled={processingOrderId === order.orderId}
                                  className="bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600"
                                  size="sm"
                                >
                                  {processingOrderId === order.orderId ? (
                                    <span className="flex items-center gap-2">
                                      <Spinner className="h-3 w-3" />
                                      Processing...
                                    </span>
                                  ) : (
                                    "Process Payment"
                                  )}
                                </Button>
                              )}
                              {order.status !== "PendingPayment" && order.status !== "Cancelled" && (
                                <div className="space-y-1">
                                  <label className="text-xs text-gray-500">Update Status:</label>
                                  <Select
                                    onValueChange={(value) => handleUpdateStatus(order.orderId, value)}
                                    disabled={updatingStatusOrderId === order.orderId}
                                  >
                                    <SelectTrigger className="w-[180px] h-8 text-sm">
                                      <SelectValue placeholder={updatingStatusOrderId === order.orderId ? "Updating..." : "Change status"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {order.status === "Paid" && (
                                        <>
                                          <SelectItem value="Processing">Processing</SelectItem>
                                          <SelectItem value="Cancelled">Cancel</SelectItem>
                                        </>
                                      )}
                                      {order.status === "Processing" && (
                                        <>
                                          <SelectItem value="Packed">Packed</SelectItem>
                                          <SelectItem value="Cancelled">Cancel</SelectItem>
                                        </>
                                      )}
                                      {order.status === "Packed" && (
                                        <>
                                          <SelectItem value="Shipped">Shipped</SelectItem>
                                          <SelectItem value="Cancelled">Cancel</SelectItem>
                                        </>
                                      )}
                                      {order.status === "Shipped" && (
                                        <SelectItem value="Delivered">Delivered</SelectItem>
                                      )}
                                      {order.status === "Delivered" && (
                                        <SelectItem value="Delivered" disabled>Already Delivered</SelectItem>
                                      )}
                                    </SelectContent>
                                  </Select>
                                </div>
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
            </CardContent>
          </Card>
        ) : (
          <>
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
                      {order.shipment && (
                        <div className="mt-2 flex items-center gap-2">
                          <Truck className="h-4 w-4 text-purple-600" />
                          <span className="text-xs text-gray-600">
                            Tracking: <span className="font-semibold text-purple-600">{order.shipment.trackingNumber}</span>
                          </span>
                        </div>
                      )}
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
          </>
        )}
      </main>
    </div>
  )
}
