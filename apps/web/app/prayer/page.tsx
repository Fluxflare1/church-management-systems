'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function PrayerPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    request: '',
    sharePublicly: false,
    contactMe: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call to prayer request endpoint
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <span className="text-green-500 text-2xl">🙏</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Prayer Request Received!</h1>
          <p className="text-gray-600 mb-4">
            Thank you for sharing your prayer request. Our prayer team is standing with you in faith.
          </p>
          <p className="text-gray-500 text-sm mb-8">
            "Do not be anxious about anything, but in every situation, by prayer and petition, 
            with thanksgiving, present your requests to God." - Philippians 4:6
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild>
              <a href="/">Return Home</a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/prayer">Submit Another Request</a>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Prayer Requests</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Share your prayer needs with our dedicated prayer team. We believe in the power of prayer to change situations.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Prayer Information */}
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-purple-50 to-blue-50">
              <CardContent className="p-6">
                <h3 className="font-semibold text-purple-900 mb-4">Our Prayer Commitment</h3>
                <ul className="space-y-3 text-purple-800 text-sm">
                  <li className="flex items-start">
                    <span className="text-purple-500 mr-2 mt-1">•</span>
                    <span>Every request is prayed for by our prayer team</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-500 mr-2 mt-1">•</span>
                    <span>Confidentiality is maintained for private requests</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-500 mr-2 mt-1">•</span>
                    <span>24/7 prayer coverage for urgent needs</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-500 mr-2 mt-1">•</span>
                    <span>Follow-up for ongoing prayer support</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Prayer Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">24/7 Prayer Line</h4>
                  <p className="text-blue-600 font-medium">+234 700 123 4567</p>
                  <p className="text-gray-600 text-sm">Available for urgent prayer needs anytime</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Prayer Meetings</h4>
                  <p className="text-gray-600 text-sm">
                    Join our weekly prayer gatherings at your local branch
                  </p>
                </div>
                <Button variant="outline" className="w-full" asChild>
                  <a href="/events?category=prayer">View Prayer Events</a>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-6">
                <h3 className="font-semibold text-green-900 mb-2">Scripture Promise</h3>
                <blockquote className="text-green-800 text-sm italic">
                  "Therefore I tell you, whatever you ask for in prayer, believe that you have received it, and it will be yours."
                </blockquote>
                <p className="text-green-700 text-xs mt-2">— Mark 11:24</p>
              </CardContent>
            </Card>
          </div>

          {/* Prayer Request Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Submit Prayer Request</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      placeholder="Your Name (Optional)"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    />
                    <Input
                      type="email"
                      placeholder="Email (Optional)"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>

                  <Input
                    placeholder="Phone Number (Optional)"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prayer Request *
                    </label>
                    <Textarea
                      placeholder="Please share your prayer need..."
                      rows={6}
                      value={formData.request}
                      onChange={(e) => setFormData(prev => ({ ...prev, request: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.sharePublicly}
                        onChange={(e) => setFormData(prev => ({ ...prev, sharePublicly: e.target.checked }))}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">
                        Share anonymously on our prayer wall to allow others to pray with you
                      </span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.contactMe}
                        onChange={(e) => setFormData(prev => ({ ...prev, contactMe: e.target.checked }))}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">
                        A prayer team member can contact me for follow-up
                      </span>
                    </label>
                  </div>

                  <Button type="submit" className="w-full" disabled={isSubmitting || !formData.request}>
                    {isSubmitting ? 'Submitting...' : 'Submit Prayer Request'}
                  </Button>

                  <p className="text-xs text-gray-500 text-center">
                    Your privacy is important to us. Personal information is kept confidential 
                    and only used for prayer ministry purposes.
                  </p>
                </form>
              </CardContent>
            </Card>

            {/* Live Prayer Wall */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Community Prayer Wall</CardTitle>
                <p className="text-sm text-gray-600">Join us in praying for these needs</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    "Healing for family members affected by illness",
                    "Guidance for important career decisions",
                    "Restoration in broken relationships",
                    "Financial breakthrough and provision",
                    "Salvation for loved ones who don't know Christ"
                  ].map((request, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-700 mb-2">{request}</p>
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>Anonymous • 2 days ago</span>
                        <Button variant="ghost" size="sm">🙏 Pray</Button>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  Load More Prayer Requests
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
