import { ImageIcon, X } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Disease, FileWithPreview, Symptom } from "@/utils/types"
import { useDiseaseContext } from "@/context/DiseaseContext"

interface DiseaseFormProps {
  symptoms: Symptom[]
  isLoading: boolean
  onAddDisease: (
    disease: Omit<Disease, "id" | "created_at">
  ) => Promise<boolean>
  onUpdateDisease: (
    id: number,
    disease: Omit<Disease, "id" | "created_at">
  ) => Promise<boolean>
}

export default function DiseaseForm({
  symptoms,
  isLoading,
  onAddDisease,
  onUpdateDisease,
}: DiseaseFormProps) {
  const {
    editingDisease,
    newDisease,
    setNewDisease,
    imagePreviews,
    setImagePreviews,
    listItems,
    setListItems,
    links,
    setLinks,
    fileNames,
    setFileNames,
    resetForm,
  } = useDiseaseContext()

  const handleAddListItem = () => {
    setListItems([...listItems, ""])
  }

  const handleListItemChange = (index: number, value: string) => {
    const newItems = [...listItems]
    newItems[index] = value
    setListItems(newItems)
    setNewDisease({
      ...newDisease,
      solution: {
        ...newDisease.solution,
        list: newItems.filter((item) => item.trim()).join("|"),
      },
    })
  }

  const handleRemoveListItem = (index: number) => {
    const newItems = listItems.filter((_, i) => i !== index)
    setListItems(newItems)
    setNewDisease({
      ...newDisease,
      solution: {
        ...newDisease.solution,
        list: newItems.filter((item) => item.trim()).join("|"),
      },
    })
  }

  const handleAddLink = () => {
    setLinks([...links, ""])
  }

  const handleLinkChange = (index: number, value: string) => {
    const newLinks = [...links]
    newLinks[index] = value
    setLinks(newLinks)
    setNewDisease({
      ...newDisease,
      solution: {
        ...newDisease.solution,
        link: newLinks.filter((link) => link.trim()).join("|"),
      },
    })
  }

  const handleRemoveLink = (index: number) => {
    const newLinks = links.filter((_, i) => i !== index)
    setLinks(newLinks)
    setNewDisease({
      ...newDisease,
      solution: {
        ...newDisease.solution,
        link: newLinks.filter((link) => link.trim()).join("|"),
      },
    })
  }

  const handleSubmit = async () => {
    if (
      !newDisease.code ||
      !newDisease.name ||
      !newDisease.solution.desc ||
      newDisease.symptoms.length === 0
    ) {
      toast.error(
        "Please fill all required fields and select at least one symptom"
      )
      return
    }

    const success = editingDisease
      ? await onUpdateDisease(editingDisease.id, newDisease)
      : await onAddDisease(newDisease)

    if (success) {
      resetForm()
    }
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-md mb-8">
      <h2 className="text-lg font-semibold mb-4">
        {editingDisease ? "Edit Disease" : "Add New Disease"}
      </h2>

      <div className="space-y-4">
        <input
          type="text"
          value={newDisease.code}
          onChange={(e) =>
            setNewDisease({
              ...newDisease,
              code: e.target.value.toUpperCase(),
            })
          }
          placeholder="Disease code (e.g. P01)"
          className="w-full px-4 py-2 border rounded-lg"
          maxLength={10}
        />

        <input
          type="text"
          value={newDisease.name}
          onChange={(e) =>
            setNewDisease({ ...newDisease, name: e.target.value })
          }
          placeholder="Disease name"
          className="w-full px-4 py-2 border rounded-lg"
        />

        <div>
          <label className="block mb-2">About Disease:</label>
          <textarea
            value={newDisease.about}
            onChange={(e) =>
              setNewDisease({
                ...newDisease,
                about: e.target.value,
              })
            }
            placeholder="Enter about disease..."
            className="w-full px-4 py-2 border rounded-lg min-h-[100px]"
            rows={4}
            required
          />
        </div>

        <div>
          <label className="block mb-2">Solution:</label>
          <div className="space-y-4">
            {/* Description Input */}
            <div>
              <label className="text-sm text-gray-600">
                Description (Required)
              </label>
              <textarea
                value={newDisease.solution.desc}
                onChange={(e) =>
                  setNewDisease({
                    ...newDisease,
                    solution: {
                      ...newDisease.solution,
                      desc: e.target.value,
                    },
                  })
                }
                placeholder="Enter solution description..."
                className="w-full px-4 py-2 border rounded-lg min-h-[100px]"
                rows={4}
                required
              />
            </div>

            {/* Image Upload Section */}
            <div>
              <label className="text-sm text-gray-600">Images (Optional)</label>
              <div className="space-y-2">
                {/* Image preview area */}
                <div className="flex flex-wrap gap-2">
                  {imagePreviews.map((preview, idx) => (
                    <div key={idx} className="relative group">
                      <Image
                        src={preview}
                        alt={`Preview ${idx + 1}`}
                        width={100}
                        height={100}
                        className="rounded-lg object-cover"
                      />
                      <button
                        onClick={() => {
                          const newPreviews = imagePreviews.filter(
                            (_, i) => i !== idx
                          )
                          setImagePreviews(newPreviews)
                          setNewDisease({
                            ...newDisease,
                            solution: {
                              ...newDisease.solution,
                              image: newPreviews.join("|"),
                            },
                          })
                        }}
                        className="absolute top-1 right-1 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* File input */}
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="dropzone-file"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <ImageIcon className="w-8 h-8 mb-2 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span>{" "}
                        or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG or WEBP (MAX. 2MB each)
                      </p>
                    </div>
                    <input
                      id="dropzone-file"
                      type="file"
                      className="hidden"
                      accept="image/png,image/jpeg,image/webp"
                      multiple
                      onChange={(e) => {
                        const files = Array.from(
                          e.target.files || []
                        ) as FileWithPreview[]
                        const validFiles = files.filter(
                          (file) => file.size <= 2 * 1024 * 1024
                        )

                        if (validFiles.length < files.length) {
                          toast.error(
                            "Some files were skipped because they exceed 2MB"
                          )
                        }

                        Promise.all(
                          validFiles.map((file) => {
                            return new Promise<{
                              base64: string
                              name: string
                            }>((resolve) => {
                              const reader = new FileReader()
                              reader.onloadend = () => {
                                resolve({
                                  base64: reader.result as string,
                                  name: file.name,
                                })
                              }
                              reader.readAsDataURL(file)
                            })
                          })
                        ).then((results) => {
                          const newFileNames = { ...fileNames }
                          results.forEach(({ base64, name }) => {
                            newFileNames[base64] = name
                          })
                          setFileNames(newFileNames)

                          const base64Array = results.map((r) => r.base64)
                          setImagePreviews((prev) => [...prev, ...base64Array])
                          setNewDisease({
                            ...newDisease,
                            solution: {
                              ...newDisease.solution,
                              image: [...imagePreviews, ...base64Array].join(
                                "|"
                              ),
                            },
                          })
                        })
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* List Items Section */}
            <div>
              <label className="text-sm text-gray-600 mb-2 block">
                List Items (Optional)
              </label>
              <div className="space-y-2">
                {listItems.map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) =>
                        handleListItemChange(index, e.target.value)
                      }
                      placeholder={`Item ${index + 1}`}
                      className="flex-1 px-4 py-2 border rounded-lg"
                    />
                    <button
                      onClick={() => handleRemoveListItem(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddListItem}
                  className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700"
                >
                  + Add Item
                </button>
              </div>
            </div>

            {/* Links Section */}
            <div>
              <label className="text-sm text-gray-600 mb-2 block">
                Links (Optional)
              </label>
              <div className="space-y-2">
                {links.map((link, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="url"
                      value={link}
                      onChange={(e) => handleLinkChange(index, e.target.value)}
                      placeholder={`https://example.com`}
                      className="flex-1 px-4 py-2 border rounded-lg"
                    />
                    <button
                      onClick={() => handleRemoveLink(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddLink}
                  className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700"
                >
                  + Add Link
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Symptoms Selection */}
        <div>
          <label className="block mb-2 font-medium">Select Symptoms:</label>
          <div className="max-h-60 overflow-y-auto border rounded-lg p-4 space-y-2">
            {symptoms.map((symptom) => (
              <div key={symptom.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`symptom-${symptom.id}`}
                  checked={newDisease.symptoms.includes(symptom.id)}
                  onChange={(e) => {
                    const updatedSymptoms = e.target.checked
                      ? [...newDisease.symptoms, symptom.id]
                      : newDisease.symptoms.filter((id) => id !== symptom.id)
                    setNewDisease({
                      ...newDisease,
                      symptoms: updatedSymptoms,
                    })
                  }}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <label
                  htmlFor={`symptom-${symptom.id}`}
                  className="flex items-center gap-2 select-none"
                >
                  <Tooltip>
                    <TooltipTrigger>
                      <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                        {symptom.code}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>{symptom.name}</TooltipContent>
                  </Tooltip>
                  <span className="text-sm text-gray-700">{symptom.name}</span>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className={`px-6 py-2 bg-blue-600 text-white rounded-lg ${
              isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
            }`}
          >
            {isLoading
              ? "Saving..."
              : editingDisease
              ? "Update Disease"
              : "Add Disease"}
          </button>
          {editingDisease && (
            <button
              onClick={resetForm}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
