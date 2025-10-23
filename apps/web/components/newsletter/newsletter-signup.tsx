'use client';

import { useState } from 'react';
import { Check, AlertCircle } from 'lucide-react';
import { subscribeToNewsletter, NewsletterSubscription } from '@/lib/api/newsletter';

interface NewsletterSignupProps {
  variant?: 'inline' | 'card' | 'modal';
  title?: string;
  description?: string;
  branchId?: string;
}

export default function NewsletterSignup({
  variant = 'inline',
  title = "Stay Connected",
  description = "Get weekly updates, sermon notes, and event invitations delivered to your inbox.",
  branchId
}: NewsletterSignupProps) {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [frequency, setFrequency] = useState<'weekly' | 'monthly'>('weekly');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const subscription: NewsletterSubscription = {
        email,
        firstName: firstName || undefined,
        branch: branchId,
        frequency
      };

      const result = await subscribeToNewsletter(subscription);
      setStatus('success');
      setMessage(result.message);
      setEmail('');
      setFirstName('');
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Subscription failed');
    }
  };

  const containerClasses = {
    inline: "w-full max-w-md",
    card: "bg-white rounded-lg shadow-md p-6 border border-gray-200",
    modal: "bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4"
  }[variant];

  if (status === 'success') {
    return (
      <div className={`${containerClasses} text-center`}>
        <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-4">
          <Check className="h-6 w-6 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Welcome to our community!</h3>
        <p className="text-gray-600">{message}</p>
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <input
              type="text"
              placeholder="First name (optional)"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Email frequency</label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="frequency"
                value="weekly"
                checked={frequency === 'weekly'}
                onChange={(e) => setFrequency(e.target.value as 'weekly')}
                className="mr-2"
              />
              <span className="text-sm">Weekly</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="frequency"
                value="monthly"
                checked={frequency === 'monthly'}
                onChange={(e) => setFrequency(e.target.value as 'monthly')}
                className="mr-2"
              />
              <span className="text-sm">Monthly</span>
            </label>
          </div>
        </div>

        {status === 'error' && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-md">
            <AlertCircle className="h-4 w-4" />
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={status === 'loading' || !email}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {status === 'loading' ? 'Subscribing...' : 'Subscribe to Newsletter'}
        </button>

        <p className="text-xs text-gray-500 text-center">
          By subscribing, you agree to our Privacy Policy and consent to receive updates.
        </p>
      </form>
    </div>
  );
}
