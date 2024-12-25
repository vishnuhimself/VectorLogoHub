import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import LogoDownloadPage from '@/components/logo-download-page'
import path from 'path'
import fs from 'fs'
import type { LogoData } from '@/types/logo'
import { toTitleCase } from '@/lib/utils'

interface Props {
  params: {
    slug: string
  }
}

function cleanLogoName(name: string): string {
      return toTitleCase(
        name
          .replace(/ logo vector$/, '')
          .replace(/ vector logo$/, '')
          .replace(/ logo$/, '')
      )
    }

async function getLogoData(slug: string) {
  try {
    const data = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'app/master_logo_details.json'), 'utf8')
    )
    const logo = data.find((item: any) => 
      item.metadata.url_path === `/logo/${slug}`
    )
    
    if (!logo) return null
    
    // Initialize random downloads count if not exists
    if (!logo.downloads) {
      logo.downloads = Math.floor(Math.random() * (80 - 50 + 1)) + 50
    }
    
    // Transform CDN URL
    logo.logo_url = logo.logo_url.replace(
      'cdn.worldvectorlogo.com/logos',
      'cdn.vectorlogohub.com'
    )
    
    return logo
  } catch (error) {
    console.error('Error reading logo data:', error)
    return null
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const logo = await getLogoData(params.slug)
  
  if (!logo) {
    return {}
  }

  return {
    title: `${cleanLogoName(logo.logo_alt)} Vector Logo - Download Free SVG + PNG`,
    description: `Download the ${cleanLogoName(logo.logo_alt)} logo in SVG and PNG formats. Super high-quality vector files compatible with AI, PSD, EPS, and Adobe PDF formats.`,
    alternates: {
      canonical: `/logo/${params.slug}`,
    },
    openGraph: {
      title: `${cleanLogoName(logo.logo_alt)} Vector Logo - Download Free SVG + PNG`,
      description: `Download the ${cleanLogoName(logo.logo_alt)} logo in SVG and PNG formats. Super high-quality vector files compatible with AI, PSD, EPS, and Adobe PDF formats.`,
      images: [{ url: logo.logo_url }],
    },
  }
}

export default async function LogoPage({ params }: Props) {
  const data = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'app/master_logo_details.json'), 'utf8')
  )

  const logo = data.find((item: LogoData) => 
    item.metadata.url_path === `/logo/${params.slug}`
  )

  if (!logo) {
    notFound()
  }

  // Generate random logos on the server
  const randomLogos = data
    .filter((l: LogoData) => l.metadata.url_path !== `/logo/${params.slug}`)
    .sort(() => 0.5 - Math.random())
    .slice(0, 12)
    .map((logo: LogoData) => ({
      ...logo,
      logo_url: logo.logo_url.replace(
        'cdn.worldvectorlogo.com/logos',
        'cdn.vectorlogohub.com'
      )
    }))

  return <LogoDownloadPage 
    logo={{
      ...logo,
      logo_url: logo.logo_url.replace(
        'cdn.worldvectorlogo.com/logos',
        'cdn.vectorlogohub.com'
      )
    }} 
    allLogos={data}
    randomLogos={randomLogos}
  />
}

export const dynamic = 'force-static'
export const dynamicParams = true // Allow dynamic generation
export const revalidate = false // Once generated, never revalidate 