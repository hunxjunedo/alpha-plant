"use client"

import { useState, useCallback, useMemo } from "react"
import { Loader2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CreatePlantFormModal } from "./create-plant-form-modal"
import { formatDateOnly } from "@/lib/date-formatter"
import { Plant } from "./plant-viewer"


type PlantSummary = Pick<Plant, "id" | "name">

interface User {
  _id: string
  id: string
  fullName: string
  house: string
  created: string
  plants: string[]
}

interface Seed {
  id: string
  name: string
  plant_given: number
}

interface UsersListProps {
  users: User[]
  plants: Record<string, Plant>
  loading: boolean
  onPlantSelected?: (plant: Plant) => void
  onUserCreated?: () => void
  onPlantCreatedOptimistic?: (userId: string, newPlant: Plant) => void
  seeds: Seed[]
}

export function UsersList({
  users,
  plants,
  loading,
  onPlantSelected,
  onUserCreated,
  onPlantCreatedOptimistic,
  seeds,
}: UsersListProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showPlantForm, setShowPlantForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedUsers, setExpandedUsers] = useState<Record<string, boolean>>({})
  const [plantSummaries, setPlantSummaries] = useState<Record<string, PlantSummary>>({})
  const [loadingUserPlants, setLoadingUserPlants] = useState<Record<string, boolean>>({})
  const [plantErrors, setPlantErrors] = useState<Record<string, string>>({})

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users
    const query = searchQuery.toLowerCase()
    return users.filter((user) => user.id.toLowerCase().includes(query) || user.fullName.toLowerCase().includes(query))
  }, [users, searchQuery])

  const handleViewPlant = async (plantId: string) => {
    if (plants[plantId]) {
      onPlantSelected?.(plants[plantId])
      return
    }

    try {
      const response = await fetch(`/api/plants/${plantId}`)
      if (!response.ok) throw new Error("Failed to fetch plant")
      onPlantSelected?.(await response.json())
    } catch {
      setPlantErrors((current) => ({ ...current, [plantId]: "Unable to load plant" }))
    }
  }

  const handleShowPlants = async (user: User) => {
    if (expandedUsers[user.id]) {
      setExpandedUsers((current) => ({ ...current, [user.id]: false }))
      return
    }

    setExpandedUsers((current) => ({ ...current, [user.id]: true }))
    if (!user.plants.length || user.plants.every((plantId) => plantSummaries[plantId])) return

    setLoadingUserPlants((current) => ({ ...current, [user.id]: true }))
    setPlantErrors((current) => ({ ...current, [user.id]: "" }))
    try {
      const summaries = await Promise.all(
        user.plants.map(async (plantId) => {
          if (plantSummaries[plantId]) return plantSummaries[plantId]
          const response = await fetch(`/api/plants/${plantId}?summary=true`)
          if (!response.ok) throw new Error(`Failed to fetch plant ${plantId}`)
          return (await response.json()) as Plant
        }),
      )
      setPlantSummaries((current) => ({
        ...current,
        ...Object.fromEntries(summaries.map((plant) => [plant.id, plant])),
      }))
    } catch {
      setPlantErrors((current) => ({ ...current, [user.id]: "Some plants could not be loaded" }))
    } finally {
      setLoadingUserPlants((current) => ({ ...current, [user.id]: false }))
    }
  }

  const handleAddPlant = (user: User) => {
    setSelectedUser(user)
    setShowPlantForm(true)
  }

  const handlePlantCreated = useCallback(
    (newPlant: Plant) => {
      setShowPlantForm(false)
      setSelectedUser(null)
      if (onPlantCreatedOptimistic && selectedUser) {
        onPlantCreatedOptimistic(selectedUser.id, newPlant)
      } else {
        onUserCreated?.()
      }
    },
    [onUserCreated, onPlantCreatedOptimistic, selectedUser],
  )

  if (loading) return <div>Loading users...</div>

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>All users in the system</CardDescription>
          <div className="mt-4">
            <Input
              placeholder="Search by user ID or full name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User ID</TableHead>
                  <TableHead>Full Name</TableHead>
                  <TableHead>House</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Plants</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell className="font-medium">{user.id}</TableCell>
                    <TableCell>{user.fullName}</TableCell>
                    <TableCell>{user.house}</TableCell>
                    <TableCell>{formatDateOnly(user.created)}</TableCell>
                    <TableCell>
                      {user.plants.length > 0 ? (
                        <div className="flex flex-col items-start gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleShowPlants(user)}
                            disabled={loadingUserPlants[user.id]}
                          >
                            {loadingUserPlants[user.id] && <Loader2 data-icon="inline-start" className="animate-spin" />}
                            {expandedUsers[user.id] ? "Hide plants" : `Show plants (${user.plants.length})`}
                          </Button>
                          {expandedUsers[user.id] && !loadingUserPlants[user.id] && (
                            <div className="flex flex-wrap gap-2">
                              {user.plants.map((plantId) => (
                                <Button
                                  key={plantId}
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewPlant(plantId)}
                                  disabled={!plantSummaries[plantId]}
                                >
                                  {plantSummaries[plantId]?.name || "Unavailable"}
                                </Button>
                              ))}
                            </div>
                          )}
                          {plantErrors[user.id] && <p className="text-sm text-destructive">{plantErrors[user.id]}</p>}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">No plants</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => handleAddPlant(user)}>
                        + Add Plant
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">No users found matching your search.</div>
          )}
        </CardContent>
      </Card>

      {showPlantForm && selectedUser && (
        <CreatePlantFormModal
          user={selectedUser}
          seeds={seeds}
          onSuccess={handlePlantCreated}
          onClose={() => setShowPlantForm(false)}
        />
      )}
    </>
  )
}
