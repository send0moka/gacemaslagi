"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/client"
import { toast } from "sonner"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { PencilIcon, TrashIcon } from "lucide-react"
import { DeleteConfirmDialog } from "@/components/ui/DeleteConfirmDialog"
import { exportToPDF } from "@/lib/utils/export"
import { ImageIcon, X } from "lucide-react"
import Image from "next/image"

interface LexicalNode {
  children?: {
    text: string
  }[]
}

interface Disease {
  id: number
  code: string
  name: string
  solution: {
    desc: string
    image: string | null
    list: string | null
    link: string | null
  }
  symptoms: number[]
  created_at: string
}

interface Symptom {
  id: number
  code: string
  name: string
}

// Add this interface near the top of the file
interface FileWithPreview extends File {
  preview?: string;
}

export default function DiseasesPage() {
  const [diseases, setDiseases] = useState<Disease[]>([])
  const [symptoms, setSymptoms] = useState<Symptom[]>([])
  const [newDisease, setNewDisease] = useState({
    code: "",
    name: "",
    solution: {
      desc: "",
      image: null as string | null,
      list: null as string | null,
      link: null as string | null,
    },
    symptoms: [] as number[],
  })
  const [editingDisease, setEditingDisease] = useState<Disease | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    diseaseId: null as number | null,
  })
  const [search, setSearch] = useState("")
  const [sortField, setSortField] = useState<"code" | "name">("code")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [filteredDiseases, setFilteredDiseases] = useState<Disease[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [listItems, setListItems] = useState<string[]>([])
  const [links, setLinks] = useState<string[]>([])
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [imageModalOpen, setImageModalOpen] = useState(false)
  const [fileNames, setFileNames] = useState<{[key: string]: string}>({});
  const supabase = createClient()

  const fetchDiseases = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("diseases")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching diseases:", error.message)
        throw error
      }
      setDiseases(data || [])
    } catch (error) {
      console.error("Error:", error)
      toast.error("Failed to fetch diseases")
    }
  }, [supabase])

  const fetchSymptoms = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("symptoms")
        .select("id, code, name")

      if (error) {
        console.error("Error fetching symptoms:", error.message)
        throw error
      }
      setSymptoms(data || [])
    } catch (error) {
      console.error("Error:", error)
      toast.error("Failed to fetch symptoms")
    }
  }, [supabase])

  useEffect(() => {
    fetchDiseases()
    fetchSymptoms()
  }, [fetchDiseases, fetchSymptoms])

  const filterAndSortDiseases = useCallback(() => {
    let filtered = [...diseases]

    // Apply search
    if (search) {
      filtered = filtered.filter(
        (d) =>
          d.code.toLowerCase().includes(search.toLowerCase()) ||
          d.name.toLowerCase().includes(search.toLowerCase()) ||
          d.solution.desc.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Apply sort
    filtered.sort((a, b) => {
      const aValue = a[sortField].toLowerCase()
      const bValue = b[sortField].toLowerCase()
      return sortOrder === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    })

    setFilteredDiseases(filtered)
  }, [diseases, search, sortField, sortOrder])

  useEffect(() => {
    filterAndSortDiseases()
  }, [diseases, search, sortField, sortOrder, filterAndSortDiseases])

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
      const newFileNames = {...fileNames}
      images.forEach(img => {
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
  }

  const handleAddDisease = async () => {
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

    setIsLoading(true)
    try {
      const { error } = await supabase.from("diseases").insert([
        {
          code: newDisease.code,
          name: newDisease.name,
          solution: JSON.stringify(newDisease.solution),
          symptoms: newDisease.symptoms,
        },
      ])

      if (error) throw error

      toast.success("Disease added successfully")
      setNewDisease({
        code: "",
        name: "",
        solution: {
          desc: "",
          image: "",
          list: "",
          link: "",
        },
        symptoms: [],
      })
      fetchDiseases()
    } catch (error) {
      console.error("Failed to add disease:", error)
      toast.error("Failed to add disease")
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdate = async () => {
    if (!editingDisease) return
    if (
      !newDisease.code ||
      !newDisease.name ||
      !newDisease.solution.desc ||
      !newDisease.symptoms.length
    ) {
      toast.error(
        "Please fill all required fields and select at least one symptom"
      )
      return
    }

    try {
      setIsLoading(true)

      const { error: supabaseError } = await supabase
        .from("diseases")
        .update({
          code: newDisease.code,
          name: newDisease.name,
          solution: JSON.stringify(newDisease.solution),
          symptoms: newDisease.symptoms,
        })
        .eq("id", editingDisease.id)

      if (supabaseError) throw supabaseError

      toast.success("Disease updated successfully")
      setEditingDisease(null)
      setNewDisease({
        code: "",
        name: "",
        solution: {
          desc: "",
          image: "",
          list: "",
          link: "",
        },
        symptoms: [],
      })
      fetchDiseases()
    } catch (err) {
      console.error("Failed to update disease:", err)
      toast.error("Failed to update disease")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteClick = (id: number) => {
    setDeleteDialog({ isOpen: true, diseaseId: id })
  }

  const handleConfirmDelete = async () => {
    if (!deleteDialog.diseaseId) return

    try {
      const { error } = await supabase
        .from("diseases")
        .delete()
        .eq("id", deleteDialog.diseaseId)

      if (error) throw error

      toast.success("Disease deleted successfully")
      fetchDiseases()
    } catch (error) {
      console.error("Error:", error)
      toast.error("Failed to delete disease")
    } finally {
      setDeleteDialog({ isOpen: false, diseaseId: null })
    }
  }

  const handleCancel = () => {
    setEditingDisease(null)
    setNewDisease({
      code: "",
      name: "",
      solution: {
        desc: "",
        image: null,
        list: null,
        link: null,
      },
      symptoms: [],
    })
    setImagePreviews([])
    setListItems([])
    setLinks([])
    setFileNames({})  // Clear filename mappings
  }

  const handleExportPDF = () => {
    const formattedData = filteredDiseases.map((d) => ({
      Code: d.code,
      Name: d.name,
      Solution: (typeof d.solution === "string"
        ? JSON.parse(d.solution)
        : d.solution
      ).root.children
        .map(
          (node: LexicalNode) =>
            node.children
              ?.map((child: { text: string }) => child.text)
              .join("") || ""
        )
        .join("\n"),
    }))
    exportToPDF(formattedData, "diseases")
  }

  const renderSolution = (solution: Disease["solution"] | string) => {
    try {
      // If solution is already an object, use it directly
      const parsedSolution = typeof solution === 'string' 
        ? JSON.parse(solution) 
        : solution;

      return (
        <div className="space-y-2">
          {parsedSolution.image && (
            <div className="flex gap-1 flex-wrap">
              {parsedSolution.image.split('|').map((img: string, idx: number) => (
                <Tooltip key={idx}>
                  <TooltipTrigger asChild>
                    <button 
                      className="text-blue-600 text-sm hover:underline"
                      onClick={() => setSelectedImage(img)}
                    >
                      📷 {fileNames[img] || img.split("/").pop()?.split(";")[0] || `Image ${idx + 1}`}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    Click to view image
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          )}

          <div className="text-gray-800">{parsedSolution.desc}</div>

          {parsedSolution.list && (
            <ul className="list-disc pl-4 space-y-1">
              {parsedSolution.list.split('|').map((item: string, idx: number) => (
                <li key={idx} className="text-sm text-gray-600">
                  {item}
                </li>
              ))}
            </ul>
          )}

          {parsedSolution.link && (
            <div className="flex gap-2 flex-wrap">
              {parsedSolution.link.split('|').map((url: string, idx: number) => (
                <a
                  key={idx}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm"
                >
                  🔗 Link {idx + 1}
                </a>
              ))}
            </div>
          )}
        </div>
      )
    } catch (error) {
      console.error('Error rendering solution:', error);
      // Fallback rendering for string values
      return <div className="text-gray-800">{String(solution)}</div>;
    }
  }

  const handleAddListItem = () => {
    setListItems([...listItems, ''])
  }

  const handleListItemChange = (index: number, value: string) => {
    const newItems = [...listItems]
    newItems[index] = value
    setListItems(newItems)
    setNewDisease({
      ...newDisease,
      solution: {
        ...newDisease.solution,
        list: newItems.filter(item => item.trim()).join('|')
      }
    })
  }

  const handleRemoveListItem = (index: number) => {
    const newItems = listItems.filter((_, i) => i !== index)
    setListItems(newItems)
    setNewDisease({
      ...newDisease,
      solution: {
        ...newDisease.solution,
        list: newItems.filter(item => item.trim()).join('|')
      }
    })
  }

  const handleAddLink = () => {
    setLinks([...links, ''])
  }

  const handleLinkChange = (index: number, value: string) => {
    const newLinks = [...links]
    newLinks[index] = value
    setLinks(newLinks)
    setNewDisease({
      ...newDisease,
      solution: {
        ...newDisease.solution,
        link: newLinks.filter(link => link.trim()).join('|')
      }
    })
  }

  const handleRemoveLink = (index: number) => {
    const newLinks = links.filter((_, i) => i !== index)
    setLinks(newLinks)
    setNewDisease({
      ...newDisease,
      solution: {
        ...newDisease.solution,
        link: newLinks.filter(link => link.trim()).join('|')
      }
    })
  }

  const ImageModal = ({ 
    src, 
    onClose 
  }: { 
    src: string | null
    onClose: () => void 
  }) => {
    if (!src) return null;
    
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
    );
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Manage Diseases</h1>

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
            <label className="block mb-2">Solution:</label>
            <div className="space-y-4">
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

              <div>
                <label className="text-sm text-gray-600">
                  Images (Optional)
                </label>
                <div className="space-y-2">
                  {/* Image preview area */}
                  <div className="flex flex-wrap gap-2">
                    {imagePreviews.map((preview, idx) => (
                      <div key={idx} className="relative group">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div 
                              className="relative cursor-pointer transition-transform hover:scale-105"
                              onClick={() => setSelectedImage(preview)}
                            >
                              <Image
                                src={preview}
                                alt={`Preview ${idx + 1}`}
                                width={100}
                                height={100}
                                className="rounded-lg object-cover"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            {fileNames[preview] || preview.split("/").pop()?.split(";")[0] || `Image ${idx + 1}`}
                          </TooltipContent>
                        </Tooltip>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const newPreviews = imagePreviews.filter((_, i) => i !== idx);
                            setImagePreviews(newPreviews);
                            setNewDisease({
                              ...newDisease,
                              solution: {
                                ...newDisease.solution,
                                image: newPreviews.join("|"),
                              },
                            });
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
                          const files = Array.from(e.target.files || []) as FileWithPreview[]
                          const validFiles = files.filter(
                            (file) => file.size <= 2 * 1024 * 1024
                          ) // 2MB limit

                          if (validFiles.length < files.length) {
                            toast.error("Some files were skipped because they exceed 2MB")
                          }

                          Promise.all(
                            validFiles.map((file) => {
                              return new Promise<{ base64: string; name: string }>((resolve) => {
                                const reader = new FileReader()
                                reader.onloadend = () => {
                                  resolve({
                                    base64: reader.result as string,
                                    name: file.name
                                  })
                                }
                                reader.readAsDataURL(file)
                              })
                            })
                          ).then((results) => {
                            const newFileNames = {...fileNames}
                            results.forEach(({base64, name}) => {
                              newFileNames[base64] = name
                            })
                            setFileNames(newFileNames)
                            
                            const base64Array = results.map(r => r.base64)
                            setImagePreviews((prev) => [...prev, ...base64Array])
                            setNewDisease({
                              ...newDisease,
                              solution: {
                                ...newDisease.solution,
                                image: [...imagePreviews, ...base64Array].join("|"),
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
                        onChange={(e) => handleListItemChange(index, e.target.value)}
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
                    <span className="text-sm text-gray-700">
                      {symptom.name}
                    </span>
                  </label>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={editingDisease ? handleUpdate : handleAddDisease}
              disabled={isLoading}
              className={`px-6 py-2 bg-blue-600 text-white rounded-lg ${
                isLoading
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-blue-700"
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
                onClick={handleCancel}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search diseases..."
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th
                className="px-6 py-3 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                onClick={() => {
                  setSortField("code")
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                }}
              >
                Code
              </th>
              <th
                className="px-6 py-3 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                onClick={() => {
                  setSortField("name")
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc")
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
                  <div className="prose prose-sm max-w-none">
                    {disease.name}{" "}
                    {/* Display name directly without renderSolution */}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {renderSolution(disease.solution)}
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
                      onClick={() => handleDeleteClick(disease.id)}
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

      <div className="flex justify-end my-4">
        <button
          onClick={handleExportPDF}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Export to PDF
        </button>
      </div>

      <DeleteConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, diseaseId: null })}
        onConfirm={handleConfirmDelete}
        itemType="Disease"
      />

      {/* Image Modal */}
      {imageModalOpen && selectedImage && (
        <ImageModal 
          src={selectedImage} 
          onClose={() => setImageModalOpen(false)} 
        />
      )}
      {selectedImage && (
        <ImageModal
          src={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </div>
  )
}
