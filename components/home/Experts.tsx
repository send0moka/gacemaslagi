"use client"

import { Button } from "@/components/ui/button"
import Image from "next/image"
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
import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { toast } from "sonner"

const experts = [
  {
    id: 1,
    name: "Dr. Michael Chen",
    image: "/experts/doctor1.jpg",
    specialization: "Clinical Psychiatrist",
  },
  {
    id: 2,
    name: "Dr. Sarah Johnson",
    image: "/experts/doctor2.png",
    specialization: "Child Psychiatrist",
  },
  {
    id: 3,
    name: "Dr. Amanda Wilson",
    image: "/experts/doctor3.png",
    specialization: "Behavioral Psychiatrist",
  },
]

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
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    whatsapp: "",
    location: "",
    time: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate date is at least tomorrow
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)

    if (!selectedDate || selectedDate < tomorrow) {
      toast.error("Consultation date must be at least tomorrow")
      return
    }

    // Here you would normally send the data to your API
    toast.success("Request submitted successfully! We'll respond within 24 hours.")
    setOpen(false)
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Our Expert Psychiatrists</h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          {experts.map((expert) => (
            <div key={expert.id}>
              <Image
                src={expert.image}
                alt={expert.name}
                width={400}
                height={400}
                className="w-full h-[30rem] object-cover rounded-lg mb-4"
              />
              <h3 className="text-xl font-semibold mb-2">{expert.name}</h3>
              <p className="text-gray-600 mb-4">{expert.specialization}</p>
              
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full">Request Consultation</Button>
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
      </div>
    </section>
  )
}