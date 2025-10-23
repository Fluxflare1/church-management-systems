'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface LiveStream {
  id: string
  branch: {
    name: string
    city: string
    country: string
  }
  title: string
  viewers: number
  thumbnail: string
  streamUrl: string
  startTime: string
}

export function LiveStreamsSection() {
  const [liveStreams, setLiveStreams] = useState<LiveStream[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLiveStreams = async () => {
      try {
        const response = await fetch('/api/streams/live')
        const data = await response.json()
        setLiveStreams(data.streams)
      } catch (error) {
        console.error('Failed to fetch live streams:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLiveStreams()
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchLiveStreams, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Live Now</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
                <div className="w-full h-48 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (liveStreams.length === 0) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Live Streams</h2>
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📺</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No Live Streams Currently
            </h3>
            <p className="text-gray-500 mb-6">
              Check back during service times or view upcoming streams.
            </p>
            <Link
              href="/live"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              View Streaming Schedule
            </Link>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Live Now</h2>
          <Link
            href="/live"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            View All Streams →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {liveStreams.map((stream) => (
            <div
              key={stream.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="relative">
                <Image
                  src={stream.thumbnail}
                  alt={stream.title}
                  width={400}
                  height={225}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-3 left-3 flex items-center space-x-1 bg-red-600 text-white px-2 py-1 rounded-full text-sm">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span>LIVE</span>
                </div>
                <div className="absolute top-3 right-3 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm">
                  {stream.viewers} watching
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {stream.title}
                </h3>
                <p className="text-gray-600 text-sm mb-3">
                  {stream.branch.name} • {stream.branch.city}
                </p>
                <Link
                  href={stream.streamUrl}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md text-center block transition-colors"
                >
                  Watch Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
