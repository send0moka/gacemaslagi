import { useEffect, useState } from 'react'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { $getRoot, $createParagraphNode, $createTextNode, EditorState } from 'lexical'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { FORMAT_TEXT_COMMAND } from 'lexical'
import { $getSelection, $isRangeSelection } from 'lexical'

interface LexicalEditorProps {
  initialValue?: string | null
  onChange?: (value: string) => void
}

function Toolbar() {
  const [editor] = useLexicalComposerContext()
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
  const [isUnderline, setIsUnderline] = useState(false)

  const formatText = (format: 'bold' | 'italic' | 'underline') => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format)
  }

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection()
        if ($isRangeSelection(selection)) {
          setIsBold(selection.hasFormat('bold'))
          setIsItalic(selection.hasFormat('italic'))
          setIsUnderline(selection.hasFormat('underline'))
        }
      })
    })
  }, [editor])

  return (
    <div className="flex gap-2 p-2 border-b">
      <button
        className={`p-2 rounded font-bold transition-colors ${
          isBold 
            ? 'bg-blue-100 text-blue-600' 
            : 'hover:bg-gray-100'
        }`}
        onClick={() => formatText('bold')}
        title="Bold"
      >
        B
      </button>
      <button
        className={`p-2 rounded italic transition-colors ${
          isItalic 
            ? 'bg-blue-100 text-blue-600' 
            : 'hover:bg-gray-100'
        }`}
        onClick={() => formatText('italic')}
        title="Italic"
      >
        I
      </button>
      <button
        className={`p-2 rounded underline transition-colors ${
          isUnderline 
            ? 'bg-blue-100 text-blue-600' 
            : 'hover:bg-gray-100'
        }`}
        onClick={() => formatText('underline')}
        title="Underline"
      >
        U
      </button>
    </div>
  )
}

function InitialValuePlugin({ initialValue }: { initialValue?: string | null }) {
  const [editor] = useLexicalComposerContext()
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    if (!isInitialized && initialValue) {
      try {
        const content = typeof initialValue === 'string' 
          ? JSON.parse(initialValue) 
          : initialValue

        editor.update(() => {
          const root = $getRoot()
          root.clear()

          const paragraph = $createParagraphNode()
          const text = content?.root?.children?.[0]?.children?.[0]?.text || ''
          paragraph.append($createTextNode(text))
          root.append(paragraph)
        })
      } catch (error) {
        console.warn('Failed to parse initial value:', error)
      }
      setIsInitialized(true)
    }
  }, [editor, initialValue, isInitialized])

  return null
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

export function LexicalEditor({ initialValue, onChange }: LexicalEditorProps) {
  const initialConfig = {
    namespace: 'disease-solution-editor',
    theme: {
      paragraph: 'mb-2',
      text: {
        bold: 'font-bold',
        italic: 'italic',
        underline: 'underline',
      },
    },
    onError: console.error,
  }

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="border rounded-lg overflow-hidden">
        <Toolbar />
        <div className="p-4 min-h-[150px] relative">
          <RichTextPlugin
            contentEditable={
              <ContentEditable className="min-h-[150px] outline-none" />
            }
            placeholder={
              <div className="absolute top-0 left-0 text-gray-400 pointer-events-none p-4">
                Enter solution details...
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
        </div>
        <HistoryPlugin />
        <InitialValuePlugin initialValue={initialValue} />
        {onChange && (
          <OnChangePlugin
            onChange={(editorState) => {
              const json = JSON.stringify(editorState.toJSON())
              if (json !== initialValue) {
                onChange(json)
              }
            }}
          />
        )}
      </div>
    </LexicalComposer>
  )
}