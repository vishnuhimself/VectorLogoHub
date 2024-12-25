import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Upload Logo - Submit Your Vector Logo',
  description: 'Submit your vector logo to VectorLogoHub. Share your logo with our community and help others find high-quality vector logos.',
  alternates: {
    canonical: '/upload',
  },
}

export default function UploadPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4 text-center">
        Upload Your Logo
      </h1>
      <p className="text-muted-foreground text-center mb-8">
        Share your vector logo with our community
      </p>
      
      <div className="max-w-4xl mx-auto">
        <iframe 
          src="https://app.youform.com/forms/m5zqrmql" 
          loading="lazy" 
          width="100%" 
          height="700" 
          className="border-0"
        />
      </div>
    </div>
  )
} 