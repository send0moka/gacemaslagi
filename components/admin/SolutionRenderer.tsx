import Image from "next/image"
import { Disease } from "@/utils/types"

interface SolutionRendererProps {
  solution: Disease["solution"] | string
  fileNames: { [key: string]: string }
  onImageClick: (imageUrl: string) => void
}

export default function SolutionRenderer({
  solution,
  onImageClick,
}: SolutionRendererProps) {
  try {
    const parsedSolution =
      typeof solution === "string" ? JSON.parse(solution) : solution

    return (
      <div className="space-y-4">
        {parsedSolution.image && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {parsedSolution.image.split("|").map((img: string, idx: number) => (
              <div
                key={idx}
                className="relative aspect-video cursor-pointer"
                onClick={() => onImageClick(img)}
              >
                <Image
                  src={img}
                  alt="Solution image"
                  fill
                  className="object-cover rounded-lg hover:opacity-90 transition"
                />
              </div>
            ))}
          </div>
        )}

        <div className="text-gray-800">{parsedSolution.desc}</div>

        {parsedSolution.list && (
          <ul className="list-disc pl-4 space-y-1">
            {parsedSolution.list.split("|").map((item: string, idx: number) => (
              <li key={idx} className="text-sm text-gray-600">
                {item}
              </li>
            ))}
          </ul>
        )}

        {parsedSolution.link && (
          <div className="flex gap-2 flex-wrap">
            {parsedSolution.link.split("|").map((url: string, idx: number) => (
              <a
                key={idx}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm"
              >
                {url}
              </a>
            ))}
          </div>
        )}
      </div>
    )
  } catch (error) {
    console.error("Error rendering solution:", error)
    return <div className="text-gray-800">{String(solution)}</div>
  }
}
