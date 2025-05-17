"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/client"

interface DashboardStats {
  totalUsers: number
  totalAdmins: number
  totalExperts: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalAdmins: 0,
    totalExperts: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    const supabase = createClient()
    try {
      // Get all users
      const { data: users, error } = await supabase
        .from('users')
        .select('*')

      if (error) throw error

      // Calculate stats
      const totalUsers = users?.length || 0
      const totalExperts = users?.filter(user => user.is_expert).length || 0
      const totalAdmins = users?.filter(user => !user.is_expert).length || 0

      setStats({
        totalUsers,
        totalAdmins,
        totalExperts
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Total Users</h3>
          {isLoading ? (
            <div className="animate-pulse h-9 bg-gray-200 rounded"></div>
          ) : (
            <p className="text-3xl font-bold">{stats.totalUsers}</p>
          )}
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Admins</h3>
          {isLoading ? (
            <div className="animate-pulse h-9 bg-gray-200 rounded"></div>
          ) : (
            <p className="text-3xl font-bold">{stats.totalAdmins}</p>
          )}
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Experts</h3>
          {isLoading ? (
            <div className="animate-pulse h-9 bg-gray-200 rounded"></div>
          ) : (
            <p className="text-3xl font-bold">{stats.totalExperts}</p>
          )}
        </div>
      </div>
    </div>
  )
}
