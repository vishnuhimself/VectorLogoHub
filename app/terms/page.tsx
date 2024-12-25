import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Use - VectorLogoHub',
  description: 'Terms and conditions for using VectorLogoHub services.',
  alternates: {
    canonical: '/terms',
  },
}

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8">Terms of Use</h1>
      
      <div className="prose prose-gray max-w-none">
        <h2 className="text-2xl font-bold mt-8 mb-4">Basic Terms</h2>
        <p className="mb-6">
          VectorLogoHub is a platform for personal, non-commercial use only. By using our website 
          and downloading any content, you agree to follow these terms. If these terms do not work 
          for you, please do not use our services.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">Copyright and Trademarks</h2>
        <p className="mb-6">
          The logos on our website are protected by copyright and trademark laws. You may download 
          and use them for personal purposes only. Please do not modify, sell, or use them commercially. 
          If you find content that violates your intellectual property rights, please contact us 
          at support@vectorlogohub.com.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">No Warranty</h2>
        <p className="mb-6">
          We work hard to provide accurate information, but we cannot guarantee it. VectorLogoHub 
          is not responsible for any issues that might arise from using our website or its content. 
          This includes any data loss or technical problems you might experience while using our site.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">Content Upload Rules</h2>
        <p className="mb-6">
          When you upload content to our site, you are responsible for it. Do not upload anything 
          that breaks the law, violates others&apos; rights, or could be offensive. Commercial uploads 
          are not allowed.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">Data Collection</h2>
        <p className="mb-6">
          We collect two types of information:
        </p>
        <ul className="list-disc pl-6 mb-6">
          <li className="mb-2">
            Website usage data: This includes your browsing activity, IP address, and session information. 
            We use cookies to collect this data and Google Analytics to process it.
          </li>
          <li className="mb-2">
            Account information: When you register, we store your email and account details.
          </li>
        </ul>
        <p className="mb-6">
          We use this information to improve our service and understand how people use our website. 
          You can manage your data through your account settings or by contacting us.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">Legal Framework</h2>
        <p className="mb-6">
          These terms follow standard digital service laws. Any disputes will be handled through 
          appropriate legal channels in our jurisdiction.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">Updates to Terms</h2>
        <p className="mb-6">
          We may update these terms as needed. We recommend checking this page occasionally for 
          any changes. Continuing to use VectorLogoHub means you accept any updated terms.
        </p>
      </div>
    </div>
  )
} 