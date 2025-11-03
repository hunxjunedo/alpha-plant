"use client"

import { useState, useCallback } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CreatePlantFormModal } from "./create-plant-form-modal"

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
}

export function UsersList({ users, plants, loading, onPlantSelected, onUserCreated }: UsersListProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showPlantForm, setShowPlantForm] = useState(false)

  const handleViewPlant = (plant: Plant) => {
    onPlantSelected?.(plant)
  }

  const handleAddPlant = (user: User) => {
    setSelectedUser(user)
    setShowPlantForm(true)
  }

  const handlePlantCreated = useCallback(() => {
    setShowPlantForm(false)
    setSelectedUser(null)
    onUserCreated?.()
  }, [onUserCreated])

  if (loading) return <div>Loading users...</div>

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>All users in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User ID</TableHead>
                  <TableHead>House</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Plants</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell className="font-medium">{user.id}</TableCell>
                    <TableCell>{user.house}</TableCell>
                    <TableCell>{new Date(user.created).toLocaleDateString()}</TableCell>
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
