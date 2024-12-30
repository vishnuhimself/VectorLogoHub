import { supabase } from '@/lib/supabase'
import type { LogoData } from '@/types/logo'
import { getCachedLogo, setCachedLogo } from '@/lib/cache'

// Helper function for data transformation
function transformLogoData(logos: any[]): LogoData[] {
  return logos.map(logo => ({
    url: `https://vectorlogohub.com${logo.url_path}`,
    title: logo.title,
    logo_url: logo.logo_url,
    logo_alt: logo.logo_alt,
    tags: logo.tags?.map((t: any) => t.tag?.name).filter(Boolean) || [],
    metadata: {
      url_path: logo.url_path
    }
  }))
}

// Helper function to generate deterministic random numbers based on a seed
function seededRandom(seed: string) {
  let hashValue = seed.split('').reduce((a, b) => {
    return ((a << 5) - a) + b.charCodeAt(0);
  }, 0);
  
  return () => {
    hashValue = (hashValue * 9301 + 49297) % 233280;
    return hashValue / 233280;
  };
}

// Get random logos with seed for consistency per page
export async function getRandomLogos(
  limit: number = 6, 
  excludePath?: string,
  seed: string = 'default'
) {
  const { data: logos, error } = await supabase
    .rpc('get_random_logos', { 
      exclude_path: excludePath || '',
      limit_val: limit
    })

  if (error) {
    console.error('Error fetching random logos:', error)
    return []
  }

  return transformLogoData(logos || [])
}

export async function getLogos(page: number = 1, limit: number = 20) {
  const start = (page - 1) * limit
  const end = start + limit - 1

  const { data: logos, error, count } = await supabase
    .from('logos')
    .select(`
      *,
      tags:logo_tags(
        tag:tags(name)
      )
    `, { count: 'exact' })
    .range(start, end)
    .order('title')

  if (error) throw error

  return {
    logos: transformLogoData(logos),
    total: count || 0
  }
}

export async function getLogoBySlug(slug: string): Promise<LogoData | null> {
  try {
    // Try Redis cache first
    const cached = await getCachedLogo(slug)
    if (cached) return cached

    // If not in cache, query database
    const { data: logo, error } = await supabase
      .from('logos')
      .select(`
        *,
        tags:logo_tags(
          tag:tags(name)
        )
      `)
      .eq('url_path', `/logo/${slug}`)
      .single()

    if (error) return null

    const transformed = transformLogoData([logo])[0]
    
    // Cache the result
    await setCachedLogo(slug, transformed)
    
    return transformed
  } catch (error) {
    console.error('Error fetching logo:', error)
    return null
  }
}

export async function getRelatedLogosBySlug(slug: string, limit: number = 6): Promise<LogoData[]> {
  try {
    // First get the current logo with its tags
    const { data: currentLogo } = await supabase
      .from('logos')
      .select(`
        id,
        tags:logo_tags(
          position,
          tag:tags(name)
        )
      `)
      .eq('url_path', `/logo/${slug}`)
      .single();

    if (!currentLogo) return [];

    // If no tags, return random logos with a different seed
    if (!currentLogo.tags?.length) {
      console.log('No tags found, returning random logos')
      return getRandomLogos(limit, `/logo/${slug}`, 'related')  // Different seed for related section
    }

    // Get related logos
    const { data: relatedLogos } = await supabase.rpc('get_related_logos', { 
      current_logo_id: currentLogo.id,
      current_logo_path: `/logo/${slug}`,
      limit_count: limit
    });

    // If no related logos found, use same fallback
    if (!relatedLogos?.length) {
      console.log('No related logos found, returning random logos')
      return getRandomLogos(limit, `/logo/${slug}`, 'related')
    }

    // If no tags or no related logos, get random logos with offset
    if (!currentLogo.tags?.length || !relatedLogos?.length) {
      const { data: randomLogos } = await supabase
        .from('logos')
        .select(`
          *,
          tags:logo_tags(
            tag:tags(name)
          )
        `)
        .neq('url_path', `/logo/${slug}`)
        .order('random()')
        .limit(limit)

      return transformLogoData(randomLogos || [])
    }

    return transformLogoData(relatedLogos || [])
  } catch (error) {
    console.error('Error fetching related logos:', error)
    return []
  }
}

export async function searchLogos(
  query: string, 
  page: number = 1,
  limit: number = 24
): Promise<{ logos: LogoData[], total: number }> {
  try {
    const searchTerm = query.toLowerCase()
    
    // First get ALL matching results
    const { data: allLogos, error, count } = await supabase
      .from('logos')
      .select(`
        *,
        tags:logo_tags(
          tag:tags(name)
        )
      `, { count: 'exact' })
      .or(
        searchTerm.length === 1
          ? `title.ilike.% ${searchTerm} %,title.ilike.%Download ${searchTerm} %`
          : `title.ilike.%${searchTerm}%`
      )

    if (error) {
      console.error('Supabase query error:', error)
      return { logos: [], total: 0 }
    }

    // Calculate relevance scores for ALL results
    const scoredResults = (allLogos || [])
      .map(logo => ({
        ...logo,
        relevance: calculateRelevance(logo, query)
      }))
      .sort((a, b) => b.relevance - a.relevance)

    //console.log(`Total matches found: ${scoredResults.length}`)
    //console.log('Top 5 most relevant results:')
    scoredResults.slice(0, 5).forEach(r => 
      console.log(`${r.title} (score: ${r.relevance})`
        
      )
    )

    // Paginate after sorting by relevance
    const start = (page - 1) * limit
    const paginatedResults = scoredResults.slice(start, start + limit)

    return {
      logos: transformLogoData(paginatedResults),
      total: count || 0
    }
  } catch (error) {
    console.error('Search error:', error)
    return { logos: [], total: 0 }
  }
}

function calculateRelevance(logo: any, query: string): number {
  const searchTerms = query.toLowerCase().split(' ')
  let score = 0

  // Clean the title
  const cleanTitle = logo.title
    .toLowerCase()
    .replace(/^download /, '')
    .replace(/ vector \(svg\) logo$/, '')
    .trim()

  //console.log('\nRelevance calculation for:', logo.title)
  //console.log('Clean title:', cleanTitle)

  // Single letter special handling
  if (query.length === 1) {
    // Exact match (title is just the letter)
    if (cleanTitle === query.toLowerCase()) {
      score += 100  // Highest priority
      //console.log('Exact match score: +100')
    }
    
    // Title starts with "X " or "X-"
    else if (
      cleanTitle.startsWith(query.toLowerCase() + ' ') || 
      cleanTitle.startsWith(query.toLowerCase() + '-')
    ) {
      score += 80
      //console.log('Starts with letter + space/hyphen score: +80')
    }
    
    // Title is just "X" with something else
    else if (cleanTitle.startsWith(query.toLowerCase())) {
      score += 60
      //console.log('Starts with letter score: +60')
    }
    
    // Title contains " X " (X as a word)
    else if (cleanTitle.includes(' ' + query.toLowerCase() + ' ')) {
      score += 40
      //console.log('Contains letter as word score: +40')
    }
    
    // Title contains X somewhere
    else if (cleanTitle.includes(query.toLowerCase())) {
      score += 20
      //console.log('Contains letter somewhere score: +20')
    }
  } 
  // Multi-word search
  else {
    // Exact match after cleaning
    if (cleanTitle === query.toLowerCase()) {
      score += 100
    }
    
    // Starts with query
    else if (cleanTitle.startsWith(query.toLowerCase())) {
      score += 80
    }
    
    // Contains full query
    else if (cleanTitle.includes(query.toLowerCase())) {
      score += 60
    }
    
    // Check individual terms
    else {
      let matchedTerms = 0
      searchTerms.forEach(term => {
        if (cleanTitle.includes(term)) {
          matchedTerms++
        }
      })
      // Score based on percentage of matched terms
      score += (matchedTerms / searchTerms.length) * 40
    }
  }

  // Add tag relevance as a small bonus
  if (logo.tags?.some((t: any) => 
    t.tag?.name?.toLowerCase().includes(query.toLowerCase())
  )) {
    score += 5
    //console.log('Tag bonus: +5')
  }

  // console.log('Final score:', score)
  //console.log('-------------------')

  return score
}

export async function getLogosByLetter(letter: string, page: number = 1, limit: number = 30) {
  //console.log('Fetching logos for letter:', letter, 'page:', page, 'limit:', limit) // Debug log
  
  const start = (page - 1) * limit
  const end = start + limit - 1

  const { data: logos, error, count } = await supabase
    .from('logos')
    .select(`
      *,
      tags:logo_tags(
        tag:tags(name)
      )
    `, { count: 'exact' })
    .ilike('title', `Download ${letter}%`)
    .range(start, end)
    .order('title')

  if (error) {
    //console.error('Error fetching logos by letter:', error)
    return { logos: [], total: 0 }
  }

  //console.log('Found logos:', logos?.length, 'total:', count) // Debug log
  
  return {
    logos: transformLogoData(logos || []),
    total: count || 0
  }
}

export async function getPopularLogos(): Promise<LogoData[]> {
  try {
    // First get the popular logo IDs
    const { data: popularIds } = await supabase
      .from('popular_logos')
      .select('logo_id')

    // Then get the logos
    const { data: logos, error } = await supabase
      .from('logos')
      .select(`
        *,
        tags:logo_tags(
          tag:tags(name)
        )
      `)
      .in('id', popularIds?.map(row => row.logo_id) || [])

    if (error) {
      //console.error('Error fetching popular logos:', error)
      return []
    }

    return transformLogoData(logos || [])
  } catch (error) {
    console.error('Error:', error)
    return []
  }
}

export async function getLogosByTag(tag: string, page: number = 1, limit: number = 24) {
  const start = (page - 1) * limit
  const end = start + limit - 1

  const { data: logos, error, count } = await supabase
    .from('logos')
    .select(`
      *,
      tags:logo_tags!inner(
        tag:tags!inner(name)
      )
    `, { count: 'exact' })
    .eq('logo_tags.tags.name', tag)
    .range(start, end)
    .order('title')

  if (error) {
    console.error('Error fetching logos by tag:', error)
    return { logos: [], total: 0 }
  }

  return {
    logos: transformLogoData(logos || []),
    total: count || 0
  }
} 