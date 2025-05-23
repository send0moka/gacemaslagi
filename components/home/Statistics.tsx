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

export default function Statistics() {
  const { user } = useUser()
  const [userHistory, setUserHistory] = useState<DiagnosisHistory[]>([])
  const [allDiagnoses, setAllDiagnoses] = useState<DiagnosisCount[]>([])
  const [diseases, setDiseases] = useState<Record<string, Disease>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return
      
      try {
        const supabase = createClient()
        
        // Fetch user's diagnosis history
        const { data: historyData, error: historyError } = await supabase
          .from("diagnoses")
          .select("*")
          .eq("user_id", user.id)
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

  if (loading) {
    return <div className="text-center p-8">Loading statistics...</div>
  }

  return (
    <section id="statistics" className="max-w-6xl mx-auto p-8">
      <h2 className="text-2xl font-bold mb-8 text-center">Statistik Diagnosis</h2>

      <div className="space-y-8">
        {/* User's History */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Riwayat Diagnosis Anda</h3>
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
              Total: {userHistory.length}
            </span>
          </div>
          {userHistory.length > 0 ? (
            <div className="max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              <div className="grid gap-3">
                {userHistory.map((diagnosis) => (
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
            <p className="text-gray-500">Belum ada riwayat diagnosis</p>
          )}
        </div>

        {/* Overall Statistics */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Statistik Keseluruhan</h3>
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
              Total: {allDiagnoses.reduce((sum, d) => sum + d.count, 0)}
            </span>
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