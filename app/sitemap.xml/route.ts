import { supabase } from '@/lib/supabase'

const BASE_URL = 'https://vectorlogohub.com'
const URLS_PER_SITEMAP = 20000

export async function GET() {
  try {
    console.log('Generating sitemap index')
    
    // Get both logo and tag counts
    const [{ count: logoCount }, { count: tagCount }] = await Promise.all([
      supabase.from('logos').select('*', { count: 'exact', head: true }),
      supabase.from('tags').select('*', { count: 'exact', head: true })
    ])

    console.log('Total counts:', { logoCount, tagCount })

    if (!logoCount) {
      console.error('No logos found')
      return new Response('No content', { status: 404 })
    }

    // Calculate total URLs and required sitemaps
    const totalUrls = (logoCount || 0) + (tagCount || 0)
    const totalSitemaps = Math.ceil(totalUrls / URLS_PER_SITEMAP)
    
    console.log('Sitemap calculations:', {
      totalUrls,
      totalSitemaps,
      urlsPerSitemap: URLS_PER_SITEMAP
    })

    const sitemaps = Array.from({ length: totalSitemaps }, (_, i) => ({
      url: `${BASE_URL}/sitemap/sitemap-${i}.xml`,
      lastmod: new Date().toISOString()
    }))

    console.log('Generated sitemap URLs:', sitemaps.map(s => s.url))

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
      <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        ${sitemaps.map(sitemap => `
          <sitemap>
            <loc>${sitemap.url}</loc>
          </sitemap>
        `).join('')}
      </sitemapindex>`.trim()

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=43200'
      }
    })
  } catch (error) {
    console.error('Sitemap index generation error:', error)
    return new Response('Internal server error', { status: 500 })
  }
} 