"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEffect } from "react"

interface CreatePlantFormProps {
  onSuccess?: () => void
}

export function CreatePlantForm({ onSuccess }: CreatePlantFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    userId: "",
    planted: new Date().toISOString().split("T")[0],
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [users, setUsers] = useState<Array<{ _id: string; id: string }>>([])

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/users")
        if (response.ok) {
          const data = await response.json()
          setUsers(data)
        }
      } catch (err) {
        console.error("Failed to fetch users:", err)
      }
    }
    fetchUsers()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleUserSelect = (value: string) => {
    setFormData((prev) => ({ ...prev, userId: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!formData.name || !formData.userId) {
      setError("Please fill in all required fields")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/plants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          userId: formData.userId,
          planted: formData.planted,
        }),
      })

      if (response.ok) {
        setSuccess("Plant created successfully!")
        setFormData({ name: "", userId: "", planted: new Date().toISOString().split("T")[0] })
        onSuccess?.()
      } else {
        const data = await response.json()
        setError(data.error || "Failed to create plant")
      }
    } catch (err) {
      setError("Failed to create plant")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Plant</CardTitle>
        <CardDescription>Create a new plant for a specific user</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">User</label>
            <Select value={formData.userId} onValueChange={handleUserSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Select a user" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user._id} value={user.id}>
                    {user.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Plant Name</label>
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Monstera Deliciosa"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Planted Date</label>
            <Input type="date" name="planted" value={formData.planted} onChange={handleChange} disabled={loading} />
          </div>

          {error && <p className="text-destructive text-sm">{error}</p>}
          {success && <p className="text-green-600 text-sm">{success}</p>}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Creating..." : "Create Plant"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
