import Search from '@/components/search'
import LogoGrid from '@/components/logo-grid'
import path from 'path'
import fs from 'fs'
import type { LogoData } from '@/types/logo'
import { Metadata } from 'next'

type LogoWithRelevance = LogoData & { relevance: number }

function calculateRelevance(logo: LogoData, query: string): number {
  const searchTerms = query.toLowerCase().split(' ')
  let score = 0

  // Clean the logo name
  const cleanName = logo.logo_alt
    .toLowerCase()
    .replace(/ logo vector$/, '')
    .replace(/ vector logo$/, '')
    .replace(/ logo$/, '')

  // Exact match gets highest score
  if (cleanName === query.toLowerCase()) score += 10
  // Starting with query gets high score
  if (cleanName.startsWith(query.toLowerCase())) score += 5
  // Contains query gets medium score
  if (cleanName.includes(query.toLowerCase())) score += 3

  // Check individual terms
  searchTerms.forEach(term => {
    if (cleanName.includes(term)) score += 2
    if (logo.tags.some(tag => tag.toLowerCase().includes(term))) score += 1
  })

  return score
}

async function searchLogos(query: string) {
  try {
    const data = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'app/master_logo_details.json'), 'utf8')
    )

    return data
      .map((logo: LogoData) => ({
        ...logo,
        relevance: calculateRelevance(logo, query),
        logo_url: logo.logo_url.replace(
          'cdn.worldvectorlogo.com/logos',
          'cdn.vectorlogohub.com'
        )
      }))
      .filter((logo: LogoWithRelevance) => logo.relevance > 0)
      .sort((a: LogoWithRelevance, b: LogoWithRelevance) => b.relevance - a.relevance)
      .slice(0, 24)

  } catch (error) {
    console.error('Search error:', error)
    return []
  }
}

export default async function SearchPage({
  searchParams
}: {
  searchParams: { q?: string }
}) {
  const query = searchParams.q
  const results = query ? await searchLogos(query) : []

  return (
    <div>
      <Search />
      
      {query && (
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">
            {results.length} results for "{query}"
          </h1>
          <LogoGrid logos={results} />
        </div>
      )}
    </div>
  )
}

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: null,
  },
}

export const dynamic = 'force-dynamic' 