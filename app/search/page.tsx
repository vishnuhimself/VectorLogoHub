import Search from '@/components/search'
import LogoGrid from '@/components/logo-grid'
import { searchLogos } from '@/lib/db'
import { Metadata } from 'next'

interface Props {
  searchParams: { 
    q?: string
    page?: string 
  }
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const query = searchParams.q

  if (!query) {
    return {
      title: 'Search Vector Logos - Download Free SVG Logos',
      description: 'Search through thousands of high-quality vector logos. Download logos in SVG and PNG formats. Perfect for developers and designers.',
      robots: {
        index: false,
        follow: true,
      },
      alternates: {
        canonical: null,
      }
    }
  }

  // For search results pages
  return {
    title: `Search results for "${query}" - Vector Logos`,
    description: `Download free vector logos matching "${query}". High-quality SVG and PNG formats available for download.`,
    robots: {
      index: false,
      follow: true,
    },
    alternates: {
      canonical: null,
    },
    openGraph: {
      title: `Search results for "${query}" - Vector Logos`,
      description: `Download free vector logos matching "${query}". High-quality SVG and PNG formats available for download.`,
      type: 'website',
      siteName: 'VectorLogoHub',
      url: `/search?q=${encodeURIComponent(query)}`,
    },
    twitter: {
      card: 'summary',
      title: `Search results for "${query}" - Vector Logos`,
      description: `Download free vector logos matching "${query}". High-quality SVG and PNG formats available.`,
    }
  }
}

export default async function SearchPage({ searchParams }: Props) {
  const query = searchParams.q
  const currentPage = Number(searchParams.page) || 1

  // Redirect to page 1 if there's no query
  if (!query) {
    return (
      <div>
        <Search />
      </div>
    )
  }

  const LOGOS_PER_PAGE = 24
  const { logos, total } = await searchLogos(query, currentPage, LOGOS_PER_PAGE)
  const totalPages = Math.ceil(total / LOGOS_PER_PAGE)

  return (
    <div>
      <Search />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">
          {total} results for "{query}"
        </h1>
        <LogoGrid 
          logos={logos}
          currentPage={currentPage}
          totalPages={totalPages}
          baseUrl="/search"
          searchParams={{ q: query }}
        />
      </div>
    </div>
  )
}

export const dynamic = 'force-dynamic' 