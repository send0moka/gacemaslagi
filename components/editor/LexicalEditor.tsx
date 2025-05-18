/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect } from 'react'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $getRoot, $createParagraphNode, $createTextNode, EditorState } from 'lexical'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { ToolbarPlugin } from './ToolbarPlugin'

interface LexicalEditorProps {
  initialValue?: string
  onChange?: (value: string) => void
}

const emptyEditorState = {
  root: {
    children: [
      {
        children: [
          {
            text: '',
            type: 'text',
          },
        ],
        type: 'paragraph',
      },
    ],
    direction: 'ltr',
    format: '',
    indent: 0,
    type: 'root',
    version: 1,
  },
}

function InitialValuePlugin({ initialValue }: { initialValue?: string }) {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    editor.update(() => {
      const root = $getRoot()
      if (initialValue) {
        try {
          const parsedContent = typeof initialValue === 'string' 
            ? JSON.parse(initialValue) 
            : emptyEditorState

          // Clear existing content
          root.clear()

          // Create new content
          const paragraph = $createParagraphNode()
          const text = $createTextNode(
            parsedContent?.root?.children?.[0]?.children?.[0]?.text || ''
          )
          paragraph.append(text)
          root.append(paragraph)
        } catch (error) {
          console.warn('Failed to parse initial value:', error)
          // Set empty state
          const paragraph = $createParagraphNode()
          paragraph.append($createTextNode(''))
          root.append(paragraph)
        }
      } else {
        // Set empty state
        const paragraph = $createParagraphNode()
        paragraph.append($createTextNode(''))
        root.append(paragraph)
      }
    })
  }, [editor, initialValue])

  return null
}

const editorConfig = {
  namespace: 'disease-solution-editor',
  theme: {
    paragraph: 'mb-2',
    text: {
      bold: 'font-bold',
      italic: 'italic',
      underline: 'underline',
    },
  },
  onError: (error: Error) => {
    console.error('Lexical Editor Error:', error)
  },
}

export function LexicalEditor({ initialValue, onChange }: LexicalEditorProps) {
  return (
    <LexicalComposer initialConfig={editorConfig}>
      <div className="border rounded-lg overflow-hidden">
        <ToolbarPlugin />
        <RichTextPlugin
          contentEditable={
            <ContentEditable className="min-h-[150px] outline-none" />
          }
          placeholder={
            <div className="absolute top-0 left-0 text-gray-400 pointer-events-none p-4">
              Enter solution details...
            </div>
          }
          ErrorBoundary={LexicalErrorBoundary as any}
        />
        <InitialValuePlugin initialValue={initialValue} />
        {onChange && (
          <OnChangePlugin
            onChange={(editorState) => {
              editorState.read(() => {
                const json = JSON.stringify($getRoot().exportJSON())
                onChange(json)
              })
            }}
          />
        )}
      </div>
    </LexicalComposer>
  )
}

function OnChangePlugin({ onChange }: { onChange: (state: EditorState) => void }) {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      onChange(editorState)
    })
  }, [editor, onChange])

  return null
}