'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { memberApi } from '@/lib/api/members';
import { Member, WelfareCase, MemberEngagement } from '@/lib/types/member-types';

export default function MemberDashboard() {
  const { data: session } = useSession();
  const [member, setMember] = useState<Member | null>(null);
  const [welfareCases, setWelfareCases] = useState<WelfareCase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      loadMemberData();
    }
  }, [session]);

  const loadMemberData = async () => {
    try {
      // Get current member profile
      const members = await memberApi.getMembers();
      const currentMember = members.results.find(m => m.user.id === session?.user?.id);
      
      if (currentMember) {
        setMember(currentMember);
        
        // Load welfare cases
        const cases = await memberApi.getWelfareCases({ member: currentMember.id });
        setWelfareCases(cases.results);
      }
    } catch (error) {
      console.error('Error loading member data:', error);
    } finally {
      setLoading(false);
    }
  };

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
    <div className="container mx-auto p-6 space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6">
        <h1 className="text-3xl font-bold">
          Welcome back, {member.user.first_name}!
        </h1>
        <p className="text-blue-100 mt-2">
          Member ID: {member.member_id} • {member.branch.name}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Engagement Score */}
        <Card>
          <CardHeader>
            <CardTitle>Engagement Score</CardTitle>
            <CardDescription>Your participation level</CardDescription>
          </CardHeader>
          <CardContent>
            {member.engagement ? (
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600">
                  {member.engagement.engagement_score}%
                </div>
                <Badge 
                  variant={
                    member.engagement.engagement_tier === 'high' ? 'default' :
                    member.engagement.engagement_tier === 'medium' ? 'secondary' :
                    'destructive'
                  }
                  className="mt-2"
                >
                  {member.engagement.engagement_tier.toUpperCase()} ENGAGEMENT
                </Badge>
                <p className="text-sm text-gray-600 mt-2">
                  Attendance Streak: {member.engagement.attendance_streak} weeks
                </p>
              </div>
            ) : (
              <p className="text-gray-500">No engagement data available</p>
            )}
          </CardContent>
        </Card>

        {/* Welfare Cases */}
        <Card>
          <CardHeader>
            <CardTitle>Support Cases</CardTitle>
            <CardDescription>Your welfare requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {welfareCases.slice(0, 3).map(caseItem => (
                <div key={caseItem.id} className="flex justify-between items-center p-2 border rounded">
                  <div>
                    <p className="font-medium text-sm">{caseItem.title}</p>
                    <Badge variant="outline" className="text-xs">
                      {caseItem.status}
                    </Badge>
                  </div>
                  <Badge 
                    variant={
                      caseItem.urgency === 'critical' ? 'destructive' :
                      caseItem.urgency === 'high' ? 'default' : 'secondary'
                    }
                  >
                    {caseItem.urgency}
                  </Badge>
                </div>
              ))}
              {welfareCases.length === 0 && (
                <p className="text-gray-500 text-sm">No active support cases</p>
              )}
            </div>
            <Button variant="outline" className="w-full mt-4" asChild>
              <a href="/member/welfare">View All Cases</a>
            </Button>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your profile</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" asChild>
              <a href="/member/profile">
                📝 Update Profile
              </a>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <a href="/member/welfare/new">
                🆘 Request Support
              </a>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <a href="/member/ministries">
                🏛️ My Ministries
              </a>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <a href="/member/attendance">
                📊 Attendance
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {welfareCases.map(caseItem => (
              <div key={caseItem.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="font-medium">{caseItem.title}</p>
                  <p className="text-sm text-gray-600">
                    {caseItem.updates[0]?.update_notes || 'Case created'}
                  </p>
                </div>
                <div className="text-right text-sm text-gray-500">
                  {new Date(caseItem.reported_date).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
