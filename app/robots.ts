import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: [
        '/',
        '/logo/*',
        '/tag/*',
        '/alphabet/*',
        '/about',
        '/contact',
        '/privacy',
        '/terms'
      ],
      disallow: [
        '/api/*',
        '/_next/*',
        '/*.json$',
        '/search*',
        '/download/*'
      ]
    },
    sitemap: 'https://vectorlogohub.com/sitemap.xml',
    host: 'https://vectorlogohub.com'
  }
} 