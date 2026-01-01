"use client"

import type React from "react"
import { formatDateOnly, formatDateTime } from "@/lib/date-formatter"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { X } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Loader2, Plus } from "lucide-react"

interface Picture {
  id: string
  src: string
  uploaded: string | Date
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
  const [uploading, setUploading] = useState(false) // added uploading state
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

  const handleUploadPicture = async () => {
    const mockSrc = `/placeholder.svg?height=400&width=400&query=plant growth photo ${displayPlant?.pictures.length + 1}`

    if (!displayPlant) return

    setUploading(true)
    try {
      const response = await fetch(`/api/plants/${displayPlant.id}/pictures`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ src: mockSrc }),
      })

      if (response.ok) {
        // Refresh plant data
        const updatedRes = await fetch(`/api/plants/${displayPlant.id}`)
        if (updatedRes.ok) {
          const updatedData = await updatedRes.json()
          setPlant(updatedData)
        }
      } else {
        setError("Failed to upload picture")
      }
    } catch (err) {
      setError("Upload error")
    } finally {
      setUploading(false)
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
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleUploadPicture}
                disabled={uploading}
                className="h-8 gap-1 bg-transparent"
              >
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Add Photo
              </Button>
              {isModalMode && onClose && (
                <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Planted</p>
                <p className="text-sm text-muted-foreground">{formatDateOnly(displayPlant.planted)}</p>
              </div>
              {displayPlant.lastProofPicture && (
                <div>
                  <p className="text-sm font-medium">Last Proof Photo</p>
                  <p className="text-sm text-muted-foreground">{formatDateTime(displayPlant.lastProofPicture)}</p>
                </div>
              )}
            </div>

            {displayPlant.pictures.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-3">Growth Gallery ({displayPlant.pictures.length})</p>
                <TooltipProvider delayDuration={0}>
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                    {displayPlant.pictures.map((pic) => (
                      <Tooltip key={pic.id}>
                        <TooltipTrigger asChild>
                          <div className="group relative aspect-square overflow-hidden rounded-lg border bg-muted transition-all hover:ring-2 hover:ring-green-500">
                            <img
                              src={pic.src || "/placeholder.svg"}
                              alt={`Plant progress`}
                              className="h-full w-full object-cover transition-transform group-hover:scale-105"
                            />
                            <div className="absolute inset-x-0 bottom-0 bg-black/60 p-1.5 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100">
                              {formatDateTime(pic.uploaded)}
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Captured: {formatDateTime(pic.uploaded)}</p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                </TooltipProvider>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
