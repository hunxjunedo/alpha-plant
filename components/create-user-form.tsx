"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RefreshCw } from "lucide-react"
import { generatePassphrase } from "@/lib/password-generator"

interface CreateUserFormProps {
  onSuccess?: () => void
}

export function CreateUserForm({ onSuccess }: CreateUserFormProps) {
  const [formData, setFormData] = useState({
    id: "",
    fullName: "",
    password: generatePassphrase(),
    house: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const regeneratePassword = () => {
    setFormData((prev) => ({
      ...prev,
      password: generatePassphrase(),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setSuccess("User created successfully!")
        setFormData({ id: "", fullName: "", password: generatePassphrase(), house: "" })
        onSuccess?.()
      } else {
        const data = await response.json()
        setError(data.error || "Failed to create user")
      }
    } catch (err) {
      setError("Failed to create user")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New User</CardTitle>
        <CardDescription>Add a new user to the system</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input type="text" name="id" placeholder="User ID" value={formData.id} onChange={handleChange} required />
          <Input
            type="text"
            name="fullName"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={handleChange}
            required
          />
          <div className="flex gap-2">
            <Input
              type="text"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={regeneratePassword}
              title="Generate new password"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          <Input
            type="text"
            name="house"
            placeholder="House/Location"
            value={formData.house}
            onChange={handleChange}
            required
          />
          {error && <p className="text-destructive text-sm">{error}</p>}
          {success && <p className="text-green-600 text-sm">{success}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating..." : "Create User"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
