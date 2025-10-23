'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface Branch {
  id: string
  name: string
  slug: string
  city: string
  country: string
  description: string
  image: string
  pastor: string
  serviceTimes: string[]
  memberCount: number
}

export function BranchSpotlight() {
  const [featuredBranch, setFeaturedBranch] = useState<Branch | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFeaturedBranch = async () => {
      try {
        const response = await fetch('/api/branches/featured')
        const data = await response.json()
        setFeaturedBranch(data.branch)
      } catch (error) {
        console.error('Failed to fetch featured branch:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedBranch()
  }, [])

  if (loading) {
    return (
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Branch Spotlight</h2>
          <div className="bg-white rounded-lg shadow-md p-8 animate-pulse">
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="lg:w-1/3">
                <div className="w-full h-64 bg-gray-200 rounded-lg"></div>
              </div>
              <div className="lg:w-2/3 space-y-4">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-10 bg-gray-200 rounded w-32"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (!featuredBranch) {
    return null
  }

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Branch Spotlight</h2>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            {/* Branch Image */}
            <div className="lg:w-2/5">
              <Image
                src={featuredBranch.image}
                alt={featuredBranch.name}
                width={600}
                height={400}
                className="w-full h-64 lg:h-full object-cover"
              />
            </div>
            
            {/* Branch Details */}
            <div className="lg:w-3/5 p-8">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {featuredBranch.name}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {featuredBranch.city}, {featuredBranch.country}
                  </p>
                </div>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  {featuredBranch.memberCount}+ members
                </span>
              </div>
              
              <p className="text-gray-700 mb-6 leading-relaxed">
                {featuredBranch.description}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Service Times</h4>
                  <ul className="space-y-2">
                    {featuredBranch.serviceTimes.map((time, index) => (
                      <li key={index} className="flex items-center text-gray-600">
                        <span className="mr-2">⏰</span>
                        {time}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Pastor</h4>
                  <p className="text-gray-600 flex items-center">
                    <span className="mr-2">👨‍💼</span>
                    {featuredBranch.pastor}
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-4">
                <Link
                  href={`/branches/${featuredBranch.country.toLowerCase()}/${featuredBranch.slug}`}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
                >
                  Visit Branch Page
                </Link>
                <Link
                  href="/branches"
                  className="border border-gray-300 hover:border-gray-400 text-gray-700 px-6 py-3 rounded-md font-medium transition-colors"
                >
                  Find Other Branches
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
