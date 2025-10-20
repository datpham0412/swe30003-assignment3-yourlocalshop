"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Spinner } from "@/components/ui/spinner"
import { LogOut, Download, FileText, Home, Package, CreditCard, LayoutDashboard, Truck, BarChart3 } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

interface Invoice {
  invoiceId: number
  invoiceNumber: string
  orderId: number
  customerId: number
  amount: number
  issueDate: string
  orderStatus: string
}

interface InvoiceDetails {
  invoiceId: number
  invoiceNumber: string
  orderId: number
  amount: number
  issueDate: string
  orderDetails: {
    customerId: number
    orderDate: string
    status: string
    lines: Array<{
      productId: number
      productName: string
      unitPrice: number
      quantity: number
      lineTotal: number
    }>
    subtotal: number
    tax: number
    total: number
  }
}

export default function InvoicesPage() {
  const router = useRouter()
  const [email, setEmail] = useState<string | null>(null)
  const [password, setPassword] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [dataLoading, setDataLoading] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceDetails | null>(null)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [generatingInvoiceId, setGeneratingInvoiceId] = useState<number | null>(null)

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
    fetchInvoices(storedEmail, storedPassword)
  }, [router])

  const fetchInvoices = async (userEmail: string, userPassword: string) => {
    setDataLoading(true)
    try {
      const response = await fetch(
        `http://localhost:5074/api/Invoice/list?email=${encodeURIComponent(userEmail)}&password=${encodeURIComponent(userPassword)}`,
      )

      if (response.ok) {
        const data: Invoice[] = await response.json()
        setInvoices(data)
      } else {
        toast.error("Failed to load invoices")
      }
    } catch (error) {
      toast.error("Network error", { description: "Please check your connection." })
    } finally {
      setDataLoading(false)
    }
  }

  const fetchInvoiceDetails = async (orderId: number) => {
    if (!email || !password) return

    setDetailsLoading(true)
    try {
      const response = await fetch(
        `http://localhost:5074/api/Invoice/${orderId}?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
      )

      if (response.ok) {
        const data: InvoiceDetails = await response.json()
        setSelectedInvoice(data)
      } else {
        toast.error("Failed to load invoice details")
      }
    } catch (error) {
      toast.error("Network error", { description: "Please check your connection." })
    } finally {
      setDetailsLoading(false)
    }
  }

  const handleGenerateInvoice = async (orderId: number) => {
    if (!email || !password) return

    setGeneratingInvoiceId(orderId)
    try {
      const response = await fetch(
        `http://localhost:5074/api/Invoice/generate/${orderId}?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
        { method: "POST" },
      )

      if (response.ok) {
        toast.success("Invoice generated successfully!")
        fetchInvoices(email, password)
      } else {
        const errorText = await response.text()
        toast.error("Failed to generate invoice", { description: errorText })
      }
    } catch (error) {
      toast.error("Network error", { description: "Please check your connection." })
    } finally {
      setGeneratingInvoiceId(null)
    }
  }

  const handleDownloadPDF = () => {
    window.print()
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
                <Button variant="ghost" size="sm" className="hover:bg-purple-50">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Payments
                </Button>
              </Link>

              <Link href="/invoices">
                <Button variant="default" size="sm" className="bg-gradient-to-r from-purple-600 to-emerald-500">
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

      <main className="container mx-auto px-4 py-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-emerald-500 bg-clip-text text-transparent">
              Invoice Management
            </CardTitle>
            <CardDescription>View and manage all invoices in the system</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {dataLoading ? (
              <div className="flex justify-center py-12">
                <Spinner className="h-8 w-8 text-purple-600" />
              </div>
            ) : invoices.length === 0 ? (
              <div className="text-center py-12 text-gray-500">No invoices yet.</div>
            ) : (
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Invoice No</TableHead>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Issue Date</TableHead>
                      <TableHead>Order Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((invoice) => (
                      <TableRow key={invoice.invoiceId} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                        <TableCell>#{invoice.orderId}</TableCell>
                        <TableCell className="font-semibold text-emerald-600">${invoice.amount.toFixed(2)}</TableCell>
                        <TableCell>{new Date(invoice.issueDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">{invoice.orderStatus}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" onClick={() => fetchInvoiceDetails(invoice.orderId)}>
                            View Invoice
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

      <Dialog open={!!selectedInvoice} onOpenChange={(open) => !open && setSelectedInvoice(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Invoice Details</DialogTitle>
            <DialogDescription>Complete invoice information</DialogDescription>
          </DialogHeader>
          {detailsLoading ? (
            <div className="flex justify-center py-8">
              <Spinner className="h-6 w-6 text-purple-600" />
            </div>
          ) : selectedInvoice ? (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-purple-50 to-emerald-50 p-4 rounded-lg">
                <h3 className="text-xl font-bold text-gray-900">{selectedInvoice.invoiceNumber}</h3>
                <p className="text-sm text-gray-600">
                  Issue Date: {new Date(selectedInvoice.issueDate).toLocaleDateString()}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Order ID</p>
                  <p className="font-semibold">#{selectedInvoice.orderId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Customer ID</p>
                  <p className="font-semibold">#{selectedInvoice.orderDetails.customerId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Order Date</p>
                  <p className="font-semibold">
                    {new Date(selectedInvoice.orderDetails.orderDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="font-semibold">{selectedInvoice.orderDetails.status}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Order Items</h4>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead>Product</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedInvoice.orderDetails.lines.map((line, index) => (
                        <TableRow key={index}>
                          <TableCell>{line.productName}</TableCell>
                          <TableCell>${line.unitPrice.toFixed(2)}</TableCell>
                          <TableCell>{line.quantity}</TableCell>
                          <TableCell className="text-right">${line.lineTotal.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-semibold">${selectedInvoice.orderDetails.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax:</span>
                  <span className="font-semibold">${selectedInvoice.orderDetails.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span className="text-emerald-600">${selectedInvoice.orderDetails.total.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleDownloadPDF} className="flex-1 bg-gradient-to-r from-purple-600 to-emerald-600">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
