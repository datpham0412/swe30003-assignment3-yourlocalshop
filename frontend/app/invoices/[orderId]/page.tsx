"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Badge } from "@/components/ui/badge"
import { FileText, ArrowLeft, Download, CheckCircle } from "lucide-react"
import { toast } from "sonner"
import { CustomerNav } from "@/components/customer/CustomerNav"

interface InvoiceLine {
  productId: number
  name: string
  unitPrice: number
  quantity: number
  lineTotal: number
}

interface Invoice {
  invoiceId: number
  orderId: number
  invoiceNumber: string
  issueDate: string
  amount: number
  paymentMethod: string
  lines: InvoiceLine[]
  subtotal: number
  tax: number
  total: number
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
}

export default function InvoiceViewPage() {
  const router = useRouter()
  const params = useParams()
  const orderId = params.orderId as string

  const [loading, setLoading] = useState(true)
  const [invoice, setInvoice] = useState<Invoice | null>(null)

  useEffect(() => {
    const storedEmail = localStorage.getItem("email")
    const storedPassword = localStorage.getItem("password")
    const storedRole = localStorage.getItem("role")

    if (!storedEmail || !storedPassword || storedRole !== "Customer") {
      router.push("/auth")
      return
    }

    fetchInvoice(storedEmail, storedPassword)
  }, [orderId, router])

  const fetchInvoice = async (email: string, password: string) => {
    setLoading(true)
    try {
      const response = await fetch(
        `http://localhost:5074/api/Invoice/${orderId}?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
      )

      if (response.ok) {
        const data = await response.json()
        setInvoice(data)
      } else {
        toast.error("Failed to load invoice", {
          description: "Invoice may not be generated yet.",
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

  const handleDownloadPDF = () => {
    window.print()
    toast.success("Print dialog opened", {
      description: "Save as PDF or print the invoice.",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner className="h-8 w-8 text-purple-600" />
      </div>
    )
  }

  if (!invoice) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-emerald-50">
      <CustomerNav />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-6 print:hidden">
          <Button
            onClick={() => router.push("/orders")}
            variant="ghost"
            className="flex items-center gap-2 text-purple-600 hover:text-purple-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Orders
          </Button>

          <Button
            onClick={handleDownloadPDF}
            className="bg-gradient-to-r from-purple-600 to-emerald-500 hover:from-purple-700 hover:to-emerald-600"
          >
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-emerald-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-purple-600" />
                <div>
                  <CardTitle className="text-2xl">Invoice</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">#{invoice.invoiceNumber}</p>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-800 border-green-300 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Paid
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-8">
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Invoice Details</h3>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Invoice Number:</span> {invoice.invoiceNumber}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Issue Date:</span> {formatDate(invoice.issueDate)}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Order ID:</span> #{invoice.orderId}
                </p>
              </div>

              <div className="text-right">
                <h3 className="font-semibold text-gray-700 mb-2">Payment Information</h3>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Payment Method:</span> {invoice.paymentMethod}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Status:</span> Paid
                </p>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="font-semibold text-gray-700 mb-4 text-lg">Items</h3>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-3 text-sm font-semibold text-gray-700">Product</th>
                      <th className="text-right p-3 text-sm font-semibold text-gray-700">Unit Price</th>
                      <th className="text-center p-3 text-sm font-semibold text-gray-700">Quantity</th>
                      <th className="text-right p-3 text-sm font-semibold text-gray-700">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.lines.map((line, index) => (
                      <tr key={index} className="border-t">
                        <td className="p-3 text-sm text-gray-900">{line.name}</td>
                        <td className="p-3 text-sm text-gray-900 text-right">${line.unitPrice.toFixed(2)}</td>
                        <td className="p-3 text-sm text-gray-900 text-center">{line.quantity}</td>
                        <td className="p-3 text-sm text-gray-900 text-right font-semibold">
                          ${line.lineTotal.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="text-gray-900">${invoice.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax (10%):</span>
                  <span className="text-gray-900">${invoice.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span className="text-gray-900">Total:</span>
                  <span className="text-emerald-600">${invoice.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t text-center text-sm text-gray-500">
              <p>Thank you for your business!</p>
              <p className="mt-1">Your Local Shop - Quality products for your local needs</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
