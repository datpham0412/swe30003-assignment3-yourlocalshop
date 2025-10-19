"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Spinner } from "@/components/ui/spinner"

interface Product {
  id: number
  name: string
  price: number
  category: string
  stock: number
}

export default function DashboardPage() {
  const router = useRouter()

  useEffect(() => {
    const storedEmail = localStorage.getItem("email")
    const storedPassword = localStorage.getItem("password")
    const storedRole = localStorage.getItem("role")

    if (!storedEmail || !storedPassword || !storedRole) {
      router.push("/auth")
      return
    }

    if (storedRole === "Admin") {
      router.push("/dashboard/admin")
    } else {
      router.push("/catalogue")
    }
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Spinner className="h-8 w-8 text-purple-600" />
    </div>
  )
}
