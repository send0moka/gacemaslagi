/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import { useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"
import { createClient } from "@/lib/client"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Disease } from "@/utils/types"

interface DiagnosisHistory {
  id: string
  created_at: string
  disease_code: string
  symptoms: string[]
}

interface DiagnosisCount {
  disease_code: string
  count: number
}

type FilterPeriod = 'today' | 'week' | 'month' | 'all'

export default function Histories() {
  const { user } = useUser()
  const [userHistory, setUserHistory] = useState<DiagnosisHistory[]>([])
  const [filteredHistory, setFilteredHistory] = useState<DiagnosisHistory[]>([])
  const [allDiagnoses, setAllDiagnoses] = useState<DiagnosisCount[]>([])
  const [diseases, setDiseases] = useState<Record<string, Disease>>({})
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<FilterPeriod>('all')

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.emailAddresses?.[0]?.emailAddress) return
      
      try {
        const supabase = createClient()
        
        // Fetch user's diagnosis history using email
        const { data: historyData, error: historyError } = await supabase
          .from("diagnoses")
          .select("*")
          .eq("email", user.emailAddresses[0].emailAddress)
          .order("created_at", { ascending: false })
        
        if (historyError) throw historyError

        // Fetch all diseases for reference
        const { data: diseasesData, error: diseasesError } = await supabase
          .from("diseases")
          .select("*")

        if (diseasesError) throw diseasesError

        const diseasesMap = diseasesData.reduce((acc, disease) => {
          acc[disease.code] = disease
          return acc
        }, {} as Record<string, Disease>)

        // Fetch diagnosis statistics
        const { data: statsData, error: statsError } = await supabase
          .from("diagnoses")
          .select("disease_code")

        if (statsError) throw statsError

        // Count diagnoses by disease
        const counts = statsData.reduce((acc: DiagnosisCount[], curr) => {
          const existing = acc.find(item => item.disease_code === curr.disease_code)
          if (existing) {
            existing.count++
          } else {
            acc.push({ disease_code: curr.disease_code, count: 1 })
          }
          return acc
        }, [])

        setUserHistory(historyData)
        setDiseases(diseasesMap)
        setAllDiagnoses(counts)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching statistics:", error)
      }
    }

    fetchData()
  }, [user])

  const filterHistory = (period: FilterPeriod) => {
    setActiveFilter(period)
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    switch (period) {
      case 'today':
        setFilteredHistory(userHistory.filter(diagnosis => {
          const diagnosisDate = new Date(diagnosis.created_at)
          return diagnosisDate >= today
        }))
        break
      case 'week':
        const weekAgo = new Date(today)
        weekAgo.setDate(weekAgo.getDate() - 7)
        setFilteredHistory(userHistory.filter(diagnosis => {
          const diagnosisDate = new Date(diagnosis.created_at)
          return diagnosisDate >= weekAgo
        }))
        break
      case 'month':
        const monthAgo = new Date(today)
        monthAgo.setMonth(monthAgo.getMonth() - 1)
        setFilteredHistory(userHistory.filter(diagnosis => {
          const diagnosisDate = new Date(diagnosis.created_at)
          return diagnosisDate >= monthAgo
        }))
        break
      case 'all':
      default:
        setFilteredHistory(userHistory)
        break
    }
  }

  useEffect(() => {
    if (userHistory.length > 0) {
      filterHistory('all')
    }
  }, [userHistory])

  if (loading) {
    return <div className="text-center p-8">Loading histories...</div>
  }

  return (
    <section id="histories" className="max-w-6xl mx-auto p-8">
      <h2 className="text-2xl font-bold mb-8 text-center">Histories</h2>

      <div className="space-y-8">
        {/* User's History */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">Riwayat Diagnosis Anda</h3>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                Total: {filteredHistory.length}
              </span>
            </div>
            
            {/* Filter Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => filterHistory('today')}
                className={`px-4 py-2 rounded-lg ${
                  activeFilter === 'today'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                Today
              </button>
              <button
                onClick={() => filterHistory('week')}
                className={`px-4 py-2 rounded-lg ${
                  activeFilter === 'week'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => filterHistory('month')}
                className={`px-4 py-2 rounded-lg ${
                  activeFilter === 'month'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => filterHistory('all')}
                className={`px-4 py-2 rounded-lg ${
                  activeFilter === 'all'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                All
              </button>
            </div>
          </div>

          {filteredHistory.length > 0 ? (
            <div className="max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 mt-4">
              <div className="grid gap-3">
                {filteredHistory.map((diagnosis) => (
                  <div
                    key={diagnosis.id}
                    className="flex items-center justify-between border rounded-lg p-3 hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm bg-blue-100 text-blue-800 font-bold px-2 py-1 rounded whitespace-nowrap">
                        {diagnosis.disease_code}
                      </span>
                      <span className="font-medium">
                        {diseases[diagnosis.disease_code]?.name}
                      </span>
                    </div>
                    <div className="flex flex-col items-end text-sm text-gray-500">
                      <span>{new Date(diagnosis.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      })}</span>
                      <span>{new Date(diagnosis.created_at).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit"
                      })}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-500 mt-4">Tidak ada riwayat diagnosis untuk periode ini</p>
          )}
        </div>

        {/* Overall Statistics */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Statistik Keseluruhan</h3>
          </div>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={allDiagnoses.map(d => ({
                  name: `${d.disease_code} - ${diseases[d.disease_code]?.name || "Unknown"}`,
                  jumlah: d.count
                }))}
                margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="jumlah" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  )
}