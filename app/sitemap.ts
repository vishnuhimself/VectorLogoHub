import { MetadataRoute } from 'next'
import path from 'path'
import fs from 'fs'
import type { LogoData } from '@/types/logo'

const URLS_PER_SITEMAP = 20000
const BASE_URL = 'https://vectorlogohub.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const data = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'app/master_logo_details.json'), 'utf8')
  )

  // Collect all URLs
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

  // Split URLs into chunks of URLS_PER_SITEMAP
  const chunks = []
  for (let i = 0; i < urls.length; i += URLS_PER_SITEMAP) {
    chunks.push(urls.slice(i, i + URLS_PER_SITEMAP))
  }

  // Generate sitemap index
  return chunks.map((chunk, index) => ({
    url: `${BASE_URL}/sitemaps/sitemap-${index + 1}.xml`,
    lastModified: new Date(),
  }))
} 