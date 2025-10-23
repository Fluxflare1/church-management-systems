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
    slug: string
  }
  title: string
  description: string
  startTime: string
  endTime: string
  streamUrl: string
  thumbnail: string
  viewers: number
  status: 'live' | 'upcoming' | 'ended'
}

export default function LiveStreamPage() {
  const [streams, setStreams] = useState<LiveStream[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState<'live' | 'upcoming' | 'past'>('live')

  useEffect(() => {
    const fetchStreams = async () => {
      try {
        const response = await fetch('/api/streams')
        const data = await response.json()
        setStreams(data.streams)
      } catch (error) {
        console.error('Failed to fetch streams:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStreams()
    const interval = setInterval(fetchStreams, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const filteredStreams = streams.filter(stream => {
    switch (selectedTab) {
      case 'live': return stream.status === 'live'
      case 'upcoming': return stream.status === 'upcoming'
      case 'past': return stream.status === 'ended'
      default: return false
    }
  })

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-lg shadow-md p-6">
                  <div className="w-full h-48 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Live Streaming</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join our services from anywhere in the world. Experience worship, teaching, and community online.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-sm">
            {[
              { key: 'live', label: 'Live Now', count: streams.filter(s => s.status === 'live').length },
              { key: 'upcoming', label: 'Upcoming', count: streams.filter(s => s.status === 'upcoming').length },
              { key: 'past', label: 'Past Streams', count: streams.filter(s => s.status === 'ended').length }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSelectedTab(tab.key as any)}
                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  selectedTab === tab.key
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label} {tab.count > 0 && `(${tab.count})`}
              </button>
            ))}
          </div>
        </div>

        {/* Streams Grid */}
        {filteredStreams.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 text-6xl mb-4">
              {selectedTab === 'live' ? '📺' : selectedTab === 'upcoming' ? '⏰' : '📼'}
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {selectedTab === 'live' && 'No Live Streams'}
              {selectedTab === 'upcoming' && 'No Upcoming Streams'}
              {selectedTab === 'past' && 'No Past Streams'}
            </h3>
            <p className="text-gray-500">
              {selectedTab === 'live' && 'Check back during service times for live streams.'}
              {selectedTab === 'upcoming' && 'New streams will be scheduled soon.'}
              {selectedTab === 'past' && 'Past streams will appear here after services.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredStreams.map((stream) => (
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
                  
                  {/* Status Badge */}
                  <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-sm font-medium ${
                    stream.status === 'live' 
                      ? 'bg-red-600 text-white' 
                      : stream.status === 'upcoming'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-600 text-white'
                  }`}>
                    {stream.status === 'live' && (
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        <span>LIVE</span>
                      </div>
                    )}
                    {stream.status === 'upcoming' && 'UPCOMING'}
                    {stream.status === 'ended' && 'ENDED'}
                  </div>

                  {stream.status === 'live' && (
                    <div className="absolute top-3 right-3 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm">
                      {stream.viewers} watching
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {stream.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {stream.description}
                  </p>

                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <span className="mr-2">📍</span>
                    <span>
                      {stream.branch.name} • {stream.branch.city}
                    </span>
                  </div>

                  <div className="text-sm text-gray-500 mb-4">
                    {stream.status === 'live' && 'Started '}
                    {stream.status === 'upcoming' && 'Starts '}
                    {stream.status === 'ended' && 'Ended '}
                    {formatTime(stream.startTime)}
                  </div>

                  <div className="flex space-x-2">
                    {stream.status === 'live' && (
                      <a
                        href={stream.streamUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded text-center font-medium transition-colors"
                      >
                        Watch Now
                      </a>
                    )}
                    
                    {stream.status === 'upcoming' && (
                      <button
                        disabled
                        className="flex-1 bg-gray-300 text-gray-500 py-2 px-4 rounded text-center font-medium cursor-not-allowed"
                      >
                        Coming Soon
                      </button>
                    )}
                    
                    {stream.status === 'ended' && (
                      <a
                        href={stream.streamUrl}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded text-center font-medium transition-colors"
                      >
                        Watch Recording
                      </a>
                    )}

                    <Link
                      href={`/branches/${stream.branch.country.toLowerCase()}/${stream.branch.slug}`}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:border-gray-400 transition-colors"
                    >
                      Branch Info
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Additional Information */}
        <div className="mt-16 bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Can't Find What You're Looking For?
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            If you're having trouble accessing our live streams or have questions about 
            our online services, our technical team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/contact"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
            >
              Contact Support
            </Link>
            <Link
              href="/branches"
              className="border border-gray-300 hover:border-gray-400 text-gray-700 px-6 py-3 rounded-md font-medium transition-colors"
            >
              Find a Physical Location
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
