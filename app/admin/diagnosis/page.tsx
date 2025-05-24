"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/client"
import { Disease, Diagnosis, Symptom } from "@/utils/types"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { exportToExcel, exportToPDF } from "@/utils/export"
import { SearchIcon, SortAscIcon, SortDescIcon, DownloadIcon } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function DiagnosisPage() {
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([])
  const [diseases, setDiseases] = useState<Disease[]>([])
  const [symptoms, setSymptoms] = useState<Symptom[]>([])
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState<"created_at" | "disease_code">("created_at")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [diseaseFilter, setDiseaseFilter] = useState("all")
  const [, setIsLoading] = useState(false)

  // Add new state for date range and export filters
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [exportEmail, setExportEmail] = useState("")
  const [exportDisease, setExportDisease] = useState("all")

  // Add the export dialog component
  const [showExportDialog, setShowExportDialog] = useState(false)

  const supabase = createClient()

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data: diagnosesData } = await supabase
        .from("diagnoses")
        .select("*")
        .order(sortBy, { ascending: sortOrder === "asc" })
        .throwOnError()

      const { data: diseasesData } = await supabase
        .from("diseases")
        .select("*")

      const { data: symptomsData } = await supabase
        .from("symptoms")
        .select("*")

      if (diagnosesData) setDiagnoses(diagnosesData)
      if (diseasesData) setDiseases(diseasesData)
      if (symptomsData) setSymptoms(symptomsData)
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("Failed to fetch data")
    } finally {
      setIsLoading(false)
    }
  }, [supabase, sortBy, sortOrder]) // Add dependencies here

  useEffect(() => {
    fetchData()
  }, [fetchData]) // Only depend on fetchData

  const filteredDiagnoses = diagnoses.filter((diagnosis) => {
    const matchesSearch = 
      diagnosis.email?.toLowerCase().includes(search.toLowerCase()) ||
      diagnosis.disease_code.toLowerCase().includes(search.toLowerCase())
    
    const matchesDisease = diseaseFilter === "all" ? 
      true : diagnosis.disease_code === diseaseFilter

    return matchesSearch && matchesDisease
  })

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Add export filter function
  const getFilteredExportData = () => {
    return diagnoses.filter(diagnosis => {
      // Normalize dates to start and end of day
      const diagnosisDate = new Date(diagnosis.created_at)
      
      let start = null
      let end = null
      
      if (startDate) {
        start = new Date(startDate)
        start.setHours(0, 0, 0, 0)
      }
      
      if (endDate) {
        end = new Date(endDate)
        end.setHours(23, 59, 59, 999)
      }

      // Debug log untuk memeriksa tanggal
      console.log({
        diagnosisDate,
        start,
        end,
        isAfterStart: !start || diagnosisDate >= start,
        isBeforeEnd: !end || diagnosisDate <= end
      })
      
      const matchesDate = (!start || diagnosisDate >= start) && (!end || diagnosisDate <= end)
      const matchesEmail = !exportEmail || diagnosis.email?.toLowerCase().includes(exportEmail.toLowerCase())
      const matchesDisease = exportDisease === "all" || diagnosis.disease_code === exportDisease

      return matchesDate && matchesEmail && matchesDisease
    }).map((diagnosis) => {
      const disease = diseases.find(d => d.code === diagnosis.disease_code)
      const diagnosisSymptoms = symptoms
        .filter(s => diagnosis.symptoms.includes(s.code))
        .map(s => s.name)
        .join(", ")

      return {
        Email: diagnosis.email || "-",
        Disease: disease?.name || diagnosis.disease_code,
        Symptoms: diagnosisSymptoms,
        "Created At": formatDate(diagnosis.created_at)
      }
    })
  }

  // Update handleExport function
  const handleExport = (type: "excel" | "pdf") => {
    const exportData = getFilteredExportData()
    
    if (exportData.length === 0) {
      toast.error("No data matches the export filters")
      return
    }

    if (type === "excel") {
      exportToExcel(exportData, "diagnoses")
    } else {
      exportToPDF(exportData, "Diagnoses List")
    }
    setShowExportDialog(false)
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Diagnosis Records</h1>

      <div className="bg-white rounded-lg p-4 mb-4 flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by email or disease..."
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Select value={diseaseFilter} onValueChange={setDiseaseFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by disease" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Diseases</SelectItem>
              {diseases
                .sort((a, b) => a.code.localeCompare(b.code)) // Mengurutkan berdasarkan kode
                .map((disease) => (
                <SelectItem key={disease.code} value={disease.code}>
                  {disease.code} - {disease.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <button
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            {sortOrder === "asc" ? 
              <SortAscIcon className="w-4 h-4" /> : 
              <SortDescIcon className="w-4 h-4" />
            }
          </button>

          <Select 
            value={sortBy} 
            onValueChange={(value: "created_at" | "disease_code") => setSortBy(value)}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_at">Date</SelectItem>
              <SelectItem value="disease_code">Disease</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Add Dialog component */}
        <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <DownloadIcon className="w-4 h-4" />
              Export Data
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Export Data</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm">Start Date</label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm">End Date</label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm">Filter by Email</label>
                <Input
                  value={exportEmail}
                  onChange={(e) => setExportEmail(e.target.value)}
                  placeholder="Enter email..."
                />
              </div>

              <div>
                <label className="text-sm">Filter by Disease</label>
                <Select value={exportDisease} onValueChange={setExportDisease}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select disease" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Diseases</SelectItem>
                    {diseases.map((disease) => (
                      <SelectItem key={disease.code} value={disease.code}>
                        {disease.code} - {disease.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => handleExport("excel")}>
                  Export XLSX
                </Button>
                <Button variant="outline" onClick={() => handleExport("pdf")}>
                  Export PDF
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Disease</TableHead>
              <TableHead>Symptoms</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDiagnoses.map((diagnosis) => {
              const disease = diseases.find(d => d.code === diagnosis.disease_code)
              const diagnosisSymptoms = symptoms
                .filter(s => diagnosis.symptoms.includes(s.code))

              return (
                <TableRow key={diagnosis.id}>
                  <TableCell>
                    {formatDate(diagnosis.created_at)}
                  </TableCell>
                  <TableCell>{diagnosis.email || "-"}</TableCell>
                  <TableCell>
                    <Tooltip>
                      <TooltipTrigger>
                        <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-700/10">
                          {disease?.code || diagnosis.disease_code}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>{disease?.name}</TooltipContent>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {diagnosisSymptoms.map((symptom) => (
                        <Tooltip key={symptom.id}>
                          <TooltipTrigger>
                            <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                              {symptom.code}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>{symptom.name}</TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}