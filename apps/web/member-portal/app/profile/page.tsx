'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { memberApi } from '@/lib/api/members';
import { Member } from '@/lib/types/member-types';

export default function ProfilePage() {
  const { data: session } = useSession();
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    occupation: '',
    education_level: '',
    skills: [] as string[],
    marital_status: '',
    date_of_birth: '',
    spiritual_gifts: [] as string[],
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
      if (currentMember) {
        setMember(currentMember);
        setFormData({
          occupation: currentMember.occupation || '',
          education_level: currentMember.education_level || '',
          skills: currentMember.skills || [],
          marital_status: currentMember.marital_status || '',
          date_of_birth: currentMember.date_of_birth || '',
          spiritual_gifts: currentMember.spiritual_gifts || [],
        });
      }
    } catch (error) {
      console.error('Error loading member profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!member) return;
    
    setSaving(true);
    try {
      await memberApi.updateMember(member.id.toString(), formData);
      setEditMode(false);
      loadMemberProfile(); // Reload to get updated data
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSkillAdd = (skill: string) => {
    if (skill && !formData.skills.includes(skill)) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }));
    }
  };

  const handleSkillRemove = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading profile...</div>;
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
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="text-gray-600">Manage your personal information and preferences</p>
        </div>
        {!editMode ? (
          <Button onClick={() => setEditMode(true)}>Edit Profile</Button>
        ) : (
          <div className="space-x-2">
            <Button variant="outline" onClick={() => setEditMode(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Your basic profile information and contact details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  value={member.user.first_name}
                  disabled
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  value={member.user.last_name}
                  disabled
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                value={member.user.email}
                disabled
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="marital_status">Marital Status</Label>
                {editMode ? (
                  <Select
                    value={formData.marital_status}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, marital_status: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single</SelectItem>
                      <SelectItem value="married">Married</SelectItem>
                      <SelectItem value="divorced">Divorced</SelectItem>
                      <SelectItem value="widowed">Widowed</SelectItem>
                      <SelectItem value="separated">Separated</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    value={member.marital_status || 'Not specified'}
                    disabled
                    className="mt-1"
                  />
                )}
              </div>

              <div>
                <Label htmlFor="date_of_birth">Date of Birth</Label>
                {editMode ? (
                  <Input
                    type="date"
                    id="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData(prev => ({ ...prev, date_of_birth: e.target.value }))}
                    className="mt-1"
                  />
                ) : (
                  <Input
                    value={member.date_of_birth ? new Date(member.date_of_birth).toLocaleDateString() : 'Not specified'}
                    disabled
                    className="mt-1"
                  />
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="occupation">Occupation</Label>
                {editMode ? (
                  <Input
                    id="occupation"
                    value={formData.occupation}
                    onChange={(e) => setFormData(prev => ({ ...prev, occupation: e.target.value }))}
                    className="mt-1"
                    placeholder="Your profession"
                  />
                ) : (
                  <Input
                    value={member.occupation || 'Not specified'}
                    disabled
                    className="mt-1"
                  />
                )}
              </div>

              <div>
                <Label htmlFor="education_level">Education Level</Label>
                {editMode ? (
                  <Input
                    id="education_level"
                    value={formData.education_level}
                    onChange={(e) => setFormData(prev => ({ ...prev, education_level: e.target.value }))}
                    className="mt-1"
                    placeholder="Highest education"
                  />
                ) : (
                  <Input
                    value={member.education_level || 'Not specified'}
                    disabled
                    className="mt-1"
                  />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Membership Details */}
        <Card>
          <CardHeader>
            <CardTitle>Membership Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Member ID</Label>
              <div className="font-mono text-lg font-bold mt-1">{member.member_id}</div>
            </div>

            <div>
              <Label>Branch</Label>
              <div className="mt-1">{member.branch.name}</div>
            </div>

            <div>
              <Label>Membership Status</Label>
              <div className="mt-1">
                <Badge variant={member.membership_status === 'active' ? 'default' : 'secondary'}>
                  {member.membership_status.toUpperCase()}
                </Badge>
              </div>
            </div>

            <div>
              <Label>Member Since</Label>
              <div className="mt-1">
                {new Date(member.membership_date).toLocaleDateString()}
              </div>
            </div>

            {member.relationship_manager && (
              <div>
                <Label>Relationship Manager</Label>
                <div className="mt-1">
                  {member.relationship_manager.first_name} {member.relationship_manager.last_name}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Skills and Spiritual Gifts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Skills & Talents</CardTitle>
            <CardDescription>
              Your skills and talents that can serve the church
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {editMode ? (
              <>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a skill (e.g., Music, Teaching, IT)"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSkillAdd((e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={(e) => {
                      const input = e.currentTarget.previousSibling as HTMLInputElement;
                      handleSkillAdd(input.value);
                      input.value = '';
                    }}
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map(skill => (
                    <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleSkillRemove(skill)}
                        className="ml-1 hover:text-red-500"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-wrap gap-2">
                {member.skills.length > 0 ? (
                  member.skills.map(skill => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))
                ) : (
                  <p className="text-gray-500">No skills added yet</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Spiritual Gifts</CardTitle>
            <CardDescription>
              Gifts and talents for ministry service
            </CardDescription>
          </CardHeader>
          <CardContent>
            {editMode ? (
              <Textarea
                placeholder="List your spiritual gifts (one per line)"
                value={formData.spiritual_gifts.join('\n')}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  spiritual_gifts: e.target.value.split('\n').filter(g => g.trim())
                }))}
                rows={4}
              />
            ) : (
              <div className="flex flex-wrap gap-2">
                {member.spiritual_gifts.length > 0 ? (
                  member.spiritual_gifts.map(gift => (
                    <Badge key={gift} variant="outline">
                      {gift}
                    </Badge>
                  ))
                ) : (
                  <p className="text-gray-500">No spiritual gifts specified</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Welfare Information */}
      {member.welfare_category !== 'none' && (
        <Card>
          <CardHeader>
            <CardTitle>Welfare Information</CardTitle>
            <CardDescription>
              Support and care information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Welfare Category</Label>
                <div className="mt-1">
                  <Badge variant="outline">
                    {member.welfare_category.replace(/_/g, ' ').toUpperCase()}
                  </Badge>
                </div>
              </div>
              {member.special_needs.length > 0 && (
                <div>
                  <Label>Special Needs</Label>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {member.special_needs.map(need => (
                      <Badge key={need} variant="secondary">
                        {need}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {member.welfare_notes && (
              <div className="mt-4">
                <Label>Welfare Notes</Label>
                <div className="mt-1 p-3 bg-gray-50 rounded-md">
                  {member.welfare_notes}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
