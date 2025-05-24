"use client"

import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote"
import { serialize } from "next-mdx-remote/serialize"
import { useEffect, useState } from "react"

interface MDXViewerProps {
  content: string
}

export default function MDXViewer({ content }: MDXViewerProps) {
  const [mdxSource, setMdxSource] = useState<MDXRemoteSerializeResult | null>(null)

  useEffect(() => {
    const prepareMDX = async () => {
      const source = await serialize(content)
      setMdxSource(source)
    }
    
    prepareMDX()
  }, [content])

  if (!mdxSource) return null

  return (
    <div className="prose max-w-none">
      <MDXRemote {...mdxSource} />
    </div>
  )
}