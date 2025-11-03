"use client"

import { useState, useEffect } from "react"
import { AdminLogin } from "@/components/admin-login"
import { CreateUserForm } from "@/components/create-user-form"
import { UsersList } from "@/components/users-list"
import { PlantViewer } from "@/components/plant-viewer"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RotateCw } from "lucide-react"

interface Plant {
  id: string
  name: string
  planted: string
  lastProofPicture?: string
  pictures: Array<{
    id: string
    src: string
    userId: string
  }>
}

export default function AdminDashboard() {
  const [authenticated, setAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null)
  const [activeTab, setActiveTab] = useState("users")
  const [users, setUsers] = useState<Array<any>>([])
  const [plants, setPlants] = useState<Record<string, Plant>>({})
  const [usersLoading, setUsersLoading] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/check")
        const data = await response.json()
        setAuthenticated(data.authenticated)
      } catch (error) {
        setAuthenticated(false)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const fetchUsers = async () => {
    setUsersLoading(true)
    try {
      const response = await fetch("/api/users")
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
        const plantsMap: Record<string, Plant> = {}
        for (const user of data) {
          for (const plantId of user.plants) {
            if (!plantsMap[plantId]) {
              try {
                const plantRes = await fetch(`/api/plants/${plantId}`)
                if (plantRes.ok) {
                  const plant = await plantRes.json()
                  plantsMap[plantId] = plant
                }
              } catch (err) {
                console.error("Failed to fetch plant:", plantId)
              }
            }
          }
        }
        setPlants(plantsMap)
      }
    } catch (err) {
      console.error("Failed to fetch users:", err)
    } finally {
      setUsersLoading(false)
    }
  }

  useEffect(() => {
    if (authenticated) {
      fetchUsers()
    }
  }, [authenticated])

  const handleLoginSuccess = () => {
    setAuthenticated(true)
  }

  const handleUserCreated = () => {
    fetchUsers()
  }

  const handlePlantSelected = (plant: Plant) => {
    setSelectedPlant(plant)
    setActiveTab("plant-details")
  }

  const handleBackFromPlant = () => {
    setSelectedPlant(null)
    setActiveTab("users")
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      setAuthenticated(false)
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (!authenticated) {
    return <AdminLogin onSuccess={handleLoginSuccess} />
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">Manage users and plants</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="create-user">Create User</TabsTrigger>
            <TabsTrigger value="plant-details" disabled={!selectedPlant}>
              Plant Details
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Users List</h2>
              <button
                onClick={fetchUsers}
                disabled={usersLoading}
                className="p-2 hover:bg-accent rounded-md transition-colors"
                title="Refresh users"
              >
                <RotateCw size={18} className={usersLoading ? "animate-spin" : ""} />
              </button>
            </div>
            <UsersList
              users={users}
              plants={plants}
              loading={usersLoading}
              onPlantSelected={handlePlantSelected}
              onUserCreated={handleUserCreated}
            />
          </TabsContent>

          <TabsContent value="create-user" className="space-y-4">
            <CreateUserForm onSuccess={handleUserCreated} />
          </TabsContent>

          <TabsContent value="plant-details" className="space-y-4">
            {selectedPlant && <PlantViewer plant={selectedPlant} onClose={handleBackFromPlant} />}
          </TabsContent>
        </Tabs>

        <button onClick={handleLogout} className="mt-8 text-muted-foreground hover:text-foreground text-sm">
          Logout
        </button>
      </div>
    </div>
  )
}
