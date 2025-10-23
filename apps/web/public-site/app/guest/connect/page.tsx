'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface GuestFormData {
  personal: {
    firstName: string
    lastName: string
    email: string
    phone: string
    location: string
  }
  visit: {
    branch: string
    serviceDate: string
    howHeard: string
    firstTime: boolean
  }
  interests: {
    salvation: boolean
    baptism: boolean
    membership: boolean
    volunteering: boolean
    prayer: boolean
  }
  prayerRequest?: string
}

export default function GuestConnectPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<GuestFormData>({
    personal: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      location: ''
    },
    visit: {
      branch: '',
      serviceDate: '',
      howHeard: '',
      firstTime: true
    },
    interests: {
      salvation: false,
      baptism: false,
      membership: false,
      volunteering: false,
      prayer: false
    },
    prayerRequest: ''
  })
  const [loading, setLoading] = useState(false)

  const handleInputChange = (section: keyof GuestFormData, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/guests/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        router.push('/guest/connect/success')
      } else {
        throw new Error('Submission failed')
      }
    } catch (error) {
      console.error('Failed to submit form:', error)
      alert('There was an error submitting your form. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4))
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1))

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4">
            <span className="text-2xl font-bold text-gray-900">THOGMi</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            We're Glad You're Here!
          </h1>
          <p className="text-gray-600">
            Let us know about your visit and how we can serve you.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-between mb-8">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === currentStep 
                  ? 'bg-blue-600 text-white' 
                  : step < currentStep 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-300 text-gray-600'
              }`}>
                {step < currentStep ? '✓' : step}
              </div>
              <span className="text-xs mt-2 text-gray-600">
                {['Personal', 'Visit', 'Interests', 'Prayer'][step - 1]}
              </span>
            </div>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
          
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Personal Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.personal.firstName}
                    onChange={(e) => handleInputChange('personal', 'firstName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.personal.lastName}
                    onChange={(e) => handleInputChange('personal', 'lastName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.personal.email}
                  onChange={(e) => handleInputChange('personal', 'email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.personal.phone}
                  onChange={(e) => handleInputChange('personal', 'phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City/Area
                </label>
                <input
                  type="text"
                  value={formData.personal.location}
                  onChange={(e) => handleInputChange('personal', 'location', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Step 2: Visit Information */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Visit Information
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Which branch did you visit? *
                </label>
                <select
                  required
                  value={formData.visit.branch}
                  onChange={(e) => handleInputChange('visit', 'branch', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a branch</option>
                  <option value="hq">THOGMi Headquarters</option>
                  <option value="lagos-ikeja">Lagos - Ikeja</option>
                  <option value="abuja-central">Abuja - Central</option>
                  <option value="port-harcourt">Port Harcourt</option>
                  <option value="online">Online Service</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  When did you visit? *
                </label>
                <input
                  type="date"
                  required
                  value={formData.visit.serviceDate}
                  onChange={(e) => handleInputChange('visit', 'serviceDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  How did you hear about us? *
                </label>
                <select
                  required
                  value={formData.visit.howHeard}
                  onChange={(e) => handleInputChange('visit', 'howHeard', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select an option</option>
                  <option value="friend">Friend or Family</option>
                  <option value="social-media">Social Media</option>
                  <option value="website">Website</option>
                  <option value="invitation-card">Invitation Card</option>
                  <option value="drive-by">Drove by Location</option>
                  <option value="event">Community Event</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="firstTime"
                  checked={formData.visit.firstTime}
                  onChange={(e) => handleInputChange('visit', 'firstTime', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="firstTime" className="ml-2 block text-sm text-gray-700">
                  This was my first time visiting THOGMi
                </label>
              </div>
            </div>
          )}

          {/* Step 3: Spiritual Interests */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Spiritual Interests
              </h2>
              <p className="text-gray-600 mb-4">
                Let us know how we can help you in your spiritual journey.
              </p>

              <div className="space-y-3">
                {[
                  { key: 'salvation', label: 'I would like to receive Jesus as my Lord and Savior' },
                  { key: 'baptism', label: 'I\'m interested in water baptism' },
                  { key: 'membership', label: 'I want to learn about church membership' },
                  { key: 'volunteering', label: 'I\'m interested in volunteering/serving' },
                  { key: 'prayer', label: 'I would like prayer' }
                ].map((item) => (
                  <div key={item.key} className="flex items-start">
                    <input
                      type="checkbox"
                      id={item.key}
                      checked={formData.interests[item.key as keyof typeof formData.interests]}
                      onChange={(e) => handleInputChange('interests', item.key, e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                    />
                    <label htmlFor={item.key} className="ml-2 block text-sm text-gray-700">
                      {item.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Prayer Request */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Prayer Request
              </h2>
              <p className="text-gray-600 mb-4">
                How can we pray for you? (Optional)
              </p>

              <div>
                <textarea
                  rows={6}
                  value={formData.prayerRequest}
                  onChange={(e) => setFormData(prev => ({ ...prev, prayerRequest: e.target.value }))}
                  placeholder="Share your prayer request here..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit'}
              </button>
            )}
          </div>
        </form>

        {/* Privacy Notice */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            Your information is safe with us. Read our{' '}
            <Link href="/privacy" className="text-blue-600 hover:text-blue-700">
              privacy policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
