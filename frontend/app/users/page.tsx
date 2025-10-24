"use client"

import React, { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { Button } from "@/components/ui/button"

type User = { id: number; email: string; role: string; status: string }

export default function UsersPage() {
  const [users, setUsers] = useState<User[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const email = localStorage.getItem("email")
    const password = localStorage.getItem("password")
    if (!email || !password) {
      setError("Not authenticated as admin.")
      setLoading(false)
      return
    }

    const fetchUsers = async () => {
      try {
        const res = await fetch(
          `http://localhost:5074/api/Auth/list?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
        )
        if (!res.ok) {
          const txt = await res.text()
          setError(txt || "Failed to fetch users")
          setUsers([])
        } else {
          const data: User[] = await res.json()
          setUsers(data)
        }
      } catch (e) {
        setError("Network error while fetching users.")
        setUsers([])
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <Spinner className="h-6 w-6 text-purple-600" />
            </div>
          ) : error ? (
            <div className="text-red-600">{error}</div>
          ) : users && users.length === 0 ? (
            <div className="text-sm text-gray-500">No users found.</div>
          ) : (
            <div className="space-y-2">
              {users?.map((u) => (
                <div key={u.id} className="p-3 border rounded flex items-center justify-between">
                  <div>
                    <div className="font-medium">{u.email}</div>
                    <div className="text-sm text-gray-500">{u.role} — {u.status}</div>
                  </div>
                  <div>
                    <Button size="sm" variant="ghost" onClick={() => navigator.clipboard?.writeText(u.email)}>
                      Copy email
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
