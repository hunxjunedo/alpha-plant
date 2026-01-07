"use client"

import { useState, useEffect } from "react"
import { AdminLogin } from "@/components/admin-login"
import { CreateUserForm } from "@/components/create-user-form"
import { UsersList } from "@/components/users-list"
import { PlantViewer } from "@/components/plant-viewer"
import { SeedsManager } from "@/components/seeds-manager"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Leaf, LogOut, RotateCw } from "lucide-react"
import { Button } from "@/components/ui/button"

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
  const [seeds, setSeeds] = useState<Array<any>>([])
  const [seedsLoading, setSeedsLoading] = useState(false)

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
        console.log(data)
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

  const fetchSeeds = async () => {
    setSeedsLoading(true)
    try {
      const response = await fetch("/api/seeds")
      if (response.ok) {
        const data = await response.json()
        setSeeds(data)
      }
    } catch (err) {
      console.error("Failed to fetch seeds:", err)
    } finally {
      setSeedsLoading(false)
    }
  }

  useEffect(() => {
    if (authenticated) {
      fetchUsers()
      fetchSeeds()
    }
  }, [authenticated])

  const handleLoginSuccess = () => {
    setAuthenticated(true)
  }

  const handleUserCreated = () => {
    fetchUsers()
  }

  const handlePlantCreatedOptimistic = (userId: string, newPlant: Plant) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) => {
        if (user.id === userId) {
          return {
            ...user,
            plants: [...user.plants, newPlant.id],
          }
        }
        return user
      }),
    )

    setPlants((prevPlants) => ({
      ...prevPlants,
      [newPlant.id]: newPlant,
    }))
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

  const handleSeedCreated = (newSeed: any) => {
    setSeeds((prevSeeds) => [...prevSeeds, newSeed])
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
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center text-white">
              <Leaf size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-zinc-900 leading-tight">Alpha Garden</h1>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout} className="text-zinc-500 hover:text-red-600">
            <LogOut size={20} />
          </Button>
        </div>
      </header>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">Manage users and plants</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="create-user">Create User</TabsTrigger>
            <TabsTrigger value="seeds">Seeds</TabsTrigger>
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
              onPlantCreatedOptimistic={handlePlantCreatedOptimistic}
              seeds={seeds}
            />
          </TabsContent>

          <TabsContent value="create-user" className="space-y-4">
            <CreateUserForm onSuccess={handleUserCreated} />
          </TabsContent>

          <TabsContent value="seeds" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Plant Types</h2>
              <button
                onClick={fetchSeeds}
                disabled={seedsLoading}
                className="p-2 hover:bg-accent rounded-md transition-colors"
                title="Refresh seeds"
              >
                <RotateCw size={18} className={seedsLoading ? "animate-spin" : ""} />
              </button>
            </div>
            <SeedsManager seeds={seeds} onSeedCreated={handleSeedCreated} />
          </TabsContent>

          <TabsContent value="plant-details" className="space-y-4">
            {selectedPlant && <PlantViewer plant={selectedPlant} onClose={handleBackFromPlant} />}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
