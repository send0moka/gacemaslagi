/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/client"
import { useUser } from "@clerk/nextjs"
import dynamic from "next/dynamic"
import { Article } from "@/utils/types"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"

const MDXEditor = dynamic(() => import("@/components/MDXEditor"), { ssr: false })

export default function ArticlePage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [currentArticle, setCurrentArticle] = useState<Partial<Article>>({})
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)
  const { user } = useUser() // Changed from useAuth to useUser
  const supabase = createClient()

  // Get current user's ID from users table
  useEffect(() => {
    async function getCurrentUser() {
      const email = user?.primaryEmailAddress?.emailAddress
      if (!email) return

      const { data } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .eq('is_expert', false)
        .single()

      if (data) {
        setCurrentUserId(data.id)
      }
    }

    getCurrentUser()
  }, [user, supabase])

  useEffect(() => {
    fetchArticles()
  }, [])

  async function fetchArticles() {
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      toast.error("Failed to fetch articles")
      return
    }

    setArticles(data)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!currentArticle.title || !currentArticle.content || !currentUserId) {
      toast.error("Title and content are required")
      return
    }

    try {
      const articleData = {
        title: currentArticle.title,
        subtitle: currentArticle.subtitle || "",
        content: currentArticle.content,
        cover_image: currentArticle.cover_image || "",
        author_id: currentUserId // Use current user's ID automatically
      }

      let result;
      if (currentArticle.id) {
        result = await supabase
          .from("articles")
          .update(articleData)
          .eq("id", currentArticle.id)
          .select()
          .single()
      } else {
        result = await supabase
          .from("articles")
          .insert(articleData)
          .select()
          .single()
      }

      if (result.error) {
        throw new Error(result.error.message)
      }

      toast.success("Article saved successfully")
      setIsEditing(false)
      setCurrentArticle({})
      await fetchArticles()
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      console.error("Error saving article:", errorMessage)
      toast.error(`Failed to save article: ${errorMessage}`)
    }
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm("Are you sure you want to delete this article?")
    if (!confirmed) return

    const { error } = await supabase
      .from("articles")
      .delete()
      .eq("id", id)

    if (error) {
      toast.error("Failed to delete article")
      return
    }

    toast.success("Article deleted successfully")
    fetchArticles()
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Articles</h1>
        <Button onClick={() => setIsEditing(true)}>New Article</Button>
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Title"
            value={currentArticle.title || ""}
            onChange={(e) => setCurrentArticle({...currentArticle, title: e.target.value})}
          />
          <Input
            placeholder="Subtitle"
            value={currentArticle.subtitle || ""}
            onChange={(e) => setCurrentArticle({...currentArticle, subtitle: e.target.value})}
          />
          <Input
            placeholder="Cover Image URL"
            value={currentArticle.cover_image || ""}
            onChange={(e) => setCurrentArticle({...currentArticle, cover_image: e.target.value})}
          />
          <MDXEditor
            value={currentArticle.content || ""}
            onChange={(content) => setCurrentArticle({...currentArticle, content})}
          />
          <div className="flex gap-2">
            <Button type="submit">Save</Button>
            <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
          </div>
        </form>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {articles.map((article) => (
              <TableRow key={article.id}>
                <TableCell>{article.title}</TableCell>
                <TableCell>{new Date(article.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCurrentArticle(article)
                      setIsEditing(true)
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(article.id)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}