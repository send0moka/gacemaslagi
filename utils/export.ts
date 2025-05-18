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
  const pageHeight = doc.internal.pageSize.height
  
  // Add title
  doc.setFontSize(16)
  doc.text('Diseases List', 14, 15)

  let currentY = 25

  for (const disease of diseases) {
    // Check if we need a new page at the start of each disease
    if (currentY > pageHeight - 20) {
      doc.addPage()
      currentY = 20
    }

    // Add disease header
    doc.setFontSize(10)
    doc.setFont(undefined, 'bold')
    doc.text(`${disease.code} - ${disease.name}`, 15, currentY)
    currentY += 10

    // Add about section
    doc.setFontSize(8)
    doc.setFont(undefined, 'normal')
    doc.text('About:', 15, currentY)
    const aboutLines = doc.splitTextToSize(disease.about, 180)
    doc.text(aboutLines, 15, currentY + 5)
    currentY += aboutLines.length * 5 + 10

    // Handle images
    if (disease.solution.image) {
      const images = disease.solution.image.split('|')
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

    // Add solution description
    doc.setFontSize(8)
    doc.setFont(undefined, 'bold')
    doc.text('Solution:', 15, currentY)
    doc.setFont(undefined, 'normal')
    const descLines = doc.splitTextToSize(disease.solution.desc, 180)
    doc.text(descLines, 15, currentY + 5)
    currentY += descLines.length * 5 + 10

    // Add steps section if present
    if (disease.solution.list) {
      doc.setFont(undefined, 'bold')
      doc.text('Steps:', 15, currentY)
      currentY += 5
      doc.setFont(undefined, 'normal')
      const listItems = disease.solution.list.split('|')
      for (const item of listItems) {
        const itemLines = doc.splitTextToSize(`• ${item}`, 175)
        doc.text(itemLines, 20, currentY) // Indented
        currentY += itemLines.length * 5 + 2
      }
      currentY += 5
    }

    // Add references section if present
    if (disease.solution.link) {
      doc.setFont(undefined, 'bold')
      doc.text('References:', 15, currentY)
      currentY += 5
      doc.setFont(undefined, 'normal')
      doc.setTextColor(0, 0, 255)
      const links = disease.solution.link.split('|')
      for (const link of links) {
        const linkLines = doc.splitTextToSize(link, 175)
        doc.text(linkLines, 20, currentY) // Indented
        currentY += linkLines.length * 5 + 2
      }
      doc.setTextColor(0, 0, 0)
      currentY += 5
    }

    // Before starting symptoms section, check remaining space
    // We estimate needing at least 15 units per symptom plus 20 for the rule
    const estimatedSpaceNeeded = (disease.symptoms.length * 15) + 20

    if (currentY + estimatedSpaceNeeded > pageHeight - 20) {
      doc.addPage()
      currentY = 20
    }

    // Add symptoms as a list
    doc.setFont(undefined, 'bold')
    doc.text('Symptoms:', 15, currentY)
    currentY += 7
    doc.setFont(undefined, 'normal')

    // Format symptoms with proper indentation
    const diseaseSymptoms = disease.symptoms
      .map(id => {
        const symptom = symptoms.find(s => s.id === id)
        return symptom ? `• ${symptom.code} - ${symptom.name}` : ''
      })
      .filter(Boolean)

    for (const symptom of diseaseSymptoms) {
      const symptomLines = doc.splitTextToSize(symptom, 170) // Reduced width for better readability
      
      // Check if we need a new page for this symptom
      if (currentY + (symptomLines.length * 5) > pageHeight - 20) {
        doc.addPage()
        currentY = 20
      }
      
      doc.text(symptomLines, 20, currentY)
      currentY += symptomLines.length * 5 + 3
    }
    currentY += 7

    // Check if we need a new page for the rule
    if (currentY > pageHeight - 30) {
      doc.addPage()
      currentY = 20
    }

    // Add rule with proper spacing
    doc.setFont(undefined, 'bold')
    doc.text('Rule:', 15, currentY)
    doc.setFont(undefined, 'normal')
    currentY += 7

    const symptomCodes = disease.symptoms
      .map(id => symptoms.find(s => s.id === id)?.code)
      .filter(Boolean)
      .join(' AND ')
    const rule = `IF ${disease.code} THEN ${symptomCodes}`
    const ruleLines = doc.splitTextToSize(rule, 170)
    doc.text(ruleLines, 20, currentY)
    currentY += ruleLines.length * 5 + 20

    // Add extra page break between diseases
    if (currentY > pageHeight - 150 && diseases.indexOf(disease) !== diseases.length - 1) {
      doc.addPage()
      currentY = 20
    }
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