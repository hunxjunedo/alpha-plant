"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Camera, Leaf, LogOut } from "lucide-react"
import { formatDate } from "@/lib/date-formatter"

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

export default function UserDashboard() {
  const [plants, setPlants] = useState<Plant[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authRes = await fetch("/api/auth/user/check")
        const authData = await authRes.json()

        if (!authData.authenticated) {
          router.push("/login")
          return
        }

        setUser(authData.user)

        const plantsRes = await fetch("/api/user/plants")
        if (plantsRes.ok) {
          const plantsData = await plantsRes.json()
          setPlants(plantsData)
        }
      } catch (err) {
        console.error("Dashboard error:", err)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/login")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-600 font-medium italic">Loading your garden...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center text-white">
              <Leaf size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-zinc-900 leading-tight">My Garden</h1>
              <p className="text-xs text-zinc-500 font-medium">Happy planting, {user?.fullName}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout} className="text-zinc-500 hover:text-red-600">
            <LogOut size={20} />
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plants.map((plant) => (
            <Card
              key={plant.id}
              className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="relative h-56 bg-zinc-200">
                {plant.lastProofPicture ? (
                  <img
                    src={plant.lastProofPicture || "/placeholder.svg"}
                    alt={plant.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-400">
                    <Leaf size={64} className="opacity-20" />
                  </div>
                )}
                <Badge className="absolute top-4 right-4 bg-white/90 backdrop-blur text-zinc-900 border-none px-3 py-1 text-xs font-bold shadow-sm">
                  {plant.pictures.length} PHOTOS
                </Badge>
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-bold flex items-center justify-between">
                  {plant.name}
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-700 hover:bg-green-100 text-[10px] uppercase tracking-wider"
                  >
                    Healthy
                  </Badge>
                </CardTitle>
                <CardDescription className="flex items-center gap-1.5 text-zinc-500">
                  <Calendar size={14} />
                  Planted on {formatDate(plant.planted)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 mt-2">
                  <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg border border-zinc-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                        <Camera size={16} />
                      </div>
                      <div className="text-xs font-medium text-zinc-700">Latest Photo</div>
                    </div>
                    <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-tight">
                      {plant.lastProofPicture ? "2 days ago" : "No photos yet"}
                    </div>
                  </div>

                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {plant.pictures.map((pic) => (
                      <div
                        key={pic.id}
                        className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border border-zinc-200 shadow-sm transition-transform hover:scale-110"
                      >
                        <img src={pic.src || "/placeholder.svg"} alt="Plant" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {plants.length === 0 && (
            <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-zinc-200">
              <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-300">
                <Leaf size={40} />
              </div>
              <h3 className="text-xl font-bold text-zinc-900">Your garden is empty</h3>
              <p className="text-zinc-500 mt-1 max-w-xs mx-auto">
                Ask your administrator to add some plants to your account to get started!
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
