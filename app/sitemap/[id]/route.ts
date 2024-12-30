import { supabase } from '@/lib/supabase'

const BASE_URL = 'https://vectorlogohub.com'
const URLS_PER_SITEMAP = 20000

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('Sitemap request params:', params)
    const sitemapId = parseInt(params.id.replace('sitemap-', '').replace('.xml', ''))
    console.log('Parsed sitemapId:', sitemapId)

    if (isNaN(sitemapId)) {
      console.error('Invalid sitemap ID:', params.id)
      return new Response('Invalid sitemap ID', { status: 400 })
    }

    // Get both logo and tag counts
    const [{ count: logoCount }, { count: tagCount }] = await Promise.all([
      supabase.from('logos').select('*', { count: 'exact', head: true }),
      supabase.from('tags').select('*', { count: 'exact', head: true })
    ])

    const totalUrls = (logoCount || 0) + (tagCount || 0)
    const totalSitemaps = Math.ceil(totalUrls / URLS_PER_SITEMAP)

    if (sitemapId >= totalSitemaps) {
      console.error('Sitemap ID out of range:', { sitemapId, totalSitemaps })
      return new Response('Sitemap not found', { status: 404 })
    }

    // Calculate logo range considering tags in first sitemap
    const tagsInFirstSitemap = sitemapId === 0 ? (tagCount || 0) : 0
    const logoStart = Math.max(0, (sitemapId * URLS_PER_SITEMAP) - (tagCount || 0))
    const logoEnd = Math.min(
      (logoCount || 0) - 1,
      logoStart + URLS_PER_SITEMAP - (tagsInFirstSitemap)
    )

    console.log('Range calculations:', {
      sitemapId,
      logoStart,
      logoEnd,
      tagsInFirstSitemap,
      totalUrls,
      totalSitemaps
    })

    // Get paginated logos
    const { data: logos, error } = await supabase
      .from('logos')
      .select('url_path, created_at')
      .range(logoStart, logoEnd)
      .order('url_path')

    // Get tags if this is the first sitemap
    let tags: { name: string }[] = []
    if (sitemapId === 0) {
      const { data: tagData } = await supabase
        .from('tags')
        .select('name')
        .order('name')
      
      tags = tagData || []
    }

    console.log('Query result:', { 
      logoCount: logos?.length, 
      tagCount: tags.length,
      error
    })

    if (error) {
      console.error('Supabase error:', error)
      return new Response('Database error', { status: 500 })
    }

    if (!logos?.length && !tags.length) {
      console.error('No content found for sitemap:', sitemapId)
      return new Response('Sitemap not found', { status: 404 })
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
              xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
              xmlns:xhtml="http://www.w3.org/1999/xhtml"
              xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
              xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
        ${sitemapId === 0 ? tags.map(tag => `
          <url>
            <loc>${BASE_URL}/tag/${encodeURIComponent(tag.name.replace(/ /g, '-'))}</loc>
            <changefreq>daily</changefreq>
            <priority>0.8</priority>
          </url>
        `).join('') : ''}
        ${logos.map(logo => `
          <url>
            <loc>${BASE_URL}${logo.url_path}</loc>
            <lastmod>${new Date(logo.created_at || Date.now()).toISOString()}</lastmod>
            <changefreq>weekly</changefreq>
            <priority>0.7</priority>
          </url>
        `).join('')}
      </urlset>`.trim()

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=43200'
      }
    })
  } catch (error) {
    console.error('Error in GET function:', error)
    return new Response('Internal server error', { status: 500 })
  }
} 