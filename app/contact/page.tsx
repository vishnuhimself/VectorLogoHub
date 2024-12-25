import { Metadata } from 'next'
import { Mail } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Contact Us - VectorLogoHub',
  description: 'Get in touch with VectorLogoHub team for support or inquiries.',
  alternates: {
    canonical: '/contact',
  },
}

export const dynamic = 'force-static'

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8">Contact Us</h1>
      
      <div className="prose prose-gray max-w-none">
        <p className="mb-6">
          Have questions or need assistance? We&apos;re here to help! Feel free to reach out to us 
          for any inquiries about our vector logo collection, website functionality, or copyright concerns.
        </p>

        <div className="bg-secondary p-6 rounded-lg flex items-center gap-4 mb-8">
          <Mail className="h-6 w-6 text-muted-foreground" />
          <a 
            href="mailto:support@vectorlogohub.com"
            className="text-lg hover:text-primary transition-colors no-underline"
          >
            support@vectorlogohub.com
          </a>
        </div>

        <p className="text-muted-foreground">
          We typically respond to all inquiries within 24-48 hours during business days.
        </p>
      </div>
    </div>
  )
} 