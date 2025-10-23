'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface Sermon {
  id: string
  title: string
  speaker: string
  branch: string
  series: string
  scripture: string
  date: string
  duration: number
  thumbnail: string
  audioUrl: string
  videoUrl: string
  views: number
}

export function RecentSermons() {
  const [sermons, setSermons] = useState<Sermon[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSermons = async () => {
      try {
        const response = await fetch('/api/sermons/recent')
        const data = await response.json()
        setSermons(data.sermons)
      } catch (error) {
        console.error('Failed to fetch sermons:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSermons()
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    return `${minutes} min`
  }

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Recent Sermons</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="w-full h-40 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Recent Sermons</h2>
          <Link
            href="/sermons"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Browse All Sermons →
          </Link>
        </div>

        {sermons.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📖</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No Sermons Available
            </h3>
            <p className="text-gray-500">
              Sermons will be posted here after services.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {sermons.map((sermon) => (
              <div
                key={sermon.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative">
                  <Image
                    src={sermon.thumbnail}
                    alt={sermon.title}
                    width={300}
                    height={160}
                    className="w-full h-40 object-cover"
                  />
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                    {formatDuration(sermon.duration)}
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm">
                    {sermon.title}
                  </h3>
                  <p className="text-gray-600 text-xs mb-1">
                    {sermon.speaker}
                  </p>
                  <p className="text-gray-500 text-xs mb-3">
                    {sermon.branch} • {formatDate(sermon.date)}
                  </p>
                  
                  <div className="flex justify-between items-center">
                    <Link
                      href={`/sermons/${sermon.id}`}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Watch
                    </Link>
                    <span className="text-gray-400 text-xs">
                      {sermon.views} views
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
