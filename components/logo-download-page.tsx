'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Share2, Link as LinkIcon, Download, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import type { LogoData } from '@/types/logo'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toTitleCase } from '@/lib/utils'
import { getRelatedLogos } from '@/lib/get-related-logos'
import LogoGrid from '@/components/logo-grid'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

function extractLogoName(title: string): string {
  // Remove "Download " from start and " vector (SVG) logo" from end
  return title
    .replace(/^Download /, '')
    .replace(/ vector \(SVG\) logo$/, '')
}

interface LogoDownloadPageProps {
  logo: LogoData
  relatedLogos: LogoData[]
  randomLogos: LogoData[]
}

export default function LogoDownloadPage({ 
  logo, 
  relatedLogos,
  randomLogos 
}: LogoDownloadPageProps) {
  const [isCopied, setIsCopied] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const logoName = extractLogoName(logo.title)

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0)
  }, [])

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(window.location.href)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
    toast({
      title: "Success!",
      description: "Link has been copied to clipboard.",
    })
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: logo.title,
          url: window.location.href,
        })
      } catch (error) {
        console.error('Error sharing:', error)
      }
    }
  }

  const handleDownload = () => {
    const slug = logo.metadata.url_path.split('/').pop()
    router.push(`/download/${slug}?format=svg`)
  }

  const handleDownloadPngSize = (size: number) => {
    const slug = logo.metadata.url_path.split('/').pop()
    router.push(`/download/${slug}?format=png&size=${size}`)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Download {logoName} Logo Vector [SVG & PNG]
      </h1>
      
      <div className="bg-white border rounded-lg shadow">
        {/* Logo Preview Section */}
        <div className="p-4 sm:p-8 border-b">
          <div className="relative w-full max-w-[384px] mx-auto aspect-square">
            <Image
              src={logo.logo_url}
              alt={logo.logo_alt}
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Actions Section */}
        <div className="p-8">
          {/* Download Actions */}
          <div className="flex flex-col sm:grid sm:grid-cols-2 gap-4 mb-6">
            <Button 
              size="lg" 
              className="text-lg py-6 active:scale-[0.98] transition-transform"
              onClick={handleDownload}
            >
              <Download className="mr-2 h-5 w-5" />
              <span>Download SVG</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  size="lg"
                  variant="outline"
                  className="text-lg py-6 active:scale-[0.98] transition-transform"
                >
                  <Download className="mr-2 h-5 w-5" />
                  <span>Download PNG</span>
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleDownloadPngSize(256)}>
                  256 × 256
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDownloadPngSize(512)}>
                  512 × 512
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDownloadPngSize(1024)}>
                  1024 × 1024
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Secondary Actions */}
          <div className="flex gap-4">
            <Button 
              variant="outline"
              className="flex-1 active:scale-[0.98] transition-all"
              onClick={handleCopyLink}
            >
              <LinkIcon className="mr-2 h-4 w-4" />
              {isCopied ? 'Copied!' : 'Copy Link'}
            </Button>
            
            <Button 
              variant="outline"
              className="flex-1 active:scale-[0.98] transition-all"
              onClick={handleShare}
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>
        </div>

        {/* Only show tags section if there are tags */}
        {logo.tags.length > 0 && (
          <div className="px-8 pb-8">
            <div className="font-semibold mb-3">Tags</div>
            <div className="flex gap-2 flex-wrap">
              {logo.tags.map(tag => (
                <Link 
                  key={tag} 
                  href={`/tag/${tag.replace(/ /g, '-')}`}
                  className="px-3 py-1 bg-secondary hover:bg-secondary/80 rounded-sm text-sm transition-colors"
                >
                  {toTitleCase(tag)}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Related Logos Section */}
      <div className="mt-12">
        <div className="text-2xl font-bold mb-6">Related Logos</div>
        <LogoGrid logos={relatedLogos} />
      </div>

      {/* Random Logos Section */}
      <div className="mt-12">
        <div className="text-2xl font-bold mb-6">You May Also Like</div>
        <LogoGrid logos={randomLogos} />
      </div>
    </div>
  )
} 