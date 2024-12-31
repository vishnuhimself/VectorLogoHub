import type { Metadata } from 'next'
import { Be_Vietnam_Pro } from 'next/font/google'
import './globals.css'
import { Toaster } from "@/components/ui/toaster"
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { RootLayoutWrapper } from '@/components/layout/root-layout-wrapper'
import GoogleAnalytics from '@/components/google-analytics'

const beVietnamPro = Be_Vietnam_Pro({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-be-vietnam-pro',
})

export const metadata: Metadata = {
  title: {
    default: 'VectorLogoHub - Download Vector Logos. Free. Unlimited.',
    template: '%s | VectorLogoHub'
  },
  description: 'VectorLogoHub is the largest collection of free vector logos. Works with AI, PSD, EPS, and Adobe PDF formats. Unlimited free downloads. No signup required.',
  metadataBase: new URL('https://vectorlogohub.com'),
  alternates: {
    canonical: 'https://vectorlogohub.com',
  },
  openGraph: {
    title: 'VectorLogoHub - Download Vector Logos. Free. Unlimited.',
    description: 'VectorLogoHub is the largest collection of free vector logos. Works with AI, PSD, EPS, and Adobe PDF formats. Unlimited free downloads. No signup required.',
    url: 'https://vectorlogohub.com',
    siteName: 'VectorLogoHub',
    images: [
      {
        url: '/VectorLogoHub.png',
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
        {process.env.NEXT_PUBLIC_GA_ID && (
          <GoogleAnalytics GA_MEASUREMENT_ID={process.env.NEXT_PUBLIC_GA_ID} />
        )}
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
