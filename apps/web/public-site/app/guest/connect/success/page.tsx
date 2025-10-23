import Link from 'next/link'

export default function GuestConnectSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Success Icon */}
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
          <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* Success Message */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Thank You!
        </h1>
        
        <p className="text-gray-600 mb-2">
          We've received your information and we're excited to connect with you.
        </p>
        
        <p className="text-gray-600 mb-8">
          Our team will reach out to you shortly to welcome you and answer any questions you might have.
        </p>

        {/* Next Steps */}
        <div className="bg-blue-50 rounded-lg p-6 mb-8 text-left">
          <h3 className="font-semibold text-blue-900 mb-3">What's Next?</h3>
          <ul className="text-blue-800 space-y-2 text-sm">
            <li>• You'll receive a welcome email within 24 hours</li>
            <li>• A team member will contact you to say hello</li>
            <li>• We'll invite you to our next newcomers event</li>
            <li>• You'll get information about getting connected</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Link
            href="/"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-md font-medium transition-colors block"
          >
            Back to Homepage
          </Link>
          
          <Link
            href="/events"
            className="w-full border border-gray-300 hover:border-gray-400 text-gray-700 py-3 px-4 rounded-md font-medium transition-colors block"
          >
            View Upcoming Events
          </Link>
        </div>

        {/* Contact Info */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Need immediate assistance?{' '}
            <Link href="/contact" className="text-blue-600 hover:text-blue-700">
              Contact us directly
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
