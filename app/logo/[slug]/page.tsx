import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import LogoDownloadPage from '@/components/logo-download-page'
import { getLogoBySlug, getRelatedLogosBySlug, getRandomLogos } from '@/lib/db'

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const logo = await getLogoBySlug(params.slug)
  if (!logo) return { title: 'Logo not found' }

  const cleanTitle = logo.title.replace(/^Download /, '').replace(/ vector \(SVG\) logo$/, '')

  return {
    title: `Download ${cleanTitle} Vector Logo [SVG + PNG]`,
    description: `Download the ${cleanTitle} logo in SVG and PNG formats. Super high-quality vector files compatible with AI, PSD, EPS, and Adobe PDF formats.`,
    alternates: {
      canonical: `/logo/${params.slug}`,
    },
    openGraph: {
      title: `${cleanTitle} Vector Logo - Download Free SVG + PNG`,
      description: `Download the ${cleanTitle} logo in SVG and PNG formats. Super high-quality vector files compatible with AI, PSD, EPS, and Adobe PDF formats.`,
      images: [{ url: logo.logo_url }],
    },
  }
}

export default async function LogoPage({ params }: { params: { slug: string } }) {
  const logo = await getLogoBySlug(params.slug)
  if (!logo) notFound()

  const [relatedLogos, randomLogos] = await Promise.all([
    getRelatedLogosBySlug(params.slug),
    getRandomLogos(6, `/logo/${params.slug}`, 'random')
  ])

  return (
    <>
      <link 
        rel="preload" 
        href={logo.logo_url} 
        as="image" 
        type="image/svg+xml"
      />
      
      {relatedLogos.slice(0, 3).map(related => (
        <link
          key={related.metadata.url_path}
          rel="preload"
          href={related.logo_url}
          as="image"
          type="image/svg+xml"
        />
      ))}

      <LogoDownloadPage 
        logo={logo}
        relatedLogos={relatedLogos}
        randomLogos={randomLogos}
      />
    </>
  )
}

export const dynamic = 'force-dynamic'
export const revalidate = 0  // Disable caching
export const dynamicParams = true // Allow dynamic generation 