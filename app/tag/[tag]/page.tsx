import { LogoData } from '@/types/logo'
import LogoGrid from '@/components/logo-grid'
import { Metadata } from 'next'
import { toTitleCase } from '@/lib/utils'
import { getLogosByTag } from '@/lib/db'

interface Props {
  params: {
    tag: string
  }
  searchParams: {
    page?: string
  }
}

const LOGOS_PER_PAGE = 24

export default async function TagPage({ params, searchParams }: Props) {
  const decodedTag = decodeURIComponent(params.tag).replace(/-/g, ' ')
  const currentPage = Number(searchParams.page) || 1
  
  const { logos, total } = await getLogosByTag(decodedTag, currentPage, LOGOS_PER_PAGE)
  const totalPages = Math.ceil(total / LOGOS_PER_PAGE)

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">
        {toTitleCase(decodedTag)} Logo{total !== 1 ? 's' : ''}
      </h1>
      <div className="text-sm text-gray-500 mb-8">
        {total} Logo{total !== 1 ? 's' : ''} Found
      </div>
      
      <LogoGrid 
        logos={logos}
        currentPage={currentPage}
        totalPages={totalPages}
        baseUrl={`/tag/${params.tag}`}
      />
    </div>
  )
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const decodedTag = decodeURIComponent(params.tag)
  const formattedTag = toTitleCase(decodedTag)
  
  const { total } = await getLogosByTag(decodedTag, 1, 1) // Just get count

  return {
    title: `${formattedTag} Logos - Download Free Vector Logos`,
    description: `Browse and download ${total} free vector logos in ${formattedTag.toLowerCase()} category. High-quality SVG and PNG formats available.`,
    alternates: {
      canonical: `/tag/${params.tag}`,
    },
    openGraph: {
      title: `${formattedTag} Logos - Download Free Vector Logos`,
      description: `Download ${total} free ${formattedTag.toLowerCase()} vector logos in SVG and PNG formats.`,
      url: `/tag/${params.tag}`,
      siteName: 'VectorLogoHub',
      type: 'website',
    }
  }
}