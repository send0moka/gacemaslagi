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
): Promise<void> => {
  const doc = new jsPDF()
  const pageHeight = doc.internal.pageSize.height
  
  doc.setFontSize(16)
  doc.text('Diseases List', 14, 15)

  let currentY = 25

  try {
    for (const disease of diseases) {
      if (currentY > pageHeight - 20) {
        doc.addPage()
        currentY = 20
      }

      // Disease header
      doc.setFontSize(10)
      doc.setFont(undefined, 'bold')
      doc.text(`${disease.code} - ${disease.name}`, 15, currentY)
      currentY += 10

      // About section
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
          if (currentY > pageHeight - imageHeight - 20) {
            doc.addPage()
            currentY = 20
          }

          const xPos = 15 + (i % imagesPerRow) * (imageWidth + 10)

          try {
            // Wait for image to load
            const response = await fetch(images[i])
            const blob = await response.blob()
            
            // Convert to base64
            const base64 = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader()
              reader.onload = () => resolve(reader.result as string)
              reader.onerror = reject
              reader.readAsDataURL(blob)
            })

            // Add image to PDF
            await new Promise<void>((resolve, reject) => {
              const img = new Image()
              img.src = base64
              img.onload = () => {
                doc.addImage(img, 'JPEG', xPos, currentY, imageWidth, imageHeight)
                resolve()
              }
              img.onerror = reject
            })

          } catch (error) {
            console.error('Error loading image:', error)
            doc.setFontSize(8)
            doc.text('Image loading failed', xPos, currentY + 30)
          }

          if ((i + 1) % imagesPerRow === 0) {
            currentY += imageHeight + 10
          }
        }

        if (images.length % imagesPerRow !== 0) {
          currentY += imageHeight + 10
        }
      }

      // Solution description
      doc.setFontSize(8)
      doc.setFont(undefined, 'bold')
      doc.text('Solution:', 15, currentY)
      doc.setFont(undefined, 'normal')
      const descLines = doc.splitTextToSize(disease.solution.desc, 180)
      doc.text(descLines, 15, currentY + 5)
      currentY += descLines.length * 5 + 10

      // Add solution steps if present
      if (disease.solution.list) {
        doc.setFont(undefined, 'bold')
        doc.text('Steps:', 15, currentY)
        currentY += 5
        doc.setFont(undefined, 'normal')
        const listItems = disease.solution.list.split('|')
        for (const item of listItems) {
          const itemLines = doc.splitTextToSize(`• ${item}`, 175)
          doc.text(itemLines, 20, currentY)
          currentY += itemLines.length * 5 + 2
        }
        currentY += 5
      }

      // Add symptoms section
      if (disease.symptoms.length > 0) {
        if (currentY > pageHeight - 40) {
          doc.addPage()
          currentY = 20
        }

        doc.setFont(undefined, 'bold')
        doc.text('Symptoms:', 15, currentY)
        currentY += 7
        doc.setFont(undefined, 'normal')

        disease.symptoms.forEach(symptomId => {
          const symptom = symptoms.find(s => s.id === symptomId)
          if (symptom) {
            const symptomText = `• ${symptom.code} - ${symptom.name}`
            const symptomLines = doc.splitTextToSize(symptomText, 170)
            
            if (currentY + (symptomLines.length * 5) > pageHeight - 20) {
              doc.addPage()
              currentY = 20
            }
            
            doc.text(symptomLines, 20, currentY)
            currentY += symptomLines.length * 5 + 3
          }
        })
      }

      currentY += 20
    }

    // Generate and download PDF
    const pdfBlob = doc.output('blob')
    const url = window.URL.createObjectURL(pdfBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'diseases.pdf'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

  } catch (error) {
    console.error('Error generating PDF:', error)
    throw error
  }
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