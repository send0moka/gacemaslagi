/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useEffect, useState, use } from "react"
import { createClient } from "@/lib/client"
import { Article, ArticleComment, CommentWithEmail } from "@/utils/types"
import Image from "next/image"
import MDXViewer from "@/components/MDXViewer"
import { slugify } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { Heart, MessageCircle } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { useUser } from "@clerk/nextjs"
import { Pencil } from "lucide-react"

interface ArticleWithAuthor extends Article {
  users: {
    name: string
  }
}

interface SupabaseError {
  code: string;
  message: string;
  details: string;
}

export default function ArticleDetailPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const router = useRouter()
  const { user } = useUser()
  const [article, setArticle] = useState<ArticleWithAuthor | null>(null)
  const [comments, setComments] = useState<CommentWithEmail[]>([])
  const [newComment, setNewComment] = useState("")
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(0)
  const [selectedComments, setSelectedComments] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLikeLoading, setIsLikeLoading] = useState(false)
  const [isExpert, setIsExpert] = useState(false)
  const [isOperator, setIsOperator] = useState(false)
  const [editContent, setEditContent] = useState("")
  const isSuperAdmin = user?.primaryEmailAddress?.emailAddress === "jehian.zuhry@mhs.unsoed.ac.id"

  const supabase = createClient()
  const resolvedParams = use(params)

  useEffect(() => {
    async function fetchArticleAndComments() {
      setIsLoading(true)
      try {
        // Get all articles first
        const { data: articles } = await supabase
          .from("articles")
          .select(`
            *,
            users (
              name
            )
          `)
        
        // Find article matching slug
        const foundArticle = articles?.find(
          article => slugify(article.title) === resolvedParams.slug
        )

        if (foundArticle) {
          setArticle(foundArticle as ArticleWithAuthor)

          // Fetch comments for this article
          const { data: articleComments } = await supabase
            .from("article_comments")
            .select("*")
            .eq("article_id", foundArticle.id)
            .order("created_at", { ascending: false })

          setComments(articleComments || [])
        }
      } catch (error) {
        console.error("Error fetching article:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchArticleAndComments()
  }, [resolvedParams.slug, supabase])

  // Fetch likes and comments
  useEffect(() => {
    if (!article?.id || !user?.primaryEmailAddress?.emailAddress) return

    const fetchLikesAndComments = async () => {
      const userEmail = user.primaryEmailAddress?.emailAddress
      if (!userEmail) throw new Error('User email not found')

      try {
        const [{ count }, { data: userLike }] = await Promise.all([
          supabase
            .from('article_likes')
            .select('*', { count: 'exact' })
            .eq('article_id', article.id)
            .throwOnError(),
          supabase
            .from('article_likes')
            .select('id')
            .eq('article_id', article.id)
            .eq('user_id', userEmail)
            .maybeSingle()
            .throwOnError()
        ])

        setLikesCount(count || 0)
        setIsLiked(!!userLike)
      } catch (error) {
        console.error('Error fetching likes:', error)
      }
    }

    fetchLikesAndComments()
  }, [article?.id, user?.primaryEmailAddress?.emailAddress, supabase])

  // Update useEffect to fetch user role
  useEffect(() => {
    async function fetchUserRole() {
      if (!user?.primaryEmailAddress?.emailAddress) return
      
      const { data } = await supabase
        .from('users')
        .select('is_expert')
        .eq('email', user.primaryEmailAddress.emailAddress)
        .single()

      // If data exists and is_expert is false, they are an operator
      setIsOperator((data && data.is_expert === false) ?? false)
      setIsExpert(data?.is_expert ?? false)
    }

    fetchUserRole()
  }, [user?.primaryEmailAddress?.emailAddress, supabase])

  const handleLike = async () => {
    if (!user?.primaryEmailAddress?.emailAddress || !article?.id) {
      toast.error("Please login to like articles")
      return
    }

    try {
      const userEmail = user.primaryEmailAddress.emailAddress

      if (isLiked) {
        await supabase
          .from('article_likes')
          .delete()
          .eq('article_id', article.id)
          .eq('user_id', userEmail)

        setIsLiked(false)
        setLikesCount(prev => prev - 1)
      } else {
        await supabase
          .from('article_likes')
          .insert({
            article_id: article.id,
            user_id: userEmail
          })

        setIsLiked(true)
        setLikesCount(prev => prev + 1)
      }
    } catch (error) {
      console.error(error)
      toast.error("Failed to update like")
    }
  }

  const handleComment = async () => {
    if (!user) {
      toast.error("Please login to comment")
      return
    }

    if (!newComment.trim()) {
      toast.error("Comment cannot be empty")
      return
    }

    try {
      const { data, error } = await supabase
        .from("article_comments")
        .insert({
          article_id: article?.id,
          content: newComment,
          email: user.primaryEmailAddress?.emailAddress
        })
        .select()
        .single()

      if (error) throw error

      setComments(prev => [data, ...prev])
      setNewComment("")
      toast.success("Comment added successfully")
    } catch (error) {
      console.error("Error adding comment:", error)
      toast.error("Failed to add comment")
    }
  }

  // Update handleDeleteComments
  const handleDeleteComments = async () => {
    if (!user?.primaryEmailAddress?.emailAddress || selectedComments.length === 0) return

    try {
      const { error } = await supabase
        .from("article_comments")
        .delete()
        .in("id", selectedComments)

      if (error) throw error

      setComments(prev => prev.filter(comment => !selectedComments.includes(comment.id)))
      setSelectedComments([])
      toast.success("Comments deleted successfully")
    } catch (error) {
      console.error("Delete error:", error)
      toast.error("Failed to delete comments")
    }
  }

  const handleEdit = async (commentId: string, newContent: string) => {
    if (!user?.primaryEmailAddress?.emailAddress) return

    try {
      const { error } = await supabase
        .from("article_comments")
        .update({ content: newContent })
        .eq("id", commentId)
        .eq("email", user.primaryEmailAddress.emailAddress)

      if (error) throw error

      setComments(prev => prev.map(comment => 
        comment.id === commentId 
          ? { ...comment, content: newContent, isEditing: false }
          : comment
      ))
      toast.success("Comment updated successfully")
    } catch (error) {
      console.error("Update error:", error)
      toast.error("Failed to update comment")
    }
  }

  const startEdit = (comment: ArticleComment) => {
    setComments(prev => prev.map(c => ({
      ...c,
      isEditing: c.id === comment.id
    })))
    setEditContent(comment.content)
  }

  const cancelEdit = () => {
    setComments(prev => prev.map(c => ({
      ...c,
      isEditing: false
    })))
    setEditContent("")
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    )
  }

  if (!article) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Article not found
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Button 
        variant="ghost" 
        className="mb-6 flex items-center gap-2"
        onClick={() => router.back()}
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Button>

      <article className="space-y-4">
        {/* Cover Image */}
        {article.cover_image && (
          <div className="relative w-full h-[400px]">
            <Image
              src={article.cover_image}
              alt={article.title}
              fill
              className="object-cover rounded-lg"
            />
          </div>
        )}

        {/* Article Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">{article.title}</h1>
          {article.subtitle && (
            <p className="text-xl text-gray-600">{article.subtitle}</p>
          )}
        </div>

        {/* Article Meta */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>By {article.users?.name}</span>
          <span>•</span>
          <time>
            {new Date(article.created_at).toLocaleDateString('en-US', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </time>
        </div>

        {/* Article Content */}
        <div className="prose max-w-none mt-8">
          <MDXViewer content={article.content} />
        </div>
      </article>

      {/* Like and Comment Section */}
      <div className="mt-8 space-y-6">
        <div className="flex items-center gap-6">
          <button
            onClick={handleLike}
            disabled={isLikeLoading}
            className={`flex items-center gap-2 text-gray-600 hover:text-primary transition-colors
              ${isLikeLoading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <Heart 
              className={`w-6 h-6 transition-colors ${isLiked ? "fill-primary text-primary" : ""}`} 
            />
            <span>{likesCount} likes</span>
          </button>
          <div className="flex items-center gap-2 text-gray-600">
            <MessageCircle className="w-6 h-6" />
            <span>{comments.length} comments</span>
          </div>
        </div>

        {/* Comment Form */}
        <div className="space-y-4">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="min-h-[100px]"
          />
          <Button onClick={handleComment}>Post Comment</Button>
        </div>

        {/* Comments List */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold">Comments</h3>
            {selectedComments.length > 0 && (
              <Button 
                variant="destructive" 
                onClick={handleDeleteComments}
              >
                Delete Selected ({selectedComments.length})
              </Button>
            )}
          </div>
          
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-4 p-4 border rounded-lg">
              {/* Show checkbox if user owns comment OR is operator OR is super admin */}
              {(comment.email === user?.primaryEmailAddress?.emailAddress || 
                isOperator || 
                isSuperAdmin) && (
                <Checkbox
                  checked={selectedComments.includes(comment.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedComments(prev => [...prev, comment.id])
                    } else {
                      setSelectedComments(prev => prev.filter(id => id !== comment.id))
                    }
                  }}
                />
              )}
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium">{comment.email}</span>
                  <div className="flex items-center gap-2">
                    {comment.email === user?.primaryEmailAddress?.emailAddress && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEdit(comment)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                    )}
                    <time className="text-sm text-gray-500">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </time>
                  </div>
                </div>
                
                {comment.isEditing ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="min-h-[100px]"
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={cancelEdit}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleEdit(comment.id, editContent)}
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-600">{comment.content}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}