"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface Picture {
  id: string
  src: string
  userId: string
}

interface Plant {
  id: string
  name: string
  planted: string
  lastProofPicture?: string
  pictures: Picture[]
}

export function PlantViewer() {
  const [plantId, setPlantId] = useState("")
  const [plant, setPlant] = useState<Plant | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!plantId.trim()) return

    setLoading(true)
    setError("")
    setPlant(null)

    try {
      const response = await fetch(`/api/plants/${plantId}`)
      if (response.ok) {
        const data = await response.json()
        setPlant(data)
      } else {
        setError("Plant not found")
      }
    } catch (err) {
      setError("Failed to fetch plant")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>View Plant</CardTitle>
          <CardDescription>Search for a plant by ID</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              type="text"
              placeholder="Enter Plant ID"
              value={plantId}
              onChange={(e) => setPlantId(e.target.value)}
              disabled={loading}
            />
            <Button type="submit" disabled={loading}>
              {loading ? "Searching..." : "Search"}
            </Button>
          </form>
          {error && <p className="text-destructive text-sm mt-2">{error}</p>}
        </CardContent>
      </Card>

      {plant && (
        <Card>
          <CardHeader>
            <CardTitle>{plant.name}</CardTitle>
            <CardDescription>Plant ID: {plant.id}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium">Planted</p>
              <p className="text-sm text-muted-foreground">{new Date(plant.planted).toLocaleDateString()}</p>
            </div>

            {plant.pictures.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-3">Pictures ({plant.pictures.length})</p>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                  {plant.pictures.map((pic) => (
                    <div key={pic.id} className="space-y-2">
                      <img
                        src={pic.src || "/placeholder.svg"}
                        alt={`Plant picture ${pic.id}`}
                        className="w-full h-40 object-cover rounded-lg border"
                      />
                      <p className="text-xs text-muted-foreground">User: {pic.userId}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
