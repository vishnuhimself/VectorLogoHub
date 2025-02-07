'use client'

import { useEffect, useState } from 'react'
import { Paintbrush, Copy, Check } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'

interface Color {
  hex: string
  percentage: number
}

interface ColorPaletteProps {
  svgUrl: string
  logoName: string
}

interface GradientStop {
  color: string
  offset: number
}

export function ColorPalette({ svgUrl, logoName }: ColorPaletteProps) {
  const [colors, setColors] = useState<Color[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [copiedColor, setCopiedColor] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    async function extractColors() {
      try {
        const response = await fetch(svgUrl)
        const svgText = await response.text()
        const parser = new DOMParser()
        const svgDoc = parser.parseFromString(svgText, 'image/svg+xml')
        
        const colorMap = new Map<string, number>()
        const gradientMap = new Map<string, GradientStop[]>()

        // First pass: collect all gradients
        svgDoc.querySelectorAll('linearGradient, radialGradient').forEach(gradient => {
          const id = gradient.id
          const stops: GradientStop[] = []
          gradient.querySelectorAll('stop').forEach(stop => {
            const color = stop.getAttribute('stop-color')
            const offset = parseFloat(stop.getAttribute('offset') || '0')
            if (color) {
              stops.push({ color, offset: offset / 100 })
            }
          })
          if (stops.length > 0) {
            gradientMap.set(`url(#${id})`, stops)
          }
        })

        // Process CSS styles
        const styleElements = svgDoc.querySelectorAll('style')
        styleElements.forEach(style => {
          const cssText = style.textContent || ''
          // Match both simple fills and gradient references
          const colorRules = cssText.match(/\.([\w-]+)\s*{\s*fill\s*:\s*([^;}]+)[;}]/g) || []
          
          colorRules.forEach(rule => {
            const [, className, colorValue] = rule.match(/\.([\w-]+)\s*{\s*fill\s*:\s*([^;}]+)/) || []
            if (className && colorValue) {
              const elements = svgDoc.getElementsByClassName(className)
              const elementCount = elements.length

              if (colorValue.startsWith('url(#')) {
                // Handle gradient references in CSS
                const gradientStops = gradientMap.get(colorValue)
                if (gradientStops) {
                  gradientStops.forEach(stop => {
                    const normalizedColor = normalizeColor(stop.color)
                    const weight = elementCount * (stop.offset || 1)
                    colorMap.set(normalizedColor, (colorMap.get(normalizedColor) || 0) + weight)
                  })
                }
              } else if (colorValue !== 'none') {
                const normalizedColor = normalizeColor(colorValue)
                colorMap.set(normalizedColor, (colorMap.get(normalizedColor) || 0) + elementCount)
              }
            }
          })
        })

        // Process direct attributes
        const elements = svgDoc.querySelectorAll('*')
        elements.forEach(element => {
          // Check fill attribute
          const fill = element.getAttribute('fill')
          if (fill) {
            if (fill.startsWith('url(#')) {
              const gradientStops = gradientMap.get(fill)
              if (gradientStops) {
                gradientStops.forEach(stop => {
                  const normalizedColor = normalizeColor(stop.color)
                  colorMap.set(normalizedColor, (colorMap.get(normalizedColor) || 0) + 1)
                })
              }
            } else if (fill !== 'none') {
              const normalizedColor = normalizeColor(fill)
              // Calculate area weight based on element size
              const bbox = (element as SVGGraphicsElement).getBBox?.() || { width: 1, height: 1 }
              const weight = Math.max(1, (bbox.width * bbox.height) / 100)
              colorMap.set(normalizedColor, (colorMap.get(normalizedColor) || 0) + weight)
            }
          }

          // Check stroke attribute
          const stroke = element.getAttribute('stroke')
          if (stroke && stroke !== 'none') {
            const normalizedColor = normalizeColor(stroke)
            const strokeWidth = parseFloat(element.getAttribute('stroke-width') || '1')
            colorMap.set(normalizedColor, (colorMap.get(normalizedColor) || 0) + strokeWidth)
          }
        })

        // Calculate percentages with improved accuracy
        const total = Array.from(colorMap.values()).reduce((a, b) => a + b, 0)
        const colorArray = Array.from(colorMap.entries())
          .map(([hex, count]) => ({
            hex,
            percentage: Math.round((count / total) * 100)
          }))
          .filter(color => color.percentage > 0) // Remove colors with 0%
          .sort((a, b) => b.percentage - a.percentage)
          .slice(0, 5)

        // Normalize percentages to ensure they sum to 100%
        const percentageSum = colorArray.reduce((sum, color) => sum + color.percentage, 0)
        if (percentageSum < 100 && colorArray.length > 0) {
          const diff = 100 - percentageSum
          colorArray[0].percentage += diff
        }

        setColors(colorArray)
      } catch (error) {
        console.error('Error extracting colors:', error)
      } finally {
        setIsLoading(false)
      }
    }

    extractColors()
  }, [svgUrl])

  const handleCopyColor = async (hex: string) => {
    try {
      await navigator.clipboard.writeText(hex.toUpperCase())
      setCopiedColor(hex)
      toast({
        title: "Color copied!",
        description: `${hex.toUpperCase()} has been copied to clipboard.`,
      })
      setTimeout(() => setCopiedColor(null), 2000)
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="animate-pulse bg-secondary h-32 rounded-lg" />
    )
  }

  if (colors.length === 0) {
    return null
  }

  return (
    <div className="bg-white border rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-start">
        <Paintbrush className="mr-2 h-5 w-5 mt-2" />
        {logoName} Logo Color Palette
      </h2>
      <div className="space-y-3">
        {colors.map((color) => (
          <div key={color.hex} className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-md border cursor-pointer hover:ring-2 ring-offset-2 transition-all"
              style={{ backgroundColor: color.hex }}
              onClick={() => handleCopyColor(color.hex)}
              title="Click to copy color"
            />
            <div className="flex-grow">
              <div className="font-medium flex items-center gap-2">
                <span>{color.hex.toUpperCase()}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => handleCopyColor(color.hex)}
                >
                  {copiedColor === color.hex ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div className="text-sm text-muted-foreground">
                {color.percentage}% usage
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function normalizeColor(color: string): string {
  try {
    // Handle named colors
    if (!/[#rgb(]/.test(color)) {
      const temp = document.createElement('div')
      temp.style.color = color
      document.body.appendChild(temp)
      const computed = getComputedStyle(temp).color
      document.body.removeChild(temp)
      color = computed
    }

    // Handle rgb/rgba
    if (color.startsWith('rgb')) {
      const values = color.match(/\d+/g)
      if (values && values.length >= 3) {
        const [r, g, b] = values.map(Number)
        return rgbToHex(r, g, b)
      }
    }

    // Handle hex
    if (color.startsWith('#')) {
      // Expand 3-digit hex
      if (color.length === 4) {
        return `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`.toLowerCase()
      }
      return color.toLowerCase()
    }

    return color.toLowerCase()
  } catch (error) {
    console.error('Color normalization error:', error)
    return '#000000'
  }
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b]
    .map(x => Math.round(x).toString(16).padStart(2, '0'))
    .join('')
} 