import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import LogoGrid from '@/components/logo-grid'
import { Pagination } from '@/components/pagination'
import { getLogosByLetter } from '@/lib/db'
import { Suspense } from 'react'
import Loading from '@/components/loading'

interface Props {
  params: {
    letter: string
  }
  searchParams: {
    page?: string
  }
}

const LOGOS_PER_PAGE = 30

export default async function AlphabetPage({ params, searchParams }: Props) {
  // Validate letter parameter
  if (!/^[A-Za-z]$/.test(params.letter)) {
    notFound()
  }

  const letter = params.letter.toUpperCase()
  const currentPage = Number(searchParams.page) || 1
  const { logos, total } = await getLogosByLetter(letter, currentPage, LOGOS_PER_PAGE)
  const totalPages = Math.ceil(total / LOGOS_PER_PAGE)

  return (
    <Suspense fallback={<Loading />}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">
            Logos Starting With "{letter}"
          </h1>
          <p className="text-muted-foreground">
            {total} Logo{total !== 1 ? 's' : ''} Found
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
        
        <LogoGrid 
          logos={logos}
          currentPage={currentPage}
          totalPages={totalPages}
          baseUrl={`/alphabet/${letter}`}
        />
      </div>
    </Suspense>
  )
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const letter = params.letter.toUpperCase()
  const { total } = await getLogosByLetter(letter, 1, 1)  // Just get count

  return {
    title: `Logos starting with ${letter}`,
    description: `Browse and download ${total} free vector logos starting with the letter ${letter}. High-quality SVG and PNG formats available. Compatible with AI, PSD, EPS, and Adobe PDF formats.`,
    alternates: {
      canonical: `/alphabet/${letter}`,
    }
  }
}

export const dynamic = 'force-dynamic'
export const dynamicParams = true

export async function generateStaticParams() {
  return Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ').map((letter) => ({
    letter: letter,
  }))
} 