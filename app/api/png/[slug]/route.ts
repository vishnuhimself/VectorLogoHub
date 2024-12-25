import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'
import sharp from 'sharp'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
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

    // Fetch SVG
    const response = await fetch(logoUrl)
    const svgBuffer = await response.arrayBuffer()

    // Convert SVG to PNG using sharp
    const pngBuffer = await sharp(Buffer.from(svgBuffer))
      .resize(1024, 1024, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .png()
      .toBuffer()

    return new NextResponse(pngBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="${params.slug}.png"`,
      },
    })
  } catch (error) {
    console.error('PNG conversion error:', error)
    return new NextResponse('Error processing download', { status: 500 })
  }
} 