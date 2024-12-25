import { LogoData } from '@/types/logo'
import LogoGrid from '@/components/logo-grid'
import { Pagination } from '@/components/pagination'
import path from 'path'
import fs from 'fs'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'

interface Props {
  params: {
    letter: string
  }
  searchParams: {
    page?: string
  }
}

const LOGOS_PER_PAGE = 30

async function getLogosByLetter(letter: string) {
  try {
    const data = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'app/master_logo_details.json'), 'utf8')
    )
    
    return data
      .filter((logo: LogoData) => {
        const cleanName = logo.logo_alt
          .replace(/ logo vector$/, '')
          .replace(/ vector logo$/, '')
          .replace(/ logo$/, '')
          .trim()
          .toLowerCase()
        return cleanName.startsWith(letter.toLowerCase())
      })
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

export default async function AlphabetPage({ params, searchParams }: Props) {
  // Validate letter parameter
  if (!/^[A-Za-z]$/.test(params.letter)) {
    notFound()
  }

  const letter = params.letter.toUpperCase()
  const allLogos = await getLogosByLetter(letter)
  const currentPage = Number(searchParams.page) || 1
  const totalPages = Math.ceil(allLogos.length / LOGOS_PER_PAGE)
  
  const startIndex = (currentPage - 1) * LOGOS_PER_PAGE
  const logos = allLogos.slice(startIndex, startIndex + LOGOS_PER_PAGE)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">
          Logos Starting With "{letter}"
        </h1>
        <p className="text-muted-foreground">
          {allLogos.length} Logo{allLogos.length !== 1 ? 's' : ''} Found
        </p>
      </div>

      {/* Alphabet Navigation */}
      <div className="mb-8 flex flex-wrap gap-2">
        {Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ').map((alpha) => (
          <a
            key={alpha}
            href={`/alphabet/${alpha}`}
            className={`w-10 h-10 flex items-center justify-center rounded-md text-sm font-medium transition-colors
              ${alpha === letter 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-secondary hover:bg-secondary/80'}`}
          >
            {alpha}
          </a>
        ))}
      </div>
      
      <LogoGrid logos={logos} />

      {totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            baseUrl={`/alphabet/${letter}`}
          />
        </div>
      )}
    </div>
  )
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const letter = params.letter.toUpperCase()
  const data = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'app/master_logo_details.json'), 'utf8')
  )
  
  const logoCount = data.filter((logo: LogoData) => {
    const cleanName = logo.logo_alt
      .replace(/ logo vector$/, '')
      .replace(/ vector logo$/, '')
      .replace(/ logo$/, '')
      .trim()
      .toLowerCase()
    return cleanName.startsWith(letter.toLowerCase())
  }).length

  return {
    title: `${letter} Logos - Download Free Vector Logos Starting with ${letter}`,
    description: `Browse and download ${logoCount} free vector logos starting with the letter ${letter}. High-quality SVG and PNG formats available. No signup required.`,
    alternates: {
      canonical: `/alphabet/${letter}`,
    },
    openGraph: {
      title: `${letter} Logos - Download Free Vector Logos Starting with ${letter}`,
      description: `Browse and download ${logoCount} free vector logos starting with the letter ${letter}. High-quality SVG and PNG formats available. No signup required.`,
      url: `/alphabet/${letter}`,
      siteName: 'VectorLogoHub',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${letter} Logos - Download Free Vector Logos Starting with ${letter}`,
      description: `Browse and download ${logoCount} free vector logos starting with the letter ${letter}. High-quality SVG and PNG formats available. No signup required.`,
    }
  }
}

export const dynamic = 'force-static'
export const dynamicParams = true
export const revalidate = false

export async function generateStaticParams() {
  return Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ').map((letter) => ({
    letter: letter,
  }))
} 