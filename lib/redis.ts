import { Redis } from 'ioredis'
import { LogoData } from '@/types/logo'
import { CACHE_TIMES } from '@/lib/constants'

let redis: Redis | null = null

try {
  redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT) || 6379,
    maxRetriesPerRequest: 3,
  })
} catch (e) {
  console.error('Redis connection failed:', e)
}

export async function getCachedLogo(slug: string): Promise<LogoData | null> {
  if (!redis) return null
  try {
    const cached = await redis.get(`logo:${slug}`)
    if (cached) return JSON.parse(cached)
    return null
  } catch (e) {
    console.error('Redis get error:', e)
    return null
  }
}

export async function setCachedLogo(slug: string, logo: LogoData) {
  if (!redis) return
  try {
    await redis.set(
      `logo:${slug}`, 
      JSON.stringify(logo), 
      'EX', 
      CACHE_TIMES.WEEK
    )
  } catch (e) {
    console.error('Redis set error:', e)
  }
} 