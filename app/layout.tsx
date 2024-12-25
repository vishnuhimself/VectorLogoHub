import type { Metadata } from 'next'
import { Be_Vietnam_Pro } from 'next/font/google'
import './globals.css'
import { Toaster } from "@/components/ui/toaster"
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { RootLayoutWrapper } from '@/components/layout/root-layout-wrapper'

const beVietnamPro = Be_Vietnam_Pro({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-be-vietnam-pro',
})

export const metadata: Metadata = {
  title: {
    default: 'VectorLogoHub - Brand Logos. Unlimited Free Downloads.',
    template: '%s | VectorLogoHub'
  },
  description: 'VectorLogoHub is the largest collection of free vector logos. Works with AI, PSD, EPS, and Adobe PDF formats. Unlimited free downloads. No signup required.',
  metadataBase: new URL('https://vectorlogohub.com'),
  alternates: {
    canonical: 'https://vectorlogohub.com',
  },
  openGraph: {
    title: 'VectorLogoHub - Brand Logos. Unlimited Free Downloads.',
    description: 'VectorLogoHub is the largest collection of free vector logos. Works with AI, PSD, EPS, and Adobe PDF formats. Unlimited free downloads. No signup required.',
    url: 'https://vectorlogohub.com',
    siteName: 'VectorLogoHub',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: {
      url: '/VectorLogoHub.svg',
      type: 'image/svg+xml'
    },
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={beVietnamPro.variable}>
      <body suppressHydrationWarning={true} className="min-h-screen bg-background font-sans antialiased flex flex-col">
        <Header />
        <RootLayoutWrapper>
          {children}
        </RootLayoutWrapper>
        <Footer />
        <Toaster />
      </body>
    </html>
  )
}
