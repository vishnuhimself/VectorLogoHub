import type { LogoData } from '@/types/logo'

function calculateSimilarity(logo: LogoData, currentLogo: LogoData): number {
  let score = 0
  
  // Clean both names
  const cleanCurrentName = currentLogo.logo_alt
    .toLowerCase()
    .replace(/ logo vector$/, '')
    .replace(/ vector logo$/, '')
    .replace(/ logo$/, '')
    .split(' ')

  const cleanLogoName = logo.logo_alt
    .toLowerCase()
    .replace(/ logo vector$/, '')
    .replace(/ vector logo$/, '')
    .replace(/ logo$/, '')
    .split(' ')

  // Check for common words in names
  cleanCurrentName.forEach(word => {
    if (cleanLogoName.includes(word)) score += 3
  })

  // Check for common tags
  if (currentLogo.tags.length && logo.tags.length) {
    const commonTags = currentLogo.tags.filter(tag => 
      logo.tags.includes(tag)
    )
    score += commonTags.length * 2
  }

  // Boost score if same brand/company
  const brandWords = cleanCurrentName[0] // Usually first word is brand name
  if (cleanLogoName[0] === brandWords) score += 5

  return score
}

type LogoWithSimilarity = LogoData & { similarity: number }

export function getRelatedLogos(
  currentLogo: LogoData,
  allLogos: LogoData[],
  limit: number = 12
): LogoData[] {
  const scoredLogos = allLogos
    .filter(logo => logo.metadata.url_path !== currentLogo.metadata.url_path)
    .map(logo => ({
      ...logo,
      similarity: calculateSimilarity(logo, currentLogo)
    }))
    .filter(logo => logo.similarity > 0)
    .sort((a: LogoWithSimilarity, b: LogoWithSimilarity) => b.similarity - a.similarity)
    .slice(0, limit)
    .map(({ similarity, ...logo }) => logo)

  // If we don't have enough related logos, add some from same tags
  if (scoredLogos.length < limit && currentLogo.tags.length) {
    const remainingNeeded = limit - scoredLogos.length
    const existingUrls = new Set(scoredLogos.map(l => l.metadata.url_path))
    
    const sameTagLogos = allLogos
      .filter(logo => 
        !existingUrls.has(logo.metadata.url_path) &&
        logo.metadata.url_path !== currentLogo.metadata.url_path &&
        logo.tags.some(tag => currentLogo.tags.includes(tag))
      )
      .slice(0, remainingNeeded)

    scoredLogos.push(...sameTagLogos)
  }

  // If we still don't have enough, add random popular logos
  if (scoredLogos.length < limit) {
    const remainingNeeded = limit - scoredLogos.length
    const existingUrls = new Set(scoredLogos.map(l => l.metadata.url_path))
    
    const randomLogos = allLogos
      .filter(logo => 
        !existingUrls.has(logo.metadata.url_path) &&
        logo.metadata.url_path !== currentLogo.metadata.url_path
      )
      .sort(() => 0.5 - Math.random())
      .slice(0, remainingNeeded)

    scoredLogos.push(...randomLogos)
  }

  return scoredLogos
} 