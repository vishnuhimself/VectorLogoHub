import Link from 'next/link'
import Image from 'next/image'
import type { LogoData } from '@/types/logo'
import { toTitleCase } from '@/lib/utils'
import type { Route } from 'next'

function cleanLogoName(name: string): string {
  return toTitleCase(
    name
      .replace(/ logo vector$/, '')
      .replace(/ vector logo$/, '')
      .replace(/ logo$/, '')
  )
}

export default function LogoGrid({ logos }: { logos: LogoData[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
      {logos.map((logo: LogoData) => (
        <Link
          key={logo.metadata.url_path}
          href={logo.metadata.url_path as Route}
          className="group"
        >
          <div className="bg-white rounded-lg shadow border p-4 hover:shadow-sm transition-shadow h-full flex flex-col">
            <div className="relative w-full aspect-video mb-4">
              <Image
                src={logo.logo_url}
                alt={logo.logo_alt}
                fill
                className="object-contain"
              />
            </div>
            <div className="flex-1 flex items-center justify-center">
              <span className="text-sm font-medium text-gray-900 group-hover:text-blue-600 line-clamp-2 text-center">
                {cleanLogoName(logo.logo_alt)}
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
} 