import LogoGrid from '@/components/logo-grid'
import Search from '@/components/search'
import path from 'path'
import fs from 'fs'
import { LogoData } from '@/types/logo'
import { getRandomLogos } from '@/data/popular-logos'

async function getPopularLogos() {
  try {
    const data = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'app/master_logo_details.json'), 'utf8')
    )
    
    const randomPaths = getRandomLogos(30) // 6 logos × 5 rows = 30 logos
    
    return data
      .filter((logo: LogoData) => 
        randomPaths.includes(logo.metadata.url_path)
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

export const dynamic = 'force-static'

export default async function Home() {
  const popularLogos = await getPopularLogos()

  return (
    <div>
      <div className="container mx-auto px-4 pt-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">
            Download Free Vector Logos
          </h1>
          <p className="text-xl text-muted-foreground">
            Access thousands of high-quality vector logos in SVG format
          </p>
        </div>
      </div>

          <Search />


      <div className="container mx-auto px-4 py-8">
        <div className="text-2xl font-bold mb-8">Popular Logos</div>
        <LogoGrid logos={popularLogos} />
      </div>
    </div>
  )
}
