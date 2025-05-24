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
  const supabase = createClient()
  const resolvedParams = use(params)

  useEffect(() => {
    async function fetchArticle() {
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
        
        // Then find the one matching our slug
        const foundArticle = articles?.find(
          article => slugify(article.title) === resolvedParams.slug
        )

        if (foundArticle) {
          setArticle(foundArticle as ArticleWithAuthor)
        }
      } catch (error: unknown) {
        console.error("Error fetching article:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchArticle()
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

  const handleDeleteComments = async () => {
    if (selectedComments.length === 0) return

    try {
      await supabase
        .from("article_comments")
        .delete()
        .in("id", selectedComments)

      setComments(prev => prev.filter(comment => !selectedComments.includes(comment.id)))
      setSelectedComments([])
      toast.success("Comments deleted successfully")
    } catch (error) {
      toast.error("Failed to delete comments")
    }
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
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium">{comment.email}</span>
                  <time className="text-sm text-gray-500">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </time>
                </div>
                <p className="text-gray-600">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}