/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

const feedbackSchema = z
  .object({
    isAnonymous: z.boolean(),
    name: z.string().optional(),
    email: z.string().email().optional(),
    whatsapp: z.string().optional(),
    message: z.string().min(10, "Feedback must be at least 10 characters"),
  })
  .superRefine((data, ctx) => {
    if (!data.isAnonymous && !data.name) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Name is required when not anonymous",
        path: ["name"],
      })
    }
    if (!data.isAnonymous && !data.email) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Email is required when not anonymous",
        path: ["email"],
      })
    }
  })

type FeedbackForm = z.infer<typeof feedbackSchema>

export default function Feedback() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const form = useForm<FeedbackForm>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      isAnonymous: false,
      name: "",
      email: "",
      whatsapp: "",
      message: "",
    },
  })

  const isAnonymous = form.watch("isAnonymous")

  async function onSubmit(data: FeedbackForm) {
    try {
      setIsSubmitting(true)
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error("Failed to submit feedback")

      toast.success("Feedback submitted successfully")
      form.reset()
    } catch (error) {
      toast.error("Failed to submit feedback")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="bg-gray-50 py-24" id="feedback">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Send us your feedback
          </h2>
          <p className="mt-2 text-lg leading-8 text-gray-600">
            Help us improve our service by sharing your thoughts
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-xl">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="isAnonymous"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel>Submit anonymously</FormLabel>
                  </FormItem>
                )}
              />

              {!isAnonymous && (
                <>
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="your@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="whatsapp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>WhatsApp (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="+62xxx" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your feedback</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Share your thoughts with us..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Send feedback"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </section>
  )
}