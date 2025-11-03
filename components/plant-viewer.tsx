"use client"

import type React from "react"
import { formatDateOnly, formatDateTime } from "@/lib/date-formatter"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { X } from "lucide-react"

interface Picture {
  src: string
  uploaded: string
}

interface Plant {
  id: string
  name: string
  planted: string
  lastProofPicture?: string
  pictures: Picture[]
}

interface PlantViewerProps {
  plant?: Plant
  onClose?: () => void
}

export function PlantViewer({ plant: initialPlant, onClose }: PlantViewerProps) {
  const [plantId, setPlantId] = useState("")
  const [plant, setPlant] = useState<Plant | null>(initialPlant || null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const isModalMode = !!initialPlant

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

  const displayPlant = plant || initialPlant

  if (!initialPlant) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">No plant selected</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {!isModalMode && (
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
      )}

      {displayPlant && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>{displayPlant.name}</CardTitle>
              <CardDescription>Plant ID: {displayPlant.id}</CardDescription>
            </div>
            {isModalMode && onClose && (
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium">Planted</p>
              <p className="text-sm text-muted-foreground">{formatDateTime(displayPlant.planted)}</p>
            </div>

            {displayPlant.lastProofPicture && (
              <div>
                <p className="text-sm font-medium">Last Proof Picture</p>
                <p className="text-sm text-muted-foreground">{formatDateTime(displayPlant.lastProofPicture)}</p>
              </div>
            )}

            {displayPlant.pictures.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-3">Pictures ({displayPlant.pictures.length})</p>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                  {displayPlant.pictures.map((pic) => (
                    <div key={pic.uploaded} className="space-y-2">
                      <img
                        src={pic.src || "/placeholder.svg"}
                        alt={`Plant picture ${pic.id}`}
                        className="w-full h-40 object-cover rounded-lg border"
                      />
                      <p className="text-xs text-muted-foreground"> {formatDateTime(pic.uploaded)}</p>
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
