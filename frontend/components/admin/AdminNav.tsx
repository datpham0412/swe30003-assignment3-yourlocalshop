"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CreditCard, FileText, Truck, BarChart3, Package, ChevronDown, Users, User } from "lucide-react"
import { LogOut } from "lucide-react"

export function AdminNav({ onCreateClick }: { onCreateClick?: () => void }) {
  const router = useRouter()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem("email")
    localStorage.removeItem("password")
    localStorage.removeItem("role")
    router.push("/auth")
  }

  const handleCreateUsers = () => {
    if (onCreateClick) return onCreateClick()
    router.push("/dashboard/admin/create-user")
  }

  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/dashboard/admin" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-emerald-500 bg-clip-text text-transparent">
            Your Local Shop — Admin Dashboard
          </h1>
        </Link>

        <nav className="flex items-center gap-2">
          <div className="relative">
            <Button variant="ghost" size="sm" className="flex items-center gap-2" onClick={() => setMenuOpen((s) => !s)}>
              Manage
              <ChevronDown className="h-4 w-4" />
            </Button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg z-50">
                <div className="flex flex-col">
                  <Link href="/payments" className="px-3 py-2 hover:bg-gray-50 flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />Payments
                  </Link>
                  <Link href="/orders/admin" className="px-3 py-2 hover:bg-gray-50 flex items-center gap-2">
                    <Package className="h-4 w-4" />Orders
                  </Link>
                  <Link href="/invoices" className="px-3 py-2 hover:bg-gray-50 flex items-center gap-2">
                    <FileText className="h-4 w-4" />Invoices
                  </Link>
                  <Link href="/shipments" className="px-3 py-2 hover:bg-gray-50 flex items-center gap-2">
                    <Truck className="h-4 w-4" />Shipments
                  </Link>
                </div>
              </div>
            )}
          </div>

          <Link href="/reports">
            <Button variant="ghost" size="sm" className="hover:bg-purple-50">
              <BarChart3 className="h-4 w-4 mr-2" />
              Reports
            </Button>
          </Link>

          <Link href="/dashboard/admin/account">
            <Button variant="ghost" size="sm" className="hover:bg-purple-50">
              <User className="h-4 w-4 mr-2" />
              Account
            </Button>
          </Link>

          <Button
            onClick={handleCreateUsers}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-colors ml-2 bg-transparent"
          >
            <Users className="h-4 w-4" />
            Create Users
          </Button>

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
    </header>
  )
}

export default AdminNav
