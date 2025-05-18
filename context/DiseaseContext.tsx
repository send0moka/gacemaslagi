import { Disease } from "@/utils/types"
import { createContext, useState, useContext, ReactNode } from "react"

interface DiseaseContextType {
  editingDisease: Disease | null
  setEditingDisease: (disease: Disease | null) => void
  newDisease: {
    code: string
    name: string
    about: string // Add this line
    solution: {
      desc: string
      image: string | null
      list: string | null
      link: string | null
    }
    symptoms: number[]
  }
  setNewDisease: React.Dispatch<
    React.SetStateAction<{
      code: string
      name: string
      about: string // Add this line
      solution: {
        desc: string
        image: string | null
        list: string | null
        link: string | null
      }
      symptoms: number[]
    }>
  >
  imagePreviews: string[]
  setImagePreviews: React.Dispatch<React.SetStateAction<string[]>>
  listItems: string[]
  setListItems: React.Dispatch<React.SetStateAction<string[]>>
  links: string[]
  setLinks: React.Dispatch<React.SetStateAction<string[]>>
  fileNames: { [key: string]: string }
  setFileNames: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>
  resetForm: () => void
}

const defaultDiseaseState = {
  code: "",
  name: "",
  about: "", // Add this line
  solution: {
    desc: "",
    image: null as string | null,
    list: null as string | null,
    link: null as string | null,
  },
  symptoms: [] as number[],
}

const DiseaseContext = createContext<DiseaseContextType | undefined>(undefined)

export function DiseaseProvider({ children }: { children: ReactNode }) {
  const [editingDisease, setEditingDisease] = useState<Disease | null>(null)
  const [newDisease, setNewDisease] = useState(defaultDiseaseState)
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [listItems, setListItems] = useState<string[]>([])
  const [links, setLinks] = useState<string[]>([])
  const [fileNames, setFileNames] = useState<{ [key: string]: string }>({})

  const resetForm = () => {
    setEditingDisease(null)
    setNewDisease(defaultDiseaseState)
    setImagePreviews([])
    setListItems([])
    setLinks([])
    setFileNames({})
  }

  return (
    <DiseaseContext.Provider
      value={{
        editingDisease,
        setEditingDisease,
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
      }}
    >
      {children}
    </DiseaseContext.Provider>
  )
}

export function useDiseaseContext() {
  const context = useContext(DiseaseContext)
  if (context === undefined) {
    throw new Error("useDiseaseContext must be used within a DiseaseProvider")
  }
  return context
}
