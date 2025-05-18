import Image from "next/image"
import { X } from "lucide-react"

interface ImageModalProps {
  src: string | null
  onClose: () => void
}

export default function ImageModal({ src, onClose }: ImageModalProps) {
  if (!src) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative z-10 max-w-4xl w-full">
        <Image
          src={src}
          alt="Full size preview"
          width={1200}
          height={800}
          className="w-full h-auto rounded-lg shadow-xl"
          onClick={(e) => e.stopPropagation()}
        />
        <button
          onClick={onClose}
          className="absolute -top-4 -right-4 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-lg"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
