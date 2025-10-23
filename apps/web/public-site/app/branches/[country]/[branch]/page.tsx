import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

interface BranchPageProps {
  params: {
    country: string
    branch: string
  }
}

interface BranchData {
  id: string
  name: string
  slug: string
  city: string
  country: string
  address: string
  description: string
  image: string
  pastor: string
  pastorImage: string
  serviceTimes: Array<{
    day: string
    time: string
    type: string
  }>
  contact: {
    phone: string
    email: string
  }
  ministries: Array<{
    name: string
    description: string
    contact: string
  }>
}

// This would typically fetch from your API
async function getBranchData(country: string, branchSlug: string): Promise<BranchData | null> {
  // Mock data - replace with actual API call
  const branches: { [key: string]: BranchData } = {
    'ikeja': {
      id: '1',
      name: 'THOGMi Ikeja',
      slug: 'ikeja',
      city: 'Lagos',
      country: 'Nigeria',
      address: '123 Church Street, Ikeja, Lagos',
      description: 'THOGMi Ikeja is a vibrant community of believers committed to spreading the gospel in the heart of Lagos. We welcome you to join our family and experience the love of Christ.',
      image: '/images/branches/ikeja.jpg',
      pastor: 'Pastor John Adeyemi',
      pastorImage: '/images/pastors/john-adeyemi.jpg',
      serviceTimes: [
        { day: 'Sunday', time: '8:00 AM', type: 'First Service' },
        { day: 'Sunday', time: '10:30 AM', type: 'Second Service' },
        { day: 'Wednesday', time: '6:00 PM', type: 'Bible Study' }
      ],
      contact: {
        phone: '+234-XXX-XXXX',
        email: 'ikeja@thogmi.org'
      },
      ministries: [
        { name: 'Children Ministry', description: 'Engaging programs for kids ages 2-12', contact: 'Sister Grace' },
        { name: 'Youth Church', description: 'Dynamic worship and teaching for teens', contact: 'Brother David' },
        { name: 'Prayer Ministry', description: 'Intercessory prayer and spiritual warfare', contact: 'Deacon James' }
      ]
    }
  }

  return branches[branchSlug] || null
}

export default async function BranchPage({ params }: BranchPageProps) {
  const branchData = await getBranchData(params.country, params.branch)

  if (!branchData) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Hero Section */}
      <section className="relative h-96 bg-gradient-to-r from-blue-900 to-purple-800">
        <Image
          src={branchData.image}
          alt={branchData.name}
          fill
          className="object-cover mix-blend-overlay opacity-30"
        />
        <div className="relative h-full flex items-center justify-center text-center text-white">
          <div className="max-w-4xl mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{branchData.name}</h1>
            <p className="text-xl mb-2">{branchData.city}, {branchData.country}</p>
            <p className="text-lg opacity-90">{branchData.address}</p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* About Section */}
            <section className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About Our Branch</h2>
              <p className="text-gray-700 leading-relaxed">{branchData.description}</p>
            </section>

            {/* Service Times */}
            <section className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Service Times</h2>
              <div className="space-y-3">
                {branchData.serviceTimes.map((service, index) => (
                  <div key={index} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
                    <div>
                      <h3 className="font-semibold text-gray-900">{service.day}</h3>
                      <p className="text-gray-600 text-sm">{service.type}</p>
                    </div>
                    <span className="text-lg font-semibold text-blue-600">{service.time}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Ministries */}
            <section className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Ministries</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {branchData.ministries.map((ministry, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{ministry.name}</h3>
                    <p className="text-gray-600 text-sm mb-3">{ministry.description}</p>
                    <p className="text-sm text-blue-600">Contact: {ministry.contact}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Pastor Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-center">
                <Image
                  src={branchData.pastorImage}
                  alt={branchData.pastor}
                  width={120}
                  height={120}
                  className="rounded-full mx-auto mb-4"
                />
                <h3 className="font-bold text-gray-900 text-lg">{branchData.pastor}</h3>
                <p className="text-gray-600 text-sm">Branch Pastor</p>
              </div>
            </div>

            {/* Contact Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-bold text-gray-900 mb-4">Contact Information</h3>
              <div className="space-y-3">
                <div className="flex items-center text-gray-600">
                  <span className="mr-3">📞</span>
                  <span>{branchData.contact.phone}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <span className="mr-3">✉️</span>
                  <span>{branchData.contact.email}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <span className="mr-3">📍</span>
                  <span className="text-sm">{branchData.address}</span>
                </div>
              </div>
            </div>

            {/* CTA Cards */}
            <div className="space-y-4">
              <Link
                href="/guest/connect"
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-3 px-4 rounded-md font-medium transition-colors"
              >
                I'm New Here
              </Link>
              
              <Link
                href="/give"
                className="block w-full border border-gray-300 hover:border-gray-400 text-gray-700 text-center py-3 px-4 rounded-md font-medium transition-colors"
              >
                Give Online
              </Link>

              <Link
                href="/events"
                className="block w-full border border-gray-300 hover:border-gray-400 text-gray-700 text-center py-3 px-4 rounded-md font-medium transition-colors"
              >
                Upcoming Events
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
