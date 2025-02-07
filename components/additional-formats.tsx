'use client'

import { useState } from 'react'
import { FileIcon, Download, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { jsPDF } from 'jspdf'
import 'jspdf/dist/jspdf.umd.min'
import 'svg2pdf.js'

interface AdditionalFormatsProps {
  svgUrl: string
  logoName: string
}

export function AdditionalFormats({ svgUrl, logoName }: AdditionalFormatsProps) {
  const [isConverting, setIsConverting] = useState<string | null>(null)

  const handleWebPDownload = async () => {
    try {
      setIsConverting('webp')
      
      // Fetch SVG content
      const response = await fetch(svgUrl)
      const svgBlob = await response.blob()
      
      // Create an image from SVG
      const img = new Image()
      const url = URL.createObjectURL(svgBlob)
      
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
        img.src = url
      })

      // Create canvas and draw image
      const canvas = document.createElement('canvas')
      canvas.width = img.width || 1024
      canvas.height = img.height || 1024
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Could not get canvas context')
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      
      // Convert to WebP
      const webpBlob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob!)
        }, 'image/webp', 0.9)
      })

      // Download
      const downloadUrl = URL.createObjectURL(webpBlob)
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = `${logoName.toLowerCase().replace(/ /g, '-')}.webp`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(downloadUrl)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error converting to WebP:', error)
    } finally {
      setIsConverting(null)
    }
  }

  const handlePDFDownload = async () => {
    try {
      setIsConverting('pdf')
      
      // Fetch SVG content
      const response = await fetch(svgUrl)
      const svgText = await response.text()
      
      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })

      // Parse SVG string to DOM element
      const parser = new DOMParser()
      const svgElement = parser.parseFromString(svgText, 'image/svg+xml').documentElement

      // Calculate dimensions
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const margin = 20
      const svgWidth = pageWidth - (margin * 2)
      const svgHeight = svgWidth // Keep aspect ratio square

      // Add SVG centered on page
      await pdf.svg(svgElement, {
        x: margin,
        y: (pageHeight - svgHeight) / 2, // Center vertically
        width: svgWidth,
        height: svgHeight
      })

      // Download
      pdf.save(`${logoName.toLowerCase().replace(/ /g, '-')}.pdf`)
    } catch (error) {
      console.error('Error converting to PDF:', error)
    } finally {
      setIsConverting(null)
    }
  }

  return (
    <div className="bg-white border rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <FileIcon className="mr-2 h-5 w-5" />
        Additional Formats
      </h2>
      <div className="space-y-3">
        <Button 
          variant="outline" 
          className="w-full justify-start"
          onClick={handleWebPDownload}
          disabled={!!isConverting}
        >
          {isConverting === 'webp' ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          Download WebP
        </Button>

        <Button 
          variant="outline" 
          className="w-full justify-start"
          onClick={handlePDFDownload}
          disabled={!!isConverting}
        >
          {isConverting === 'pdf' ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          Download PDF
        </Button>
      </div>
    </div>
  )
} 