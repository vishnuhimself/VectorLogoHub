import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'
import sharp from 'sharp'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const searchParams = request.nextUrl.searchParams
  const format = searchParams.get('format')
  const size = searchParams.get('size')

  try {
    const data = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'app/master_logo_details.json'), 'utf8')
    )
    
    const logo = data.find((item: any) => 
      item.metadata.url_path === `/logo/${params.slug}`
    )
    
    if (!logo) {
      return new NextResponse('Logo not found', { status: 404 })
    }

    const logoUrl = logo.logo_url.replace(
      'cdn.worldvectorlogo.com/logos',
      'cdn.vectorlogohub.com'
    )

    const response = await fetch(logoUrl)
    const svgBuffer = await response.arrayBuffer()

    if (format === 'png') {
      const pngSize = size ? parseInt(size) : 512
      
      const pngBuffer = await sharp(Buffer.from(svgBuffer))
        .resize(pngSize, pngSize, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png()
        .toBuffer()

      return new NextResponse(pngBuffer, {
        headers: {
          'Content-Type': 'image/png',
          'Content-Disposition': `attachment; filename="${params.slug}-${pngSize}x${pngSize}.png"`,
        },
      })
    }

    return new NextResponse(Buffer.from(svgBuffer), {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Content-Disposition': `attachment; filename="${params.slug}.svg"`,
      },
    })
  } catch (error) {
    console.error('Download error:', error)
    return new NextResponse('Error processing download', { status: 500 })
  }
} 