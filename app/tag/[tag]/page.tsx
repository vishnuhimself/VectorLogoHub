import { LogoData } from '@/types/logo'
import LogoGrid from '@/components/logo-grid'
import { PaginationWithSuspense } from '@/components/pagination'
import path from 'path'
import fs from 'fs'
import { Metadata } from 'next'
import { toTitleCase } from '@/lib/utils'

interface Props {
  params: {
    tag: string
  }
  searchParams: {
    page?: string
  }
}

const LOGOS_PER_PAGE = 18

async function getLogosByTag(tag: string) {
  try {
    const data = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'app/master_logo_details.json'), 'utf8')
    )
    
    return data
      .filter((logo: LogoData) => 
        logo.tags.includes(decodeURIComponent(tag))
      )
      .map((logo: LogoData) => ({
        ...logo,
        logo_url: logo.logo_url.replace(
          'cdn.worldvectorlogo.com/logos',
          'cdn.vectorlogohub.com'
        )
      }))
  } catch (error) {
    console.error('Error reading logo data:', error)
    return []
  }
}

export default async function TagPage({ params, searchParams }: Props) {
  const allLogos = await getLogosByTag(params.tag)
  const currentPage = Number(searchParams.page) || 1
  const totalPages = Math.ceil(allLogos.length / LOGOS_PER_PAGE)
  
  const startIndex = (currentPage - 1) * LOGOS_PER_PAGE
  const logos = allLogos.slice(startIndex, startIndex + LOGOS_PER_PAGE)
  
  const decodedTag = decodeURIComponent(params.tag)

  return (
    <div className="container mx-auto px-4 py-8">

      <h1 className="text-3xl font-bold mb-2">
      {toTitleCase(decodedTag)} Logo{allLogos.length !== 1 ? 's' : ''}
      </h1>
      <div className="text-sm text-gray-500 mb-8">
      {allLogos.length} Logo{allLogos.length !== 1 ? 's' : ''} Found
      </div>
      
      <LogoGrid logos={logos} />

      {totalPages > 1 && (
        <div className="mt-8">
          <PaginationWithSuspense
            currentPage={currentPage}
            totalPages={totalPages}
            tag={params.tag}
          />
        </div>
      )}
    </div>
  )
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const decodedTag = decodeURIComponent(params.tag)
  const formattedTag = toTitleCase(decodedTag)
  
  const data = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'app/master_logo_details.json'), 'utf8')
  )
  
  const logoCount = data.filter((logo: LogoData) => 
    logo.tags.includes(decodedTag)
  ).length

  return {
    title: `${formattedTag} Logos - Download Free ${formattedTag} Vector Logos`,
    description: `Download ${logoCount} free ${formattedTag.toLowerCase()} vector logos in SVG and PNG formats. High-quality files compatible with AI, PSD, EPS, and Adobe PDF formats.`,
    alternates: {
      canonical: `/tag/${params.tag}`,
    },
    openGraph: {
      title: `${formattedTag} Logos - Download Free ${formattedTag} Vector Logos`,
      description: `Download ${logoCount} free ${formattedTag.toLowerCase()} vector logos in SVG and PNG formats. High-quality files compatible with AI, PSD, EPS, and Adobe PDF formats.`,
      url: `/tag/${params.tag}`,
      siteName: 'VectorLogoHub',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${formattedTag} Logos - Download Free ${formattedTag} Vector Logos`,
      description: `Download ${logoCount} free ${formattedTag.toLowerCase()} vector logos in SVG and PNG formats. High-quality files compatible with AI, PSD, EPS, and Adobe PDF formats.`,
    }
  }
}

export const dynamic = 'force-static'
export const dynamicParams = true
export const revalidate = false