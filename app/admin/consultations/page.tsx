/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/client"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface ConsultationRequest {
  id: string
  expert_id: string
  name: string
  email: string
  whatsapp: string
  consultation_date: string
  consultation_time: string
  location: string
  status: "pending" | "accepted" | "rejected"
  created_at: string
  expert: {
    name: string | null
    email: string
  }
}

export default function ConsultationsPage() {
  const [requests, setRequests] = useState<ConsultationRequest[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from("consultation_requests")
        .select(`
          *,
          expert:users(name, email)
        `)
        .order("created_at", { ascending: false })

      if (error) throw error
      setRequests(data || [])
    } catch (error) {
      console.error("Error fetching requests:", error)
      toast.error("Failed to fetch consultation requests")
    }
  }

  const handleStatusUpdate = async (id: string, status: "accepted" | "rejected") => {
    setIsLoading(true)
    try {
      const { error } = await supabase
        .from("consultation_requests")
        .update({ status })
        .eq("id", id)

      if (error) throw error

      toast.success(`Request ${status} successfully`)
      fetchRequests()
    } catch (error) {
      console.error("Error updating status:", error)
      toast.error("Failed to update request status")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Consultation Requests</h1>

      <div className="bg-white rounded-lg shadow-md">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Patient</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Contact</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Schedule</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Location</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {requests.map((request) => (
              <tr key={request.id}>
                <td className="px-6 py-4">
                  <div className="font-medium">{request.name}</div>
                  <div className="text-sm text-gray-500">
                    for {request.expert.name || request.expert.email}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>{request.email}</div>
                  <div>{request.whatsapp}</div>
                </td>
                <td className="px-6 py-4">
                  <div>{new Date(request.consultation_date).toLocaleDateString()}</div>
                  <div>{request.consultation_time}</div>
                </td>
                <td className="px-6 py-4">{request.location}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    request.status === "pending" 
                      ? "bg-yellow-100 text-yellow-800"
                      : request.status === "accepted"
                      ? "bg-green-100 text-green-800"  
                      : "bg-red-100 text-red-800"
                  }`}>
                    {request.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {request.status === "pending" && (
                    <div className="space-x-2">
                      <Button
                        size="sm"
                        variant="default"
                        disabled={isLoading}
                        onClick={() => handleStatusUpdate(request.id, "accepted")}
                      >
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={isLoading}
                        onClick={() => handleStatusUpdate(request.id, "rejected")}
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {requests.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No consultation requests yet.
          </div>
        )}
      </div>
    </div>
  )
}