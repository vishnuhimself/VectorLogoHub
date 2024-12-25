import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy - VectorLogoHub',
  description: 'Privacy policy and data collection practices for VectorLogoHub.',
  alternates: {
    canonical: '/privacy',
  },
}

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
      
      <div className="prose prose-gray max-w-none">
        <p className="mb-6">
          At VectorLogoHub, accessible from https://vectorlogohub.com/, one of our main priorities 
          is the privacy of our visitors. This Privacy Policy document contains types of information 
          that is collected and recorded by VectorLogoHub and how we use it.
        </p>

        <p className="mb-8">
          If you have additional questions or require more information about our Privacy Policy, 
          do not hesitate to contact us.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">Log Files</h2>
        <p className="mb-6">
          VectorLogoHub follows a standard procedure of using log files. These files log visitors 
          when they visit websites. All hosting companies do this and a part of hosting services&apos; 
          analytics. The information collected by log files include internet protocol (IP) addresses, 
          browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, 
          and possibly the number of clicks. These are not linked to any information that is 
          personally identifiable. The purpose of the information is for analyzing trends, 
          administering the site, tracking users&apos; movement on the website, and gathering 
          demographic information.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">Cookies and Web Beacons</h2>
        <p className="mb-6">
          Like any other website, VectorLogoHub uses &apos;cookies&apos;. These cookies are used to store 
          information including visitors&apos; preferences, and the pages on the website that the visitor 
          accessed or visited. The information is used to optimize the users&apos; experience by 
          customizing our web page content based on visitors&apos; browser type and/or other information.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">Third Party Privacy Policies</h2>
        <p className="mb-6">
          VectorLogoHub&apos;s Privacy Policy does not apply to other advertisers or websites. Thus, 
          we are advising you to consult the respective Privacy Policies of these third-party ad 
          servers for more detailed information. It may include their practices and instructions 
          about how to opt-out of certain options.
        </p>

        <p className="mb-6">
          You can choose to disable cookies through your individual browser options. To know more 
          detailed information about cookie management with specific web browsers, it can be found 
          at the browsers&apos; respective websites.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">Consent</h2>
        <p className="mb-6">
          By using our website, you hereby consent to our Privacy Policy and agree to its Terms 
          and Conditions.
        </p>
      </div>
    </div>
  )
} 