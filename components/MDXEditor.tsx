"use client"

import { useState } from "react"
import MDEditor from "@uiw/react-md-editor"
import { Button } from "@/components/ui/button"

interface MDXEditorProps {
  value: string
  onChange: (value: string) => void
}

export default function MDXEditor({ value, onChange }: MDXEditorProps) {
  const [preview, setPreview] = useState<"edit" | "preview">("edit")

  return (
    <div className="space-y-4" data-color-mode="light">
      <div className="flex gap-2">
        <Button 
          variant={preview === "edit" ? "default" : "outline"}
          onClick={() => setPreview("edit")}
          type="button"
        >
          Edit
        </Button>
        <Button
          variant={preview === "preview" ? "default" : "outline"} 
          onClick={() => setPreview("preview")}
          type="button"
        >
          Preview
        </Button>
      </div>

      <MDEditor
        value={value}
        onChange={(val) => onChange(val || "")}
        preview={preview === "preview" ? "preview" : "live"}
        height={500}
        hideToolbar={preview === "preview"}
      />
    </div>
  )
}