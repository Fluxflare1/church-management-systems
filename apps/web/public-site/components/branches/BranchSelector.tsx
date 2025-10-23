'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Branch {
  id: string
  name: string
  slug: string
  city: string
  country: string
}

export function BranchSelector() {
  const [isOpen, setIsOpen] = useState(false)
  const [branches, setBranches] = useState<Branch[]>([])
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Fetch branches from API
    const fetchBranches = async () => {
      try {
        const response = await fetch('/api/branches')
        const data = await response.json()
        setBranches(data.branches)
        
        // Try to get user's location from localStorage or geolocation
        const savedBranch = localStorage.getItem('selectedBranch')
        if (savedBranch) {
          setSelectedBranch(JSON.parse(savedBranch))
        }
      } catch (error) {
        console.error('Failed to fetch branches:', error)
      }
    }

    fetchBranches()
  }, [])

  const handleBranchSelect = (branch: Branch) => {
    setSelectedBranch(branch)
    localStorage.setItem('selectedBranch', JSON.stringify(branch))
    setIsOpen(false)
    router.push(`/branches/${branch.country.toLowerCase()}/${branch.slug}`)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
      >
        <span>📍</span>
        <span className="max-w-32 truncate">
          {selectedBranch ? selectedBranch.city : 'Select Branch'}
        </span>
        <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg border z-50">
          <div className="py-1 max-h-60 overflow-y-auto">
            {branches.map((branch) => (
              <button
                key={branch.id}
                onClick={() => handleBranchSelect(branch)}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <div className="font-medium">{branch.name}</div>
                <div className="text-xs text-gray-500">{branch.city}, {branch.country}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
