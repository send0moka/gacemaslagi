import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface ExportData {
  [key: string]: string | number | boolean | null
}

export const exportToExcel = (data: ExportData[], fileName: string) => {
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
  XLSX.writeFile(wb, `${fileName}.xlsx`)
}

export const exportToPDF = (data: ExportData[], fileName: string) => {
  const doc = new jsPDF()

  const headers = Object.keys(data[0])
  const rows = data.map(item => Object.values(item))

  // Add title
  doc.setFontSize(16)
  doc.text(fileName.charAt(0).toUpperCase() + fileName.slice(1), 14, 15)

  // Add table
  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: 25,
    theme: 'grid',
    styles: { fontSize: 8 },
    headStyles: { 
      fillColor: [41, 128, 185],
      textColor: 255,
      fontSize: 8,
      fontStyle: 'bold'
    },
    margin: { top: 25 }
  })

  doc.save(`${fileName}.pdf`)
}

export const parseCSV = async (file: File): Promise<ExportData[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      const csv = event.target?.result
      if (typeof csv === 'string') {
        const lines = csv.split('\n')
        const headers = lines[0].split(',').map(h => h.trim())
        const data = lines.slice(1)
          .filter(line => line.trim()) // Remove empty lines
          .map(line => {
            const values = line.split(',').map(v => v.trim())
            return headers.reduce((obj, header, i) => {
              obj[header.toLowerCase()] = values[i]
              return obj
            }, {} as ExportData)
          })
        resolve(data)
      }
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}