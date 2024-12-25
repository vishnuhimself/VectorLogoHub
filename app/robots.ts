import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/'],
        disallow: ['/api/', '/search', '/download/'],
      },
    ],
    sitemap: 'https://vectorlogohub.com/sitemap.xml',
  }
} 