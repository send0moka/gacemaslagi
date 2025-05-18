import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { Disease, Symptom } from '@/utils/types'

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

export const exportDiseaseToPDF = async (
  diseases: Disease[], 
  symptoms: Symptom[]
) => {
  const doc = new jsPDF()

  // Add title
  doc.setFontSize(16)
  doc.text('Diseases List', 14, 15)

  let currentY = 25 // Track vertical position

  for (const disease of diseases) {
    // Get symptom names
    const diseaseSymptoms = disease.symptoms
      .map(id => {
        const symptom = symptoms.find(s => s.id === id)
        return symptom ? `${symptom.code} - ${symptom.name}` : ''
      })
      .filter(Boolean)
      .join(', ')

    const solution = typeof disease.solution === 'string' 
      ? JSON.parse(disease.solution) 
      : disease.solution

    // Start new page if less than 100 units of space left
    if (currentY > doc.internal.pageSize.height - 100) {
      doc.addPage()
      currentY = 20
    }

    // Add disease header
    doc.setFontSize(10)
    doc.setFont(undefined, 'bold')
    doc.text(`${disease.code} - ${disease.name}`, 15, currentY)
    currentY += 10

    // Handle images
    if (solution.image) {
      const images = solution.image.split('|')
      const imagesPerRow = 2
      const imageWidth = 80
      const imageHeight = 60
      
      for (let i = 0; i < images.length; i++) {
        // Check if need new page
        if (currentY > doc.internal.pageSize.height - imageHeight - 20) {
          doc.addPage()
          currentY = 20
        }

        const xPos = 15 + (i % imagesPerRow) * (imageWidth + 10)
        try {
          // For base64 images, we can use them directly
          if (images[i].startsWith('data:image')) {
            doc.addImage(images[i], 'JPEG', xPos, currentY, imageWidth, imageHeight)
          }
        } catch (error) {
          console.error('Error adding image:', error)
        }

        // Move to next row if needed
        if ((i + 1) % imagesPerRow === 0) {
          currentY += imageHeight + 10
        }
      }
      // Ensure we move past the last row of images
      if (images.length % imagesPerRow !== 0) {
        currentY += imageHeight + 10
      }
    }

    // Add description
    doc.setFontSize(8)
    doc.setFont(undefined, 'normal')
    const descLines = doc.splitTextToSize(solution.desc, 180)
    doc.text(descLines, 15, currentY)
    currentY += descLines.length * 5 + 5

    // Add list items if present
    if (solution.list) {
      const listItems = solution.list.split('|')
      for (const item of listItems) {
        const itemLines = doc.splitTextToSize(`• ${item}`, 180)
        doc.text(itemLines, 15, currentY)
        currentY += itemLines.length * 5 + 2
      }
      currentY += 3
    }

    // Add links if present
    if (solution.link) {
      const links = solution.link.split('|')
      doc.setTextColor(0, 0, 255) // Blue color for links
      for (const link of links) {
        const linkLines = doc.splitTextToSize(link, 180)
        doc.text(linkLines, 15, currentY)
        currentY += linkLines.length * 5 + 2
      }
      doc.setTextColor(0, 0, 0) // Reset to black
      currentY += 3
    }

    // Add symptoms
    doc.setFont(undefined, 'bold')
    doc.text('Symptoms:', 15, currentY)
    doc.setFont(undefined, 'normal')
    const symptomsLines = doc.splitTextToSize(diseaseSymptoms, 180)
    doc.text(symptomsLines, 15, currentY + 5)
    currentY += symptomsLines.length * 5 + 15

    // Add rules
    doc.setFont(undefined, 'bold')
    doc.text('Rule:', 15, currentY)
    doc.setFont(undefined, 'normal')
    const symptomCodes = disease.symptoms
      .map(id => symptoms.find(s => s.id === id)?.code)
      .filter(Boolean)
      .join(' AND ')
    const rule = `IF ${disease.code} THEN ${symptomCodes}`
    const ruleLines = doc.splitTextToSize(rule, 180)
    doc.text(ruleLines, 15, currentY + 5)
    currentY += ruleLines.length * 5 + 15
  }

  doc.save('diseases.pdf')
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