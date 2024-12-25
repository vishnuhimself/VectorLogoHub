import { NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'
import type { LogoData } from '@/types/logo'

const URLS_PER_SITEMAP = 20000
const BASE_URL = 'https://vectorlogohub.com'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const sitemapId = parseInt(params.id.replace('sitemap-', '').replace('.xml', ''))
  if (isNaN(sitemapId)) {
    return new Response('Invalid sitemap ID', { status: 400 })
  }
  
  const data = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'app/master_logo_details.json'), 'utf8')
  )

  const urls: string[] = []

  // Static pages
  urls.push('/')
  urls.push('/privacy')
  urls.push('/terms')
  urls.push('/contact')

  // Alphabet pages
  Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ').forEach(letter => {
    urls.push(`/alphabet/${letter}`)
  })

  // Logo pages
  data.forEach((logo: LogoData) => {
    urls.push(logo.metadata.url_path)
  })

  // Tag pages
  const uniqueTags = new Set<string>(data.flatMap((logo: LogoData) => logo.tags as string[]))
  Array.from<string>(uniqueTags).forEach((tag: string) => {
    urls.push(`/tag/${encodeURIComponent(tag)}`)
  })

  const startIndex = (sitemapId - 1) * URLS_PER_SITEMAP
  const chunk = urls.slice(startIndex, startIndex + URLS_PER_SITEMAP)
  
  if (!chunk.length) {
    return new Response('Sitemap not found', { status: 404 })
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${chunk.map(url => `
        <url>
          <loc>${BASE_URL}${url}</loc>
          <lastmod>${new Date().toISOString()}</lastmod>
          <changefreq>weekly</changefreq>
          <priority>0.7</priority>
        </url>
      `).join('')}
    </urlset>`.trim()

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
} 