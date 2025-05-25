 
"use client"

import { useState } from "react"
import { Feedback } from "@/utils/types"
import { createClient } from "@/lib/client"
import { toast } from "sonner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

interface Props {
  feedbacks: Feedback[]
}

export default function FeedbackTable({ feedbacks: initialFeedbacks }: Props) {
  const [feedbacks, setFeedbacks] = useState(initialFeedbacks)

  // Create Supabase client once at component level
  const supabase = createClient()

  const handleStatusChange = async (id: string, newStatus: 'pending' | 'solved' | 'rejected') => {
    console.log(`Updating feedback ${id} to ${newStatus}`)
    
    const { data, error } = await supabase
      .from('feedbacks')
      .update({ status: newStatus })
      .eq('id', id)

    console.log('Update response:', { data, error })

    if (!error) {
      setFeedbacks(feedbacks.map(f => 
        f.id === id ? { ...f, status: newStatus } : f
      ))
      toast.success('Status updated')
    } else {
      toast.error('Update failed')
    }
  }

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    solved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>From</TableHead>
          <TableHead>Contact</TableHead>
          <TableHead>Message</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {feedbacks.map((feedback) => (
          <TableRow key={feedback.id}>
            <TableCell>
              {format(new Date(feedback.created_at), 'dd MMM yyyy HH:mm')}
            </TableCell>
            <TableCell>
              {feedback.is_anonymous ? (
                <Badge variant="secondary">Anonymous</Badge>
              ) : (
                feedback.name
              )}
            </TableCell>
            <TableCell>
              {feedback.is_anonymous ? (
                "-"
              ) : (
                <div className="space-y-1">
                  <div>{feedback.email}</div>
                  {feedback.whatsapp && (
                    <div className="text-sm text-gray-500">{feedback.whatsapp}</div>
                  )}
                </div>
              )}
            </TableCell>
            <TableCell className="max-w-md">{feedback.message}</TableCell>
            <TableCell>
              <Badge className={statusColors[feedback.status]}>
                {feedback.status}
              </Badge>
            </TableCell>
            <TableCell>
              <Select
                defaultValue={feedback.status}
                onValueChange={(value: 'pending' | 'solved' | 'rejected') => 
                  handleStatusChange(feedback.id, value)
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="solved">Solved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}