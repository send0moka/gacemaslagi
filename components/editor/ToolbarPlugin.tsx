import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { FORMAT_TEXT_COMMAND } from 'lexical'

export function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext()

  return (
    <div className="border-b p-2 flex gap-2">
      <button
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
        className="p-2 rounded hover:bg-gray-100"
      >
        Bold
      </button>
      <button
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
        className="p-2 rounded hover:bg-gray-100"
      >
        Italic
      </button>
      <button
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}
        className="p-2 rounded hover:bg-gray-100"
      >
        Underline
      </button>
    </div>
  )
}