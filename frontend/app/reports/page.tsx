"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import {
  LogOut,
  Calendar,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Home,
  Package,
  CreditCard,
  FileText,
  Truck,
  LayoutDashboard,
  BarChart3,
} from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

interface SalesReport {
  period: string
  totalOrders: number
  totalRevenue: number
  generatedAt: string
}

export default function ReportsPage() {
  const router = useRouter()
  const [email, setEmail] = useState<string | null>(null)
  const [password, setPassword] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [generatingReport, setGeneratingReport] = useState<string | null>(null)
  const [report, setReport] = useState<SalesReport | null>(null)

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
  }, [router])

  const generateReport = async (period: "Daily" | "Weekly" | "Monthly") => {
    if (!email || !password) return

    setGeneratingReport(period)
    setReport(null)

    try {
      const response = await fetch(
        `http://localhost:5074/api/Report/generate?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}&period=${period}`,
        { method: "GET" },
      )

      if (response.ok) {
        const data: SalesReport = await response.json()
        setReport(data)
        toast.success("Report generated successfully!", {
          description: `${period} sales report is ready.`,
        })
      } else {
        const errorText = await response.text()
        toast.error("Failed to generate report", { description: errorText })
      }
    } catch (error) {
      toast.error("Network error", { description: "Please check your connection." })
    } finally {
      setGeneratingReport(null)
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
                <Button variant="default" size="sm" className="bg-gradient-to-r from-purple-600 to-emerald-500">
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
        <div className="text-center space-y-2 mb-8">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-emerald-500 bg-clip-text text-transparent">
            Sales Reports
          </h2>
          <p className="text-gray-600">Generate comprehensive sales reports for different time periods</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-purple-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-600">
                <Calendar className="h-5 w-5" />
                Daily Report
              </CardTitle>
              <CardDescription>View today's sales performance</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => generateReport("Daily")}
                disabled={generatingReport !== null}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
              >
                {generatingReport === "Daily" ? (
                  <span className="flex items-center gap-2">
                    <Spinner className="h-4 w-4" />
                    Generating...
                  </span>
                ) : (
                  "Generate Daily Report"
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-emerald-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-600">
                <TrendingUp className="h-5 w-5" />
                Weekly Report
              </CardTitle>
              <CardDescription>View this week's sales trends</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => generateReport("Weekly")}
                disabled={generatingReport !== null}
                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800"
              >
                {generatingReport === "Weekly" ? (
                  <span className="flex items-center gap-2">
                    <Spinner className="h-4 w-4" />
                    Generating...
                  </span>
                ) : (
                  "Generate Weekly Report"
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-blue-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-600">
                <BarChart3 className="h-5 w-5" />
                Monthly Report
              </CardTitle>
              <CardDescription>View this month's overview</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => generateReport("Monthly")}
                disabled={generatingReport !== null}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                {generatingReport === "Monthly" ? (
                  <span className="flex items-center gap-2">
                    <Spinner className="h-4 w-4" />
                    Generating...
                  </span>
                ) : (
                  "Generate Monthly Report"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {report && (
          <Card className="shadow-xl border-2 border-purple-200 animate-in fade-in slide-in-from-bottom-4">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-emerald-50">
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-emerald-500 bg-clip-text text-transparent">
                {report.period} Sales Report
              </CardTitle>
              <CardDescription>Generated on {new Date(report.generatedAt).toLocaleString()}</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 bg-purple-600 rounded-lg">
                      <ShoppingBag className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Total Orders</p>
                      <p className="text-3xl font-bold text-purple-600">{report.totalOrders}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Number of completed orders in this period</p>
                </div>

                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-6 border border-emerald-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 bg-emerald-600 rounded-lg">
                      <DollarSign className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Total Revenue</p>
                      <p className="text-3xl font-bold text-emerald-600">${report.totalRevenue.toFixed(2)}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Total revenue from paid and delivered orders</p>
                </div>
              </div>

              {report.totalOrders > 0 && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-blue-900">Average Order Value</p>
                  <p className="text-2xl font-bold text-blue-600">
                    ${(report.totalRevenue / report.totalOrders).toFixed(2)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {!report && !generatingReport && (
          <div className="text-center py-12 text-gray-500">
            <BarChart3 className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No report generated yet</p>
            <p className="text-sm">Select a time period above to generate a sales report</p>
          </div>
        )}
      </main>
    </div>
  )
}
