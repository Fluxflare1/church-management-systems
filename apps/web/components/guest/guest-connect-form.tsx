'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSubmitGuestForm } from '@/hooks/use-api-queries';
import { useBranches } from '@/hooks/use-api-queries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface GuestFormData {
  personal: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    location: string;
  };
  visit: {
    branch: string;
    serviceDate: string;
    howHeard: string;
    firstTime: boolean;
  };
  interests: {
    salvation: boolean;
    baptism: boolean;
    membership: boolean;
    volunteering: boolean;
    prayer: boolean;
  };
  prayerRequest?: string;
}

export function GuestConnectForm() {
  const [step, setStep] = useState(1);
  const { register, handleSubmit, watch, formState: { errors } } = useForm<GuestFormData>();
  const { mutate: submitForm, isPending, isSuccess, error } = useSubmitGuestForm();
  const { data: branches, isLoading: branchesLoading } = useBranches();

  const onSubmit = (data: GuestFormData) => {
    submitForm(data, {
      onSuccess: () => {
        setStep(5); // Success step
      },
    });
  };

  if (isSuccess && step === 5) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center text-green-600">
            Thank You for Connecting!
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-4">
            We're excited to connect with you! Our team will reach out to you shortly.
          </p>
          <Button onClick={() => setStep(1)}>Submit Another Response</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl mx-auto space-y-6">
      {/* Step 1: Personal Information */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                {...register('personal.firstName', { required: 'First name is required' })}
                placeholder="First Name"
                error={errors.personal?.firstName?.message}
              />
              <Input
                {...register('personal.lastName', { required: 'Last name is required' })}
                placeholder="Last Name"
                error={errors.personal?.lastName?.message}
              />
            </div>
            <Input
              {...register('personal.email', { 
                required: 'Email is required',
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: 'Invalid email address'
                }
              })}
              type="email"
              placeholder="Email Address"
              error={errors.personal?.email?.message}
            />
            <Input
              {...register('personal.phone')}
              placeholder="Phone Number (Optional)"
            />
            <Input
              {...register('personal.location')}
              placeholder="City/Area (Optional)"
            />
            <Button type="button" onClick={() => setStep(2)}>
              Continue
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Visit Information */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Visit Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <select
              {...register('visit.branch', { required: 'Please select a branch' })}
              className="w-full p-2 border rounded"
            >
              <option value="">Select a Branch</option>
              {branches?.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
            
            <Input
              {...register('visit.serviceDate', { required: 'Service date is required' })}
              type="date"
              placeholder="Date of Visit"
            />
            
            <select
              {...register('visit.howHeard')}
              className="w-full p-2 border rounded"
            >
              <option value="">How did you hear about us?</option>
              <option value="friend">Friend/Family</option>
              <option value="social">Social Media</option>
              <option value="website">Website</option>
              <option value="event">Community Event</option>
              <option value="other">Other</option>
            </select>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                {...register('visit.firstTime')}
                className="rounded"
              />
              <span>This was my first visit</span>
            </label>
            
            <div className="flex space-x-4">
              <Button type="button" variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button type="button" onClick={() => setStep(3)}>
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Interests */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Areas of Interest</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Let us know what you're interested in (select all that apply):
            </p>
            
            {[
              { key: 'salvation', label: 'Learning about salvation' },
              { key: 'baptism', label: 'Water baptism' },
              { key: 'membership', label: 'Church membership' },
              { key: 'volunteering', label: 'Volunteering/Serving' },
              { key: 'prayer', label: 'Prayer support' },
            ].map((interest) => (
              <label key={interest.key} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  {...register(`interests.${interest.key as keyof GuestFormData['interests']}`)}
                  className="rounded"
                />
                <span>{interest.label}</span>
              </label>
            ))}
            
            <div className="flex space-x-4">
              <Button type="button" variant="outline" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button type="button" onClick={() => setStep(4)}>
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Prayer & Submission */}
      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Prayer Request & Final Step</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              {...register('prayerRequest')}
              placeholder="Share a prayer request (optional)"
              rows={4}
            />
            
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700">
                There was an error submitting your form. Please try again.
              </div>
            )}
            
            <div className="flex space-x-4">
              <Button type="button" variant="outline" onClick={() => setStep(3)}>
                Back
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Submitting...' : 'Submit Connect Card'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </form>
  );
}
