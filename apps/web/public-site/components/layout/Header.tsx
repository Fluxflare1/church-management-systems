'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { BranchSelector } from '@/components/branches/BranchSelector'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo and Church Name */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-3">
              {/* Round Logo - Replace with actual logo path */}
              <div className="flex-shrink-0">
                <Image
                  src="/images/logo-round.png"
                  alt="THOGMi Logo"
                  width={40}
                  height={40}
                  className="rounded-full"
                  priority
                />
              </div>
              <div className="hidden sm:block">
                <span className="text-xl font-bold text-gray-900">THOGMi</span>
                <p className="text-xs text-gray-500 -mt-1">
                  The House of God Ministry
                </p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="/branches" 
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              Find a Branch
            </Link>
            <Link 
              href="/about" 
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              About Us
            </Link>
            <Link 
              href="/sermons" 
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              Sermons
            </Link>
            <Link 
              href="/events" 
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              Events
            </Link>
            <Link 
              href="/live" 
              className="text-red-600 hover:text-red-700 font-medium transition-colors"
            >
              Watch Live
            </Link>
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            
            {/* Branch Selector */}
            <div className="hidden lg:block">
              <BranchSelector />
            </div>

            {/* CTA Buttons */}
            <div className="hidden sm:flex items-center space-x-3">
              <Link 
                href="/guest/connect"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                I'm New
              </Link>
              <Link 
                href="/give"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
              >
                Give Online
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <span className="sr-only">Open main menu</span>
              {/* Hamburger icon */}
              <div className="w-6 h-6 space-y-1">
                <div className="w-6 h-0.5 bg-gray-600"></div>
                <div className="w-6 h-0.5 bg-gray-600"></div>
                <div className="w-6 h-0.5 bg-gray-600"></div>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-4">
              <Link href="/branches" className="text-gray-700 hover:text-blue-600">
                Find a Branch
              </Link>
              <Link href="/about" className="text-gray-700 hover:text-blue-600">
                About Us
              </Link>
              <Link href="/sermons" className="text-gray-700 hover:text-blue-600">
                Sermons
              </Link>
              <Link href="/events" className="text-gray-700 hover:text-blue-600">
                Events
              </Link>
              <Link href="/live" className="text-red-600 hover:text-red-700 font-medium">
                Watch Live
              </Link>
              <div className="pt-4 border-t">
                <BranchSelector />
              </div>
              <div className="flex flex-col space-y-2 pt-4">
                <Link 
                  href="/guest/connect"
                  className="px-4 py-2 text-center font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  I'm New Here
                </Link>
                <Link 
                  href="/give"
                  className="px-4 py-2 text-center font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Give Online
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
