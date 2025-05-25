"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { createClient } from "@/lib/client"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { toast } from "sonner"

interface Expert {
  id: string
  name: string | null
  email: string
  specialization: string | null
  photo: string | null
  is_expert: boolean
}

const locations = [
  { id: 1, name: "RS Margono Soekarjo" },
  { id: 2, name: "RS Banyumas" },
  { id: 3, name: "Klinik Sehat Waras" },
]

const timeSlots = Array.from({ length: 13 }, (_, i) => {
  const hour = i + 7 // Starting from 7 AM
  return `${hour}:00`
})

export default function Experts() {
  const [experts, setExperts] = useState<Expert[]>([])
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    whatsapp: "",
    location: "",
    time: "",
  })
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null)

  useEffect(() => {
    fetchExperts()
  }, [])

  const fetchExperts = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("is_expert", true)

    if (error) {
      console.error("Error fetching experts:", error)
      return
    }

    setExperts(data)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate date is at least tomorrow
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)

    if (!selectedDate || selectedDate < tomorrow) {
      toast.error("Consultation date must be at least tomorrow")
      return
    }

    const supabase = createClient()
    
    try {
      const { error } = await supabase
        .from("consultation_requests")
        .insert({
          expert_id: selectedExpert?.id, // Add selectedExpert state and tracking
          name: formData.name,
          email: formData.email,
          whatsapp: formData.whatsapp,
          consultation_date: selectedDate.toISOString().split('T')[0],
          consultation_time: formData.time,
          location: formData.location
        })

      if (error) throw error

      toast.success("Request submitted successfully! We'll respond within 24 hours.")
      setOpen(false)
      setFormData({
        name: "",
        email: "",
        whatsapp: "",
        location: "",
        time: "",
      })
      setSelectedDate(undefined)
    } catch (error) {
      console.error("Error submitting request:", error)
      toast.error("Failed to submit request. Please try again.")
    }
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Our Expert Psychiatrists</h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          {experts.map((expert) => (
            <div key={expert.id}>
              {expert.photo ? (
                <Image
                  src={expert.photo}
                  alt={expert.name || "Expert"}
                  width={400}
                  height={400}
                  className="w-full h-[30rem] object-cover rounded-lg mb-4"
                />
              ) : (
                <div className="w-full h-[30rem] bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-gray-400">No photo available</span>
                </div>
              )}
              <h3 className="text-xl font-semibold mb-2">{expert.name || "Anonymous Expert"}</h3>
              <p className="text-gray-600 mb-4">{expert.specialization || "General Psychiatrist"}</p>
              
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full" onClick={() => setSelectedExpert(expert)}>Request Consultation</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Schedule Consultation</DialogTitle>
                    <DialogDescription>
                      Complete this form to request a consultation. We&apos;ll respond within 24 hours.
                    </DialogDescription>
                  </DialogHeader>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="whatsapp">WhatsApp Number</Label>
                      <Input
                        id="whatsapp"
                        required
                        value={formData.whatsapp}
                        onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label>Consultation Date</Label>
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        className="rounded-md border"
                        disabled={(date) => {
                          const tomorrow = new Date()
                          tomorrow.setDate(tomorrow.getDate() + 1)
                          tomorrow.setHours(0, 0, 0, 0)
                          return date < tomorrow
                        }}
                      />
                    </div>

                    <div>
                      <Label htmlFor="time">Time</Label>
                      <Select
                        required
                        value={formData.time}
                        onValueChange={(value) => setFormData({ ...formData, time: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Select
                        required
                        value={formData.location}
                        onValueChange={(value) => setFormData({ ...formData, location: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                        <SelectContent>
                          {locations.map((location) => (
                            <SelectItem key={location.id} value={location.name}>
                              {location.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Button type="submit" className="w-full">Submit Request</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          ))}
        </div>

        {experts.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            No experts available at the moment.
          </div>
        )}
      </div>
    </section>
  )
}