"use client"

import { useEffect, useState, use } from "react"
import { createClient } from "@/lib/client"
import { Article } from "@/utils/types"
import Image from "next/image"
import MDXViewer from "@/components/MDXViewer"
import { slugify } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

interface ArticleWithAuthor extends Article {
  users: {
    name: string
  }
}

export default function ArticleDetailPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const router = useRouter()
  const [article, setArticle] = useState<ArticleWithAuthor | null>(null)
  const [isLoading, setIsLoading] = useState(true)
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
      } catch (error) {
        console.error("Error fetching article:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchArticle()
  }, [resolvedParams.slug, supabase])

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
    </div>
  )
}