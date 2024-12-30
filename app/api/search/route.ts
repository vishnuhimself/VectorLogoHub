import { NextRequest, NextResponse } from 'next/server'
import { searchLogos } from '@/lib/db'

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')

  if (!query) {
    return NextResponse.json([])
  }

  try {
    const results = await searchLogos(query)
    return NextResponse.json(results)
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json([])
  }
} 