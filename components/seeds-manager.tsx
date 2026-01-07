"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Plus } from "lucide-react"

interface Seed {
  id: string
  name: string
  plant_given: number
}

interface SeedsManagerProps {
  seeds: Seed[]
  onSeedCreated?: (newSeed: Seed) => void
}

export function SeedsManager({ seeds, onSeedCreated }: SeedsManagerProps) {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newSeedName, setNewSeedName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleCreateSeed = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!newSeedName.trim()) {
      setError("Please enter a plant type name")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/seeds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newSeedName }),
      })

      if (response.ok) {
        const newSeed = await response.json()
        onSeedCreated?.(newSeed)
        setNewSeedName("")
        setShowCreateForm(false)
      } else {
        const data = await response.json()
        setError(data.error || "Failed to create seed type")
      }
    } catch (err) {
      setError("Failed to create seed type")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button disabled={loading} onClick={() => setShowCreateForm(!showCreateForm)} size="sm" className="gap-2">
          <Plus size={16} />
          New Type
        </Button>
      </div>

      {showCreateForm && (
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleCreateSeed} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Plant Type Name</label>
                <Input
                  type="text"
                  value={newSeedName}
                  onChange={(e) => setNewSeedName(e.target.value)}
                  placeholder="e.g., Monstera Deliciosa"
                  disabled={loading}
                />
              </div>

              {error && <p className="text-destructive text-sm">{error}</p>}

              <div className="flex gap-2">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? "Creating..." : "Create Type"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateForm(false)
                    setError("")
                  }}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-row gap-3">
        {seeds.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              No plant types created yet. Create one to get started!
            </CardContent>
          </Card>
        ) : (
          seeds.map((seed) => (
            <Card key={seed.id}>
              <CardContent className="p-6">
                <div className="flex gap-7 items-center ">
                  <div>
                    <p className="font-medium">{seed.name}</p>
                    <p className="text-sm text-muted-foreground">{seed.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">{seed.plant_given}</p>
                    <p className="text-xs text-muted-foreground">given out</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
