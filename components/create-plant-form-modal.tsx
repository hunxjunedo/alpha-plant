"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface User {
  _id: string
  id: string
  house: string
  created: string
  plants: string[]
}

interface CreatePlantFormModalProps {
  user: User
  seeds: Array<{ id: string; name: string; plant_given: number }>
  onSuccess?: (newPlant: any) => void
  onClose?: () => void
}

export function CreatePlantFormModal({ user, seeds, onSuccess, onClose }: CreatePlantFormModalProps) {
  const [formData, setFormData] = useState({
    seedId: "",
    planted: new Date().toISOString().split("T")[0],
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!formData.seedId) {
      setError("Please select a plant type")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/plants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seedId: formData.seedId,
          userId: user.id,
          planted: formData.planted,
        }),
      })

      if (response.ok) {
        const newPlantData = await response.json()
        setSuccess("Plant created successfully!")
        setFormData({ seedId: "", planted: new Date().toISOString().split("T")[0] })
        setTimeout(() => {
          onSuccess?.(newPlantData)
        }, 500)
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
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <Card className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <CardHeader>
          <CardTitle>Add Plant for {user.id}</CardTitle>
          <CardDescription>Create a new plant for this user</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Plant Type</label>
              <select
                name="seedId"
                value={formData.seedId}
                onChange={handleChange}
                disabled={loading || seeds.length === 0}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
              >
                <option value="">Select a plant type...</option>
                {seeds.map((seed) => (
                  <option key={seed.id} value={seed.id}>
                    {seed.name}
                  </option>
                ))}
              </select>
              {seeds.length === 0 && (
                <p className="text-xs text-muted-foreground mt-1">Create seed types first in the Seeds tab</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Planted Date</label>
              <Input type="date" name="planted" value={formData.planted} onChange={handleChange} disabled={loading} />
            </div>

            {error && <p className="text-destructive text-sm">{error}</p>}
            {success && <p className="text-green-600 text-sm">{success}</p>}

            <div className="flex gap-2">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "Creating..." : "Create Plant"}
              </Button>
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
