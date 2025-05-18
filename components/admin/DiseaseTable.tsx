import { PencilIcon, TrashIcon } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import SolutionRenderer from "./SolutionRenderer"
import { useDiseaseContext } from "@/context/DiseaseContext"
import { Disease, Symptom } from "@/utils/types"

interface DiseaseTableProps {
  diseases: Disease[]
  symptoms: Symptom[]
  sortField: "code" | "name"
  sortOrder: "asc" | "desc"
  onSortFieldChange: (field: "code" | "name") => void
  onSortOrderChange: (order: "asc" | "desc") => void
  onEdit: (disease: Disease) => void
  onDelete: (id: number) => void
  onImageClick: (imageUrl: string) => void
}

export default function DiseaseTable({
  diseases,
  symptoms,
  sortField,
  sortOrder,
  onSortFieldChange,
  onSortOrderChange,
  onEdit,
  onDelete,
  onImageClick,
}: DiseaseTableProps) {
  const {
    setEditingDisease,
    setNewDisease,
    setImagePreviews,
    setListItems,
    setLinks,
    fileNames,
    setFileNames,
  } = useDiseaseContext()

  const handleEdit = (disease: Disease) => {
    setEditingDisease(disease)
    setNewDisease({
      code: disease.code,
      name: disease.name,
      solution: disease.solution,
      symptoms: disease.symptoms,
    })

    // Load existing images
    if (disease.solution.image) {
      const images = disease.solution.image.split("|")
      setImagePreviews(images)

      // Try to extract original filenames if they exist in the image path/name
      const newFileNames = { ...fileNames }
      images.forEach((img) => {
        const fileName = img.split("/").pop()?.split(";")[0]
        if (fileName) {
          newFileNames[img] = fileName
        }
      })
      setFileNames(newFileNames)
    } else {
      setImagePreviews([])
    }

    // Load existing list items
    if (disease.solution.list) {
      setListItems(disease.solution.list.split("|"))
    } else {
      setListItems([])
    }

    // Load existing links
    if (disease.solution.link) {
      setLinks(disease.solution.link.split("|"))
    } else {
      setLinks([])
    }

    onEdit(disease)
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th
              className={`px-6 py-3 text-left text-sm font-semibold text-gray-900 cursor-pointer ${
                sortField === "code" ? "bg-gray-100" : ""
              }`}
              onClick={() => {
                onSortFieldChange("code")
                onSortOrderChange(sortOrder === "asc" ? "desc" : "asc")
              }}
            >
              Code
            </th>
            <th
              className={`px-6 py-3 text-left text-sm font-semibold text-gray-900 cursor-pointer ${
                sortField === "name" ? "bg-gray-100" : ""
              }`}
              onClick={() => {
                onSortFieldChange("name")
                onSortOrderChange(sortOrder === "asc" ? "desc" : "asc")
              }}
            >
              Name
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
              Solution
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
              Symptoms
            </th>
            <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {diseases.map((disease) => (
            <tr key={disease.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <Tooltip>
                  <TooltipTrigger>
                    <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-700/10">
                      {disease.code}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>{disease.name}</TooltipContent>
                </Tooltip>
              </td>
              <td className="px-6 py-4">
                <div className="prose prose-sm max-w-none">{disease.name}</div>
              </td>
              <td className="px-6 py-4">
                <SolutionRenderer
                  solution={disease.solution}
                  fileNames={fileNames}
                  onImageClick={onImageClick}
                />
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-wrap gap-1">
                  {symptoms
                    .filter((s) => disease.symptoms.includes(s.id))
                    .map((s) => (
                      <Tooltip key={s.id}>
                        <TooltipTrigger>
                          <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                            {s.code}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>{s.name}</TooltipContent>
                      </Tooltip>
                    ))}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => handleEdit(disease)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(disease.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
