"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/client"
import { Article } from "@/utils/types"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { slugify } from "@/lib/utils"

interface ArticleWithAuthor extends Article {
  users: {
    name: string
  } | null
}

export default function Articles() {
  const [articles, setArticles] = useState<ArticleWithAuthor[]>([])
  const supabase = createClient()

  useEffect(() => {
    async function fetchArticles() {
      const { data } = await supabase
        .from("articles")
        .select(`
          *,
          users (
            name
          )
        `)
        .order("created_at", { ascending: false })
        .limit(3)

      if (data) setArticles(data)
    }

    fetchArticles()
  }, [supabase])

  function truncate(text: string, length: number) {
    return text.length > length ? text.slice(0, length) + "..." : text
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {articles.map((article) => (
            <Link 
              href={`/articles/${slugify(article.title)}`} 
              key={article.id}
            >
              <Card className="h-full hover:shadow-lg transition-shadow max-w-sm mx-auto">
                <CardHeader className="p-0">
                  <div className="relative h-40 w-full">
                    <Image
                      src={article.cover_image || "/placeholder.jpg"}
                      alt={article.title}
                      fill
                      className="object-cover rounded-t-lg"
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <h3 className="font-bold text-lg mb-2">{article.title}</h3>
                  <p className="text-gray-600 text-sm mb-3">
                    {truncate(article.subtitle || "", 80)}
                  </p>
                </CardContent>
                <CardFooter className="px-4 py-3 border-t flex flex-col items-start gap-1">
                  <div className="text-sm text-gray-600">
                    By {article.users?.name || 'Unknown Author'}
                  </div>
                  <time className="text-sm text-gray-500">
                    {formatDate(article.created_at)}
                  </time>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}