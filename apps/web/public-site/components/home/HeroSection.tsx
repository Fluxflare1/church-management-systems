'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface HeroContent {
  id: string
  title: string
  description: string
  image: string
  cta: {
    primary: { text: string; link: string }
    secondary: { text: string; link: string }
  }
  priority: 'global' | 'national' | 'regional' | 'branch'
}

export function HeroSection() {
  const [heroContent, setHeroContent] = useState<HeroContent | null>(null)
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    // Fetch hero content from API
    const fetchHeroContent = async () => {
      try {
        const response = await fetch('/api/hero-content')
        const data = await response.json()
        setHeroContent(data.content)
      } catch (error) {
        console.error('Failed to fetch hero content:', error)
      }
    }

    fetchHeroContent()
  }, [])

  if (!heroContent) {
    return (
      <section className="relative h-[70vh] bg-gradient-to-br from-blue-900 to-purple-800 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">Loading...</p>
        </div>
      </section>
    )
  }

  return (
    <section className="relative h-[70vh] min-h-[600px] bg-gradient-to-br from-blue-900 to-purple-800 overflow-hidden">
      
      {/* Background Image */}
      <Image
        src={heroContent.image}
        alt="THOGMi Church"
        fill
        className="object-cover mix-blend-overlay opacity-20"
        priority
      />
      
      {/* Content Overlay */}
      <div className="relative h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              {heroContent.title}
            </h1>
            <p className="text-xl text-gray-200 mb-8 leading-relaxed">
              {heroContent.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href={heroContent.cta.primary.link}
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
              >
                {heroContent.cta.primary.text}
              </Link>
              <Link
                href={heroContent.cta.secondary.link}
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white border-2 border-white rounded-lg hover:bg-white hover:text-blue-900 transition-colors"
              >
                {heroContent.cta.secondary.text}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Live Indicator if there's a live stream */}
      <div className="absolute top-6 right-6">
        <div className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-full shadow-lg">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <span className="font-semibold">LIVE NOW</span>
        </div>
      </div>
    </section>
  )
}
