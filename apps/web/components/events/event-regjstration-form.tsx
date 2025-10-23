'use client';

import { useState, useEffect } from 'react';
import { Check, Users, Calendar, MapPin } from 'lucide-react';
import { registerForEvent, getEventRegistrationForm, RegistrationFormField, EventRegistration } from '@/lib/api/events';
import { Event } from '@/types';

interface EventRegistrationFormProps {
  event: Event;
  onSuccess?: (registrationId: string) => void;
  onCancel?: () => void;
}

export default function EventRegistrationForm({ event, onSuccess, onCancel }: EventRegistrationFormProps) {
  const [formData, setFormData] = useState<Partial<EventRegistration>>({
    eventId: event.id,
    guests: 0,
  });
  const [formFields, setFormFields] = useState<RegistrationFormField[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [attendeeInfo, setAttendeeInfo] = useState<{ total: number; registered: number; capacity?: number } | null>(null);

  useEffect(() => {
    loadRegistrationForm();
    loadAttendeeInfo();
  }, [event.id]);

  const loadRegistrationForm = async () => {
    try {
      const { formFields: fields } = await getEventRegistrationForm(event.id);
      setFormFields(fields);
    } catch (error) {
      console.error('Failed to load registration form:', error);
    }
  };

  const loadAttendeeInfo = async () => {
    try {
      const info = await getEventAttendees(event.id);
      setAttendeeInfo(info);
    } catch (error) {
      console.error('Failed to load attendee info:', error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      // Validate required fields
      const requiredFields = formFields.filter(field => field.required);
      for (const field of requiredFields) {
        if (!formData[field.id as keyof EventRegistration]) {
          throw new Error(`${field.label} is required`);
        }
      }

      const result = await registerForEvent(formData as EventRegistration);
      setStatus('success');
      setMessage(result.message);
      onSuccess?.(result.registrationId);
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Registration failed');
    }
  };

  const isFull = attendeeInfo && attendeeInfo.capacity && attendeeInfo.registered >= attendeeInfo.capacity;

  if (status === 'success') {
    return (
      <div className="text-center py-8">
        <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-4">
          <Check className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Registration Confirmed!</h3>
        <p className="text-gray-600 mb-4">{message}</p>
        <div className="space-y-2 text-sm text-gray-500">
          <p>We've sent a confirmation email to {formData.email}</p>
          <p>Check your email for event details and reminders.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Event Header */}
      <div className="bg-gray-50 p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{event.title}</h2>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>
              {new Date(event.startDate).toLocaleDateString()} •{' '}
              {new Date(event.startDate).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>{event.location || event.branch?.name}</span>
          </div>
          {attendeeInfo && (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>
                {attendeeInfo.registered} {attendeeInfo.capacity ? `/ ${attendeeInfo.capacity}` : ''} registered
                {isFull && <span className="ml-2 text-red-600 font-medium">• Event Full</span>}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {isFull ? (
          <div className="text-center py-8">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <h3 className="text-lg font-semibold text-red-800 mb-2">Event Full</h3>
              <p className="text-red-700">
                This event has reached its capacity. Please check back later for cancellations 
                or view other upcoming events.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Standard Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  id="firstName"
                  required
                  value={formData.firstName || ''}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  id="lastName"
                  required
                  value={formData.lastName || ''}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={formData.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label htmlFor="guests" className="block text-sm font-medium text-gray-700 mb-1">
                Number of Additional Guests
              </label>
              <select
                id="guests"
                value={formData.guests || 0}
                onChange={(e) => handleInputChange('guests', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {[0, 1, 2, 3, 4, 5].map(num => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? 'guest' : 'guests'}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Form Fields */}
            {formFields.map((field) => (
              <div key={field.id}>
                <label htmlFor={field.id} className="block text-sm font-medium text-gray-700 mb-1">
                  {field.label} {field.required && '*'}
                </label>
                {field.type === 'textarea' ? (
                  <textarea
                    id={field.id}
                    required={field.required}
                    placeholder={field.placeholder}
                    value={formData[field.id as keyof EventRegistration] as string || ''}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : field.type === 'select' ? (
                  <select
                    id={field.id}
                    required={field.required}
                    value={formData[field.id as keyof EventRegistration] as string || ''}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select an option</option>
                    {field.options?.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    id={field.id}
                    required={field.required}
                    placeholder={field.placeholder}
                    value={formData[field.id as keyof EventRegistration] as string || ''}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                )}
              </div>
            ))}

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Additional Notes or Questions
              </label>
              <textarea
                id="notes"
                rows={3}
                value={formData.notes || ''}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Any special requirements or questions..."
              />
            </div>

            {status === 'error' && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-700 text-sm">{message}</p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={status === 'loading'}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {status === 'loading' ? 'Registering...' : 'Complete Registration'}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}
