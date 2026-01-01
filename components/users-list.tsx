"use client"

import { useState, useCallback, useMemo } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CreatePlantFormModal } from "./create-plant-form-modal"
import { formatDateOnly } from "@/lib/date-formatter"

interface Plant {
  id: string
  name: string
  planted: string
  last_proof_picture?: string
  pictures: Array<{ id: string; src: string; userId: string }>
}

interface User {
  _id: string
  id: string
  fullName: string
  house: string
  created: string
  plants: string[]
}

interface UsersListProps {
  users: User[]
  plants: Record<string, Plant>
  loading: boolean
  onPlantSelected?: (plant: Plant) => void
  onUserCreated?: () => void
  onPlantCreatedOptimistic?: (userId: string, newPlant: Plant) => void // Added optimistic update callback
}

export function UsersList({
  users,
  plants,
  loading,
  onPlantSelected,
  onUserCreated,
  onPlantCreatedOptimistic,
}: UsersListProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showPlantForm, setShowPlantForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users
    const query = searchQuery.toLowerCase()
    return users.filter((user) => user.id.toLowerCase().includes(query) || user.fullName.toLowerCase().includes(query))
  }, [users, searchQuery])

  const handleViewPlant = (plant: Plant) => {
    onPlantSelected?.(plant)
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
                        <div className="flex flex-wrap gap-2">
                          {user.plants.map((plantId) => (
                            <Button
                              key={plantId}
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewPlant(plants[plantId])}
                              disabled={!plants[plantId]}
                            >
                              {plants[plantId]?.name || "Loading..."}
                            </Button>
                          ))}
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
          onSuccess={handlePlantCreated}
          onClose={() => setShowPlantForm(false)}
        />
      )}
    </>
  )
}
