"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeClosed } from "lucide-react"

export default function UserLoginPage() {
  const [id, setId] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/user/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, password }),
      })

      if (response.ok) {
        router.push("/dashboard")
      } else {
        const data = await response.json()
        setError(data.error || "Invalid credentials")
      }
    } catch (err) {
      setError("Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-alpha-8kvWg5IPHgiYiMT3aGPJ1GXiCI6qbI.jpg"
            alt="Alpha College"
            className="mx-auto mb-4 size-16 rounded-xl object-cover shadow-sm"
          />
          <h1 className="text-3xl font-bold text-zinc-900">Plant Parent Login</h1>
          <p className="text-zinc-600 mt-2">Access your Alpha Garden dashboard</p>
        </div>

        <Card className="border-none shadow-xl shadow-green-900/5">
          <CardHeader className="pb-4">
            <CardTitle>Welcome back</CardTitle>
            <CardDescription>Enter your ID and password to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700">User ID</label>
                <Input
                  placeholder="Your unique ID"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  className="bg-zinc-50 border-zinc-200 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700">Password</label>
               <div className="flex flex-row gap-2">
                 <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-zinc-50 border-zinc-200 focus:ring-green-500 focus:border-green-500"
                />
                <Button onClick={()=>(setShowPassword(!showPassword))} className="bg-gray-200 hover:bg-gray-400 cursor-pointer " type="button">
                  {
                    !showPassword ? <EyeClosed color="black" /> : <Eye color="black"  />
                  }
                </Button>
               </div>
              </div>
              {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
              <Button 
                className="w-full cursor-pointer bg-green-600 hover:bg-green-700 text-white font-semibold py-6"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Login to Dashboard"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
