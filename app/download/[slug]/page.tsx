import { Metadata } from 'next'
import { getLogoBySlug } from '@/lib/db'
import DownloadPageContent from '@/components/download-page'

interface Props {
  params: { slug: string }
  searchParams: { format?: string }
}

export default async function DownloadPage({ params, searchParams }: Props) {
  const logo = await getLogoBySlug(params.slug)
  if (!logo) return null

  return <DownloadPageContent slug={params.slug} logoTitle={logo.title} />
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const logo = await getLogoBySlug(params.slug)
  if (!logo) return {}

  const format = (searchParams.format || 'svg').toUpperCase()
  const cleanTitle = logo.title.replace(/^Download /, '').replace(/ vector \(SVG\) logo$/, '')

  return {
    title: `Downloading ${cleanTitle} logo in ${format} format - VectorLogoHub`,
    robots: {
      index: false,
      follow: false,
    }
  }
}