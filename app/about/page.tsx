import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Us - VectorLogoHub',
  description: 'Learn about VectorLogoHub - Your source for high-quality vector logos.',
  alternates: {
    canonical: '/about',
  },
}

export const dynamic = 'force-static'

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8">About VectorLogoHub</h1>
      
      <div className="prose prose-gray max-w-none">
        <p className="mb-6">
          Welcome to VectorLogoHub, your go-to destination for high-quality vector logos. We&apos;ve 
          created this platform to make it easy for designers, developers, and creators to find 
          and download vector logos in SVG format.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">What We Offer</h2>
        <p className="mb-6">
          Our collection includes thousands of professionally crafted vector logos, all available 
          in both SVG and PNG formats. Whether you&apos;re working on a presentation, website, or 
          design project, we provide the logos you need in the format you want.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">Why Vector Format?</h2>
        <p className="mb-6">
          Vector logos are resolution-independent, meaning they stay crisp and clear at any size. 
          Our SVG files are lightweight, scalable, and perfect for modern web development and 
          professional design work.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">Our Mission</h2>
        <p className="mb-6">
          We believe in making quality design resources accessible to everyone. Our platform is 
          free to use, and we&apos;re constantly updating our collection with new logos while 
          maintaining the highest quality standards.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">Community-Driven</h2>
        <p className="mb-6">
          VectorLogoHub grows through community contributions. We welcome submissions from designers 
          and appreciate the collaborative spirit that helps our platform expand and improve.
        </p>
      </div>
    </div>
  )
} 