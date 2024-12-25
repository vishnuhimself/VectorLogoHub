import { Metadata } from 'next'
import DownloadPageContent from '@/components/download-page'

interface Props {
  params: {
    slug: string
  }
}

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: null,
  },
}

export const dynamic = 'force-dynamic'

export default function DownloadPage({ params }: Props) {
  return <DownloadPageContent slug={params.slug} />
}