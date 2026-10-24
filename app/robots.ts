import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://www.proofa.ng'

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api/', '/profile/settings'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
