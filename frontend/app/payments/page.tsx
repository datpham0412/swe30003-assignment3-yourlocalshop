"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Spinner } from "@/components/ui/spinner"
import { LogOut, Search, CreditCard, Home, Package, FileText, LayoutDashboard } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

interface Payment {
  paymentId: number
  orderId: number
  customerId: number
  method: string
  amount: number
  status: string
  paymentDate: string
}

interface PaymentDetails extends Payment {
  // Additional fields if needed
}

export default function PaymentsPage() {
  const router = useRouter()
  const [email, setEmail] = useState<string | null>(null)
  const [password, setPassword] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [payments, setPayments] = useState<Payment[]>([])
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [dataLoading, setDataLoading] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<PaymentDetails | null>(null)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [processingPaymentId, setProcessingPaymentId] = useState<number | null>(null)

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
    fetchPayments(storedEmail, storedPassword)
  }, [router])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredPayments(payments)
    } else {
      const filtered = payments.filter((payment) => payment.orderId.toString().includes(searchQuery))
      setFilteredPayments(filtered)
    }
  }, [searchQuery, payments])

  const fetchPayments = async (userEmail: string, userPassword: string) => {
    setDataLoading(true)
    try {
      const response = await fetch(
        `http://localhost:5074/api/Payment/list?email=${encodeURIComponent(userEmail)}&password=${encodeURIComponent(userPassword)}`,
      )

      if (response.ok) {
        const data: Payment[] = await response.json()
        setPayments(data)
        setFilteredPayments(data)
      } else {
        toast.error("Failed to load payments")
      }
    } catch (error) {
      toast.error("Network error", { description: "Please check your connection." })
    } finally {
      setDataLoading(false)
    }
  }

  const fetchPaymentDetails = async (paymentId: number) => {
    if (!email || !password) return

    setDetailsLoading(true)
    try {
      const response = await fetch(
        `http://localhost:5074/api/Payment/${paymentId}?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
      )

      if (response.ok) {
        const data: PaymentDetails = await response.json()
        setSelectedPayment(data)
      } else {
        toast.error("Failed to load payment details")
      }
    } catch (error) {
      toast.error("Network error", { description: "Please check your connection." })
    } finally {
      setDetailsLoading(false)
    }
  }

  const handleSimulatePayment = async (orderId: number) => {
    if (!email || !password) return

    setProcessingPaymentId(orderId)
    try {
      const response = await fetch(
        `http://localhost:5074/api/Payment/process/${orderId}?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
        { method: "POST" },
      )

      if (response.ok) {
        toast.success("Payment processed successfully!", {
          description: "Invoice has been generated automatically.",
        })
        fetchPayments(email, password)
      } else {
        const errorText = await response.text()
        toast.error("Payment failed", { description: errorText })
      }
    } catch (error) {
      toast.error("Network error", { description: "Please check your connection." })
    } finally {
      setProcessingPaymentId(null)
    }
  }

  const handleLogout = () => {
    localStorage.clear()
    router.push("/auth")
  }

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase()
    if (statusLower === "success" || statusLower === "paid") {
      return "bg-green-100 text-green-800 border-green-200"
    } else if (statusLower === "pending" || statusLower === "pendingpayment") {
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
                <Button variant="ghost" size="sm" className="hover:bg-purple-50">
                  <Package className="h-4 w-4 mr-2" />
                  Orders
                </Button>
              </Link>

              <Link href="/payments">
                <Button variant="default" size="sm" className="bg-gradient-to-r from-purple-600 to-emerald-500">
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

      <main className="container mx-auto px-4 py-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-emerald-500 bg-clip-text text-transparent">
              Payment Management
            </CardTitle>
            <CardDescription>View and manage all payments in the system</CardDescription>
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
            ) : filteredPayments.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                {searchQuery ? "No payments found matching your search." : "No payments yet."}
              </div>
            ) : (
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Payment ID</TableHead>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayments.map((payment) => (
                      <TableRow key={payment.paymentId} className="hover:bg-gray-50">
                        <TableCell className="font-medium">#{payment.paymentId}</TableCell>
                        <TableCell>#{payment.orderId}</TableCell>
                        <TableCell className="font-semibold text-emerald-600">${payment.amount.toFixed(2)}</TableCell>
                        <TableCell>{payment.method}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(payment.status)}`}
                          >
                            {payment.status}
                          </span>
                        </TableCell>
                        <TableCell>{new Date(payment.paymentDate).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button variant="outline" size="sm" onClick={() => fetchPaymentDetails(payment.paymentId)}>
                            View Details
                          </Button>
                          {payment.status.toLowerCase() === "pendingpayment" && (
                            <Button
                              variant="default"
                              size="sm"
                              className="bg-gradient-to-r from-purple-600 to-emerald-600"
                              onClick={() => handleSimulatePayment(payment.orderId)}
                              disabled={processingPaymentId === payment.orderId}
                            >
                              {processingPaymentId === payment.orderId ? (
                                <span className="flex items-center gap-2">
                                  <Spinner className="h-3 w-3" />
                                  Processing...
                                </span>
                              ) : (
                                "Simulate Payment"
                              )}
                            </Button>
                          )}
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

      <Dialog open={!!selectedPayment} onOpenChange={(open) => !open && setSelectedPayment(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
            <DialogDescription>Complete information about this payment</DialogDescription>
          </DialogHeader>
          {detailsLoading ? (
            <div className="flex justify-center py-8">
              <Spinner className="h-6 w-6 text-purple-600" />
            </div>
          ) : selectedPayment ? (
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Payment ID:</span>
                <span className="font-semibold">#{selectedPayment.paymentId}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Order ID:</span>
                <span className="font-semibold">#{selectedPayment.orderId}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Amount:</span>
                <span className="font-semibold text-emerald-600">${selectedPayment.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Method:</span>
                <span className="font-semibold">{selectedPayment.method}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Status:</span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(selectedPayment.status)}`}
                >
                  {selectedPayment.status}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Payment Date:</span>
                <span className="font-semibold">{new Date(selectedPayment.paymentDate).toLocaleString()}</span>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
