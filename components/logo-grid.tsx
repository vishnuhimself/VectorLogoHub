import Image from 'next/image'
import Link from 'next/link'
import { PaginationWithSuspense } from '@/components/pagination'
import type { LogoData } from '@/types/logo'
import { getLogos } from '@/lib/db'

interface LogoGridProps {
  logos: LogoData[]
  currentPage?: number
  totalPages?: number
  baseUrl?: string
  searchParams?: Record<string, string>
}

export default function LogoGrid({ 
  logos,
  currentPage,
  totalPages,
  baseUrl = '',
  searchParams = {}
}: LogoGridProps) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {logos.map((logo) => (
          <Link
            key={logo.metadata.url_path}
            href={{
              pathname: logo.metadata.url_path
            }}
            className="group block"
          >
            <div className="relative bg-white rounded-lg shadow border hover:shadow-md transition-all duration-200 overflow-hidden">
              {/* Card with fixed aspect ratio */}
              <div className="pt-[100%] relative">
                {/* Logo container with padding */}
                <div className="absolute inset-0 p-8 flex items-center justify-center">
                  <div className="relative w-full h-full">
                    <Image
                      src={logo.logo_url}
                      alt={logo.logo_alt}
                      className="object-contain transition-transform duration-300 group-hover:scale-105"
                      fill
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 16vw"
                      priority={currentPage === 1}
                    />
                  </div>
                </div>
              </div>
              
              {/* Title section with clean background */}
              <div className="p-1 text-center bg-white border-t">
                <p className="text-sm text-gray-600 line-clamp-2 leading-snug min-h-[2.5rem] flex items-center justify-center">
                  {logo.title
                    .replace(/^Download /, '')
                    .replace(/ vector \(SVG\) logo$/, '')}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {totalPages && totalPages > 1 && (
        <PaginationWithSuspense
          currentPage={currentPage!}
          totalPages={totalPages}
          baseUrl={baseUrl}
          searchParams={searchParams}
        />
      )}
    </div>
  )
}

// Helper function to use in pages
export async function getLogoGridProps(page: number = 1, limit: number = 20) {
  const { logos, total } = await getLogos(page, limit)
  const totalPages = Math.ceil(total / limit)

  return {
    logos,
    currentPage: page,
    totalPages,
    total
  }
} 