'use client';

import { useState } from 'react';
import { useInitiateDonation } from '@/hooks/use-api-queries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const givingOptions = [
  {
    title: "Tithe",
    description: "Honor God with the first fruits of your labor",
    scripture: "Malachi 3:10",
    suggested: [1000, 2500, 5000, 10000]
  },
  {
    title: "Offering",
    description: "Give generously as God has prospered you",
    scripture: "2 Corinthians 9:7",
    suggested: [500, 1000, 2500, 5000]
  },
  {
    title: "Missions & Outreach",
    description: "Support our local and global evangelism efforts",
    scripture: "Matthew 28:19-20",
    suggested: [2000, 5000, 10000, 25000]
  },
  {
    title: "Building Fund",
    description: "Help us build and maintain our church facilities",
    scripture: "Haggai 1:8",
    suggested: [5000, 10000, 25000, 50000]
  }
];

export default function GivePage() {
  const [selectedFund, setSelectedFund] = useState('tithe');
  const [amount, setAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [donorInfo, setDonorInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });

  const { mutate: initiateDonation, isPending } = useInitiateDonation();

  const selectedOption = givingOptions.find(opt => opt.title.toLowerCase() === selectedFund) || givingOptions[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const donationData = {
      fund: selectedFund,
      amount: customAmount || amount,
      donor: donorInfo,
      frequency: 'one-time' // Could be 'monthly', 'weekly', etc.
    };

    initiateDonation(donationData, {
      onSuccess: (data) => {
        // Redirect to payment gateway
        window.location.href = data.checkout_url;
      }
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Give Online</h1>
          <p className="text-xl text-gray-600">
            Partner with us in advancing God's kingdom through your generous giving.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Giving Options */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Giving Funds</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {givingOptions.map((option) => (
                  <div
                    key={option.title}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedFund === option.title.toLowerCase() 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedFund(option.title.toLowerCase())}
                  >
                    <h3 className="font-semibold text-gray-900">{option.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                    <p className="text-xs text-blue-600 mt-2">{option.scripture}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Giving Scripture */}
            <Card className="mt-6 bg-gradient-to-br from-green-50 to-blue-50">
              <CardContent className="p-6">
                <blockquote className="text-center">
                  <p className="text-lg text-gray-700 italic">
                    "Each of you should give what you have decided in your heart to give, 
                    not reluctantly or under compulsion, for God loves a cheerful giver."
                  </p>
                  <footer className="mt-4 text-gray-600">— 2 Corinthians 9:7</footer>
                </blockquote>
              </CardContent>
            </Card>
          </div>

          {/* Donation Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Make a Donation</CardTitle>
                <p className="text-gray-600">Supporting: {selectedOption.title}</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Amount Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Select Amount ({process.env.NEXT_PUBLIC_CURRENCY || 'NGN'})
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                      {selectedOption.suggested.map((suggestedAmount) => (
                        <Button
                          key={suggestedAmount}
                          type="button"
                          variant={amount === suggestedAmount.toString() ? "default" : "outline"}
                          onClick={() => {
                            setAmount(suggestedAmount.toString());
                            setCustomAmount('');
                          }}
                          className="h-12"
                        >
                          {suggestedAmount.toLocaleString()}
                        </Button>
                      ))}
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <span className="text-gray-600">Or enter custom amount:</span>
                      <Input
                        type="number"
                        placeholder="Enter amount"
                        value={customAmount}
                        onChange={(e) => {
                          setCustomAmount(e.target.value);
                          setAmount('');
                        }}
                        className="w-32"
                      />
                    </div>
                  </div>

                  {/* Donor Information */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Your Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        placeholder="First Name"
                        value={donorInfo.firstName}
                        onChange={(e) => setDonorInfo(prev => ({ ...prev, firstName: e.target.value }))}
                        required
                      />
                      <Input
                        placeholder="Last Name"
                        value={donorInfo.lastName}
                        onChange={(e) => setDonorInfo(prev => ({ ...prev, lastName: e.target.value }))}
                        required
                      />
                    </div>
                    <Input
                      type="email"
                      placeholder="Email Address"
                      value={donorInfo.email}
                      onChange={(e) => setDonorInfo(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                    <Input
                      placeholder="Phone Number (Optional)"
                      value={donorInfo.phone}
                      onChange={(e) => setDonorInfo(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>

                  {/* Payment Button */}
                  <Button 
                    type="submit" 
                    className="w-full h-12 text-lg"
                    disabled={isPending || (!amount && !customAmount)}
                  >
                    {isPending ? 'Processing...' : `Give ${(customAmount || amount).toLocaleString()}`}
                  </Button>

                  {/* Security Notice */}
                  <div className="text-center text-sm text-gray-500">
                    <p>🔒 Secure payment processed by Paystack</p>
                    <p className="mt-1">You will be redirected to our secure payment gateway</p>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Giving Benefits */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Your Giving Makes a Difference</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-start space-x-3">
                    <span className="text-green-500 text-lg">✓</span>
                    <div>
                      <p className="font-medium">Tax Deductible</p>
                      <p className="text-gray-600">Receive annual tax receipts for your donations</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-green-500 text-lg">✓</span>
                    <div>
                      <p className="font-medium">Kingdom Impact</p>
                      <p className="text-gray-600">Support missions, outreach, and community programs</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-green-500 text-lg">✓</span>
                    <div>
                      <p className="font-medium">Secure & Encrypted</p>
                      <p className="text-gray-600">Bank-level security for all transactions</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-green-500 text-lg">✓</span>
                    <div>
                      <p className="font-medium">Recurring Options</p>
                      <p className="text-gray-600">Set up automatic monthly giving</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
