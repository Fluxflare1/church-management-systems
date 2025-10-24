'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { memberApi } from '@/lib/api/members';
import { Member } from '@/lib/types/member-types';

export default function NewWelfareCasePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    case_type: '',
    title: '',
    description: '',
    urgency: 'medium',
  });

  useEffect(() => {
    if (session) {
      loadMemberProfile();
    }
  }, [session]);

  const loadMemberProfile = async () => {
    try {
      const members = await memberApi.getMembers();
      const currentMember = members.results.find(m => m.user.id === session?.user?.id);
      setMember(currentMember || null);
    } catch (error) {
      console.error('Error loading member profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!member) return;

    setSubmitting(true);
    try {
      await memberApi.createWelfareCase({
        member: member.id,
        ...formData
      });
      
      router.push('/member/welfare?success=true');
    } catch (error) {
      console.error('Error creating welfare case:', error);
      alert('Error creating support request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const caseTypes = [
    { value: 'financial', label: 'Financial Assistance' },
    { value: 'medical', label: 'Medical Support' },
    { value: 'housing', label: 'Housing Needs' },
    { value: 'employment', label: 'Employment Support' },
    { value: 'counseling', label: 'Counseling' },
    { value: 'prayer', label: 'Prayer Support' },
    { value: 'education', label: 'Educational Support' },
    { value: 'other', label: 'Other' },
  ];

  const urgencyLevels = [
    { value: 'low', label: 'Low - Can wait a few weeks' },
    { value: 'medium', label: 'Medium - Need help within a week' },
    { value: 'high', label: 'High - Need immediate attention' },
    { value: 'critical', label: 'Critical - Emergency situation' },
  ];

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  if (!member) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <h1 className="text-2xl font-bold mb-4">Member Profile Not Found</h1>
        <p>Please contact your branch administrator to set up your member profile.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Request Support</CardTitle>
          <CardDescription>
            Submit a welfare or support request. Our team will get back to you as soon as possible.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Member Information */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Your Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-700">Name:</span>
                  <div>{member.user.first_name} {member.user.last_name}</div>
                </div>
                <div>
                  <span className="text-blue-700">Member ID:</span>
                  <div>{member.member_id}</div>
                </div>
                <div>
                  <span className="text-blue-700">Branch:</span>
                  <div>{member.branch.name}</div>
                </div>
                <div>
                  <span className="text-blue-700">Contact:</span>
                  <div>{member.user.email}</div>
                </div>
              </div>
            </div>

            {/* Case Type */}
            <div>
              <Label htmlFor="case_type">Type of Support Needed *</Label>
              <Select
                value={formData.case_type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, case_type: value }))}
                required
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select the type of support you need" />
                </SelectTrigger>
                <SelectContent>
                  {caseTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Title */}
            <div>
              <Label htmlFor="title">Brief Description *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Brief summary of your support need"
                className="mt-1"
                required
              />
            </div>

            {/* Detailed Description */}
            <div>
              <Label htmlFor="description">Detailed Explanation *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Please provide detailed information about your situation and the support you need..."
                rows={6}
                className="mt-1"
                required
              />
              <p className="text-sm text-gray-600 mt-1">
                The more details you provide, the better we can assist you.
              </p>
            </div>

            {/* Urgency Level */}
            <div>
              <Label htmlFor="urgency">Urgency Level *</Label>
              <Select
                value={formData.urgency}
                onValueChange={(value) => setFormData(prev => ({ ...prev, urgency: value }))}
                required
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="How urgent is your request?" />
                </SelectTrigger>
                <SelectContent>
                  {urgencyLevels.map(level => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Additional Information */}
            <div>
              <Label htmlFor="additional_info">Additional Information</Label>
              <Textarea
                id="additional_info"
                placeholder="Any other information that might be helpful (preferred contact method, availability, etc.)"
                rows={3}
                className="mt-1"
              />
            </div>

            {/* Submission Guidelines */}
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h3 className="font-semibold text-yellow-900 mb-2">Important Information</h3>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Our welfare team will contact you within 1-3 business days</li>
                <li>• For emergency situations, please contact your relationship manager directly</li>
                <li>• All information shared is kept confidential</li>
                <li>• You can track the status of your request in your welfare cases section</li>
              </ul>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Support Request'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
