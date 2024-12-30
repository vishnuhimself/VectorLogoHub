import NodeCache from 'node-cache'
import type { LogoData } from '@/types/logo'
import { CACHE_TIMES } from '@/lib/constants'

// Initialize cache with checkperiod
const cache = new NodeCache({
  stdTTL: CACHE_TIMES.WEEK,
  checkperiod: CACHE_TIMES.MEDIUM,
  useClones: false
})

export async function getCachedLogo(slug: string): Promise<LogoData | null> {
  try {
    const cached = cache.get<LogoData>(`logo:${slug}`)
    return cached || null
  } catch (e) {
    console.error('Cache get error:', e)
    return null
  }
}

export async function setCachedLogo(slug: string, logo: LogoData): Promise<void> {
  try {
    cache.set(`logo:${slug}`, logo)
  } catch (e) {
    console.error('Cache set error:', e)
  }
} 