interface ExportButtonProps {
  onExport: () => Promise<void>
}

export default function ExportButton({ onExport }: ExportButtonProps) {
  return (
    <div className="flex justify-end my-4">
      <button
        onClick={onExport}
        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
      >
        Export to PDF
      </button>
    </div>
  )
}