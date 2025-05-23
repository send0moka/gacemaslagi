import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Disease } from "@/utils/types"
import Image from "next/image"

interface SolutionDialogProps {
  isOpen: boolean
  onClose: () => void
  solution: Disease["solution"] | null
}

export default function SolutionDialog({
  isOpen,
  onClose,
  solution
}: SolutionDialogProps) {
  if (!solution) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Solution Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {solution.image && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {solution.image.split("|").map((img, idx) => (
                <div key={idx} className="relative aspect-video">
                  <Image
                    src={img}
                    alt={`Solution image ${idx + 1}`}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
              ))}
            </div>
          )}

          <div className="prose prose-sm max-w-none">
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p>{solution.desc}</p>
          </div>

          {solution.list && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Steps</h3>
              <ul className="list-disc pl-5 space-y-1">
                {solution.list.split("|").map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {solution.link && (
            <div>
              <h3 className="text-lg font-semibold mb-2">References</h3>
              <div className="space-y-1">
                {solution.link.split("|").map((url, idx) => (
                  <a
                    key={idx}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-blue-600 hover:underline"
                  >
                    {url}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}