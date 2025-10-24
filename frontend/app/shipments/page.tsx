"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { LogOut, Search, Truck, Home, Package, CreditCard, FileText, LayoutDashboard, BarChart3 } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import AdminNav from "@/components/admin/AdminNav"

interface Shipment {
  id: number
  orderId: number
  address: string
  contactName: string
  trackingNumber: string
  status: string
  deliveryDate: string | null
  order: {
    id: number
    customerId: number
    orderDate: string
    status: string
    subtotal: number
    tax: number
    total: number
  }
}

export default function ShipmentsPage() {
  const router = useRouter()
  const [email, setEmail] = useState<string | null>(null)
  const [password, setPassword] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [filteredShipments, setFilteredShipments] = useState<Shipment[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [dataLoading, setDataLoading] = useState(false)
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null)
  const [updateStatus, setUpdateStatus] = useState("")
  const [deliveryDate, setDeliveryDate] = useState("")
  const [updating, setUpdating] = useState(false)

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
    fetchShipments(storedEmail, storedPassword)
  }, [router])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredShipments(shipments)
    } else {
      const filtered = shipments.filter(
        (shipment) =>
          shipment.orderId.toString().includes(searchQuery) ||
          shipment.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setFilteredShipments(filtered)
    }
  }, [searchQuery, shipments])

  const fetchShipments = async (userEmail: string, userPassword: string) => {
    setDataLoading(true)
    try {
      const response = await fetch(
        `http://localhost:5074/api/Shipment/list?email=${encodeURIComponent(userEmail)}&password=${encodeURIComponent(userPassword)}`,
      )

      if (response.ok) {
        const data: Shipment[] = await response.json()
        setShipments(data)
        setFilteredShipments(data)
      } else {
        toast.error("Failed to load shipments")
      }
    } catch (error) {
      toast.error("Network error", { description: "Please check your connection." })
    } finally {
      setDataLoading(false)
    }
  }

  const handleUpdateShipment = async () => {
    if (!selectedShipment || !email || !password || !updateStatus) return

    setUpdating(true)
    try {
      const deliveryParam = deliveryDate ? `&deliveryDate=${encodeURIComponent(deliveryDate)}` : ""
      const response = await fetch(
        `http://localhost:5074/api/Shipment/update?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}&orderId=${selectedShipment.orderId}&status=${updateStatus}${deliveryParam}`,
        { method: "PUT" },
      )

      if (response.ok) {
        const result = await response.json()
        toast.success("Shipment updated successfully!", {
          description: result.emailNotification || "Status updated and customer notified.",
        })
        setSelectedShipment(null)
        setUpdateStatus("")
        setDeliveryDate("")
        fetchShipments(email, password)
      } else {
        const errorText = await response.text()
        toast.error("Update failed", { description: errorText })
      }
    } catch (error) {
      toast.error("Network error", { description: "Please check your connection." })
    } finally {
      setUpdating(false)
    }
  }

  const openUpdateDialog = (shipment: Shipment) => {
    setSelectedShipment(shipment)
    setUpdateStatus(shipment.status)
    setDeliveryDate(shipment.deliveryDate || "")
  }

  const handleLogout = () => {
    localStorage.clear()
    router.push("/auth")
  }

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase()
    if (statusLower === "delivered") {
      return "bg-green-100 text-green-800 border-green-200"
    } else if (statusLower === "intransit") {
      return "bg-blue-100 text-blue-800 border-blue-200"
    } else if (statusLower === "pending") {
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    } else if (statusLower === "failed") {
      return "bg-red-100 text-red-800 border-red-200"
    }
    return "bg-gray-100 text-gray-800 border-gray-200"
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
              Shipment Management
            </CardTitle>
            <CardDescription>Track and manage all shipments in the system</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by Order ID or Tracking Number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
            </div>

            {dataLoading ? (
              <div className="flex justify-center py-12">
                <Spinner className="h-8 w-8 text-purple-600" />
              </div>
            ) : filteredShipments.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                {searchQuery ? "No shipments found matching your search." : "No shipments yet."}
              </div>
            ) : (
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Shipment ID</TableHead>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Tracking Number</TableHead>
                      <TableHead>Contact Name</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Delivery Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredShipments.map((shipment) => (
                      <TableRow key={shipment.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">#{shipment.id}</TableCell>
                        <TableCell>#{shipment.orderId}</TableCell>
                        <TableCell className="font-mono text-sm">{shipment.trackingNumber}</TableCell>
                        <TableCell>{shipment.contactName}</TableCell>
                        <TableCell className="max-w-xs truncate">{shipment.address}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(shipment.status)}`}
                          >
                            {shipment.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          {shipment.deliveryDate ? new Date(shipment.deliveryDate).toLocaleDateString() : "Not set"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" onClick={() => openUpdateDialog(shipment)}>
                            Update Status
                          </Button>
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

      <Dialog open={!!selectedShipment} onOpenChange={(open) => !open && setSelectedShipment(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Shipment Status</DialogTitle>
            <DialogDescription>Update the shipment status for Order #{selectedShipment?.orderId}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="status">Shipment Status</Label>
              <Select value={updateStatus} onValueChange={setUpdateStatus}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="InTransit">In Transit</SelectItem>
                  <SelectItem value="Delivered">Delivered</SelectItem>
                  <SelectItem value="Failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deliveryDate">Delivery Date (Optional)</Label>
              <Input
                id="deliveryDate"
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
              <p className="font-medium">Note:</p>
              <p>Updating the status will trigger an email notification to the customer.</p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setSelectedShipment(null)} disabled={updating}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdateShipment}
              className="bg-gradient-to-r from-purple-600 to-emerald-600 hover:from-purple-700 hover:to-emerald-700"
              disabled={updating || !updateStatus}
            >
              {updating ? (
                <span className="flex items-center gap-2">
                  <Spinner className="h-4 w-4" />
                  Updating...
                </span>
              ) : (
                "Update Shipment"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
