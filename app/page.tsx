import LogoGrid from '@/components/logo-grid'
import Search from '@/components/search'
import { getPopularLogos } from '@/lib/db'
import { ArrowRight, Sparkle, Zap } from 'lucide-react'

export const dynamic = 'force-static'
export const revalidate = false

export default async function Home() {
  const popularLogos = await getPopularLogos()

  return (
    <div>
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-50" />
        
        <div className="container mx-auto px-4 pt-24 pb-32 relative">
          {/* Hero Content */}
          <div className="max-w-3xl mx-auto text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-black/5 backdrop-blur-sm px-4 py-2 rounded-full text-gray-600 mb-6">
              <Zap className="w-4 h-4" />
              <span>Free SVG Vector Logos</span>
            </div>
            
            <h1 className="text-5xl font-bold mb-6 text-gray-900">
              Download Vector Logos
            </h1>
            
            <p className="text-xl text-gray-600 mb-8">
              Access thousands of high-quality, professionally designed vector logos. 
              Perfect for developers, designers, and creators.
            </p>

            <div className="flex flex-col items-center gap-6">
              <Search />
              
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Sparkle className="w-4 h-4" />
                <span>Available in SVG and PNG formats.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Logos Section */}
      <div className="container mx-auto px-4 -mt-16 relative z-10 mb-16">
        <div className="bg-white rounded-xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Popular Logos</h2>
            <a href="/alphabet/A" className="inline-flex items-center text-gray-600 hover:text-gray-700">
              Browse all
              <ArrowRight className="w-4 h-4 ml-1" />
            </a>
          </div>
          <LogoGrid logos={popularLogos} />
        </div>
      </div>
    </div>
  )
}
