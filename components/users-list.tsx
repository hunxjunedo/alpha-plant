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
  onPlantsLoaded?: (plants: Plant[]) => void
  onUserCreated?: () => void
  onPlantCreatedOptimistic?: (userId: string, newPlant: Plant) => void
  seeds: Seed[]
}

export function UsersList({
  users,
  plants,
  loading,
  onPlantSelected,
  onPlantsLoaded,
  onUserCreated,
  onPlantCreatedOptimistic,
  seeds,
}: UsersListProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showPlantForm, setShowPlantForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const usersPerPage = 25
  const [visiblePlants, setVisiblePlants] = useState<Record<string, boolean>>({})
  const [loadingPlants, setLoadingPlants] = useState<Record<string, boolean>>({})

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users
    const query = searchQuery.toLowerCase()
    return users.filter((user) => user.id.toLowerCase().includes(query) || user.fullName.toLowerCase().includes(query))
  }, [users, searchQuery])

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / usersPerPage))
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * usersPerPage, currentPage * usersPerPage)

  const handleViewPlant = async (plantId: string) => {
    if (plants[plantId]) {
      onPlantSelected?.(plants[plantId])
      return
    }

    try {
      const response = await fetch(`/api/plants/${plantId}`)
      if (!response.ok) throw new Error("Failed to fetch plant")
      onPlantSelected?.(await response.json())
    } catch (error) {
      console.error("Failed to fetch plant:", error)
    }
  }

  const handleShowPlants = async (user: User) => {
    if (visiblePlants[user.id]) {
      setVisiblePlants((current) => ({ ...current, [user.id]: false }))
      return
    }

    const missingPlantIds = user.plants.filter((plantId) => !plants[plantId])
    if (missingPlantIds.length > 0) {
      setLoadingPlants((current) => ({ ...current, [user.id]: true }))
      try {
        const fetchedPlants = await Promise.all(
          missingPlantIds.map(async (plantId) => {
            const response = await fetch(`/api/plants/${plantId}`)
            if (!response.ok) throw new Error(`Failed to fetch plant ${plantId}`)
            return (await response.json()) as Plant
          }),
        )
        onPlantsLoaded?.(fetchedPlants)
      } catch (error) {
        console.error("Failed to fetch plants:", error)
      } finally {
        setLoadingPlants((current) => ({ ...current, [user.id]: false }))
      }
    }
    setVisiblePlants((current) => ({ ...current, [user.id]: true }))
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
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
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
                {paginatedUsers.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell className="font-medium">{user.id}</TableCell>
                    <TableCell>{user.fullName}</TableCell>
                    <TableCell>{user.house}</TableCell>
                    <TableCell>{formatDateOnly(user.created)}</TableCell>
                    <TableCell>
                      {user.plants.length > 0 ? (
                        <div className="flex flex-col items-start gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleShowPlants(user)} disabled={loadingPlants[user.id]}>
                            {loadingPlants[user.id] && <Loader2 data-icon="inline-start" className="animate-spin" />}
                            {visiblePlants[user.id] ? "Hide plants" : `Show plants (${user.plants.length})`}
                          </Button>
                          {visiblePlants[user.id] && !loadingPlants[user.id] && (
                            <div className="flex flex-wrap gap-2">
                              {user.plants.map((plantId) => (
                                <Button key={plantId} variant="outline" size="sm" onClick={() => handleViewPlant(plantId)}>
                                  {plants[plantId]?.name || "Unavailable"}
                                </Button>
                              ))}
                            </div>
                          )}
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
          {filteredUsers.length > 0 && (
            <div className="mt-4 flex items-center justify-between gap-4 border-t pt-4">
              <p className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * usersPerPage + 1}-{Math.min(currentPage * usersPerPage, filteredUsers.length)} of {filteredUsers.length}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
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
