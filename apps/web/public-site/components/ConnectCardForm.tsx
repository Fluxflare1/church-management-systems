'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';

interface ConnectCardFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  branchId: number;
  visitDate: string;
  howHeard: string;
  isFirstVisit: boolean;
  prefersEmail: boolean;
  prefersSms: boolean;
  prefersWhatsapp: boolean;
  prefersInApp: boolean;
  interestedSalvation: boolean;
  interestedBaptism: boolean;
  interestedMembership: boolean;
  interestedVolunteering: boolean;
  prayerRequest: string;
}

export default function ConnectCardForm({ branches }: { branches: any[] }) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm<ConnectCardFormData>();
  
  const onSubmit = async (data: ConnectCardFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/v1/guests/profiles/submit_connect_card/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setStep(4); // Success step
      } else {
        console.error('Submission failed:', result.error);
      }
    } catch (error) {
      console.error('Submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">We're Glad You're Here!</h2>
      
      {step === 1 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Personal Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">First Name *</label>
              <input
                {...register('firstName', { required: true })}
                className="w-full p-2 border rounded"
              />
              {errors.firstName && <span className="text-red-500 text-sm">Required</span>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Last Name *</label>
              <input
                {...register('lastName', { required: true })}
                className="w-full p-2 border rounded"
              />
              {errors.lastName && <span className="text-red-500 text-sm">Required</span>}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Email *</label>
            <input
              type="email"
              {...register('email', { required: true })}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input
              {...register('phone')}
              className="w-full p-2 border rounded"
              placeholder="+234 800 000 0000"
            />
          </div>
          
          <button
            onClick={() => setStep(2)}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Continue
          </button>
        </div>
      )}
      
      {step === 2 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Visit Information</h3>
          
          <div>
            <label className="block text-sm font-medium mb-1">Which branch did you visit? *</label>
            <select
              {...register('branchId', { required: true })}
              className="w-full p-2 border rounded"
            >
              <option value="">Select a branch</option>
              {branches.map(branch => (
                <option key={branch.id} value={branch.id}>
                  {branch.name} - {branch.location}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">When did you visit? *</label>
            <input
              type="date"
              {...register('visitDate', { required: true })}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">How did you hear about us? *</label>
            <select
              {...register('howHeard', { required: true })}
              className="w-full p-2 border rounded"
            >
              <option value="">Select an option</option>
              <option value="friend">Friend or Family</option>
              <option value="social_media">Social Media</option>
              <option value="website">Website</option>
              <option value="invitation">Personal Invitation</option>
              <option value="drive_by">Drove By</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              {...register('isFirstVisit')}
              className="mr-2"
            />
            <label>This was my first visit</label>
          </div>
          
          <div className="flex justify-between">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 border rounded text-gray-600"
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Continue
            </button>
          </div>
        </div>
      )}
      
      {step === 3 && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <h3 className="text-lg font-semibold">Get Connected</h3>
          
          <div>
            <h4 className="font-medium mb-2">Communication Preferences</h4>
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  {...register('prefersEmail')}
                  defaultChecked
                  className="mr-2"
                />
                <label>Email Updates</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  {...register('prefersSms')}
                  className="mr-2"
                />
                <label>SMS/Text Messages</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  {...register('prefersWhatsapp')}
                  defaultChecked
                  className="mr-2"
                />
                <label>WhatsApp Messages</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  {...register('prefersInApp')}
                  defaultChecked
                  className="mr-2"
                />
                <label>In-App Notifications</label>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">I'm interested in learning more about:</h4>
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  {...register('interestedSalvation')}
                  className="mr-2"
                />
                <label>Salvation and New Life in Christ</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  {...register('interestedBaptism')}
                  className="mr-2"
                />
                <label>Water Baptism</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  {...register('interestedMembership')}
                  className="mr-2"
                />
                <label>Church Membership</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  {...register('interestedVolunteering')}
                  className="mr-2"
                />
                <label>Volunteering Opportunities</label>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Prayer Request (Optional)</label>
            <textarea
              {...register('prayerRequest')}
              rows={4}
              className="w-full p-2 border rounded"
              placeholder="How can we pray for you?"
            />
          </div>
          
          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-4 py-2 border rounded text-gray-600"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Connect Card'}
            </button>
          </div>
        </form>
      )}
      
      {step === 4 && (
        <div className="text-center py-8">
          <div className="text-green-500 text-6xl mb-4">✓</div>
          <h3 className="text-xl font-bold mb-2">Thank You!</h3>
          <p className="text-gray-600">
            We've received your connect card and look forward to connecting with you soon!
          </p>
        </div>
      )}
    </div>
  );
}
