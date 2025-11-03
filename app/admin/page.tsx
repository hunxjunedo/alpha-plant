"use client"

import { useState, useEffect } from "react"
import { AdminLogin } from "@/components/admin-login"
import { CreateUserForm } from "@/components/create-user-form"
import { UsersList } from "@/components/users-list"
import { PlantViewer } from "@/components/plant-viewer"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
  const [usersRefresh, setUsersRefresh] = useState(0)
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null)
  const [activeTab, setActiveTab] = useState("users")

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

  const handleLoginSuccess = () => {
    setAuthenticated(true)
  }

  const handleUserCreated = () => {
    setUsersRefresh((prev) => prev + 1)
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
            <UsersList key={usersRefresh} onPlantSelected={handlePlantSelected} />
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
