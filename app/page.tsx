"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { LoadingAnimation } from "@/components/ui/loading-animation"

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push("/dashboard")
      } else {
        router.push("/login")
      }
    }
  }, [user, loading, router])

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center">
      <div className="text-center">
        <h1 className="mb-6 text-3xl font-bold">Trucking Expense Tracker</h1>
        <LoadingAnimation />
      </div>
    </div>
  )
}
