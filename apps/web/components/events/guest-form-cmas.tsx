'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Users, Mail, Phone, MapPin, Heart } from 'lucide-react';
import { submitGuestToCMAS } from '@/lib/api/cmas';
import { GuestFormData } from '@/types';

interface GuestFormCMASProps {
  branchId?: string;
  defaultSource?: string;
  onSuccess?: (result: any) => void;
}

export default function GuestFormCMAS({ 
  branchId, 
  defaultSource = 'website',
  onSuccess 
}: GuestFormCMASProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<GuestFormData>>({
    branch: branchId,
    source: defaultSource,
    isFirstTime: true,
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [result, setResult] = useState<{ guestId: string; workflowId: string; nextSteps: string[] } | null>(null);

  const updateFormData = (updates: Partial<GuestFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, 4));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    setStatus('submitting');
    
    try {
      // Validate required fields
      if (!formData.personal?.firstName || !formData.personal?.email) {
        throw new Error('Please complete all required fields');
      }

      const submissionResult = await submitGuestToCMAS(formData as GuestFormData);
      setResult(submissionResult);
      setStatus('success');
      onSuccess?.(submissionResult);
      
      // Trigger welcome workflow immediately
      await triggerWelcomeWorkflow(submissionResult.guestId);
      
    } catch (error) {
      console.error('CMAS submission error:', error);
      setStatus('error');
    }
  };

  const triggerWelcomeWorkflow = async (guestId: string) => {
    try {
      await fetch('/api/v1/cmas/workflows/trigger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workflow_id: 'welcome_sequence',
          guest_id: guestId,
          metadata: {
            source: 'website_connect_card',
            branch: branchId,
          },
        }),
      });
    } catch (error) {
      console.error('Failed to trigger welcome workflow:', error);
    }
  };

  // Step 1: Personal Information
  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <Users className="h-12 w-12 text-blue-600 mx-auto mb-3" />
        <h3 className="text-xl font-semibold text-gray-900">Welcome to THOGMi!</h3>
        <p className="text-gray-600 mt-2">We're excited to connect with you. Let's start with some basic information.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            First Name *
          </label>
          <input
            type="text"
            required
            value={formData.personal?.firstName || ''}
            onChange={(e) => updateFormData({
              personal: { ...formData.personal, firstName: e.target.value }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Your first name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Last Name
          </label>
          <input
            type="text"
            value={formData.personal?.lastName || ''}
            onChange={(e) => updateFormData({
              personal: { ...formData.personal, lastName: e.target.value }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Your last name"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address *
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="email"
              required
              value={formData.personal?.email || ''}
              onChange={(e) => updateFormData({
                personal: { ...formData.personal, email: e.target.value }
              })}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="your.email@example.com"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="tel"
              value={formData.personal?.phone || ''}
              onChange={(e) => updateFormData({
                personal: { ...formData.personal, phone: e.target.value }
              })}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="(555) 123-4567"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Location
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            value={formData.personal?.location || ''}
            onChange={(e) => updateFormData({
              personal: { ...formData.personal, location: e.target.value }
            })}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="City, State"
          />
        </div>
      </div>
    </div>
  );

  // Step 2: Visit Information
  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <MapPin className="h-12 w-12 text-green-600 mx-auto mb-3" />
        <h3 className="text-xl font-semibold text-gray-900">Your Visit</h3>
        <p className="text-gray-600 mt-2">Tell us about your experience with us.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Which branch did you visit?
        </label>
        <select
          value={formData.visit?.branch || ''}
          onChange={(e) => updateFormData({
            visit: { ...formData.visit, branch: e.target.value }
          })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Select a branch</option>
          <option value="hq">THOGMi Headquarters</option>
          <option value="lagos-ikeja">Lagos Ikeja Branch</option>
          <option value="abuja-central">Abuja Central Branch</option>
          <option value="port-harcourt">Port Harcourt Branch</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          When did you visit?
        </label>
        <input
          type="date"
          value={formData.visit?.serviceDate || ''}
          onChange={(e) => updateFormData({
            visit: { ...formData.visit, serviceDate: e.target.value }
          })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          How did you hear about us?
        </label>
        <select
          value={formData.visit?.howHeard || ''}
          onChange={(e) => updateFormData({
            visit: { ...formData.visit, howHeard: e.target.value }
          })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Select an option</option>
          <option value="friend">Friend or Family</option>
          <option value="social-media">Social Media</option>
          <option value="website">Website</option>
          <option value="event">Community Event</option>
          <option value="drive-by">Drove By</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="firstTime"
          checked={formData.visit?.isFirstTime || false}
          onChange={(e) => updateFormData({
            visit: { ...formData.visit, isFirstTime: e.target.checked }
          })}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="firstTime" className="ml-2 text-sm text-gray-700">
          This was my first time visiting
        </label>
      </div>
    </div>
  );

  // Step 3: Spiritual Interests
  const renderStep3 = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <Heart className="h-12 w-12 text-red-600 mx-auto mb-3" />
        <h3 className="text-xl font-semibold text-gray-900">Spiritual Journey</h3>
        <p className="text-gray-600 mt-2">We'd love to support you in your spiritual growth.</p>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-700">
          I'm interested in learning more about:
        </label>
        
        <div className="space-y-2">
          {[
            { id: 'salvation', label: 'Accepting Jesus as my Savior' },
            { id: 'baptism', label: 'Water Baptism' },
            { id: 'membership', label: 'Church Membership' },
            { id: 'volunteering', label: 'Serving Opportunities' },
            { id: 'small-group', label: 'Small Group/Connect Group' },
            { id: 'prayer', label: 'Prayer and Counseling' },
          ].map((interest) => (
            <div key={interest.id} className="flex items-center">
              <input
                type="checkbox"
                id={interest.id}
                checked={formData.interests?.[interest.id as keyof typeof formData.interests] || false}
                onChange={(e) => updateFormData({
                  interests: { 
                    ...formData.interests, 
                    [interest.id]: e.target.checked 
                  }
                })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor={interest.id} className="ml-2 text-sm text-gray-700">
                {interest.label}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Step 4: Prayer Requests
  const renderStep4 = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <Heart className="h-12 w-12 text-purple-600 mx-auto mb-3" />
        <h3 className="text-xl font-semibold text-gray-900">Prayer Support</h3>
        <p className="text-gray-600 mt-2">How can we pray for you? Our prayer team is standing by.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Prayer Request (Optional)
        </label>
        <textarea
          rows={4}
          value={formData.prayerRequest || ''}
          onChange={(e) => updateFormData({ prayerRequest: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Share your prayer needs here..."
        />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Your prayer request will be shared with our prayer team. 
          For confidential matters, please indicate "private" in your request.
        </p>
      </div>
    </div>
  );

  // Success Step
  const renderSuccess = () => (
    <div className="text-center py-8">
      <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-4">
        <Check className="h-8 w-8 text-green-600" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">Welcome to the THOGMi Family!</h3>
      <p className="text-gray-600 mb-6">
        Thank you for connecting with us. We're excited to journey with you!
      </p>
      
      {result && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
          <h4 className="font-medium text-gray-900 mb-2">What's Next:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• You'll receive a welcome email within the next hour</li>
            <li>• Our guest services team will reach out to you soon</li>
            <li>• Check your inbox for upcoming event invitations</li>
            {result.nextSteps.map((step, index) => (
              <li key={index}>• {step}</li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={() => router.push('/')}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Return to Homepage
      </button>
    </div>
  );

  if (status === 'success') {
    return renderSuccess();
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Progress Bar */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            Step {currentStep} of 4
          </span>
          <span className="text-sm text-gray-500">
            {['Personal Info', 'Visit Details', 'Interests', 'Prayer'][currentStep - 1]}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* Form Content */}
      <div className="p-6">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}

        {status === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
            <p className="text-red-700 text-sm">
              There was an error submitting your form. Please try again or contact us directly.
            </p>
          </div>
        )}

        {/* Navigation Buttons */}
        {currentStep <= 4 && (
          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Back
            </button>

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Continue
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={status === 'submitting'}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {status === 'submitting' ? 'Submitting...' : 'Complete Connection'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
