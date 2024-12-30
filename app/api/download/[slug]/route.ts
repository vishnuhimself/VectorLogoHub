import { NextResponse } from 'next/server'
import { getLogoBySlug } from '@/lib/db'
import sharp from 'sharp'

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'svg'
    const sizeParam = searchParams.get('size')
    
    console.log('Request params:', { 
      format, 
      sizeParam, 
      url: request.url,
      searchParams: Object.fromEntries(searchParams.entries())
    })

    const logo = await getLogoBySlug(params.slug)
    if (!logo) {
      return new Response('Logo not found', { status: 404 })
    }

    // Fetch the SVG from CDN
    const response = await fetch(logo.logo_url)
    if (!response.ok) {
      throw new Error('Failed to fetch logo from CDN')
    }
    const svgBuffer = await response.arrayBuffer()

    if (format === 'png') {
      // Convert SVG to PNG with specified size
      let pngSize: number
      
      // First try to parse the size as a number
      const parsedSize = parseInt(sizeParam || '')
      if (!isNaN(parsedSize)) {
        pngSize = parsedSize
      } else {
        // Fall back to predefined sizes if not a number
        switch (sizeParam) {
          case 'small':
            pngSize = 128
            break
          case 'medium':
            pngSize = 256
            break
          case 'large':
          default:
            pngSize = 512
            break
        }
      }

      // Cap the maximum size at 1024px
      pngSize = Math.min(Math.max(pngSize, 32), 1024)

      console.log('PNG conversion:', { 
        sizeParam,
        pngSize,
        requestUrl: request.url 
      })

      const pngBuffer = await sharp(Buffer.from(svgBuffer))
        .resize(pngSize, pngSize, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png()
        .toBuffer()

      return new Response(pngBuffer, {
        headers: {
          'Content-Type': 'image/png',
          'Content-Disposition': `attachment; filename="${params.slug}-${pngSize}.png"`,
          'Cache-Control': 'public, max-age=31536000',
        },
      })
    }

    // Handle SVG download
    return new Response(Buffer.from(svgBuffer), {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Content-Disposition': `attachment; filename="${params.slug}.svg"`,
        'Cache-Control': 'public, max-age=31536000',
      },
    })

  } catch (error) {
    console.error('Download error:', error)
    return new Response('Internal server error', { status: 500 })
  }
} 