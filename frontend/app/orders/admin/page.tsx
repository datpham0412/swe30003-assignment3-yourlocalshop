"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { LogOut, Search, CreditCard, Home, Package, FileText, LayoutDashboard, Truck, BarChart3 } from "lucide-react"
import { toast } from "sonner"
import AdminNav from "@/components/admin/AdminNav"

interface Order {
  orderId: number
  customerId: number
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
  }
  return colors[status] || "bg-gray-100 text-gray-800 border-gray-300"
}

// Match the backend enum numeric values exactly
const statusMap: Record<string, number> = {
  PendingPayment: 0,
  Paid: 1,
  Processing: 2,
  Packed: 3,
  Shipped: 4,
  Delivered: 5,
}

export default function AdminOrdersPage() {
  const router = useRouter()
  const [email, setEmail] = useState<string | null>(null)
  const [password, setPassword] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [dataLoading, setDataLoading] = useState(false)

  useEffect(() => {
    const storedEmail = localStorage.getItem("email")
    const storedPassword = localStorage.getItem("password")
    const storedRole = localStorage.getItem("role")

    if (!storedEmail || !storedPassword || !storedRole) {
      router.push("/auth")
      return
    }

    if (storedRole !== "Admin") {
      toast.error("Access denied", { description: "This page is for admins only." })
      router.push("/catalogue")
      return
    }

    setEmail(storedEmail)
    setPassword(storedPassword)
    setLoading(false)
    fetchOrders(storedEmail, storedPassword)
  }, [router])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredOrders(orders)
    } else {
      const filtered = orders.filter((order) => order.orderId.toString().includes(searchQuery))
      setFilteredOrders(filtered)
    }
  }, [searchQuery, orders])

  const fetchOrders = async (userEmail: string, userPassword: string) => {
    setDataLoading(true)
    try {
      const response = await fetch(
        `http://localhost:5074/api/Order/all?email=${encodeURIComponent(userEmail)}&password=${encodeURIComponent(userPassword)}`
      )

      if (response.ok) {
        const data: Order[] = await response.json()
        setOrders(data)
        setFilteredOrders(data)
      } else {
        toast.error("Failed to load orders")
      }
    } catch {
      toast.error("Network error", { description: "Please check your connection." })
    } finally {
      setDataLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.clear()
    router.push("/auth")
  }

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    if (!email || !password) return

    const statusValue = statusMap[newStatus]
    if (statusValue === undefined) {
      toast.error("Invalid status value")
      return
    }

    try {
      const response = await fetch(
        `http://localhost:5074/api/Order/status/${orderId}?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          // 👇 send numeric enum value like Swagger does
          body: JSON.stringify({ status: statusValue }),
        }
      )

      if (response.ok) {
        toast.success("Order status updated", {
          description: `Order #${orderId} changed to ${newStatus}`,
        })
        fetchOrders(email, password)
      } else {
        const errorText = await response.text()
        toast.error("Failed to update status", {
          description: errorText || "Please try again.",
        })
      }
    } catch {
      toast.error("Network error", {
        description: "Could not update order status.",
      })
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
      <AdminNav />

      <main className="container mx-auto px-4 py-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-emerald-500 bg-clip-text text-transparent">
              Order Management
            </CardTitle>
            <CardDescription>View and manage all customer orders</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by Order ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
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
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order.orderId} className="hover:bg-gray-50">
                        <TableCell className="font-medium">#{order.orderId}</TableCell>
                        <TableCell>#{order.customerId}</TableCell>
                        <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                        </TableCell>
                        <TableCell className="font-semibold text-emerald-600">${order.total.toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Select
                              value={order.status}
                              onValueChange={(newStatus) => updateOrderStatus(order.orderId, newStatus)}
                            >
                              <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="Update Status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Paid">Paid</SelectItem>
                                <SelectItem value="Processing">Processing</SelectItem>
                                <SelectItem value="Packed">Packed</SelectItem>
                                <SelectItem value="Shipped">Shipped</SelectItem>
                                <SelectItem value="Delivered">Delivered</SelectItem>
                              </SelectContent>
                            </Select>

                            <Button variant="outline" size="sm" onClick={() => router.push(`/orders/${order.orderId}`)}>
                              View Details
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
    </div>
  )
}
