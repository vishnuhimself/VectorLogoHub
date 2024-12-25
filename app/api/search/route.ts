import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'
import type { LogoData } from '@/types/logo'

function calculateRelevance(logo: LogoData, query: string): number {
  const searchTerms = query.toLowerCase().split(' ')
  let score = 0

  // Clean the logo name
  const cleanName = logo.logo_alt
    .toLowerCase()
    .replace(/ logo vector$/, '')
    .replace(/ vector logo$/, '')
    .replace(/ logo$/, '')

  // Check title match
  if (cleanName === query.toLowerCase()) score += 10
  if (cleanName.startsWith(query.toLowerCase())) score += 5
  if (cleanName.includes(query.toLowerCase())) score += 3

  // Check individual terms
  searchTerms.forEach(term => {
    if (cleanName.includes(term)) score += 2
    if (logo.tags.some(tag => tag.toLowerCase().includes(term))) score += 1
  })

  return score
}

type LogoWithRelevance = LogoData & { relevance: number }

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')

  if (!query) {
    return NextResponse.json([])
  }

  try {
    const data = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'app/master_logo_details.json'), 'utf8')
    )

    const results = data
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
      .slice(0, 24) // Limit results

    return NextResponse.json(results)
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json([])
  }
} 